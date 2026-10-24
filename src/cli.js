#!/usr/bin/env node
'use strict';

/**
 * tokeness-bulk-apikey CLI — mint Tokeness (tokeness.ai, New API fork
 * `v1.0.0-rc.40-tokeness-intl.15`) accounts, one API key per account, and keep
 * only the keys that survived a live chat call.
 *
 * Three gates stack on this panel, and all three are handled here:
 *   1. Cloudflare Turnstile (`0x4AAAAAADUMi6GTHDf1f5T7`); every auth route wants
 *      `?turnstile=`. The widget passes in managed mode through a residential
 *      exit (WARP measured), so the tool launches a real Chrome over one vetted
 *      exit and drives an explicit-render widget via CDP (Page/Runtime + a tiny
 *      built-in WebSocket client — still zero dependencies). Datacenter exits
 *      never issue a token here (0/60 clicks, error `600010`), which is exactly
 *      what `--screen` filters for.
 *   2. e-mail **domain whitelist** — only `gmail.com` and `outlook.com` pass
 *      (probed domain by domain by spending a real token per domain).
 *   3. **alias restriction** — an address carrying `+` is refused verbatim:
 *      `管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。`
 *      so the address handed to the panel must be the plain one, and the reader
 *      has to be able to read that same plain address. This tool therefore uses
 *      the Emailnator gmail pool in its **dot-free** form — the form Emailnator
 *      itself polls. (temp.tf's reader only reads its own `+tag` form, which this
 *      panel refuses: that rail cannot work here.)
 *
 * Flow, per account, browser + panel + live proof all through one pinned exit:
 *   1. vet exit  `GET /api/status` + the Turnstile script (with redirects) — an
 *                exit that cannot load challenges.cloudflare.com is skipped
 *   2. mailbox   Emailnator gmail pool via the same exit (dot-free form)
 *   3. browser   Chrome → `/register` → in-page Turnstile token
 *   4. send code `GET /api/verification?email=…&turnstile=<fresh>` (in-page fetch)
 *   5. code      poll the inbox — the panel mails «Tokeness email verification»
 *                from `noreply@<panel-mail>`, the code is **six hex chars in the
 *                body** (`Your verification code is: 7ca362`), life 10 minutes,
 *                delivery measured 34 s – 4 min, so the window defaults to 600 s
 *                and only mail naming tokeness is ever trusted (the pool boxes
 *                are public and carry other panels' spam)
 *   6. register  `POST /api/user/register?turnstile=<fresh>` with
 *                {username, password, email, verification_code, aff_code, turnstile}
 *   7. login     `POST /api/user/login?turnstile=<fresh>` (plain password — the
 *                panel reports encryption off); the answer carries the auth
 *                bundle and every later call needs `Authorization: Bearer
 *                <access_token>` — cookie-only answers
 *                `401 AUTH_UNAUTHORIZED "Unauthorized, invalid access token"`
 *   8. key       `POST /api/token/` under that bearer (this fork returns no key
 *                there and masks it in the list: `xxek**********VKbX`; the real
 *                key comes from `POST /api/token/<id>/key`)
 *   9. gate      `GET /v1/models` + a real completion through the same exit — a
 *                key is appended to `keys.txt` only after the chat 200
 *
 * Options:
 *   --count N        accounts (= keys) to mint, serial               [1]
 *   --model <id>     model used for the live gate           [tokeness/free]
 *   --pool <file>    proxy list, one exit per line (env TOKENESS_PROXIES) [optional]
 *   --exits N        exit candidates vetted per account               [6]
 *   --gap MS         pause between accounts                           [4000]
 *   --timeout MS     per-request timeout (node side)                 [60000]
 *   --code-timeout S seconds to wait for the e-mail code               [600]
 *   --key-name <s>   token name created on the panel            [tokeness-1]
 *   --debug-port N   Chrome DevTools port (nonzero)                  [auto]
 *   --browser <exe>  Chrome binary (env CHROME_PATH)              [auto]
 *   --headless       run Chrome headless (Turnstile then fails — not recommended)
 *   --keys <file>    key file for --verify-only / --connect-9router [keys.txt]
 *   --verify-only    re-run every key in the key file through the chat gate
 *   --screen         only test the proxy list (status + Turnstile script gates)
 *   --connect-9router  register this provider (and every key) on a local 9Router
 *   --help
 *
 * Zero dependencies. Node.js >= 18 (uses fetch only for the local 9Router).
 * Your proxy list is OPTIONAL: pass --pool (or the TOKENESS_PROXIES env) and
 * every request — browser included — goes through an exit from it, fail-closed.
 * Without a pool the tool connects directly, and then the Turnstile widget
 * usually refuses to mount (`600010`): this panel wants a residential exit.
 *
 * Smoke (one key through a local exit):
 *   node src/cli.js --count 1 --pool proxies.txt
 */

const fs = require('fs');
const path = require('path');
const net = require('net');
const tls = require('tls');
const http = require('http');
const crypto = require('crypto');
const { launchChrome, Page, pageHelper, getToken, findChrome, WsClient, CDP, NS } = require('./solver.js');

const IS_SRC = path.basename(__dirname) === 'src';
const ROOT = IS_SRC ? path.resolve(__dirname, '..') : __dirname;
const KEYS_FILE = path.join(ROOT, 'keys.txt');
const ACCOUNTS_FILE = path.join(ROOT, 'accounts.json');
const OUT_DIR = path.join(ROOT, 'out');
const DEAD_FILE = path.join(ROOT, 'keys-dead.txt');

const BASE = 'https://tokeness.ai';
const EMAILNATOR = 'https://www.emailnator.com';
const TURNSTILE_ASSET = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
/** Used only before the live `/api/status` answers with the panel's own sitekey. */
const DEFAULT_SITEKEY = '0x4AAAAAADUMi6GTHDf1f5T7';
/** Only mail carrying this word is trusted on the shared Emailnator boxes. */
const BRAND = /tokeness/i;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36';

