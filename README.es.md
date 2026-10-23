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
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Inicio rápido](#-quick-start) · [🎁 Nivel gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-22-of-them) · [🧪 Usar la API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Cómo funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Opciones](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por qué existe esto

Tokeness es un **fork de New-API** (`v1.0.0-rc.40-tokeness-intl.15`) detrás de un CDN global. Cada ruta de autenticación está detrás de un Cloudflare Turnstile **y** de una regla de correo electrónico, y la regla de correo —no el captcha— es lo que detiene a un script ingenuo: el panel mantiene una **lista blanca de dominios** (solo `gmail.com` / `outlook.com`) y rechaza cualquier dirección que contenga `+` por "símbolos especiales". Una vez que la dirección es simple y una salida residencial resuelve el widget, el registro es un flujo normal de `enviar código → registrar → iniciar sesión` y cada cuenta entrega **una clave con `unlimited_quota: true`**. La herramienta se demostró de extremo a extremo dos veces: el carril de laboratorio acuñó **cada cuenta acuñó su propia clave**, y este CLI empaquetado luego acuñó una undécima en una **ejecución directa de 57 segundos** — cada una de ellas verificada por chat en `tokeness/free` antes de ser escrita, las **11/11 aún activas** en la reverificación independiente.

## 🎁 Nivel gratuito — cuánto obtienes

| Qué | Valor |
| --- | --- |
| Cuota de registro por cuenta | **18000 unidades** — `GET /api/user/self` responde `quota: 18000` en cada cuenta nueva |
| Cuánto vale eso | `quota_per_unit 500000`, `usd_exchange_rate 7`, `price 7` → la asignación es **≈ $0.036** |
| Cuota de la clave | la clave se crea con `unlimited_quota: true`, así que la comprobación a nivel de token está desactivada; la cuota propia de la cuenta sigue limitando el relay |
| Check-in diario | `checkin_enabled: true`, pero con una sesión responde `200 {"success":false,"message":"Turnstile token 为空"}` — quiere su propio token, así que la herramienta lo deja sin reclamar |
| Política de direcciones | **solo gmail.com y outlook.com** (probado dominio por dominio con tokens reales); un alias con `+` se rechaza textualmente — `管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。` |
| Una cuenta por dirección | una dirección se usa una vez; un buzón rechazado/ocupado se reemplaza por un buzón nuevo de Emailnator |
| Clase de salida | el widget de Turnstile pasa en modo gestionado desde una **salida residencial** (se midieron tanto WARP como un host residencial simple); una IP de centro de datos responde `600010` en el navegador (0/60 clics) |
| La unidad que escala | **una cuenta = una clave**, y la clave se escribe solo tras un chat 200 en vivo |

> 💡 El nivel gratuito lo define Tokeness y puede cambiar. Consulta los números en vivo en [tokeness.ai](https://tokeness.ai) — y deja que la propia puerta de la herramienta decida:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — los 22

`GET /v1/models` (200 con una clave activa) anuncia **22 ids**:

| ID de modelo | nota |
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

URL base **`https://tokeness.ai/v1`** — compatible con OpenAI. `tokeness.io` es un `301` a `tokeness.ai`, y el propio `/api/status` del panel anuncia un host CDN `n.tokeness.dev` (sirve el mismo `/v1`, así que es un segundo endpoint útil cuando el host principal está ocupado).

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

### 🖱️ El launcher

El launcher es la ruta de un solo comando: pregunta cuántas claves quieres (Enter = `10`) y ejecuta el CLI con `--auto`; `proxies.txt` se detecta automáticamente cuando existe, de lo contrario la ejecución va directa. También reverifica cada clave, examina tu lista de salidas, muestra la configuración recordada, conecta claves a 9Router / OmniRoute — y comprueba Chrome de antemano, así que un navegador faltante se reporta antes de que comience una ejecución.

### 🚀 Un solo comando

```bash
node src/launcher.js       # menu → "1) Mint keys" → how many keys? [10]
node src/cli.js --count 10 # the same run, non-interactive
```

Esa es toda la herramienta: `--auto` está activado por defecto — el Turnstile se resuelve en el carril de navegador integrado (un Chrome real sobre una salida fijada de `proxies.txt`, o DIRECT cuando no hay ninguna) y una clave llega a `keys.txt` solo después de su propio chat 200 en vivo. `--dry` imprime el plan resuelto — recuento, salidas, solucionador, modelo — y sale sin tocar un archivo ni la red:

```bash
node src/cli.js --count 10 --dry
```

> ⚠️ **Términos y riesgo de cuenta.** Automatizar un registro de terceros es tu decisión y tu responsabilidad, no la de este repositorio. Lee los términos de Tokeness antes de ejecutar esto y respétalos: el panel vincula una cuenta a una dirección, rechaza el correo con alias plus, puede banear lo que detecte, y sus reglas de correo/captcha pueden cambiar sin aviso. Acuña solo lo que realmente uses.

## ✅ Verificado y funcionando — cada clave se prueba

| Comprobación | Resultado |
| --- | --- |
| `GET /api/status` | **200** — registro activado, verificación por correo activada, `turnstile_check: true`, check-in activado, sitekey `0x4AAAAAADUMi6GTHDf1f5T7` publicada |
| `GET /api/verification?email=<plain gmail>&turnstile=<fresh>` | **200** `{"message":"","success":true}` |
| la misma llamada con un alias `+` | **200** `{"message":"管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。","success":false}` — el muro de alias, medido |
| el correo del panel | **«Tokeness email verification»** de `noreply@<panel-mail>`; el código son seis caracteres hex en el cuerpo (`Your verification code is: 7ca362`), TTL 10 minutos, entrega medida 34 s – 4 min |
| `POST /api/user/register?turnstile=<fresh>` | **200** `{"success":true}` con `{username, password, email, verification_code, aff_code, turnstile}` |
| `POST /api/user/login?turnstile=<fresh>` (contraseña simple) | **200** — la respuesta lleva el paquete de autenticación (`data.access_token`) |
| `GET /api/user/self` | **200** `id`, `quota 18000`, `group default` — **solo** con `Authorization: Bearer <access_token>`: solo con cookie responde `401 {"code":"AUTH_UNAUTHORIZED","message":"Unauthorized, invalid access token"}` |
| `POST /api/token/` | **200** pero **sin clave en la respuesta**; la lista la entrega enmascarada (`xxek**********VKbX`); `POST /api/token/<id>/key` → **200** con la clave real de 48 caracteres |
| `GET /v1/models` | **200**, **22** ids |
| `POST /v1/chat/completions` (`tokeness/free`) — para **cada** clave antes de ser escrita | **200** con contenido real — la ejecución completó cada clave |
| **una acuñación completa desde este paquete** (`--count 1`, directa, sin pool) | **cada clave en 57 s** — buzón, token de 730 caracteres, código, registro 200, inicio de sesión 200, clave 200, chat 200 |
| reverificación independiente de `keys.txt` (proceso separado, `--verify-only`) | **cada clave verificada** — `tokeness/free` para diez de ellas, `mimo-v2.6-flash` para la undécima |
| `--screen` sobre una muestra mixta de salidas | la salida residencial y una salida de centro de datos pasaron las puertas de `/api/status` + el recurso de Turnstile; otras dos expiraron — el carril de navegador aún necesita una clase de salida que el widget acepte |

> **Puertas de calidad.** Cada clave aquí pasó un `chat-200` en vivo antes de ser escrita en `keys.txt`
> (las claves muertas nunca se entregan). Las combinaciones del router siguen la misma regla a nivel de modelo: una entrada se
> añade **solo si el modelo responde `chat-200` y puede llamar herramientas** — un modelo sin soporte de herramientas,
> una clave muerta o un proveedor muerto se descarta en lugar de añadirse. Vuelve a ejecutar el paso de verificación cuando quieras;
> los fallos se reportan, nunca se ocultan.

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
| 1 verificar salida | `GET /api/status` + `challenges.cloudflare.com/turnstile/v0/api.js` | una salida que no puede cargar ninguna de las dos se omite antes de gastar una cuenta |
| 2 buzón | Emailnator `POST /api/generate-email` | un gmail nuevo por cuenta, usado en su forma **sin puntos**: el panel rechaza `+` y puntos, y el propio Emailnator consulta esa misma dirección simple |
| 3 navegador | Chrome sobre CDP, `GET /register` | un `--remote-debugging-port` distinto de cero mantiene `navigator.webdriver` en false |
| 4 enviar código | `GET /api/verification?email=…&turnstile=<fresh>` | fetch dentro de la página, así la cookie de sesión viaja con ella |
| 5 leer código | Emailnator `/api/message-list` → `/api/message/<id>` | solo cuenta el correo que menciona tokeness (los buzones son un pool público); el código son seis caracteres hex en el cuerpo |
| 6 registrar | `POST /api/user/register?turnstile=<fresh>` | `verification_code` es el nombre del campo; el token viaja en la query **y** en el cuerpo |
| 7 iniciar sesión | `POST /api/user/login?turnstile=<fresh>` | contraseña simple (`password_login_encryption_enabled: false`); captura `access_token` |
| clave | `POST /api/token/` → lista → `POST /api/token/<id>/key` | se requiere bearer; la respuesta de creación no tiene clave y la lista está enmascarada |
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

| Env / flag | Predeterminado | Significado |
| --- | --- | --- |
| `TOKENESS_PROXIES` | `proxies.txt` | pool de salidas, una línea por proxy |
| `TOKENESS_MODEL` | `tokeness/free` | modelo usado para la puerta en vivo |
| `CHROME_PATH` | autodetectado | binario de Chrome/Edge para el navegador del captcha |
| `--auto` | `on` | resolver el Turnstile en el carril de navegador integrado (predeterminado) |
| `--dry` | `off` | imprimir el plan resuelto y salir — sin escrituras de archivos, sin solicitudes |

El CLI ejecuta una cuenta a la vez: el panel vincula una cuenta a su dirección y a su salida, así que las ejecuciones paralelas solo compiten por el mismo recurso.

## 🛰️ Detrás de un proxy

**Opcional — y la herramienta funciona sin uno, pero la clase de salida decide quién puede acuñar.**

- **Con un pool:** pasa `--pool <file>` (o define `TOKENESS_PROXIES`) y cada solicitud de una cuenta —incluido el navegador del captcha— pasa por una salida fijada de esa lista, con fallo cerrado: un pool que no produce ninguna salida alcanzable hace fallar la ejecución en lugar de filtrar una solicitud desde tu propia dirección. `--screen` verifica cada salida en `/api/status` **y** el script de Turnstile antes de usarla.
- **Sin un pool:** el CLI imprime `running WITHOUT a proxy (direct)` y se conecta directamente. Medido: en un host residencial el widget aún se resolvió en modo gestionado y una cuenta completa se acuñó en 57 s, mientras que la misma página desde una IP de centro de datos nunca monta el desafío (`600010`, 0/60 clics en una prueba). Así que directo está bien desde una conexión doméstica y es inútil desde un VPS.
- Chrome no puede autenticarse en un proxy SOCKS5, así que las líneas `socks5://user:pass@host:port` se descartan con una nota; `socks5://host:port` simple y `http://host:port` funcionan.

## 📄 Archivos

| Ruta | Contenido |
| --- | --- |
| `keys.txt` | una clave verificada en vivo por línea — ignorada por git |
| `accounts.json` | correo electrónico / nombre de usuario / contraseña / clave / salida / cuota / estados de pasos — ignorado por git |
| `proxies.txt` | tus salidas — ignorado por git |
| `keys-dead.txt` | claves que dejaron de responder a `--verify-only` — ignorado por git |
| `out/` | registros de ejecución, capturas de pantalla y `attempts.jsonl` (una línea por intento fallido con su clase de fallo) — ignorado por git |

## 🔌 Conectar con 9Router

[9Router](https://9router.com) es un router autoalojado y compatible con OpenAI:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
node src/cli.js --connect-9router      # same, from the CLI
```

Predeterminados: `--prefix tokeness`, `--base-url https://tokeness.ai/v1`, `--model tokeness/free`. Los modelos se sirven como `tokeness/<model id>`.

## 🔌 Conectar con OmniRoute

[OmniRoute](https://omniroute.online) es un router autoalojado y compatible con OpenAI:

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
node src/cli.js --connect-omniroute      # same, from the CLI
```

Predeterminados: `--prefix tokeness`, `--base-url https://tokeness.ai/v1`, `--model tokeness/free`. Los modelos se sirven como `tokeness/<model id>`.

## 🔑 Qué te da una clave

| | |
| --- | --- |
| 🏢 Proveedor | **Tokeness** — [tokeness.ai](https://tokeness.ai) |
| 🎁 Qué da el proveedor | una cuenta nueva con 18000 unidades de cuota (≈ $0.036) y un bono de check-in que protege con su propio captcha |
| 🔑 Qué te da una clave | una clave de 48 caracteres en su propia cuenta, creada con `unlimited_quota` y verificada por chat en `tokeness/free` |
| 🌐 Forma de la API | compatible con OpenAI: `POST https://tokeness.ai/v1/chat/completions` |
| 🔒 Tus datos | solo se contacta a `tokeness.ai` y a tu backend de buzón; las claves permanecen en tu máquina |

## 🐞 Problemas

Si Tokeness cambia su regla de correo (lista blanca, política de alias), su sitekey de Turnstile o la ruta de revelación de claves, la herramienta se detiene en ese paso y la línea de `out/attempts.jsonl` indica qué clase de fallo encontró (`address-policy`, `mail`, `register`, `login`, `token`, `chat-gate`, `turnstile`, `exit`). **[Abre un issue](../../issues)** con el comando y la salida exacta.

## 📄 Licencia

MIT © 2026 — consulta [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 tokeness-bulk-apikey contributors

</div>