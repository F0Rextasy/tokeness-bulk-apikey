'use strict';
/**
 * solver.js — the browser/captcha rail, moved verbatim out of cli.js.
 *
 * Zero dependencies: a minimal RFC6455 client talks to Chrome's DevTools
 * endpoint, a thin CDP layer drives it, and the page's own Turnstile widget (or
 * an explicit `turnstile.render`) answers with a fresh token — no external
 * solver service. The token is bound to the exit that solved it, so the whole
 * browser runs over that one pinned proxy.
 *
 *   const { solveCaptcha } = require('./solver.js');
 *   const { token, ms } = await solveCaptcha({ type: 'turnstile', sitekey, url, proxy });
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const net = require('net');
const crypto = require('crypto');
const { spawn, spawnSync } = require('child_process');
const { EventEmitter } = require('events');

const IS_SRC = path.basename(__dirname) === 'src';
const ROOT = IS_SRC ? path.resolve(__dirname, '..') : __dirname;
const SHOTS_DIR = path.join(ROOT, 'out', 'shots');

// ------------------------------------------------------------------- options
// The Chrome flags come from the same argv/env the CLI reads (one process), so
// --browser / --debug-port / --headless keep working unchanged.
const argv = process.argv.slice(2);
function arg(name, dflt) {
  const eq = argv.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.slice(name.length + 3);
  const i = argv.indexOf(`--${name}`);
  if (i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--')) return argv[i + 1];
  return dflt;
}
const has = (name) => argv.includes(`--${name}`) || argv.includes(`-${name}`);

const CHROME_BIN = arg('browser', process.env.CHROME_PATH || '');
const DEBUG_PORT = parseInt(arg('debug-port', '0'), 10) || 0; // 0 = auto-pick a free, nonzero port
const HEADLESS = has('headless');

/** The in-page namespace the Turnstile helper mounts itself under. */
const NS = "__tks";
/** Panel defaults for `solveCaptcha` when the caller omits url/sitekey. */
const BASE = "https://tokeness.ai";
const DEFAULT_SITEKEY = "0x4AAAAAADUMi6GTHDf1f5T7";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);

function withTimeout(promise, ms, message) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });
}

/**
 * One proxy line -> {protocol, host, port, username, password, line}, or null.
 * Same shape as cli.js#parseProxy, kept local so this module stands alone.
 */
function parseProxy(line) {
  const s = String(line || '').trim();
  if (!s || s.startsWith('#') || s.startsWith('//')) return null;
  let m = s.match(/^(https?|socks5h?|socks4a?):\/\/(?:([^:@/]+):([^@/]+)@)?([^:/]+):(\d+)/i);
  if (!m) m = s.match(/^(?:([^:@/]+):([^@/]+)@)?([^:/]+):(\d+)$/);
  if (!m) return null;
  if (m.length === 6) {
    const raw = m[1].toLowerCase();
    if (raw === 'socks4' || raw === 'socks4a') return null; // not supported by this client
    const protocol = raw.startsWith('socks') ? 'socks5' : 'http';
    return { protocol, host: m[4], port: Number(m[5]), username: m[2] || undefined, password: m[3] || undefined, line: s };
  }
  return { protocol: 'http', host: m[3], port: Number(m[4]), username: m[1] || undefined, password: m[2] || undefined, line: s };
}

// ------------------------------------------------------------ websocket CDP
/**
 * Minimal RFC6455 client for Chrome's ws:// DevTools endpoint. Node 18 has no
 * global WebSocket, so the handshake and framing are done here on `net`.
 */