// ------------------------------------------------------------------- options
const argv = process.argv.slice(2);
function arg(name, dflt) {
  const eq = argv.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.slice(name.length + 3);
  const i = argv.indexOf(`--${name}`);
  if (i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--')) return argv[i + 1];
  return dflt;
}
const has = (name) => argv.includes(`--${name}`) || argv.includes(`-${name}`);

if (has('help') || has('h')) {
  console.log(`tokeness-bulk-apikey — mint Tokeness accounts, one key each, verified by a live chat call.

  node src/cli.js --count 1          mint (a key is kept only after a chat 200)
  node src/cli.js --verify-only      re-check every key in keys.txt
  node src/cli.js --screen           test your proxy list against Tokeness
  node src/cli.js --connect-9router  register the provider + every key on a local 9Router
  node src/cli.js --help

  --count N      accounts to mint, serial                             [1]
  --model <id>   model used for the live gate              [tokeness/free]
  --pool <file>  proxy list, one exit per line (env TOKENESS_PROXIES) [optional]
  --exits N      exit candidates vetted per account                   [6]
  --code-timeout S  seconds to wait for the e-mail code             [600]
  --keys <file>  key file for --verify-only            [keys.txt]
  --debug-port N Chrome DevTools port — must be nonzero, free one picked by default
  --auto         solve the Turnstile in the built-in browser rail   [default]
  --dry          print the resolved plan and exit — no file or network writes

Every auth route on this panel is behind a Cloudflare Turnstile, so the tool
drives a real Chrome (CDP) over one vetted exit and reads tokens from an
explicit-render widget it mounts itself — no external solver service. The
address handed to the panel is the plain (dot-free) Emailnator gmail form: the
panel refuses plus-alias addresses and only whitelists gmail.com / outlook.com.

Requests go through the exits in your proxy list when one is provided (--pool or
the TOKENESS_PROXIES env). Without a pool the tool connects DIRECTLY — and the
widget then usually refuses to mount (error 600010): this panel wants a
residential exit.
`);
  process.exit(0);
}

const COUNT = Math.max(1, parseInt(arg('count', '1'), 10) || 1);
const MODEL = arg('model', process.env.TOKENESS_MODEL || 'tokeness/free');
const EXITS = Math.max(1, parseInt(arg('exits', '6'), 10) || 6);
const GAP_MS = Math.max(0, parseInt(arg('gap', '4000'), 10) || 0);
const TIMEOUT_MS = Math.max(5000, parseInt(arg('timeout', '60000'), 10) || 60000);
const CODE_TIMEOUT_MS = Math.max(30000, (parseInt(arg('code-timeout', '600'), 10) || 600) * 1000);
const KEY_NAME = arg('key-name', 'tokeness-1');
const VERIFY_ONLY = has('verify-only');
const SCREEN = has('screen');
const CONNECT_9ROUTER = has('connect-9router');
const KEYS_ARG = arg('keys', KEYS_FILE);
const KEYS_PATH = path.isAbsolute(KEYS_ARG) ? KEYS_ARG : fs.existsSync(KEYS_ARG) ? path.resolve(KEYS_ARG) : path.resolve(ROOT, KEYS_ARG);

const DRY = has('dry');
const AUTO = !has('no-auto'); // the browser rail is the only captcha path; --no-auto has no fallback

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
if (DRY) {
  const poolArg = arg('pool', process.env.TOKENESS_PROXIES || 'proxies.txt');
  const poolFile = fs.existsSync(poolArg) ? path.resolve(poolArg) : path.resolve(ROOT, poolArg);
  const poolLines = fs.existsSync(poolFile) ? fs.readFileSync(poolFile, 'utf8').split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith('#')) : [];
  let chrome = 'found';
  try { findChrome(); } catch (e) { chrome = `NOT found (${e.message})`; }
  console.log(`tokeness dry run — nothing written, nothing requested
  command   node src/cli.js --count ${COUNT}
  count     ${COUNT}
  model     ${MODEL}
  exits     ${poolLines.length ? `${poolLines.length} line(s) from ${poolFile}` : `none at ${poolFile} → DIRECT`}
  solver    src/solver.js · turnstile · Chrome ${chrome}
  keys      ${KEYS_FILE}`);
  process.exit(0);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const log = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);
const rand = (n) => crypto.randomBytes(32).toString('hex').slice(0, n);

function withTimeout(promise, ms, message) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });
}

// ------------------------------------------------------- fail-class ledger
/** One line per failure: {ts, account, exit, class, detail} in out/attempts.jsonl. */
function ledger(rec) {
  try {
    fs.appendFileSync(path.join(OUT_DIR, 'attempts.jsonl'), JSON.stringify({ ts: new Date().toISOString(), ...rec }) + '\n');
  } catch (e) { /* diagnostics must never break the run */ }
}
function classify(e) {
  const m = String((e && e.message) || e || '');
  if (/turnstile/i.test(m)) return 'turnstile';
  if (/特殊符号|alias restriction|别名/i.test(m)) return 'address-policy';
  if (/already in use|已被使用|已被注册|已存在|已注册/i.test(m)) return 'email-in-use';
  if (/verification code|verification send/i.test(m)) return 'mail';
  if (/register never succeeded/i.test(m)) return 'register';
  if (/login never succeeded/i.test(m)) return 'login';
  if (/key stayed masked|no token in/i.test(m)) return 'token';
  if (/chat gate|no model answered/i.test(m)) return 'chat-gate';
  if (/chrome|websocket|DevTools/i.test(m)) return 'browser';
  if (/proxy|connect|timeout|socket|ECONN|EPIPE|reset|TLS/i.test(m)) return 'exit';
  return 'other';
}

// ------------------------------------------------------------------- proxy
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
const labelOf = (p) => (p ? `${p.protocol}://${p.host}:${p.port}` : '(direct)');

