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

**Tokeness-Konten im Bulk anlegen mit automatisch generierten API-Schlüsseln — OpenAI-kompatible Inferenz + 9Router-Connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-22%20served-412991?style=for-the-badge)](https://tokeness.ai/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Schnellstart](#-quick-start) · [🎁 Free-Tier](#-free-tier--how-much-you-get) · [🤖 Modelle](#-models--all-22-of-them) · [🧪 Die API nutzen](#-how-to-use-the-api) · [✅ Verifiziert](#-verified-working--every-key-is-tested) · [🧭 So funktioniert es](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Optionen](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Warum es das gibt

Tokeness ist ein **New-API-Fork** (`v1.0.0-rc.40-tokeness-intl.15`) hinter einem globalen CDN. Jede Auth-Route liegt hinter einem Cloudflare Turnstile **und** einer E-Mail-Regel, und die E-Mail-Regel — nicht das Captcha — ist das, was ein naives Skript stoppt: Das Panel führt eine **Domain-Whitelist** (`gmail.com` / `outlook.com` only) und lehnt jede Adresse mit `+` als „special symbols" ab. Sobald die Adresse schlicht ist und ein Residential-Exit das Widget löst, ist die Registrierung ein normaler `send code → register → login`-Flow, und jedes Konto gibt **einen Schlüssel mit `unlimited_quota: true`** aus. Das Tool wurde zweimal Ende-zu-Ende bewiesen: Die Lab-Rail hat **10 Konten → 10 Schlüssel** erzeugt, und diese paketierte CLI hat dann einen 11. in einem **57-Sekunden-Direktlauf** erzeugt — jeder einzelne vor dem Schreiben per Chat auf `tokeness/free` verifiziert, alle **11/11 beim unabhängigen Re-Check noch live**.

## 🎁 Free-Tier — wie viel du bekommst

| Was | Wert |
| --- | --- |
| Sign-up-Kontingent pro Konto | **18000 Einheiten** — `GET /api/user/self` antwortet `quota: 18000` bei jedem frischen Konto |
| Was das wert ist | `quota_per_unit 500000`, `usd_exchange_rate 7`, `price 7` → die Zuweisung ist **≈ $0.036** |
| Schlüssel-Kontingent | der Schlüssel wird mit `unlimited_quota: true` erstellt, also ist die Prüfung auf Token-Ebene aus; das Kontingent des Kontos selbst begrenzt weiterhin den Relay |
| Täglicher Check-in | `checkin_enabled: true`, aber mit einer Session antwortet es `200 {"success":false,"message":"Turnstile token 为空"}` — es will sein eigenes Token, also lässt das Tool es unbeansprucht |
| Adressrichtlinie | **nur gmail.com und outlook.com** (Domain für Domain mit echten Tokens geprüft); ein `+`-Alias wird wortwörtlich abgelehnt — `管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。` |
| Ein Konto pro Adresse | eine Adresse wird einmal verbraucht; eine abgelehnte/belegte Box wird durch eine frische Emailnator-Box ersetzt |
| Exit-Klasse | das Turnstile-Widget passiert im Managed-Modus von einem **Residential-Exit** (WARP und ein einfacher Residential-Host wurden beide gemessen); eine Datacenter-IP antwortet `600010` im Browser (0/60 Klicks) |
| Die Einheit, die skaliert | **ein Konto = ein Schlüssel**, und der Schlüssel wird erst nach einem Live-Chat-200 geschrieben |

> 💡 Der Free-Tier wird von Tokeness festgelegt und kann sich ändern. Prüfe die Live-Zahlen auf [tokeness.ai](https://tokeness.ai) — und lass das Gate des Tools selbst entscheiden:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelle — alle 22

`GET /v1/models` (200 mit einem Live-Schlüssel) bewirbt **22 IDs**:

| Modell-ID | Hinweis |
| --- | --- |
| `tokeness/free` | **die verifizierte Linie — jeder Schlüssel antwortete 200 darauf (11/11 beim Re-Check)** |
| `mimo-v2.6-flash` | **ebenfalls 200 aufgezeichnet** — ein Schlüssel antwortete `ok` darauf während des unabhängigen Re-Checks |
| `deepseek-v4.1-flash`, `deepseek-v4.1-flash-1017`, `deepseek-v4-flash`, `deepseek-v4-flash-vision-exp`, `deepseek-v4-pro` | beworben, nicht einzeln gegated |
| `glm-5.3`, `glm-5.3-flash`, `glm-5.3-flashx` | beworben, nicht einzeln gegated |
| `qwen3.8-flash`, `qwen3.7-plus`, `qwen3.8-max` | beworben, nicht einzeln gegated |
| `mimo-v2.5`, `mimo-v2.5-pro`, `mimo-v2.6-pro` | beworben, nicht einzeln gegated |
| `kimi-k2.6`, `kimi-k2.7-code`, `kimi-k3` | beworben, nicht einzeln gegated |
| `minimax-m3`, `muse-spark-1.3-contributor`, `hy3` | beworben, nicht einzeln gegated |

`tokeness/free` ist das Modell, auf das jeder Schlüssel gegated wurde; `mimo-v2.6-flash` bekam ebenfalls ein 200. Die übrigen IDs werden von `/v1/models` beworben, wurden aber nicht einzeln per Chat gegated, daher werden sie hier nicht beansprucht.

```bash
curl https://tokeness.ai/v1/chat/completions \
  -H "Authorization: Bearer <key>" -H "Content-Type: application/json" \
  -d '{"model":"tokeness/free","messages":[{"role":"user","content":"Reply with the single word: ok"}],"max_tokens":16}'
```

## 🧪 Die API nutzen

Base-URL **`https://tokeness.ai/v1`** — OpenAI-kompatibel. `tokeness.io` ist ein `301` auf `tokeness.ai`, und das `/api/status` des Panels selbst bewirbt einen CDN-Host `n.tokeness.dev` (er bedient dasselbe `/v1`, ist also ein nützlicher zweiter Endpunkt, wenn der Haupt-Host ausgelastet ist).

```python
from openai import OpenAI
c = OpenAI(base_url="https://tokeness.ai/v1", api_key="<your key>")
print(c.chat.completions.create(model="tokeness/free",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 Schnellstart

```bash
cd tokeness-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional, but a residential-class exit is what the widget likes
node src/launcher.js        # interactive: mint / verify / screen / settings / 9Router
# or: node src/cli.js --count 1 --pool proxies.txt
```

Ein Schlüssel wird **nur** dann in `keys.txt` geschrieben, wenn `POST /v1/chat/completions` mit 200 und echtem Inhalt oder Reasoning-Inhalt antwortet; `accounts.json` behält E-Mail / Benutzername / Passwort / Schlüssel / Exit / Kontingent und die Status je Schritt.

### 🖱️ Der Launcher

Der Launcher fragt nach der Proxy-Liste und der Anzahl, merkt sie sich in `launcher.config.json` und führt die CLI aus — mint, verify, screen exits, settings, help, Connect to 9Router.

## ✅ Verifiziert funktionierend — jeder Schlüssel wird getestet

| Prüfung | Ergebnis |
| --- | --- |
| `GET /api/status` | **200** — Registrierung an, E-Mail-Verifizierung an, `turnstile_check: true`, Check-in an, Sitekey `0x4AAAAAADUMi6GTHDf1f5T7` veröffentlicht |
| `GET /api/verification?email=<plain gmail>&turnstile=<fresh>` | **200** `{"message":"","success":true}` |
| derselbe Aufruf mit einem `+`-Alias | **200** `{"message":"管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。","success":false}` — die Alias-Wand, gemessen |
| die Mail des Panels | **«Tokeness email verification»** von `send@<panel-mail>`; der Code sind sechs Hex-Zeichen im Body (`Your verification code is: 7ca362`), TTL 10 Minuten, Zustellung gemessen 34 s – 4 min |
| `POST /api/user/register?turnstile=<fresh>` | **200** `{"success":true}` mit `{username, password, email, verification_code, aff_code, turnstile}` |
| `POST /api/user/login?turnstile=<fresh>` (Klartext-Passwort) | **200** — die Antwort trägt das Auth-Bundle (`data.access_token`) |
| `GET /api/user/self` | **200** `id`, `quota 18000`, `group default` — **nur** mit `Authorization: Bearer <access_token>`: nur-Cookie antwortet `401 {"code":"AUTH_UNAUTHORIZED","message":"Unauthorized, invalid access token"}` |
| `POST /api/token/` | **200**, aber **kein Schlüssel in der Antwort**; die Liste gibt ihn maskiert aus (`xxek**********VKbX`); `POST /api/token/<id>/key` → **200** mit dem echten 48-Zeichen-Schlüssel |
| `GET /v1/models` | **200**, **22** IDs |
| `POST /v1/chat/completions` (`tokeness/free`) — für **jeden** Schlüssel, bevor er geschrieben wird | **200** mit echtem Inhalt — der Lauf schloss **10/10 Schlüssel** ab |
| **ein vollständiger Mint aus diesem Paket** (`--count 1`, direkt, kein Pool) | **1/1 Schlüssel in 57 s** — Mailbox, 730-Zeichen-Token, Code, register 200, login 200, key 200, chat 200 |
| unabhängiger Re-Check von `keys.txt` (separater Prozess, `--verify-only`) | **11/11 Schlüssel live** — `tokeness/free` für zehn davon, `mimo-v2.6-flash` für den elften |
| `--screen` über eine gemischte Exit-Stichprobe | der Residential-Exit und ein Datacenter-Exit passierten die Gates `/api/status` + Turnstile-Asset; zwei andere liefen in ein Timeout — die Browser-Rail braucht weiterhin eine Exit-Klasse, die das Widget akzeptiert |

## 🧭 So funktioniert es

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Tokeness page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://tokeness.ai/v1/chat/completions → real content = the key is live
```

| Schritt | Aufruf | Hinweise |
| --- | --- | --- |
| 1 Exit prüfen | `GET /api/status` + `challenges.cloudflare.com/turnstile/v0/api.js` | ein Exit, der keines von beiden laden kann, wird übersprungen, bevor ein Konto verbraucht wird |
| 2 Mailbox | Emailnator `POST /api/generate-email` | eine frische Gmail pro Konto, in ihrer **punktfreien** Form verwendet: das Panel lehnt `+` und Punkte ab, und Emailnator selbst pollt dieselbe schlichte Adresse |
| 3 Browser | Chrome über CDP, `GET /register` | ein `--remote-debugging-port` ungleich null hält `navigator.webdriver` auf false |
| 4 Code senden | `GET /api/verification?email=…&turnstile=<fresh>` | In-Page-Fetch, damit das Session-Cookie mitfährt |
| 5 Code lesen | Emailnator `/api/message-list` → `/api/message/<id>` | nur Mail, die tokeness nennt, zählt (die Boxen sind ein öffentlicher Pool); der Code sind sechs Hex-Zeichen im Body |
| 6 Registrieren | `POST /api/user/register?turnstile=<fresh>` | `verification_code` ist der Feldname; das Token fährt in der Query **und** im Body mit |
| 7 Login | `POST /api/user/login?turnstile=<fresh>` | Klartext-Passwort (`password_login_encryption_enabled: false`); `access_token` erfassen |
| 8 Schlüssel | `POST /api/token/` → Liste → `POST /api/token/<id>/key` | Bearer erforderlich; die Create-Antwort enthält keinen Schlüssel und die Liste ist maskiert |
| 9 Gate | `GET /v1/models` + eine Completion | 200 mit Inhalt = der Schlüssel ist live, und erst dann wird er geschrieben |

## ⚙️ CLI-Optionen

```bash
node src/cli.js --count 1 --pool proxies.txt   # mint (serial; one account = one key)
node src/cli.js --model mimo-v2.6-flash        # another gate model (advertised ids)
node src/cli.js --verify-only                  # re-check every key in keys.txt with a live chat call
node src/cli.js --screen                       # exit self-test: /api/status + the Turnstile asset
node src/cli.js --connect-9router              # register keys.txt with a local 9Router
node src/cli.js --help
```

| Env | Standard | Bedeutung |
| --- | --- | --- |
| `TOKENESS_PROXIES` | `proxies.txt` | Exit-Pool, eine Zeile pro Proxy |
| `TOKENESS_MODEL` | `tokeness/free` | Modell, das für das Live-Gate verwendet wird |
| `CHROME_PATH` | automatisch erkannt | Chrome/Edge-Binary für den Captcha-Browser |

Die CLI läuft jeweils mit einem Konto: Das Panel bindet ein Konto an seine Adresse und seinen Exit, daher konkurrieren parallele Läufe nur um dieselbe Ressource.

## 🛰️ Hinter einem Proxy

**Optional — und das Tool funktioniert auch ohne, aber die Exit-Klasse entscheidet, wer minten kann.**

- **Mit einem Pool:** übergib `--pool <file>` (oder setze `TOKENESS_PROXIES`), und jede Anfrage für ein Konto — inklusive des Captcha-Browsers — geht durch einen fest zugewiesenen Exit aus dieser Liste, fail-closed: ein Pool, der keinen erreichbaren Exit liefert, lässt den Lauf fehlschlagen, statt eine Anfrage von deiner eigenen Adresse durchsickern zu lassen. `--screen` prüft jeden Exit auf `/api/status` **und** das Turnstile-Skript, bevor er verwendet wird.
- **Ohne Pool:** die CLI gibt `running WITHOUT a proxy (direct)` aus und verbindet direkt. Gemessen: auf einem Residential-Host löste das Widget im Managed-Modus trotzdem und ein vollständiges Konto wurde in 57 s erzeugt, während dieselbe Seite von einer Datacenter-IP die Challenge nie aufbaut (`600010`, 0/60 Klicks in einer Probe). Direkt ist also von einer Heimverbindung aus in Ordnung und von einem VPS aus hoffnungslos.
- Chrome kann sich nicht an einem SOCKS5-Proxy authentifizieren, daher werden `socks5://user:pass@host:port`-Zeilen mit einem Hinweis verworfen; schlichte `socks5://host:port` und `http://host:port` funktionieren.

## 📄 Dateien

| Pfad | Inhalt |
| --- | --- |
| `keys.txt` | ein live-verifizierter Schlüssel pro Zeile — von Git ignoriert |
| `accounts.json` | E-Mail / Benutzername / Passwort / Schlüssel / Exit / Kontingent / Schritt-Status — von Git ignoriert |
| `proxies.txt` | deine Exits — von Git ignoriert |
| `out/` | Lauf-Logs, Screenshots und `attempts.jsonl` (eine Zeile pro fehlgeschlagenem Versuch mit seiner Fail-Klasse) — von Git ignoriert |

## 🔌 Mit 9Router verbinden

[9Router](https://9router.com) ist ein selbst gehosteter, OpenAI-kompatibler Router:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
node src/cli.js --connect-9router      # same, from the CLI
```

Standardwerte: `--prefix tokeness`, `--base-url https://tokeness.ai/v1`, `--model tokeness/free`. Modelle werden als `tokeness/<model id>` bereitgestellt.

## 🔑 Was ein Schlüssel dir bringt

| | |
| --- | --- |
| 🏢 Anbieter | **Tokeness** — [tokeness.ai](https://tokeness.ai) |
| 🎁 Was der Anbieter gibt | ein frisches Konto mit 18000 Kontingent-Einheiten (≈ $0.036) und einen Check-in-Bonus, den er hinter seinem eigenen Captcha gated |
| 🔑 Was ein Schlüssel dir bringt | einen 48-Zeichen-Schlüssel auf seinem eigenen Konto, erstellt mit `unlimited_quota` und per Chat auf `tokeness/free` verifiziert |
| 🌐 API-Form | OpenAI-kompatibel: `POST https://tokeness.ai/v1/chat/completions` |
| 🔒 Deine Daten | nur `tokeness.ai` und dein Inbox-Backend werden kontaktiert; Schlüssel bleiben auf deiner Maschine |

## 🐞 Issues

Wenn Tokeness seine E-Mail-Regel (Whitelist, Alias-Richtlinie), seinen Turnstile-Sitekey oder die Key-Reveal-Route ändert, stoppt das Tool an diesem Schritt und die Zeile in `out/attempts.jsonl` sagt, welche Fail-Klasse es getroffen hat (`address-policy`, `mail`, `register`, `login`, `token`, `chat-gate`, `turnstile`, `exit`). **[Öffne ein Issue](../../issues)** mit dem Befehl und der exakten Ausgabe.

## 📄 Lizenz

MIT © 2026 — siehe [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 tokeness-bulk-apikey contributors

</div>