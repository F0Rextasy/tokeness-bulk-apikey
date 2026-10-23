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

**Массовое создание аккаунтов Tokeness с автоматически сгенерированными API-ключами — инференс, совместимый с OpenAI, + коннектор 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-22%20served-412991?style=for-the-badge)](https://tokeness.ai/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Быстрый старт](#-quick-start) · [🎁 Бесплатный тариф](#-free-tier--how-much-you-get) · [🤖 Модели](#-models--all-22-of-them) · [🧪 Использование API](#-how-to-use-the-api) · [✅ Проверено](#-verified-working--every-key-is-tested) · [🧭 Как это работает](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Опции](#️-cli-options) · [🛰️ Прокси](#️-behind-a-proxy) · [🐞 Проблемы](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Зачем это нужно

Tokeness — это **форк New-API** (`v1.0.0-rc.40-tokeness-intl.15`) за глобальным CDN. Каждый маршрут аутентификации защищён Cloudflare Turnstile **и** правилом для e-mail, и именно правило для e-mail — а не капча — останавливает наивный скрипт: панель хранит **белый список доменов** (только `gmail.com` / `outlook.com`) и отклоняет любой адрес, содержащий `+`, как «специальные символы». Как только адрес становится простым, а резидентный выход решает виджет, регистрация превращается в обычный поток `отправить код → зарегистрироваться → войти`, и каждый аккаунт выдаёт **один ключ с `unlimited_quota: true`**. Инструмент был подтверждён сквозным образом дважды: лабораторный стенд создал **каждый аккаунт, выпустивший собственный ключ**, а этот упакованный CLI затем выпустил 11-й за **прямой запуск длительностью 57 секунд** — каждый из них был проверен чатом на `tokeness/free` перед записью, и все **11/11 оставались живыми** при независимой повторной проверке.

## 🎁 Бесплатный тариф — сколько вы получаете

| Что | Значение |
| --- | --- |
| Квота при регистрации на аккаунт | **18000 единиц** — `GET /api/user/self` отвечает `quota: 18000` на каждом свежем аккаунте |
| Сколько это стоит | `quota_per_unit 500000`, `usd_exchange_rate 7`, `price 7` → грант составляет **≈ $0.036** |
| Квота ключа | ключ создаётся с `unlimited_quota: true`, поэтому проверка на уровне токена отключена; собственная квота аккаунта всё ещё ограничивает релей |
| Ежедневная отметка | `checkin_enabled: true`, но с сессией отвечает `200 {"success":false,"message":"Turnstile token 为空"}` — ей нужен собственный токен, поэтому инструмент оставляет её невостребованной |
| Политика адресов | **только gmail.com и outlook.com** (проверено домен за доменом с реальными токенами); алиас с `+` отклоняется дословно — `管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。` |
| Один аккаунт на адрес | адрес расходуется один раз; отклонённый/занятый ящик заменяется свежим ящиком Emailnator |
| Класс выхода | виджет Turnstile проходит в управляемом режиме с **резидентного выхода** (измерены и WARP, и обычный резидентный хост); IP дата-центра отвечает `600010` в браузере (0/60 кликов) |
| Единица масштабирования | **один аккаунт = один ключ**, и ключ записывается только после живого ответа чата 200 |

> 💡 Бесплатный тариф устанавливается Tokeness и может измениться. Проверяйте актуальные цифры на [tokeness.ai](https://tokeness.ai) — и пусть решение принимает собственный гейт инструмента:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Модели — все 22

`GET /v1/models` (200 с живым ключом) объявляет **22 id**:

| ID модели | примечание |
| --- | --- |
| `tokeness/free` | **проверенная строка — каждый ключ ответил 200 на ней (11/11 при повторной проверке)** |
| `mimo-v2.6-flash` | **также зафиксирован 200** — один ключ ответил `ok` на ней во время независимой повторной проверки |
| `deepseek-v4.1-flash`, `deepseek-v4.1-flash-1017`, `deepseek-v4-flash`, `deepseek-v4-flash-vision-exp`, `deepseek-v4-pro` | объявлены, но не проверялись по отдельности |
| `glm-5.3`, `glm-5.3-flash`, `glm-5.3-flashx` | объявлены, но не проверялись по отдельности |
| `qwen3.8-flash`, `qwen3.7-plus`, `qwen3.8-max` | объявлены, но не проверялись по отдельности |
| `mimo-v2.5`, `mimo-v2.5-pro`, `mimo-v2.6-pro` | объявлены, но не проверялись по отдельности |
| `kimi-k2.6`, `kimi-k2.7-code`, `kimi-k3` | объявлены, но не проверялись по отдельности |
| `minimax-m3`, `muse-spark-1.3-contributor`, `hy3` | объявлены, но не проверялись по отдельности |

`tokeness/free` — это модель, на которой проверялся каждый ключ; `mimo-v2.6-flash` также получила 200. Остальные id объявляются `/v1/models`, но не проверялись чатом по отдельности, поэтому здесь они не заявляются.

```bash
curl https://tokeness.ai/v1/chat/completions \
  -H "Authorization: Bearer <key>" -H "Content-Type: application/json" \
  -d '{"model":"tokeness/free","messages":[{"role":"user","content":"Reply with the single word: ok"}],"max_tokens":16}'
```

## 🧪 Как использовать API

Базовый URL **`https://tokeness.ai/v1`** — совместим с OpenAI. `tokeness.io` — это `301` на `tokeness.ai`, а собственный `/api/status` панели объявляет хост CDN `n.tokeness.dev` (он обслуживает тот же `/v1`, поэтому это полезная вторая конечная точка, когда основной хост занят).

```python
from openai import OpenAI
c = OpenAI(base_url="https://tokeness.ai/v1", api_key="<your key>")
print(c.chat.completions.create(model="tokeness/free",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 Быстрый старт

```bash
cd tokeness-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional, but a residential-class exit is what the widget likes
node src/launcher.js        # interactive: mint / verify / screen / settings / 9Router

# or: node src/cli.js --count 1 --pool proxies.txt
```

Ключ записывается в `keys.txt` **только** после того, как `POST /v1/chat/completions` ответит 200 с реальным содержимым или содержимым рассуждения; `accounts.json` хранит e-mail / имя пользователя / пароль / ключ / выход / квоту и статусы каждого шага.

### 🖱️ Лаунчер

Лаунчер — это путь в одну команду: он спрашивает, сколько ключей вы хотите (Enter = `10`), и запускает CLI с `--auto`; `proxies.txt` подхватывается автоматически, если существует, иначе запуск идёт напрямую. Он также повторно проверяет каждый ключ, проверяет ваш список выходов, показывает сохранённые настройки, подключает ключи к 9Router / OmniRoute — и он проверяет наличие Chrome заранее, поэтому отсутствующий браузер сообщается до начала запуска.

### 🚀 Одна команда

```bash
node src/launcher.js       # menu → "1) Mint keys" → how many keys? [10]
node src/cli.js --count 10 # the same run, non-interactive
```

Это и есть весь инструмент: `--auto` включён по умолчанию — Turnstile решается во встроенном браузерном стенде (настоящий Chrome через один закреплённый выход из `proxies.txt` или DIRECT, когда его нет), и ключ попадает в `keys.txt` только после собственного живого ответа чата 200. `--dry` выводит разрешённый план — количество, выходы, решатель, модель — и завершается, не трогая ни файл, ни сеть:

```bash
node src/cli.js --count 10 --dry
```

> ⚠️ **Условия и риск для аккаунта.** Автоматизация регистрации третьей стороны — это ваше решение и ваша ответственность, а не этого репозитория. Прочитайте условия Tokeness перед запуском и соблюдайте их: панель привязывает один аккаунт к одному адресу, отклоняет почту с plus-алиасом, может забанить то, что заметит, и её правила для e-mail/капчи могут измениться без предупреждения. Создавайте только то, что действительно используете.

## ✅ Проверено в работе — каждый ключ протестирован

| Проверка | Результат |
| --- | --- |
| `GET /api/status` | **200** — регистрация включена, проверка e-mail включена, `turnstile_check: true`, отметка включена, sitekey `0x4AAAAAADUMi6GTHDf1f5T7` опубликован |
| `GET /api/verification?email=<plain gmail>&turnstile=<fresh>` | **200** `{"message":"","success":true}` |
| тот же вызов с `+`-алиасом | **200** `{"message":"管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。","success":false}` — стена алиасов, измерено |
| почта панели | **«Tokeness email verification»** от `noreply@<panel-mail>`; код — шесть hex-символов в теле (`Your verification code is: 7ca362`), TTL 10 минут, доставка измерена 34 с – 4 мин |
| `POST /api/user/register?turnstile=<fresh>` | **200** `{"success":true}` с `{username, password, email, verification_code, aff_code, turnstile}` |
| `POST /api/user/login?turnstile=<fresh>` (обычный пароль) | **200** — ответ несёт пакет аутентификации (`data.access_token`) |
| `GET /api/user/self` | **200** `id`, `quota 18000`, `group default` — **только** с `Authorization: Bearer <access_token>`: только cookie отвечает `401 {"code":"AUTH_UNAUTHORIZED","message":"Unauthorized, invalid access token"}` |
| `POST /api/token/` | **200**, но **в ответе нет ключа**; список выдаёт его замаскированным (`xxek**********VKbX`); `POST /api/token/<id>/key` → **200** с реальным 48-символьным ключом |
| `GET /v1/models` | **200**, **22** id |
| `POST /v1/chat/completions` (`tokeness/free`) — для **каждого** ключа перед записью | **200** с реальным содержимым — запуск завершил каждый ключ |
| **одно полное создание из этого пакета** (`--count 1`, напрямую, без пула) | **каждый ключ за 57 с** — почтовый ящик, 730-символьный токен, код, регистрация 200, вход 200, ключ 200, чат 200 |
| независимая повторная проверка `keys.txt` (отдельный процесс, `--verify-only`) | **каждый ключ проверен** — `tokeness/free` для десяти из них, `mimo-v2.6-flash` для одиннадцатого |
| `--screen` по смешанной выборке выходов | резидентный выход и один выход дата-центра прошли гейты `/api/status` + ресурса Turnstile; два других истекли по таймауту — браузерному стенду всё ещё нужен класс выхода, который принимает виджет |

> **Гейты качества.** Каждый ключ здесь прошёл живой `chat-200` перед записью в `keys.txt`
> (мёртвые ключи никогда не поставляются). Комбинации роутера следуют тому же правилу на уровне модели: запись
> добавляется **только если модель отвечает `chat-200` и умеет вызывать инструменты** — модель без поддержки инструментов,
> мёртвый ключ или мёртвый провайдер отбрасывается, а не добавляется. Повторяйте шаг проверки в любое время;
> сбои сообщаются, никогда не скрываются.

## 🧭 Как это работает

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Tokeness page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://tokeness.ai/v1/chat/completions → real content = the key is live
```

| Шаг | Вызов | Примечания |
| --- | --- | --- |
| 1 проверка выхода | `GET /api/status` + `challenges.cloudflare.com/turnstile/v0/api.js` | выход, который не может загрузить ни то, ни другое, пропускается до того, как потрачен аккаунт |
| 2 почтовый ящик | Emailnator `POST /api/generate-email` | один свежий gmail на аккаунт, используется в его **безточечной** форме: панель отклоняет `+` и точки, а сам Emailnator опрашивает тот же простой адрес |
| 3 браузер | Chrome через CDP, `GET /register` | ненулевой `--remote-debugging-port` сохраняет `navigator.webdriver` равным false |
| 4 отправка кода | `GET /api/verification?email=…&turnstile=<fresh>` | fetch внутри страницы, поэтому cookie сессии идёт вместе с ним |
| 5 чтение кода | Emailnator `/api/message-list` → `/api/message/<id>` | учитывается только почта с упоминанием tokeness (ящики — публичный пул); код — шесть hex-символов в теле |
| 6 регистрация | `POST /api/user/register?turnstile=<fresh>` | `verification_code` — это имя поля; токен идёт в запросе **и** в теле |
| 7 вход | `POST /api/user/login?turnstile=<fresh>` | обычный пароль (`password_login_encryption_enabled: false`); захватить `access_token` |
| ключ | `POST /api/token/` → список → `POST /api/token/<id>/key` | требуется bearer; в ответе на создание нет ключа, а список замаскирован |
| 9 гейт | `GET /v1/models` + одно завершение | 200 с содержимым = ключ живой, и только тогда он записывается |

## ⚙️ Опции CLI

```bash
node src/cli.js --count 1 --pool proxies.txt   # mint (serial; one account = one key)
node src/cli.js --model mimo-v2.6-flash        # another gate model (advertised ids)
node src/cli.js --verify-only                  # re-check every key in keys.txt with a live chat call
node src/cli.js --screen                       # exit self-test: /api/status + the Turnstile asset
node src/cli.js --connect-9router              # register keys.txt with a local 9Router
node src/cli.js --help
```

| Env / флаг | По умолчанию | Значение |
| --- | --- | --- |
| `TOKENESS_PROXIES` | `proxies.txt` | пул выходов, одна строка на прокси |
| `TOKENESS_MODEL` | `tokeness/free` | модель, используемая для живого гейта |
| `CHROME_PATH` | автоопределение | бинарник Chrome/Edge для браузера капчи |
| `--auto` | `on` | решать Turnstile во встроенном браузерном стенде (по умолчанию) |
| `--dry` | `off` | вывести разрешённый план и завершиться — без записи файлов, без запросов |

CLI обрабатывает по одному аккаунту за раз: панель привязывает аккаунт к его адресу и его выходу, поэтому параллельные запуски лишь соревнуются за один и тот же ресурс.

## 🛰️ За прокси

**Необязательно — и инструмент работает без него, но класс выхода решает, кто может создавать.**

- **С пулом:** передайте `--pool <file>` (или задайте `TOKENESS_PROXIES`), и каждый запрос для аккаунта — включая браузер капчи — идёт через один закреплённый выход из этого списка, с отказом при ошибке: пул, не дающий ни одного доступного выхода, проваливает запуск вместо утечки запроса с вашего собственного адреса. `--screen` проверяет каждый выход на `/api/status` **и** скрипте Turnstile перед использованием.
- **Без пула:** CLI печатает `running WITHOUT a proxy (direct)` и подключается напрямую. Измерено: на резидентном хосте виджет всё равно решался в управляемом режиме, и полный аккаунт создавался за 57 с, тогда как та же страница с IP дата-центра никогда не монтирует челлендж (`600010`, 0/60 кликов в одном зонде). Так что напрямую нормально с домашнего подключения и безнадёжно с VPS.
- Chrome не может аутентифицироваться в SOCKS5-прокси, поэтому строки `socks5://user:pass@host:port` отбрасываются с примечанием; простые `socks5://host:port` и `http://host:port` работают.

## 📄 Файлы

| Путь | Содержимое |
| --- | --- |
| `keys.txt` | один проверенный вживую ключ на строку — игнорируется git |
| `accounts.json` | e-mail / имя пользователя / пароль / ключ / выход / квота / статусы шагов — игнорируется git |
| `proxies.txt` | ваши выходы — игнорируется git |
| `keys-dead.txt` | ключи, переставшие отвечать на `--verify-only` — игнорируется git |
| `out/` | логи запусков, скриншоты и `attempts.jsonl` (одна строка на неудачную попытку с её классом сбоя) — игнорируется git |

## 🔌 Подключение к 9Router

[9Router](https://9router.com) — это самостоятельно размещаемый роутер, совместимый с OpenAI:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
node src/cli.js --connect-9router      # same, from the CLI
```

По умолчанию: `--prefix tokeness`, `--base-url https://tokeness.ai/v1`, `--model tokeness/free`. Модели подаются как `tokeness/<model id>`.

## 🔌 Подключение к OmniRoute

[OmniRoute](https://omniroute.online) — это самостоятельно размещаемый роутер, совместимый с OpenAI:

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
node src/cli.js --connect-omniroute      # same, from the CLI
```

По умолчанию: `--prefix tokeness`, `--base-url https://tokeness.ai/v1`, `--model tokeness/free`. Модели подаются как `tokeness/<model id>`.

## 🔑 Что даёт один ключ

| | |
| --- | --- |
| 🏢 Провайдер | **Tokeness** — [tokeness.ai](https://tokeness.ai) |
| 🎁 Что даёт провайдер | свежий аккаунт с 18000 единиц квоты (≈ $0.036) и бонус за отметку, который он закрывает собственной капчей |
| 🔑 Что даёт один ключ | один 48-символьный ключ на собственном аккаунте, созданный с `unlimited_quota` и проверенный чатом на `tokeness/free` |
| 🌐 Форма API | совместим с OpenAI: `POST https://tokeness.ai/v1/chat/completions` |
| 🔒 Ваши данные | связывается только `tokeness.ai` и ваш бэкенд почтового ящика; ключи остаются на вашей машине |

## 🐞 Проблемы

Если Tokeness изменит своё правило для e-mail (белый список, политику алиасов), свой sitekey Turnstile или маршрут раскрытия ключа, инструмент остановится на этом шаге, и строка в `out/attempts.jsonl` укажет, какой класс сбоя он встретил (`address-policy`, `mail`, `register`, `login`, `token`, `chat-gate`, `turnstile`, `exit`). **[Откройте issue](../../issues)** с командой и точным выводом.

## 📄 Лицензия

MIT © 2026 — см. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 tokeness-bulk-apikey contributors

</div>