/** A raw socket straight to host:port — direct-mode twin of connectThrough. */
function directConnect(host, port, timeoutMs) {
  return new Promise((resolve, reject) => {
    const sock = net.connect({ host, port });
    const t = setTimeout(() => { sock.destroy(); reject(new Error(`connect timeout (${host}:${port})`)); }, timeoutMs);
    sock.once('error', (e) => { clearTimeout(t); try { sock.destroy(); } catch {} reject(new Error(`connect failed: ${e.message}`)); });
    sock.once('connect', () => { clearTimeout(t); resolve(sock); });
  });
}

function connectThrough(proxy, host, port, timeoutMs) {
  return new Promise((resolve, reject) => {
    const sock = net.connect({ host: proxy.host, port: proxy.port });
    const t = setTimeout(() => { sock.destroy(); reject(new Error(`proxy timeout (${proxy.host}:${proxy.port})`)); }, timeoutMs);
    const done = (err, s) => { clearTimeout(t); if (err) { try { sock.destroy(); } catch {} reject(err); } else resolve(s); };
    sock.once('error', (e) => done(new Error(`proxy connect failed: ${e.message}`)));
    sock.once('connect', () => {
      if (proxy.protocol === 'socks5') {
        sock.write(proxy.username ? Buffer.from([5, 2, 0, 2]) : Buffer.from([5, 1, 0]));
        let stage = 0;
        let buf = Buffer.alloc(0);
        const sendConnect = () => {
          const hb = Buffer.from(host);
          sock.write(Buffer.concat([Buffer.from([5, 1, 0, 3, hb.length]), hb, Buffer.from([port >> 8, port & 0xff])]));
        };
        const onData = (d) => {
          try {
            buf = Buffer.concat([buf, d]);
            for (;;) {
              if (stage === 0) {
                if (buf.length < 2) return;
                const v = buf; buf = buf.slice(2);
                if (v[0] !== 5) return done(new Error('SOCKS5 bad version'));
                if (v[1] === 2) {
                  if (!proxy.username) return done(new Error('SOCKS5 auth required'));
                  const u = Buffer.from(proxy.username || '');
                  const p = Buffer.from(proxy.password || '');
                  sock.write(Buffer.concat([Buffer.from([1, u.length]), u, Buffer.from([p.length]), p]));
                  stage = 1;
                  continue;
                }
                if (v[1] !== 0) return done(new Error('SOCKS5 no acceptable method'));
                stage = 2; sendConnect(); continue;
              }
              if (stage === 1) {
                if (buf.length < 2) return;
                const v = buf; buf = buf.slice(2);
                if (v[1] !== 0) return done(new Error('SOCKS5 auth failed'));
                stage = 2; sendConnect(); continue;
              }
              if (stage === 2) {
                if (buf.length < 5) return;
                const atyp = buf[3];
                const need = 4 + (atyp === 1 ? 4 : atyp === 3 ? 1 + buf[4] : 16) + 2;
                if (buf.length < need) return;
                const rep = buf[1]; buf = buf.slice(need);
                if (rep !== 0) return done(new Error(`SOCKS5 connect failed (code ${rep})`));
                sock.off('data', onData);
                return done(null, sock);
              }
            }
          } catch (e) { done(e); }
        };
        sock.on('data', onData);
        return;
      }
      const auth = proxy.username ? `Proxy-Authorization: Basic ${Buffer.from(`${proxy.username}:${proxy.password || ''}`).toString('base64')}\r\n` : '';
      sock.write(`CONNECT ${host}:${port} HTTP/1.1\r\nHost: ${host}:${port}\r\n${auth}\r\n`);
      let buf = '';
      const onData = (d) => {
        buf += d;
        if (!buf.includes('\r\n\r\n')) return;
        sock.off('data', onData);
        if (!/^HTTP\/\d(\.\d)? 200/.test(buf)) return done(new Error(`proxy CONNECT refused: ${buf.split('\r\n')[0]}`));
        done(null, sock);
      };
      sock.on('data', onData);
    });
  });
}

/** One HTTPS request through one exit (or direct). Redirects are followed on demand. */
async function exitFetch(proxy, url, { method = 'GET', headers = {}, body = null, timeoutMs = TIMEOUT_MS, redirects = 0 } = {}) {
  let current = url;
  for (let hop = 0; ; hop++) {
    const u = new URL(current);
    const raw = proxy ? await connectThrough(proxy, u.hostname, u.port || 443, Math.min(timeoutMs, 20000)) : await directConnect(u.hostname, u.port || 443, Math.min(timeoutMs, 20000));
    const sock = tls.connect({ socket: raw, servername: u.hostname });
    try {
      await withTimeout(
        new Promise((res, rej) => { sock.once('secureConnect', res); sock.once('error', rej); }),
        timeoutMs,
        `TLS handshake timeout (${u.hostname})`
      );
      const payload = body == null ? null : Buffer.isBuffer(body) ? body : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
      const r = await withTimeout(
        new Promise((resolve, reject) => {
          const req = http.request(
            {
              method,
              path: u.pathname + u.search,
              createConnection: () => sock,
              headers: {
                host: u.host,
                'user-agent': UA,
                accept: '*/*',
                connection: 'close',
                ...(payload ? { 'content-type': 'application/json', 'content-length': payload.length } : {}),
                ...headers,
              },
            },
            (res) => {
              const chunks = [];
              res.on('data', (c) => chunks.push(c));
              res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') }));
            }
          );
          req.on('error', reject);
          if (payload) req.write(payload);
          req.end();
        }),
        timeoutMs,
        'request timeout'
      );
      try { sock.destroy(); } catch {}
      const loc = r.headers.location;
      if ([301, 302, 303, 307, 308].includes(r.status) && loc && hop < redirects) {
        const next = new URL(loc, current).toString();
        if (!next.startsWith('https://')) return { ...r, url: current };
        current = next;
        continue;
      }
      return { ...r, url: current };
    } catch (e) {
      try { sock.destroy(); } catch {}
      throw e;
    }
  }
}