class WsClient extends EventEmitter {
  constructor(url) {
    super();
    this.url = url;
    this.sock = null;
    this.buf = Buffer.alloc(0);
    this.frag = [];
    this.id = 0;
    this.pending = new Map();
  }
  connect(timeoutMs = 15000) {
    const u = new URL(this.url);
    return new Promise((resolve, reject) => {
      const sock = net.connect({ host: u.hostname, port: Number(u.port || 80) });
      this.sock = sock;
      const t = setTimeout(() => { sock.destroy(); reject(new Error('websocket handshake timeout')); }, timeoutMs);
      sock.once('error', (e) => { clearTimeout(t); reject(new Error(`websocket error: ${e.message}`)); });
      sock.once('close', () => {
        for (const [, p] of this.pending) p.reject(new Error('websocket closed'));
        this.pending.clear();
        this.emit('closed');
      });
      sock.once('connect', () => {
        sock.write(
          `GET ${u.pathname} HTTP/1.1\r\n` +
            `Host: ${u.hostname}:${u.port}\r\n` +
            'Upgrade: websocket\r\n' +
            'Connection: Upgrade\r\n' +
            `Sec-WebSocket-Key: ${crypto.randomBytes(16).toString('base64')}\r\n` +
            'Sec-WebSocket-Version: 13\r\n\r\n'
        );
      });
      let handshake = '';
      const onData = (d) => {
        handshake += d.toString('latin1');
        const idx = handshake.indexOf('\r\n\r\n');
        if (idx === -1) return;
        sock.off('data', onData);
        const head = handshake.slice(0, idx);
        if (!/^HTTP\/1\.1 101/.test(head)) {
          clearTimeout(t);
          sock.destroy();
          reject(new Error(`websocket refused: ${head.split('\r\n')[0]}`));
          return;
        }
        clearTimeout(t);
        const rest = Buffer.from(handshake.slice(idx + 4), 'latin1');
        sock.on('data', (chunk) => this._feed(chunk));
        if (rest.length) this._feed(rest);
        resolve(this);
      };
      sock.on('data', onData);
    });
  }
  _feed(chunk) {
    this.buf = Buffer.concat([this.buf, chunk]);
    for (;;) {
      const b = this.buf;
      if (b.length < 2) return;
      const fin = (b[0] & 0x80) !== 0;
      const op = b[0] & 0x0f;
      const masked = (b[1] & 0x80) !== 0;
      let len = b[1] & 0x7f;
      let off = 2;
      if (len === 126) {
        if (b.length < 4) return;
        len = b.readUInt16BE(2);
        off = 4;
      } else if (len === 127) {
        if (b.length < 10) return;
        len = Number(b.readBigUInt64BE(2));
        off = 10;
      }
      let mask = null;
      if (masked) {
        if (b.length < off + 4) return;
        mask = b.slice(off, off + 4);
        off += 4;
      }
      if (b.length < off + len) return;
      const payload = Buffer.from(b.slice(off, off + len));
      if (mask) for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i & 3];
      this.buf = b.slice(off + len);
      if (op === 0x0) {
        this.frag.push(payload);
        if (fin) { const full = Buffer.concat(this.frag).toString('utf8'); this.frag = []; this._message(full); }
        continue;
      }
      if (op === 0x1) {
        if (fin) this._message(payload.toString('utf8'));
        else this.frag = [payload];
        continue;
      }
      if (op === 0x9) { this._frame(payload, 0xa); continue; }
      if (op === 0x8) { try { this.sock.destroy(); } catch {} return; }
      // 0xa pong — ignore
    }
  }
  _frame(payload, opcode) {
    const data = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
    const len = data.length;
    let header;
    if (len < 126) header = Buffer.from([0x80 | opcode, 0x80 | len]);
    else if (len < 65536) {
      header = Buffer.alloc(4);
      header[0] = 0x80 | opcode;
      header[1] = 0x80 | 126;
      header.writeUInt16BE(len, 2);
    } else {
      header = Buffer.alloc(10);
      header[0] = 0x80 | opcode;
      header[1] = 0x80 | 127;
      header.writeBigUInt64BE(BigInt(len), 2);
    }
    const mask = crypto.randomBytes(4);
    const out = Buffer.allocUnsafe(len);
    for (let i = 0; i < len; i++) out[i] = data[i] ^ mask[i & 3];
    try { this.sock.write(Buffer.concat([header, mask, out])); } catch (e) { /* closed */ }
  }
  _message(text) {
    let msg;
    try { msg = JSON.parse(text); } catch { return; }
    if (msg.id !== undefined && this.pending.has(msg.id)) {
      const { resolve, reject } = this.pending.get(msg.id);
      this.pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message || 'cdp error'));
      else resolve(msg.result || {});
      return;
    }
    if (msg.method) this.emit('event', msg);
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this._frame(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }), 0x1);
    });
  }
  close() { try { this.sock.destroy(); } catch {} }
}

