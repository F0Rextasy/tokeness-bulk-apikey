<div align="center">

```
████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗███████╗███████╗███████╗
╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║██╔════╝██╔════╝██╔════╝
   ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║█████╗  ███████╗███████╗
   ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║██╔══╝  ╚════██║╚════██║
   ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║███████╗███████║███████║
   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚══════╝╚══════╝╚══════╝
```

# tokeness-bulk-apikey

**Bulk-create Tokeness accounts with auto-generated API keys — OpenAI-compatible inference + 9Router connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-22%20served-412991?style=for-the-badge)](https://tokeness.ai/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Quick start](#-quick-start) · [🎁 Free tier](#-free-tier--how-much-you-get) · [🤖 Models](#-models--all-22-of-them) · [🧪 Use the API](#-how-to-use-the-api) · [✅ Verified](#-verified-working--every-key-is-tested) · [🧭 How it works](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Options](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Why this exists

Tokeness is a **New-API fork** (`v1.0.0-rc.40-tokeness-intl.15`) behind a global CDN. Every auth route is behind a Cloudflare Turnstile **and** an e-mail rule, and the e-mail rule — not the captcha — is what stops a naive script: the panel keeps a **domain whitelist** (`gmail.com` / `outlook.com` only) and refuses any address carrying `+` as "special symbols". Once the address is plain and a residential exit solves the widget, signup is a normal `send code → register → login` flow and each account hands out **one key with `unlimited_quota: true`**. The tool was proven end-to-end twice: the lab rail minted **keys verified**, and this packaged CLI then minted an 11th in a **57-second direct run** — every one of them chat-verified on `tokeness/free` before it was written, all **11/11 still live** on the independent re-check.

## 🎁 Free tier — how much you get

| What | Value |
| --- | --- |
| Sign-up quota per account | **18000 units** — `GET /api/user/self` answers `quota: 18000` on every fresh account |
| What that is worth | `quota_per_unit 500000`, `usd_exchange_rate 7`, `price 7` → the grant is **≈ $0.036** |
| Key quota | the key is created with `unlimited_quota: true`, so the token-level check is off; the account's own quota still gates the relay |
| Daily check-in | `checkin_enabled: true`, but with a session it answers `200 {"success":false,"message":"Turnstile token 为空"}` — it wants its own token, so the tool leaves it unclaimed |
| Address policy | **gmail.com and outlook.com only** (probed domain by domain with real tokens); a `+` alias is refused verbatim — `管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。` |
| One account per address | an address is spent once; a refused/taken box is replaced by a fresh Emailnator box |
| Exit class | the Turnstile widget passes in managed mode from a **residential exit** (proxy and a plain residential host both measured); a datacenter IP answers `600010` in the browser (0/60 clicks) |
| The unit that scales | **one account = one key**, and the key is written only after a live chat 200 |

> 💡 The free tier is set by Tokeness and can change. Check the live numbers at [tokeness.ai](https://tokeness.ai) — and let the tool's own gate decide:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Models — all 22 of them

`GET /v1/models` (200 with a verified keys) advertises **22 ids**:

| Model ID | note |
| --- | --- |
| `tokeness/free` | **the verified line — every key answered 200 on it (11/11 on the re-check)** |
| `mimo-v2.6-flash` | **also recorded 200** — a key answered `ok` on it during the independent re-check |
| `deepseek-v4.1-flash`, `deepseek-v4.1-flash-1017`, `deepseek-v4-flash`, `deepseek-v4-flash-vision-exp`, `deepseek-v4-pro` | advertised, not individually gated |
| `glm-5.3`, `glm-5.3-flash`, `glm-5.3-flashx` | advertised, not individually gated |
| `qwen3.8-flash`, `qwen3.7-plus`, `qwen3.8-max` | advertised, not individually gated |
| `mimo-v2.5`, `mimo-v2.5-pro`, `mimo-v2.6-pro` | advertised, not individually gated |
| `kimi-k2.6`, `kimi-k2.7-code`, `kimi-k3` | advertised, not individually gated |
| `minimax-m3`, `muse-spark-1.3-contributor`, `hy3` | advertised, not individually gated |

`tokeness/free` is the model every key was gated on; `mimo-v2.6-flash` picked up a 200 as well. The remaining ids are advertised by `/v1/models` but were not individually chat-gated, so they are not claimed here.

```bash
curl https://tokeness.ai/v1/chat/completions \
  -H "Authorization: Bearer <key>" -H "Content-Type: application/json" \
  -d '{"model":"tokeness/free","messages":[{"role":"user","content":"Reply with the single word: ok"}],"max_tokens":16}'
```

## 🧪 How to use the API

Base URL **`https://tokeness.ai/v1`** — OpenAI-compatible. `tokeness.io` is a `301` to `tokeness.ai`, and the panel's own `/api/status` advertises a CDN host `n.tokeness.dev` (it serves the same `/v1`, so it is a useful second endpoint when the main host is busy).

```python
from openai import OpenAI
c = OpenAI(base_url="https://tokeness.ai/v1", api_key="<your key>")
print(c.chat.completions.create(model="tokeness/free",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 Quick start

```bash
cd tokeness-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional, but a residential-class exit is what the widget likes
node src/launcher.js        # interactive: mint / verify / screen / settings / 9Router
# or: node src/cli.js --count 1 --pool proxies.txt
```

A key is written to `keys.txt` **only** after `POST /v1/chat/completions` answers 200 with real content or reasoning content; `accounts.json` keeps e-mail / username / password / key / exit / quota and the per-step statuses.

### 🖱️ The launcher

The launcher asks for the proxy list and the count, remembers them in `launcher.config.json`, and runs the CLI — mint, verify, screen exits, settings, help, Connect to 9Router.

## ✅ Verified working — every key is tested

| Check | Result |
| --- | --- |
| `GET /api/status` | **200** — register on, e-mail verification on, `turnstile_check: true`, check-in on, sitekey `0x4AAAAAADUMi6GTHDf1f5T7` published |
| `GET /api/verification?email=<plain gmail>&turnstile=<fresh>` | **200** `{"message":"","success":true}` |
| the same call with a `+` alias | **200** `{"message":"管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。","success":false}` — the alias wall, measured |
| the panel's mail | **«Tokeness email verification»** from `send@<panel-mail>`; the code is six hex chars in the body (`Your verification code is: 7ca362`), TTL 10 minutes, delivery measured 34 s – 4 min |
| `POST /api/user/register?turnstile=<fresh>` | **200** `{"success":true}` with `{username, password, email, verification_code, aff_code, turnstile}` |
| `POST /api/user/login?turnstile=<fresh>` (plain password) | **200** — the answer carries the auth bundle (`data.access_token`) |
| `GET /api/user/self` | **200** `id`, `quota 18000`, `group default` — **only** with `Authorization: Bearer <access_token>`: cookie-only answers `401 {"code":"AUTH_UNAUTHORIZED","message":"Unauthorized, invalid access token"}` |
| `POST /api/token/` | **200** but **no key in the answer**; the list hands it out masked (`xxek**********VKbX`); `POST /api/token/<id>/key` → **200** with the real 48-char key |
| `GET /v1/models` | **200**, **22** ids |
| `POST /v1/chat/completions` (`tokeness/free`) — for **every** key before it is written | **200** with real content — the run completed **verified** |
| **one full mint from this package** (`--count 1`, direct, no pool) | **verified** — mailbox, 730-char token, code, register 200, login 200, key 200, chat 200 |
| independent re-check of `keys.txt` (separate process, `--verify-only`) | **verified working** — `tokeness/free` for ten of them, `mimo-v2.6-flash` for the eleventh |
| `--screen` over a mixed exit sample | the residential exit and one datacenter exit passed the `/api/status` + Turnstile-asset gates; two others timed out — the browser rail still needs an exit class the widget accepts |

## 🧭 How it works

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Tokeness page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://tokeness.ai/v1/chat/completions → real content = the key is live
```

| Step | Call | Notes |
| --- | --- | --- |
| 1 vet exit | `GET /api/status` + `challenges.cloudflare.com/turnstile/v0/api.js` | an exit that cannot load either is skipped before an account is spent |
| 2 mailbox | Emailnator `POST /api/generate-email` | one fresh gmail per account, used in its **dot-free** form: the panel refuses `+` and dots, and Emailnator itself polls that same plain address |
| 3 browser | Chrome over CDP, `GET /register` | a non-zero `--remote-debugging-port` keeps `navigator.webdriver` false |
| 4 send code | `GET /api/verification?email=…&turnstile=<fresh>` | in-page fetch, so the session cookie rides along |
| 5 read code | Emailnator `/api/message-list` → `/api/message/<id>` | only mail naming tokeness counts (the boxes are a public pool); the code is six hex chars in the body |
| 6 register | `POST /api/user/register?turnstile=<fresh>` | `verification_code` is the field name; the token rides in the query **and** the body |
| 7 login | `POST /api/user/login?turnstile=<fresh>` | plain password (`password_login_encryption_enabled: false`); capture `access_token` |
| 8 key | `POST /api/token/` → list → `POST /api/token/<id>/key` | bearer required; the create answer has no key and the list is masked |
| 9 gate | `GET /v1/models` + one completion | 200 with content = the key is live and only then is it written |

## ⚙️ CLI options

```bash
node src/cli.js --count 1 --pool proxies.txt   # mint (serial; one account = one key)
node src/cli.js --model mimo-v2.6-flash        # another gate model (advertised ids)
node src/cli.js --verify-only                  # re-check every key in keys.txt with a live chat call
node src/cli.js --screen                       # exit self-test: /api/status + the Turnstile asset
node src/cli.js --connect-9router              # register keys.txt with a local 9Router
node src/cli.js --help
```

| Env | Default | Meaning |
| --- | --- | --- |
| `TOKENESS_PROXIES` | `proxies.txt` | exit pool, one line per proxy |
| `TOKENESS_MODEL` | `tokeness/free` | model used for the live gate |
| `CHROME_PATH` | auto-detected | Chrome/Edge binary for the captcha browser |

The CLI runs one account at a time: the panel ties an account to its address and its exit, so parallel runs only race for the same resource.

## 🛰️ Behind a proxy

**Optional — and the tool works without one, but the exit class decides who can mint.**

- **With a pool:** pass `--pool <file>` (or set `TOKENESS_PROXIES`) and every request for an account — the captcha browser included — goes through one pinned exit from that list, fail-closed: a pool that yields no reachable exit fails the run instead of leaking a request from your own address. `--screen` vets each exit on `/api/status` **and** the Turnstile script before it is used.
- **Without a pool:** the CLI prints `running WITHOUT a proxy (direct)` and connects directly. Measured: on a residential host the widget still solved in managed mode and a full account minted in 57 s, while the same page from a datacenter IP never mounts the challenge (`600010`, 0/60 clicks in one probe). So direct is fine from a home connection and hopeless from a VPS.
- Chrome cannot authenticate to a SOCKS5 proxy, so `socks5://user:pass@host:port` lines are dropped with a note; plain `socks5://host:port` and `http://host:port` work.

## 📄 Files

| Path | Contents |
| --- | --- |
| `keys.txt` | one live-verified key per line — git-ignored |
| `accounts.json` | e-mail / username / password / key / exit / quota / step statuses — git-ignored |
| `proxies.txt` | your exits — git-ignored |
| `out/` | run logs, screenshots and `attempts.jsonl` (one line per failed attempt with its fail class) — git-ignored |

## 🔌 Connect to 9Router

[9Router](https://9router.com) is a self-hosted, OpenAI-compatible router:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
node src/cli.js --connect-9router      # same, from the CLI
```

Defaults: `--prefix tokeness`, `--base-url https://tokeness.ai/v1`, `--model tokeness/free`. Models are served as `tokeness/<model id>`.

## 🔑 What one key gets you

| | |
| --- | --- |
| 🏢 Provider | **Tokeness** — [tokeness.ai](https://tokeness.ai) |
| 🎁 What the provider gives | a fresh account with 18000 quota units (≈ $0.036) and a check-in bonus it gates behind its own captcha |
| 🔑 What one key gets you | one 48-char key on its own account, created with `unlimited_quota` and chat-verified on `tokeness/free` |
| 🌐 API shape | OpenAI-compatible: `POST https://tokeness.ai/v1/chat/completions` |
| 🔒 Your data | only `tokeness.ai` and your inbox backend are contacted; keys stay on your machine |

## 🐞 Issues

If Tokeness changes its e-mail rule (whitelist, alias policy), its Turnstile sitekey or the key-reveal route, the tool stops at that step and the `out/attempts.jsonl` line says which fail class it hit (`address-policy`, `mail`, `register`, `login`, `token`, `chat-gate`, `turnstile`, `exit`). **[Open an issue](../../issues)** with the command and the exact output.

## 📄 License

MIT © 2026 — see [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 tokeness-bulk-apikey contributors

</div>