async function exitJson(proxy, url, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (opts.body != null && !Buffer.isBuffer(opts.body)) headers['content-type'] = headers['content-type'] || 'application/json';
  const r = await exitFetch(proxy, url, { ...opts, headers });
  let json = null;
  try { json = JSON.parse(r.body); } catch { /* not json */ }
  return { status: r.status, json, text: r.body, headers: r.headers };
}

// ------------------------------------------------------------------- pool
function loadExits() {
  const poolArg = arg('pool', process.env.TOKENESS_PROXIES || 'proxies.txt');
  const poolFile = fs.existsSync(poolArg) ? path.resolve(poolArg) : path.resolve(ROOT, poolArg);
  if (!fs.existsSync(poolFile)) {
    // No pool = DIRECT mode: this panel's Turnstile gate needs a healthy exit
    // class, but the tool still works without one where the network allows.
    console.log(`no proxy list at ${poolFile} — running WITHOUT a proxy (direct).`);
    return [null];
  }
  const lines = fs.readFileSync(poolFile, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  const exits = [];
  let skipped = 0;
  for (const line of lines) {
    const p = parseProxy(line);
    if (!p) { skipped++; continue; }
    // Chrome cannot authenticate to a SOCKS5 proxy; such lines are unusable in
    // the browser rail and are dropped here (fail-closed, never silently direct).
    if (p.protocol === 'socks5' && p.username) { skipped++; continue; }
    exits.push(p);
  }
  if (skipped) console.log(`pool: ${skipped} line(s) skipped (unparsable or socks5-with-auth — Chrome cannot use those)`);
  if (!exits.length) throw new Error(`${poolFile} has no usable exits`);
  return exits;
}

/** Exit vet: the panel must answer AND the Turnstile script must load (with redirects). */
async function vetExit(exit) {
  const t0 = Date.now();
  const st = await exitJson(exit, `${BASE}/api/status`, { timeoutMs: 25000 });
  if (!(st.status === 200 && /password_register_enabled/.test(st.text))) {
    return { ok: false, why: `status ${st.status}` };
  }
  if (st.json && st.json.data && st.json.data.password_register_enabled === false) {
    return { ok: false, why: 'registration is disabled on the panel right now' };
  }
  const ts = await exitFetch(exit, TURNSTILE_ASSET, { timeoutMs: 35000, redirects: 4 });
  if (!(ts.status === 200 && /turnstile/i.test(ts.body))) return { ok: false, why: `turnstile asset ${ts.status}` };
  return { ok: true, ms: Date.now() - t0, data: (st.json && st.json.data) || {} };
}

async function screen(exits) {
  let ok = 0;
  for (const e of exits) {
    try {
      const v = await vetExit(e);
      if (v.ok) ok++;
      console.log(`  ${v.ok ? '✔' : '✘'} ${labelOf(e)} ${v.ok ? `ok ${v.ms}ms` : v.why}`);
    } catch (err) {
      console.log(`  ✘ ${labelOf(e)} ${String(err.message).slice(0, 90)}`);
    }
  }
  console.log(`screened ${exits.length} exit(s): ${ok} pass the status + Turnstile gates`);
  return ok;
}

// ------------------------------------------------------------------- mail
const emailnator = {
  headers: { origin: EMAILNATOR, referer: `${EMAILNATOR}/` },
  async json(exit, p, opts = {}) {
    return exitJson(exit, `${EMAILNATOR}${p}`, { ...opts, headers: { ...this.headers, ...(opts.headers || {}) } });
  },
};

/**
 * A fresh gmail box in its **dot-free** form: the panel refuses `+`, and dots
 * are "special symbols" to it too, while Emailnator itself polls the dot-free
 * address — so the form the panel gets and the form the reader uses are the same
 * string and gmail delivers either spelling to the same inbox.
 */
async function newMailbox(exit) {
  const r = await emailnator.json(exit, '/api/generate-email', { method: 'POST', body: { ids: [3] } });
  const dotted = r.json && r.json.email;
  if (!dotted || !/@gmail\.com$/i.test(dotted)) throw new Error(`emailnator generate ${r.status}: ${String(r.text).slice(0, 120)}`);
  const [local, domain] = dotted.split('@');
  return { provider: 'emailnator', dotted, address: `${local.replace(/\./g, '')}@${domain}` };
}

const inboxList = async (exit, box) => {
  const r = await emailnator.json(exit, '/api/message-list', { method: 'POST', body: { email: box.address, limit: 20 } });
  return (r.json && r.json.messages) || [];
};
const inboxRead = async (exit, box, id) => (await emailnator.json(exit, `/api/message/${encodeURIComponent(id)}`)).json || {};

/**
 * The panel's own code shape first — `Your verification code is: 7ca362`, six
 * hex chars in the body — then the generic patterns other panels on the same
 * shared pool use.
 */
function extractCode(blobRaw) {
  const blob = String(blobRaw)
    .replace(/<[^>]+>/g, ' ')
    .replace(/#[0-9a-fA-F]{3,8}\b/g, ' ') // the template's hex colours, not a code
    .replace(/&nbsp;|&amp;/g, ' ');
  const exact = /verification code is:?\s*([0-9a-z]{4,8})\b/i.exec(blob) || /\b([0-9a-f]{6})\b/i.exec(blob);
  if (exact) return exact[1];
  const near = [
    /(?:验证码|校验码|verification code|code)[^0-9a-z]{0,24}(\d{4,8})/i,
    /(?:验证码|code)[^0-9a-z]{0,24}([a-z0-9]{6})\b/i,
  ];
  for (const re of near) {
    const m = re.exec(blob);
    if (m) return m[1];
  }
  const six = /\b(\d{6})\b/.exec(blob);
  return six ? six[1] : null;
}

/**
 * Only mail that names tokeness is ours: the boxes are a public pool and carry
 * other panels' codes and spam. Delivery measured 34 s – 4 min, the code lives
 * 10 minutes, so the window defaults to 600 s.
 */
/**
 * Ids already in the box, taken BEFORE the code is requested. The Emailnator
 * gmail pool is shared and recycled, so a mail that was already there belongs to
 * another tenant and its digits are not ours. A failed snapshot is not an empty
 * box — it retries, then throws.
 */
async function snapshotIds(exit, box) {
  for (let k = 0; k < 4; k++) {
    try { const msgs = await inboxList(exit, box); if (Array.isArray(msgs)) return new Set(msgs.map((m) => String((m && m.id) || '')).filter(Boolean)); } catch (e) { /* retry */ }
    await sleep(4000);
  }
  throw new Error('inbox snapshot failed (exits unhealthy)');
}
async function waitForCode(exit, box, { timeoutMs = CODE_TIMEOUT_MS, pollMs = 5000, seenIds = [] } = {}) {
  const deadline = Date.now() + timeoutMs;
  const seen = new Set(seenIds instanceof Set ? seenIds : (seenIds || []).map(String));
  while (Date.now() < deadline) {
    let messages = [];
    try { messages = await inboxList(exit, box); } catch (e) { /* retry */ }
    for (const m of messages) {
      const id = String(m.id);
      if (seen.has(id)) continue;
      let full = m;
      if (!m.text && !m.html) {
        try { full = await inboxRead(exit, box, id); } catch (e) { continue; }
      }
      seen.add(id);
      const head = `${m.from || full.from || ''} ${m.subject || full.subject || ''}`;
      const body = String(full.content || full.html || full.text || '');
      if (!BRAND.test(head) && !BRAND.test(body)) continue;
      const code = extractCode(`${head}\n${body}`);
      if (code) return { code, subject: String(m.subject || full.subject || '').slice(0, 80), from: String(m.from || full.from || '').slice(0, 80) };
    }
    await sleep(pollMs);
  }
  throw new Error(`no tokeness verification code arrived in ${Math.round(timeoutMs / 1000)}s`);
}

// ------------------------------------------------------------ account flow
async function mintOnExit(n, exit, sitekey) {
  const started = Date.now();
  let box = await newMailbox(exit);
  log(`account ${n}: mailbox ${box.address}`);

  const chrome = await launchChrome(exit);
  const page = new Page(chrome.cdp, chrome.sessionId);
  let ua = null;
  let stage = 'browser';
  try {
    const inPage = (p, opts) => page.eval(`window.${NS}.fetchJson(${JSON.stringify(p)}, ${JSON.stringify(opts || {})})`, { awaitPromise: true, timeoutMs: 90000 });

    log(`account ${n}: goto ${BASE}/register via ${labelOf(exit)}`);
    await page.goto(`${BASE}/register`);
    await sleep(6000);
    ua = await page.eval('navigator.userAgent');
    await page.shoot('01-register');

    let apiReady = null;
    for (let i = 0; i < 40; i++) {
      apiReady = await page.eval('typeof window.turnstile');
      if (apiReady === 'object' || apiReady === 'function') break;
      await sleep(1500);
    }
    if (apiReady !== 'object' && apiReady !== 'function') {
      await page.shoot('02-no-turnstile-api');
      throw new Error('turnstile api never loaded through this exit');
    }
    await page.eval(pageHelper(sitekey));

    // 4) verification send — the mailbox is a *recycled* gmail box, so an
    //    address that already owns a panel account has to be dropped entirely.
    let email = box.address;
    let username = 'tks' + rand(8);
    let password = 'Tk' + rand(6) + '!' + rand(6) + '9';
    let sent = null;
    stage = 'mail';
  let seenIds = new Set();
    seenIds = await snapshotIds(exit, box);
    for (let boxTry = 1; boxTry <= 4 && !sent; boxTry++) {
      for (let attempt = 1; attempt <= 2 && !sent; attempt++) {
        const tok = await getToken(page, `verification${boxTry}-${attempt}`);
        seenIds = await snapshotIds(exit, box);
        const r = await inPage(`/api/verification?email=${encodeURIComponent(email)}&turnstile=${encodeURIComponent(tok)}`);
        log(`  verification -> ${r.status} ${String(r.text).slice(0, 160)}`);
        const msg = String((r.json && r.json.message) || '');
        if (r.json && r.json.success === true) sent = r;
        else if (/频繁|frequent|too many/i.test(msg)) {
          log('  send throttled — waiting 65s');
          await sleep(65000);
        } else if (/特殊符号|别名|alias/i.test(msg)) {
          // The panel refuses `+` in the address ("special symbols"); a box that
          // somehow carries one is replaced instead of retried.
          box = await newMailbox(exit);
          email = box.address;
          log(`  address refused by the alias rule — new mailbox ${email}`);
          break;
        } else if (/already in use|已被使用|已被注册|已存在|已注册/i.test(msg)) {
          box = await newMailbox(exit);
          email = box.address;
          username = 'tks' + rand(8);
          password = 'Tk' + rand(6) + '!' + rand(6) + '9';
          log(`  address already in use — new mailbox ${email}`);
          break;
        }
      }
    }
    if (!sent) throw new Error('verification send never succeeded');
    await page.shoot('03-sent');

    // 5) code
    stage = 'code';
    let code = (await waitForCode(exit, box, { seenIds })).code;
    log(`  code ${code}`);

    // 6) register — candidates from the inbox, each with its own fresh token.
    stage = 'register';
    const tried = new Set([code]);
    const nextCandidate = async () => {
      try {
        const msgs = await inboxList(exit, box);
        for (const m of msgs.slice(0, 12)) {
          const full = await inboxRead(exit, box, m.id).catch(() => null);
          const blob = `${m.subject || ''} ${(full && (full.content || full.html || full.text)) || ''}`;
          const cand = extractCode(blob);
          if (!cand || tried.has(cand)) continue;
          tried.add(cand);
          return cand;
        }
      } catch (e) {
        log(`  candidate scan failed: ${String(e.message).slice(0, 80)}`);
      }
      return null;
    };
    let reg = null;
    for (let attempt = 1; attempt <= 7 && !reg; attempt++) {
      const tok = await getToken(page, `register${attempt}`);
      const r = await inPage(`/api/user/register?turnstile=${encodeURIComponent(tok)}`, {
        method: 'POST',
        // exact SPA payload (the panel's own sign-up chunk): the field is
        // `verification_code` and the token rides in the query *and* the body
        body: { username, password, email, verification_code: code, aff_code: '', turnstile: tok },
      });
      log(`  register attempt ${attempt} (code ${code}) -> ${r.status} ${String(r.text).slice(0, 180)}`);
      if (r.json && r.json.success === true) reg = r;
      else if (r.json && /验证码|code|incorrect|expired/i.test(String(r.json.message || ''))) {
        const alt = await nextCandidate();
        if (alt) {
          code = alt;
          log(`  switching to candidate code ${code}`);
        } else await sleep(4000);
      }
    }
    if (!reg) throw new Error('register never succeeded');
    await page.shoot('04-registered');

    // 7) login — plaintext: the panel reports `password_login_encryption_enabled:
    //    false`; the RSA hop stays as a fallback for a fork that turns it on.
    stage = 'login';
    let auth = null;
    for (let attempt = 1; attempt <= 3 && !auth; attempt++) {
      const tok = await getToken(page, `login${attempt}`);
      let body = { username, password };
      let mode = 'plain';
      if (attempt === 3) {
        try {
          const keyRes = await inPage('/api/user/login/encryption-key');
          const data = (keyRes.json && keyRes.json.data) || {};
          const pub = data.public_key || data.publicKey;
          if (pub) {
            const encrypted = crypto
              .publicEncrypt({ key: pub, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, Buffer.from(password))
              .toString('base64');
            body = { username, password_encrypted: encrypted, encryption_key_id: data.kid || data.key_id || data.id };
            mode = 'rsa';
          }
        } catch (e) { /* stay plain */ }
      }
      const r = await inPage(`/api/user/login?turnstile=${encodeURIComponent(tok)}`, { method: 'POST', body });
      log(`  login attempt ${attempt} (${mode}) -> ${r.status} ${String(r.text).slice(0, 150)}`);
      const d = (r.json && r.json.data) || {};
      const access = d.access_token || d.token;
      if (access) auth = { token: access, sid: (d.session && (d.session.sid || d.session.id)) || d.session_id, user: d };
    }
    if (!auth) throw new Error('login never succeeded');

    const authHeaders = { Authorization: `Bearer ${auth.token}` };

    // 8) key create + reveal
    stage = 'token';
    const created = await inPage('/api/token/', {
      method: 'POST',
      headers: authHeaders,
      body: {
        name: KEY_NAME,
        expired_time: -1,
        remain_quota: 0,
        unlimited_quota: true,
        model_limits_enabled: false,
        model_limits: '',
        allow_ips: '',
        group: '',
      },
    });
    log(`  token create -> ${created.status} ${String(created.text).slice(0, 160)}`);

    const extract = (obj) => {
      if (!obj) return null;
      const cands = [];
      if (Array.isArray(obj)) cands.push(...obj);
      if (Array.isArray(obj.items)) cands.push(...obj.items);
      if (Array.isArray(obj.data)) cands.push(...obj.data);
      if (obj.data && Array.isArray(obj.data.items)) cands.push(...obj.data.items);
      if (obj.key || obj.api_key || obj.key_string) cands.push(obj);
      if (obj.data && (obj.data.key || obj.data.api_key || obj.data.key_string)) cands.push(obj.data);
      const usable = cands.filter((t) => t && typeof t === 'object' && (t.key || t.api_key || t.key_string));
      if (!usable.length) return null;
      const pick = usable.find((t) => String(t.name || '') === KEY_NAME) || usable[usable.length - 1];
      return { raw: pick, key: String(pick.key || pick.api_key || pick.key_string) };
    };

    let found = extract(created.json);
    if (!found) {
      const list = await inPage('/api/token/?p=0&size=100', { headers: authHeaders });
      found = extract(list.json);
    }
    if (!found) throw new Error(`no token in create/list response: ${String(created.text).slice(0, 140)}`);

    let key = found.key;
    if (key.includes('*')) {
      const id = found.raw.id ?? found.raw.token_id;
      const hops = [
        ['POST', `/api/token/${id}/key`],
        ['GET', `/api/token/${id}/key`],
        ['POST', `/api/token/${id}/reveal`],
        ['GET', `/api/token/${id}`],
      ];
      for (const [m, u] of hops) {
        const r = await inPage(u, { method: m, headers: authHeaders, body: m === 'POST' ? {} : undefined });
        const k = r.json && ((r.json.data && (r.json.data.key || r.json.data.api_key)) || r.json.key || (typeof r.json.data === 'string' ? r.json.data : null));
        if (k && !String(k).includes('*')) {
          key = String(k);
          break;
        }
      }
    }
    if (!key || key.includes('*')) throw new Error('key stayed masked');

    // 9) check-in + self (informational)
    let checkin = null;
    try {
      const r = await inPage('/api/user/checkin', { method: 'POST', headers: authHeaders, body: {} });
      checkin = { status: r.status };
      log(`  checkin -> ${r.status}`);
    } catch (e) { /* the check-in is Turnstile-gated; the quota headroom makes it optional */ }
    let self = null;
    try {
      const r = await inPage('/api/user/self', { headers: authHeaders });
      self = (r.json && r.json.data) || null;
      log(`  self -> ${r.status} quota=${self && self.quota} group=${self && self.group}`);
    } catch (e) { /* informational */ }
    await page.shoot('05-done');

    // 10) live proof through the same pinned exit — the key is kept only on 200.
    stage = 'verify';
    const proof = await proveKey(exit, key);
    if (!proof.ok) throw new Error(`chat gate ${proof.status}: ${String(proof.sample).slice(0, 120)}`);
    await page.shoot('06-live');

    log(
      `account ${n}: key LIVE on ${proof.model} (${proof.models} models) · quota ${self && self.quota} · ${key.slice(0, 8)}… · ${Math.round((Date.now() - started) / 1000)}s`
    );
    return {
      provider: 'tokeness',
      address: box.address,
      username,
      password,
      key,
      keyName: KEY_NAME,
      exit: labelOf(exit),
      ua,
      ts: new Date().toISOString(),
      quota: self && self.quota,
      used: self && self.used_quota,
      group: self && self.group,
      checkin,
      live: proof,
      models: proof.models,
    };
  } catch (e) {
    await page.shoot(`99-fatal-${stage}`).catch(() => {});
    e.tksStage = stage;
    throw e;
  } finally {
    await chrome.close();
  }
}

async function attemptAccount(n, exits, seed) {
  const limit = Math.min(EXITS, exits.length);
  for (let t = 0; t < limit; t++) {
    const exit = exits[(seed + t) % exits.length];
    let vet;
    try {
      vet = await vetExit(exit);
    } catch (e) {
      vet = { ok: false, why: String(e.message).slice(0, 90) };
    }
    if (!vet.ok) {
      log(`account ${n}: exit ${labelOf(exit)} failed the vet (${vet.why}) — trying the next one`);
      ledger({ account: n, exit: labelOf(exit), class: 'exit-vet', detail: vet.why });
      continue;
    }
    log(`account ${n}: exit pinned ${labelOf(exit)} (vet ${vet.ms}ms)`);
    try {
      const rec = await mintOnExit(n, exit, (vet.data && vet.data.turnstile_site_key) || DEFAULT_SITEKEY);
      return rec;
    } catch (e) {
      const cls = classify(e);
      log(`account ${n}: ${cls} failed — ${String(e.message).slice(0, 150)}`);
      ledger({ account: n, exit: labelOf(exit), class: cls, stage: e.tksStage, detail: String(e.message).slice(0, 300) });
    }
  }
  return null;
}

// ------------------------------------------------------------ key handling
function readKeys(file = KEYS_PATH) {
  try {
    return fs
      .readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}
function appendKey(key) {
  fs.appendFileSync(KEYS_FILE, (fs.existsSync(KEYS_FILE) && fs.statSync(KEYS_FILE).size ? '\n' : '') + key + '\n');
}
function loadAccounts() {
  try { return JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8')); } catch { return []; }
}
function saveAccounts(list) {
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(list, null, 2) + '\n');
}

// ------------------------------------------------------------------- proof
const CHEAP_HINTS = ['mimo-v2.6-flash', 'longcat', 'step-5-preview', 'qwen3.8-flash', 'glm-5.3-flash', 'flash', 'deepseek', 'mini', 'lite', 'small'];
/** Chat-capable candidates, cheapest-looking first, embedding ids excluded. */
function pickCandidates(ids) {
  const chat = (ids || []).filter((id) => id && !/embedding|rerank/i.test(id));
  const out = [MODEL];
  for (const hint of CHEAP_HINTS) for (const id of chat) if (!out.includes(id) && id.toLowerCase().includes(hint)) out.push(id);
  for (const id of chat) if (!out.includes(id)) out.push(id);
  return out.slice(0, 8);
}

async function listModels(exit, key) {
  const r = await exitJson(exit, `${BASE}/v1/models`, { headers: { authorization: `Bearer ${key}` }, timeoutMs: TIMEOUT_MS });
  return { status: r.status, ids: ((r.json && r.json.data) || []).map((m) => m.id).filter(Boolean) };
}

/** One real completion; 200 with content (or reasoning) = the key is live. */
async function chatGate(exit, key, model) {
  const r = await exitJson(exit, `${BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}` },
    timeoutMs: Math.max(TIMEOUT_MS, 120000),
    body: { model, messages: [{ role: 'user', content: 'Reply with the single word: ok' }], max_tokens: 16, stream: false },
  });
  const msg = r.json && r.json.choices && r.json.choices[0] && r.json.choices[0].message;
  const content = msg && (msg.content || msg.reasoning_content);
  return { ok: r.status === 200 && !!content, status: r.status, model, sample: content ? String(content).slice(0, 60) : String(r.text).slice(0, 140) };
}

/** Models + a completion on the first model that answers — the keep/drop gate. */
async function proveKey(exit, key) {
  const models = await listModels(exit, key);
  if (models.status !== 200 || !models.ids.length) {
    return { ok: false, status: models.status, models: 0, sample: `GET /v1/models -> ${models.status}` };
  }
  let last = null;
  for (const model of pickCandidates(models.ids)) {
    try {
      const g = await chatGate(exit, key, model);
      if (g.ok) return { ok: true, status: 200, model: g.model, sample: g.sample, models: models.ids.length };
      last = g;
    } catch (e) {
      last = { status: 0, model, sample: String(e.message).slice(0, 120) };
    }
  }
  return { ok: false, status: last && last.status, models: models.ids.length, sample: (last && last.sample) || 'no model answered' };
}

// ------------------------------------------------------------------- modes
async function mint(exits) {
  log(`tokeness mint · ${COUNT} account(s) · model ${MODEL} · exits ${exits.filter(Boolean).length || 'direct'} · keys land in ${KEYS_FILE}`);
  if (COUNT > 1) log('note: one account per e-mail address and one key per account — a batch is N risk units on one exit class');
  const accounts = loadAccounts();
  let made = 0;
  for (let i = 0; i < COUNT; i++) {
    const rec = await attemptAccount(i + 1, exits, i);
    if (rec) {
      appendKey(rec.key);
      accounts.push(rec);
      saveAccounts(accounts);
      made++;
    }
    if (i < COUNT - 1 && GAP_MS) await sleep(GAP_MS);
  }
  log(`done — ${made}/${COUNT} key(s) written to ${KEYS_FILE}`);
  process.exit(made === COUNT ? 0 : 1);
}

async function verifyOnly(exits) {
  const keys = readKeys();
  if (!keys.length) {
    console.log(`no keys in ${KEYS_PATH}`);
    process.exit(0);
  }
  console.log(`keys: ${keys.length} from ${KEYS_PATH} · exits ${exits.filter(Boolean).length || 'direct'}`);
  let live = 0;
  const dead = [];
  let modelCount = null;
  for (let i = 0; i < keys.length; i++) {
    const exit = exits[i % exits.length];
    try {
      if (modelCount === null) {
        const m = await listModels(exit, keys[i]);
        modelCount = m.ids.length;
        console.log(`  /v1/models -> ${m.status}, ${modelCount} models`);
      }
      const g = await proveKey(exit, keys[i]);
      if (g.ok) live++;
      else if ([401, 402, 403].includes(Number(g.status))) dead.push({ key: keys[i], why: g.status });
      console.log(`  ${g.ok ? '✔' : '✘'} ${keys[i].slice(0, 8)}… chat=${g.ok ? 200 : g.status || 0} ${g.ok ? `${g.model} "${g.sample}"` : String(g.sample).slice(0, 90)}`);
    } catch (e) {
      console.log(`  ✘ ${keys[i].slice(0, 8)}… ${String(e.message).slice(0, 90)} (transport — key kept)`);
    }
  }
  if (dead.length) {
    const parked = fs.existsSync(DEAD_FILE) ? fs.readFileSync(DEAD_FILE, 'utf8') : '';
    const fresh = dead.filter((d) => !parked.includes(d.key)).map((d) => `${d.key}\t${d.why}\t${new Date().toISOString()}`);
    if (fresh.length) fs.appendFileSync(DEAD_FILE, fresh.join('\n') + '\n');
    console.log(`dead key(s) → ${DEAD_FILE}`);
  }
  console.log(`verify: ${live}/${keys.length} keys live`);
  process.exit(live === keys.length ? 0 : 1);
}

// ------------------------------------------------------------ 9Router
/** Register the provider-node + one connection per key on a local 9Router. */
async function connect9router() {
  const base = (arg('9router-base', 'http://localhost:20128')).replace(/\/$/, '');
  const password = arg('9router-password', '123456');
  const name = arg('9router-name', 'Tokeness');
  const prefix = arg('9router-prefix', 'tokeness');
  const baseUrl = arg('base-url', `${BASE}/v1`);
  const r9ua = 'tokeness-bulk-9router-connector/1.0';
  const keys = arg('api-key', '') ? [arg('api-key', '')] : readKeys();
  if (!keys.length) {
    console.log(`no keys — mint one first (node src/cli.js --count 1), or pass --api-key <key>`);
    process.exit(1);
  }

  const login = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': r9ua },
    body: JSON.stringify({ password }),
  });
  const setCookie = typeof login.headers.getSetCookie === 'function' ? login.headers.getSetCookie() : [];
  const cookie = setCookie.map((c) => c.split(';')[0]).join('; ');
  console.log(`9Router login: ${login.ok ? 'ok' : `not required/failed ${(await login.text()).slice(0, 120)}`}`);

  const api = async (route, init = {}) => {
    const res = await fetch(`${base}${route}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', 'User-Agent': r9ua, ...(cookie ? { Cookie: cookie } : {}), ...(init.headers || {}) },
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* non-JSON reported as text */ }
    return { status: res.status, ok: res.ok, json, text: text.slice(0, 300) };
  };

  const nodes = await api('/api/provider-nodes');
  let node = (((nodes.json || {}).nodes) || []).find((n) => n.prefix === prefix || n.name === name);
  if (node) {
    console.log(`provider-node exists: ${node.id} (prefix ${node.prefix})`);
  } else {
    const created = await api('/api/provider-nodes', {
      method: 'POST',
      body: JSON.stringify({ name, prefix, apiType: 'chat', type: 'openai-compatible', baseUrl }),
    });
    if (!created.ok) throw new Error(`create node failed ${created.status}: ${created.text}`);
    node = created.json.node;
    console.log(`provider-node created: ${node.id} (${baseUrl})`);
  }

  const conns = await api('/api/providers');
  const existing = (((conns.json || {}).connections) || []).filter((c) => c.provider === node.id || c.name === name);
  let added = 0;
  for (let i = 0; i < keys.length; i++) {
    const connName = keys.length === 1 ? name : `${prefix}-${String(i + 1).padStart(3, '0')}`;
    if (existing.some((c) => c.name === connName)) {
      console.log(`connection exists: ${connName}`);
      continue;
    }
    const created = await api('/api/providers', {
      method: 'POST',
      body: JSON.stringify({ provider: node.id, apiKey: keys[i], name: connName, priority: 1, defaultModel: MODEL }),
    });
    if (!created.ok && created.status !== 409) throw new Error(`create connection ${connName} failed ${created.status}: ${created.text}`);
    added++;
    console.log(`connection created: ${connName}`);
  }
  console.log(`\nDone — ${added} new connection(s). Models are served as ${prefix}/<model id>:\n  ${prefix}/${MODEL}`);
}

// ------------------------------------------------------------------- main
if (require.main === module) {
  (async () => {
    if (!AUTO) throw new Error('--no-auto: this tool has no manual token path — the Turnstile is solved in the built-in browser rail (drop --no-auto)');
    if (CONNECT_9ROUTER) {
      await connect9router();
      process.exit(0);
    }
    const exits = loadExits();
    if (SCREEN) {
      const pass = await screen(exits);
      process.exit(pass ? 0 : 1);
    }
    if (VERIFY_ONLY) {
      await verifyOnly(exits);
      return;
    }
    await mint(exits);
  })().catch((e) => {
    console.error('[fatal]', e.message);
    process.exit(1);
  });
}

// Exported so the lab can drive parts of the rail directly (page probe); the
// CLI itself only runs its main flow when executed as a script.
module.exports = { parseProxy, extractCode, pickCandidates, launchChrome, Page, pageHelper, getToken, WsClient, CDP };