/** Thin CDP layer: session-aware send + method-scoped events. */
class CDP {
  constructor(ws) {
    this.ws = ws;
  }
  send(method, params, sessionId) { return this.ws.send(method, params, sessionId); }
  /** No `sessionId` = every session (attach events carry the new session id). */
  on(method, fn, sessionId) {
    const h = (msg) => {
      if (msg.method !== method) return;
      if (sessionId !== undefined && (msg.sessionId || undefined) !== sessionId) return;
      fn(msg.params);
    };
    this.ws.on('event', h);
    return () => this.ws.off('event', h);
  }
}

// ------------------------------------------------------------------- chrome
function findChrome() {
  if (CHROME_BIN) return CHROME_BIN;
  const cands =
    process.platform === 'win32'
      ? [
          'C:/Program Files/Google/Chrome/Application/chrome.exe',
          'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
          process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe') : null,
        ]
      : process.platform === 'darwin'
        ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
        : ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'];
  for (const c of cands) {
    if (!c) continue;
    if (c.includes('/') || c.includes('\\')) { if (fs.existsSync(c)) return c; continue; }
    const probe = spawnSync(process.platform === 'win32' ? 'where' : 'which', [c], { encoding: 'utf8', windowsHide: true });
    if (probe.status === 0 && String(probe.stdout).trim()) return String(probe.stdout).trim().split(/\r?\n/)[0];
  }
  throw new Error('Chrome not found — pass --browser <chrome.exe> or set CHROME_PATH');
}

function killChromeTree(child) {
  if (!child || child.killed || child.exitCode !== null) return;
  try {
    if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
    else child.kill('SIGTERM');
  } catch (e) { /* best effort */ }
}

/** A free loopback port — the debug port must be NONZERO (see the header note). */
function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.once('error', reject);
    s.listen(0, '127.0.0.1', () => {
      const p = s.address().port;
      s.close(() => resolve(p));
    });
  });
}

/**
 * Launch Chrome with lean flags over the pinned exit (whole-browser
 * --proxy-server; authenticated HTTP proxies are answered through the Fetch
 * domain). The page session is auto-attached and wired for proxy auth.
 */
