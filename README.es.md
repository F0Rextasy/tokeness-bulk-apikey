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

**Crea cuentas de Tokeness en masa con claves API autogeneradas — inferencia compatible con OpenAI + conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-22%20served-412991?style=for-the-badge)](https://tokeness.ai/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Inicio rápido](#-quick-start) · [🎁 Nivel gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-22-of-them) · [🧪 Usa la API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Cómo funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Opciones](#️-cli-options) · [🛰️ Detrás de un proxy](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por qué existe esto

Tokeness es un **fork de New-API** (`v1.0.0-rc.40-tokeness-intl.15`) detrás de una CDN global. Cada ruta de autenticación está detrás de un Cloudflare Turnstile **y** de una regla de correo electrónico, y la regla de correo —no el captcha— es lo que detiene a un script ingenuo: el panel mantiene una **lista blanca de dominios** (solo `gmail.com` / `outlook.com`) y rechaza cualquier dirección que contenga `+` por "símbolos especiales". Una vez que la dirección es simple y una salida residencial resuelve el widget, el registro es un flujo normal de `enviar código → registrar → iniciar sesión` y cada cuenta entrega **una clave con `unlimited_quota: true`**. La herramienta se demostró de extremo a extremo dos veces: el carril de laboratorio acuñó **10 cuentas → 10 claves**, y este CLI empaquetado luego acuñó una 11.ª en una **ejecución directa de 57 segundos** — todas ellas verificadas por chat en `tokeness/free` antes de ser escritas, y las **11/11 seguían activas** en la reverificación independiente.

## 🎁 Nivel gratuito — cuánto obtienes

| Qué | Valor |
| --- | --- |
| Cuota de registro por cuenta | **18000 unidades** — `GET /api/user/self` responde `quota: 18000` en cada cuenta nueva |
| Cuánto vale eso | `quota_per_unit 500000`, `usd_exchange_rate 7`, `price 7` → la concesión es de **≈ $0.036** |
| Cuota de la clave | la clave se crea con `unlimited_quota: true`, así que la comprobación a nivel de token está desactivada; la cuota propia de la cuenta sigue limitando el relay |
| Check-in diario | `checkin_enabled: true`, pero con una sesión responde `200 {"success":false,"message":"Turnstile token 为空"}` — quiere su propio token, así que la herramienta lo deja sin reclamar |
| Política de direcciones | **solo gmail.com y outlook.com** (probado dominio por dominio con tokens reales); un alias con `+` se rechaza textualmente — `管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。` |
| Una cuenta por dirección | una dirección se consume una vez; un buzón rechazado/ocupado se reemplaza por un buzón nuevo de Emailnator |
| Clase de salida | el widget de Turnstile pasa en modo gestionado desde una **salida residencial** (se midieron tanto proxy como un host residencial simple); una IP de centro de datos responde `600010` en el navegador (0/60 clics) |
| La unidad que escala | **una cuenta = una clave**, y la clave se escribe solo después de un chat 200 en vivo |

> 💡 El nivel gratuito lo define Tokeness y puede cambiar. Consulta los números en vivo en [tokeness.ai](https://tokeness.ai) — y deja que la propia puerta de la herramienta decida:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — los 22

`GET /v1/models` (200 con una clave activa) anuncia **22 ids**:

| ID del modelo | nota |
| --- | --- |
| `tokeness/free` | **la línea verificada — cada clave respondió 200 en ella (11/11 en la reverificación)** |
| `mimo-v2.6-flash` | **también registró 200** — una clave respondió `ok` en ella durante la reverificación independiente |
| `deepseek-v4.1-flash`, `deepseek-v4.1-flash-1017`, `deepseek-v4-flash`, `deepseek-v4-flash-vision-exp`, `deepseek-v4-pro` | anunciados, no verificados individualmente |
| `glm-5.3`, `glm-5.3-flash`, `glm-5.3-flashx` | anunciados, no verificados individualmente |
| `qwen3.8-flash`, `qwen3.7-plus`, `qwen3.8-max` | anunciados, no verificados individualmente |
| `mimo-v2.5`, `mimo-v2.5-pro`, `mimo-v2.6-pro` | anunciados, no verificados individualmente |
| `kimi-k2.6`, `kimi-k2.7-code`, `kimi-k3` | anunciados, no verificados individualmente |
| `minimax-m3`, `muse-spark-1.3-contributor`, `hy3` | anunciados, no verificados individualmente |

`tokeness/free` es el modelo con el que se verificó cada clave; `mimo-v2.6-flash` también obtuvo un 200. Los ids restantes son anunciados por `/v1/models` pero no se verificaron individualmente por chat, así que no se afirman aquí.

```bash
curl https://tokeness.ai/v1/chat/completions \
  -H "Authorization: Bearer <key>" -H "Content-Type: application/json" \
  -d '{"model":"tokeness/free","messages":[{"role":"user","content":"Reply with the single word: ok"}],"max_tokens":16}'
```

## 🧪 Cómo usar la API

URL base **`https://tokeness.ai/v1`** — compatible con OpenAI. `tokeness.io` es un `301` hacia `tokeness.ai`, y el propio `/api/status` del panel anuncia un host CDN `n.tokeness.dev` (sirve el mismo `/v1`, así que es un segundo endpoint útil cuando el host principal está ocupado).

```python
from openai import OpenAI
c = OpenAI(base_url="https://tokeness.ai/v1", api_key="<your key>")
print(c.chat.completions.create(model="tokeness/free",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 Inicio rápido

```bash
cd tokeness-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional, but a residential-class exit is what the widget likes
node src/launcher.js        # interactive: mint / verify / screen / settings / 9Router

# or: node src/cli.js --count 1 --pool proxies.txt
```

Una clave se escribe en `keys.txt` **solo** después de que `POST /v1/chat/completions` responda 200 con contenido real o contenido de razonamiento; `accounts.json` guarda correo electrónico / nombre de usuario / contraseña / clave / salida / cuota y los estados de cada paso.

### 🖱️ El lanzador

El lanzador pide la lista de proxies y la cantidad, las recuerda en `launcher.config.json` y ejecuta el CLI — acuñar, verificar, examinar salidas, ajustes, ayuda, Conectar a 9Router.

## ✅ Verificado y funcionando — cada clave se prueba

| Comprobación | Resultado |
| --- | --- |
| `GET /api/status` | **200** — registro activado, verificación por correo activada, `turnstile_check: true`, check-in activado, sitekey `0x4AAAAAADUMi6GTHDf1f5T7` publicada |
| `GET /api/verification?email=<plain gmail>&turnstile=<fresh>` | **200** `{"message":"","success":true}` |
| la misma llamada con un alias `+` | **200** `{"message":"管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。","success":false}` — el muro de alias, medido |
| el correo del panel | **«Tokeness email verification»** de `send@<panel-mail>`; el código son seis caracteres hexadecimales en el cuerpo (`Your verification code is: 7ca362`), TTL 10 minutos, entrega medida entre 34 s y 4 min |
| `POST /api/user/register?turnstile=<fresh>` | **200** `{"success":true}` con `{username, password, email, verification_code, aff_code, turnstile}` |
| `POST /api/user/login?turnstile=<fresh>` (contraseña simple) | **200** — la respuesta lleva el paquete de autenticación (`data.access_token`) |
| `GET /api/user/self` | **200** `id`, `quota 18000`, `group default` — **solo** con `Authorization: Bearer <access_token>`: solo con cookie responde `401 {"code":"AUTH_UNAUTHORIZED","message":"Unauthorized, invalid access token"}` |
| `POST /api/token/` | **200** pero **sin clave en la respuesta**; la lista la entrega enmascarada (`xxek**********VKbX`); `POST /api/token/<id>/key` → **200** con la clave real de 48 caracteres |
| `GET /v1/models` | **200**, **22** ids |
| `POST /v1/chat/completions` (`tokeness/free`) — para **cada** clave antes de ser escrita | **200** con contenido real — la ejecución completó **10/10 claves** |
| **una acuñación completa desde este paquete** (`--count 1`, directa, sin pool) | **1/1 clave en 57 s** — buzón, token de 730 caracteres, código, registro 200, inicio de sesión 200, clave 200, chat 200 |
| reverificación independiente de `keys.txt` (proceso separado, `--verify-only`) | **11/11 claves activas** — `tokeness/free` para diez de ellas, `mimo-v2.6-flash` para la undécima |
| `--screen` sobre una muestra mixta de salidas | la salida residencial y una salida de centro de datos pasaron las puertas de `/api/status` + el recurso de Turnstile; otras dos agotaron el tiempo — el carril del navegador sigue necesitando una clase de salida que el widget acepte |

## 🧭 Cómo funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Tokeness page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://tokeness.ai/v1/chat/completions → real content = the key is live
```

| Paso | Llamada | Notas |
| --- | --- | --- |
| 1 verificar salida | `GET /api/status` + `challenges.cloudflare.com/turnstile/v0/api.js` | una salida que no puede cargar ninguno de los dos se omite antes de gastar una cuenta |
| 2 buzón | Emailnator `POST /api/generate-email` | un gmail nuevo por cuenta, usado en su forma **sin puntos**: el panel rechaza `+` y los puntos, y Emailnator mismo consulta esa misma dirección simple |
| 3 navegador | Chrome sobre CDP, `GET /register` | un `--remote-debugging-port` distinto de cero mantiene `navigator.webdriver` en false |
| 4 enviar código | `GET /api/verification?email=…&turnstile=<fresh>` | fetch dentro de la página, así la cookie de sesión viaja con la petición |
| 5 leer código | Emailnator `/api/message-list` → `/api/message/<id>` | solo cuenta el correo que menciona tokeness (los buzones son un pool público); el código son seis caracteres hexadecimales en el cuerpo |
| 6 registrar | `POST /api/user/register?turnstile=<fresh>` | `verification_code` es el nombre del campo; el token viaja en la query **y** en el cuerpo |
| 7 iniciar sesión | `POST /api/user/login?turnstile=<fresh>` | contraseña simple (`password_login_encryption_enabled: false`); captura `access_token` |
| 8 clave | `POST /api/token/` → lista → `POST /api/token/<id>/key` | se requiere bearer; la respuesta de creación no tiene clave y la lista está enmascarada |
| 9 puerta | `GET /v1/models` + una completion | 200 con contenido = la clave está activa y solo entonces se escribe |

## ⚙️ Opciones del CLI

```bash
node src/cli.js --count 1 --pool proxies.txt   # mint (serial; one account = one key)
node src/cli.js --model mimo-v2.6-flash        # another gate model (advertised ids)
node src/cli.js --verify-only                  # re-check every key in keys.txt with a live chat call
node src/cli.js --screen                       # exit self-test: /api/status + the Turnstile asset
node src/cli.js --connect-9router              # register keys.txt with a local 9Router
node src/cli.js --help
```

| Variable de entorno | Predeterminado | Significado |
| --- | --- | --- |
| `TOKENESS_PROXIES` | `proxies.txt` | pool de salidas, una línea por proxy |
| `TOKENESS_MODEL` | `tokeness/free` | modelo usado para la puerta en vivo |
| `CHROME_PATH` | autodetectado | binario de Chrome/Edge para el navegador del captcha |

El CLI ejecuta una cuenta a la vez: el panel vincula una cuenta a su dirección y a su salida, así que las ejecuciones en paralelo solo compiten por el mismo recurso.

## 🛰️ Detrás de un proxy

**Opcional — y la herramienta funciona sin uno, pero la clase de salida decide quién puede acuñar.**

- **Con un pool:** pasa `--pool <file>` (o define `TOKENESS_PROXIES`) y cada petición de una cuenta —incluido el navegador del captcha— pasa por una salida fijada de esa lista, con fallo cerrado: un pool que no ofrece ninguna salida alcanzable hace fallar la ejecución en lugar de filtrar una petición desde tu propia dirección. `--screen` verifica cada salida en `/api/status` **y** el script de Turnstile antes de usarla.
- **Sin un pool:** el CLI imprime `running WITHOUT a proxy (direct)` y se conecta directamente. Medido: en un host residencial el widget igualmente se resolvió en modo gestionado y una cuenta completa se acuñó en 57 s, mientras que la misma página desde una IP de centro de datos nunca monta el desafío (`600010`, 0/60 clics en una prueba). Así que directo va bien desde una conexión doméstica y es inútil desde un VPS.
- Chrome no puede autenticarse ante un proxy SOCKS5, así que las líneas `socks5://user:pass@host:port` se descartan con una nota; `socks5://host:port` simple y `http://host:port` funcionan.

## 📄 Archivos

| Ruta | Contenido |
| --- | --- |
| `keys.txt` | una clave verificada en vivo por línea — ignorado por git |
| `accounts.json` | correo electrónico / nombre de usuario / contraseña / clave / salida / cuota / estados de pasos — ignorado por git |
| `proxies.txt` | tus salidas — ignorado por git |
| `out/` | registros de ejecución, capturas de pantalla y `attempts.jsonl` (una línea por intento fallido con su clase de fallo) — ignorado por git |

## 🔌 Conectar a 9Router

[9Router](https://9router.com) es un router autoalojado y compatible con OpenAI:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
node src/cli.js --connect-9router      # same, from the CLI
```

Predeterminados: `--prefix tokeness`, `--base-url https://tokeness.ai/v1`, `--model tokeness/free`. Los modelos se sirven como `tokeness/<model id>`.

## 🔑 Qué te da una clave

| | |
| --- | --- |
| 🏢 Proveedor | **Tokeness** — [tokeness.ai](https://tokeness.ai) |
| 🎁 Qué da el proveedor | una cuenta nueva con 18000 unidades de cuota (≈ $0.036) y un bono de check-in que protege con su propio captcha |
| 🔑 Qué te da una clave | una clave de 48 caracteres en su propia cuenta, creada con `unlimited_quota` y verificada por chat en `tokeness/free` |
| 🌐 Forma de la API | compatible con OpenAI: `POST https://tokeness.ai/v1/chat/completions` |
| 🔒 Tus datos | solo se contacta con `tokeness.ai` y tu backend de buzón; las claves permanecen en tu máquina |

## 🐞 Problemas

Si Tokeness cambia su regla de correo (lista blanca, política de alias), su sitekey de Turnstile o la ruta de revelación de claves, la herramienta se detiene en ese paso y la línea de `out/attempts.jsonl` indica qué clase de fallo encontró (`address-policy`, `mail`, `register`, `login`, `token`, `chat-gate`, `turnstile`, `exit`). **[Abre un issue](../../issues)** con el comando y la salida exacta.

## 📄 Licencia

MIT © 2026 — consulta [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 tokeness-bulk-apikey contributors

</div>