async function launchChrome(exit) {
  const bin = findChrome();
  const debugPort = DEBUG_PORT || (await freePort());
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'tokeness-cli-'));
  const args = [
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-default-apps',
    '--disable-sync',
    '--disable-features=Translate,BackForwardCache,AcceptCHFrame,MediaRouter,OptimizationHints',
    '--renderer-process-limit=2',
    '--js-flags=--max-old-space-size=256',
    '--no-first-run',
    '--no-default-browser-check',
    '--mute-audio',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`,
    '--window-size=1280,900',
    '--remote-allow-origins=*',
  ];
  if (HEADLESS) args.push('--headless=new');
  if (exit) args.push(`--proxy-server=${exit.protocol}://${exit.host}:${exit.port}`);
  args.push('about:blank');

  const child = spawn(bin, args, { detached: false, stdio: 'ignore' });
  const cleanup = () => {
    killChromeTree(child);
    setTimeout(() => { try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {} }, 2000).unref();
  };
  child.once('error', cleanup);

  const devFile = path.join(profile, 'DevToolsActivePort');
  let port = 0;
  let wsPath = '';
  for (let i = 0; i < 160 && !port; i++) {
    // The DevTools endpoint answers as soon as the browser is up; newer Chrome
    // builds only write DevToolsActivePort for ephemeral ports, so the file is
    // the secondary source here.
    const v = await fetch(`http://127.0.0.1:${debugPort}/json/version`).then((r) => r.json()).catch(() => null);
    if (v && v.webSocketDebuggerUrl) {
      const u = new URL(v.webSocketDebuggerUrl);
      port = Number(u.port);
      wsPath = u.pathname;
      break;
    }
    if (fs.existsSync(devFile)) {
      const lines = fs.readFileSync(devFile, 'utf8').split('\n');
      port = Number(lines[0]);
      wsPath = (lines[1] || '').trim();
      break;
    }
    await sleep(300);
  }
  if (!port) {
    cleanup();
    throw new Error(`chrome never came up (debug port ${debugPort} busy? pass --debug-port N)`);
  }

  const ws = new WsClient(`ws://127.0.0.1:${port}${wsPath || '/devtools/browser'}`);
  try {
    await ws.connect();
  } catch (e) {
    cleanup();
    throw e;
  }
  const cdp = new CDP(ws);

  // Auth'd HTTP proxy: answer 407 challenges via the Fetch domain, on the page
  // session and on every auto-attached child (out-of-process iframes).
  const needAuth = !!(exit && exit.username && exit.protocol !== 'socks5');
  const wired = new Set();
  const wireAuth = async (sid) => {
    if (!needAuth || !sid || wired.has(sid)) return;
    wired.add(sid);
    cdp.on('Fetch.authRequired', (p) => {
      cdp.send('Fetch.continueWithAuth', {
        requestId: p.requestId,
        authChallengeResponse: {
          response: 'ProvideCredentials',
          username: exit.username,
          password: exit.password || '',
          proxyUsername: exit.username,
          proxyPassword: exit.password || '',
        },
      }, sid).catch(() => {});
    }, sid);
    cdp.on('Fetch.requestPaused', (p) => cdp.send('Fetch.continueRequest', { requestId: p.requestId }, sid).catch(() => {}), sid);
    await cdp.send('Fetch.enable', { handleAuthRequests: true, patterns: [{ urlPattern: '*' }] }, sid).catch(() => {});
  };

  cdp.on('Target.attachedToTarget', (p) => wireAuth(p && p.sessionId));
  await cdp.send('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: false, flatten: true });
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  for (const d of ['Page', 'Runtime', 'Network']) await cdp.send(`${d}.enable`, {}, sessionId);
  await wireAuth(sessionId);

  return {
    cdp,
    targetId,
    sessionId,
    close: async () => {
      try { await cdp.send('Target.closeTarget', { targetId }); } catch (e) {}
      try { ws.close(); } catch (e) {}
      cleanup();
    },
  };
}

class Page {
  constructor(cdp, sessionId) {
    this.cdp = cdp;
    this.sessionId = sessionId;
  }
  async eval(expr, { awaitPromise = false, timeoutMs = 70000 } = {}) {
    const r = await withTimeout(this.cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise }, this.sessionId), timeoutMs, 'eval timeout');
    if (r.exceptionDetails) throw new Error('eval: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
    return r.result && r.result.value;
  }
  async goto(url) {
    await this.cdp.send('Page.navigate', { url }, this.sessionId);
  }
  async click(x, y) {
    for (const type of ['mousePressed', 'mouseReleased']) {
      await this.cdp.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 }, this.sessionId);
    }
  }
  async shoot(name) {
    try {
      const r = await this.cdp.send('Page.captureScreenshot', { format: 'png' }, this.sessionId);
      fs.mkdirSync(SHOTS_DIR, { recursive: true });
      fs.writeFileSync(path.join(SHOTS_DIR, `${name}.png`), Buffer.from(r.data, 'base64'));
    } catch (e) { /* diagnostics only */ }
  }
}

// ------------------------------------------------------- in-page turnstile
/**
 * Token helper injected into the register page (the proven production pattern):
 * the page's own widget is read first; otherwise an explicit `turnstile.render`
 * widget is mounted, and on failure the Node side clicks its checkbox iframe.
 */
const pageHelper = (sitekey) => `
window.${NS} = window.${NS} || {};
window.${NS}.readToken = () => {
  if (window.${NS}.pageTokenUsed) return null;
  const el = document.querySelector('input[name="cf-turnstile-response"], [id$="_response"]');
  return el && el.value && el.value.length > 20 ? el.value : null;
};
window.${NS}.startWidget = () => {
  if (window.${NS}.host && document.body.contains(window.${NS}.host)) window.${NS}.host.remove();
  const host = document.createElement('div');
  host.id = '${NS}_tt_host';
  host.style.cssText = 'position:fixed;left:12px;top:12px;z-index:2147483647;width:320px;height:84px;background:#fff';
  document.body.appendChild(host);
  window.${NS}.host = host;
  window.${NS}.settled = false;
  window.${NS}.widgetResult = new Promise((resolve, reject) => {
    const done = (fn, v) => {
      if (window.${NS}.settled) return;
      window.${NS}.settled = true;
      fn(v);
    };
    try {
      window.turnstile.render(host, {
        sitekey: ${JSON.stringify(sitekey)},
        callback: (t) => done(resolve, t),
        'error-callback': (e) => done(reject, new Error('ts error: ' + e)),
        'timeout-callback': () => done(reject, new Error('ts timeout')),
      });
    } catch (e) { done(reject, e); }
  });
  return true;
};
window.${NS}.awaitWidget = (timeoutMs) =>
  Promise.race([
    window.${NS}.widgetResult,
    new Promise((_, rej) => setTimeout(() => rej(new Error('ts deadline')), timeoutMs)),
  ]);
window.${NS}.hostRect = () => {
  const h = window.${NS}.host;
  if (!h) return null;
  const f = h.querySelector('iframe');
  const el = f || h;
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
};
window.${NS}.clearHost = () => { try { if (window.${NS}.host) window.${NS}.host.remove(); } catch (e) {} };
window.${NS}.fetchJson = async (p, opts) => {
  opts = opts || {};
  const r = await fetch(p, {
    method: opts.method || 'GET',
    headers: Object.assign({ Accept: 'application/json', 'Content-Type': 'application/json' }, opts.headers || {}),
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: 'include',
  });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) {}
  return { status: r.status, json, text };
};
true;
`;

/** One fresh in-page Turnstile token for `tag` (three attempts, click fallback). */
async function getToken(page, tag) {
  const existing = await page.eval(`window.${NS}.readToken()`);
  if (existing) {
    await page.eval(`window.${NS}.pageTokenUsed = true`);
    log(`  token(${tag}) from page widget: ${String(existing).length} chars`);
    return existing;
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    await page.eval(`window.${NS}.startWidget()`);
    try {
      const t = await page.eval(`window.${NS}.awaitWidget(22000)`, { awaitPromise: true, timeoutMs: 30000 });
      await page.eval(`window.${NS}.clearHost()`);
      log(`  token(${tag}) attempt ${attempt}: ${String(t).length} chars`);
      return t;
    } catch (e) {
      log(`  token(${tag}) attempt ${attempt} failed: ${String(e.message).slice(0, 110)}`);
      await page.shoot(`token-${tag}-${attempt}-fail`);
      try {
        const rect = await page.eval(`window.${NS}.hostRect()`);
        if (rect && rect.w > 10) {
          log(`  clicking widget iframe at ${Math.round(rect.x + 30)},${Math.round(rect.y + rect.h / 2)}`);
          await page.click(Math.round(rect.x + 30), Math.round(rect.y + rect.h / 2));
          const t2 = await page.eval(`window.${NS}.awaitWidget(25000)`, { awaitPromise: true, timeoutMs: 33000 });
          await page.eval(`window.${NS}.clearHost()`);
          log(`  token(${tag}) after click: ${String(t2).length} chars`);
          return t2;
        }
      } catch (e2) {
        log(`  click path failed: ${String(e2.message).slice(0, 90)}`);
      }
    }
  }
  throw new Error(`no turnstile token for ${tag}`);
}

/**
 * Launch Chrome over `proxy`, open `url` and hand back one fresh Turnstile
 * token through the same `getToken` path the mint uses; the browser is always
 * closed. A missing Chrome or an unsolved widget throws — never a silent null.
 */
async function solveCaptcha({ type = 'turnstile', sitekey = DEFAULT_SITEKEY, url = `${BASE}/register`, proxy = null } = {}) {
  if (type !== 'turnstile') throw new Error(`solveCaptcha: unsupported type "${type}" (this rail solves turnstile only)`);
  const exit = typeof proxy === 'string' ? parseProxy(proxy) : proxy || null;
  const started = Date.now();
  const chrome = await launchChrome(exit);
  try {
    const page = new Page(chrome.cdp, chrome.sessionId);
    await page.goto(url);
    let apiReady = null;
    for (let i = 0; i < 40; i++) {
      apiReady = await page.eval('typeof window.turnstile');
      if (apiReady === 'object' || apiReady === 'function') break;
      await sleep(1500);
    }
    if (apiReady !== 'object' && apiReady !== 'function') throw new Error('turnstile api never loaded through this proxy');
    await page.eval(pageHelper(sitekey));
    const token = await getToken(page, 'solve');
    return { token, ms: Date.now() - started };
  } finally {
    await chrome.close();
  }
}

module.exports = {
  solveCaptcha,
  parseProxy,
  NS,
  WsClient,
  CDP,
  findChrome,
  killChromeTree,
  freePort,
  launchChrome,
  Page,
  pageHelper,
  getToken,
};
