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

**Otomatik oluşturulan API anahtarlarıyla toplu Tokeness hesabı açın — OpenAI uyumlu çıkarım + 9Router bağlayıcısı.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-22%20served-412991?style=for-the-badge)](https://tokeness.ai/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Hızlı başlangıç](#-quick-start) · [🎁 Ücretsiz katman](#-free-tier--how-much-you-get) · [🤖 Modeller](#-models--all-22-of-them) · [🧪 API'yi kullanma](#-how-to-use-the-api) · [✅ Doğrulandı](#-verified-working--every-key-is-tested) · [🧭 Nasıl çalışır](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Seçenekler](#️-cli-options) · [🛰️ Proxy'ler](#️-behind-a-proxy) · [🐞 Sorunlar](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Bu neden var

Tokeness, küresel bir CDN arkasındaki bir **New-API çatalıdır** (`v1.0.0-rc.40-tokeness-intl.15`). Her kimlik doğrulama rotası bir Cloudflare Turnstile **ve** bir e-posta kuralının arkasındadır ve naif bir betiği durduran şey captcha değil, e-posta kuralıdır: panel bir **alan adı beyaz listesi** tutar (yalnızca `gmail.com` / `outlook.com`) ve `+` içeren herhangi bir adresi "özel semboller" gerekçesiyle reddeder. Adres sade olduğunda ve konut tipi bir çıkış widget'ı çözdüğünde, kayıt normal bir `kod gönder → kaydol → giriş yap` akışıdır ve her hesap **`unlimited_quota: true` olan bir anahtar** verir. Araç uçtan uca iki kez kanıtlandı: laboratuvar hattı **her hesabın kendi anahtarını ürettiğini** gösterdi ve bu paketlenmiş CLI ardından **57 saniyelik doğrudan bir çalıştırmada** 11. anahtarı üretti — hepsi yazılmadan önce `tokeness/free` üzerinde sohbetle doğrulandı, **11/11'i bağımsız yeniden kontrolde hâlâ canlı**.

## 🎁 Ücretsiz katman — ne kadar alıyorsunuz

| Ne | Değer |
| --- | --- |
| Hesap başına kayıt kotası | **18000 birim** — `GET /api/user/self` her yeni hesapta `quota: 18000` yanıtını verir |
| Bunun değeri | `quota_per_unit 500000`, `usd_exchange_rate 7`, `price 7` → verilen hak **≈ $0.036** |
| Anahtar kotası | anahtar `unlimited_quota: true` ile oluşturulur, yani token düzeyindeki kontrol kapalıdır; hesabın kendi kotası yine de aktarımı sınırlar |
| Günlük giriş | `checkin_enabled: true`, ancak bir oturumla `200 {"success":false,"message":"Turnstile token 为空"}` yanıtını verir — kendi token'ını ister, bu yüzden araç bunu talep etmeden bırakır |
| Adres politikası | **yalnızca gmail.com ve outlook.com** (gerçek token'larla alan adı alan adı denendi); `+` takma adı birebir reddedilir — `管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。` |
| Adres başına bir hesap | bir adres bir kez kullanılır; reddedilen/alınmış bir kutu yeni bir Emailnator kutusuyla değiştirilir |
| Çıkış sınıfı | Turnstile widget'ı **konut tipi bir çıkıştan** yönetilen modda geçer (WARP ve düz bir konut ana makinesi ölçüldü); veri merkezi IP'si tarayıcıda `600010` yanıtını verir (0/60 tıklama) |
| Ölçeklenen birim | **bir hesap = bir anahtar** ve anahtar yalnızca canlı bir sohbet 200'ünden sonra yazılır |

> 💡 Ücretsiz katman Tokeness tarafından belirlenir ve değişebilir. Güncel sayıları [tokeness.ai](https://tokeness.ai) adresinden kontrol edin — ve kararı aracın kendi kapısına bırakın:

```bash
node src/cli.js --verify-only     # keys.txt içindeki her anahtar gerçek bir sohbet çağrısıyla yeniden test edilir
```

## 🤖 Modeller — 22'sinin tamamı

`GET /v1/models` (canlı bir anahtarla 200) **22 id** duyurur:

| Model ID | not |
| --- | --- |
| `tokeness/free` | **doğrulanan satır — her anahtar buna 200 yanıtı verdi (yeniden kontrolde 11/11)** |
| `mimo-v2.6-flash` | **ayrıca 200 kaydedildi** — bağımsız yeniden kontrolde bir anahtar buna `ok` yanıtı verdi |
| `deepseek-v4.1-flash`, `deepseek-v4.1-flash-1017`, `deepseek-v4-flash`, `deepseek-v4-flash-vision-exp`, `deepseek-v4-pro` | duyurulur, tek tek kapıdan geçirilmedi |
| `glm-5.3`, `glm-5.3-flash`, `glm-5.3-flashx` | duyurulur, tek tek kapıdan geçirilmedi |
| `qwen3.8-flash`, `qwen3.7-plus`, `qwen3.8-max` | duyurulur, tek tek kapıdan geçirilmedi |
| `mimo-v2.5`, `mimo-v2.5-pro`, `mimo-v2.6-pro` | duyurulur, tek tek kapıdan geçirilmedi |
| `kimi-k2.6`, `kimi-k2.7-code`, `kimi-k3` | duyurulur, tek tek kapıdan geçirilmedi |
| `minimax-m3`, `muse-spark-1.3-contributor`, `hy3` | duyurulur, tek tek kapıdan geçirilmedi |

`tokeness/free` her anahtarın kapıdan geçirildiği modeldir; `mimo-v2.6-flash` de bir 200 aldı. Kalan id'ler `/v1/models` tarafından duyurulur ancak tek tek sohbet kapısından geçirilmedi, bu yüzden burada iddia edilmiyor.

```bash
curl https://tokeness.ai/v1/chat/completions \
  -H "Authorization: Bearer <key>" -H "Content-Type: application/json" \
  -d '{"model":"tokeness/free","messages":[{"role":"user","content":"Reply with the single word: ok"}],"max_tokens":16}'
```

## 🧪 API nasıl kullanılır

Temel URL **`https://tokeness.ai/v1`** — OpenAI uyumlu. `tokeness.io`, `tokeness.ai` adresine bir `301`'dir ve panelin kendi `/api/status`'u bir CDN ana makinesi olan `n.tokeness.dev`'i duyurur (aynı `/v1`'i sunar, bu yüzden ana makine meşgulken kullanışlı ikinci bir uç noktadır).

```python
from openai import OpenAI
c = OpenAI(base_url="https://tokeness.ai/v1", api_key="<your key>")
print(c.chat.completions.create(model="tokeness/free",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 Hızlı başlangıç

```bash
cd tokeness-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional, but a residential-class exit is what the widget likes
node src/launcher.js        # interactive: mint / verify / screen / settings / 9Router

# or: node src/cli.js --count 1 --pool proxies.txt
```

Bir anahtar `keys.txt` dosyasına **yalnızca** `POST /v1/chat/completions` gerçek içerik veya akıl yürütme içeriğiyle 200 yanıtı verdikten sonra yazılır; `accounts.json` e-posta / kullanıcı adı / parola / anahtar / çıkış / kota ve adım başına durumları saklar.

### 🖱️ Başlatıcı

Başlatıcı tek komutluk yoldur: kaç anahtar istediğinizi sorar (Enter = `10`) ve CLI'yi `--auto` ile çalıştırır; `proxies.txt` mevcut olduğunda otomatik olarak alınır, aksi halde çalıştırma doğrudan gider. Ayrıca her anahtarı yeniden kontrol eder, çıkış listenizi tarar, hatırlanan ayarları gösterir, anahtarları 9Router / OmniRoute'a bağlar — ve baştan Chrome'u kontrol eder, böylece eksik bir tarayıcı bir çalıştırma başlamadan önce bildirilir.

### 🚀 Tek komut

```bash
node src/launcher.js       # menu → "1) Mint keys" → how many keys? [10]
node src/cli.js --count 10 # the same run, non-interactive
```

Aracın tamamı bu: `--auto` varsayılan olarak açıktır — Turnstile yerleşik tarayıcı hattında çözülür (`proxies.txt`'ten sabitlenmiş tek bir çıkış üzerinden gerçek bir Chrome veya hiç yoksa DIRECT) ve bir anahtar `keys.txt` dosyasına yalnızca kendi canlı sohbet 200'ünden sonra ulaşır. `--dry` çözümlenen planı — sayı, çıkışlar, çözücü, model — yazdırır ve hiçbir dosyaya veya ağa dokunmadan çıkar:

```bash
node src/cli.js --count 10 --dry
```

> ⚠️ **Şartlar ve hesap riski.** Üçüncü taraf bir kaydı otomatikleştirmek sizin kararınız ve sorumluluğunuzdur, bu deponun değil. Bunu çalıştırmadan önce Tokeness'in şartlarını okuyun ve bunlara uyun: panel bir hesabı bir adrese bağlar, artı takma adlı postayı reddeder, fark ettiklerini yasaklayabilir ve e-posta/captcha kuralları önceden haber verilmeden değişebilir. Yalnızca gerçekten kullandığınız kadar üretin.

## ✅ Çalıştığı doğrulandı — her anahtar test edilir

| Kontrol | Sonuç |
| --- | --- |
| `GET /api/status` | **200** — kayıt açık, e-posta doğrulama açık, `turnstile_check: true`, giriş açık, sitekey `0x4AAAAAADUMi6GTHDf1f5T7` yayınlanmış |
| `GET /api/verification?email=<plain gmail>&turnstile=<fresh>` | **200** `{"message":"","success":true}` |
| aynı çağrı bir `+` takma adıyla | **200** `{"message":"管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。","success":false}` — takma ad duvarı, ölçüldü |
| panelin postası | `noreply@<panel-mail>` adresinden **«Tokeness email verification»**; kod gövdede altı onaltılık karakterdir (`Your verification code is: 7ca362`), TTL 10 dakika, teslimat 34 sn – 4 dk ölçüldü |
| `POST /api/user/register?turnstile=<fresh>` | `{username, password, email, verification_code, aff_code, turnstile}` ile **200** `{"success":true}` |
| `POST /api/user/login?turnstile=<fresh>` (düz parola) | **200** — yanıt kimlik doğrulama paketini taşır (`data.access_token`) |
| `GET /api/user/self` | **200** `id`, `quota 18000`, `group default` — **yalnızca** `Authorization: Bearer <access_token>` ile: yalnızca çerezli yanıt `401 {"code":"AUTH_UNAUTHORIZED","message":"Unauthorized, invalid access token"}` |
| `POST /api/token/` | **200** ancak **yanıtta anahtar yok**; liste onu maskelenmiş olarak verir (`xxek**********VKbX`); `POST /api/token/<id>/key` → gerçek 48 karakterlik anahtarla **200** |
| `GET /v1/models` | **200**, **22** id |
| `POST /v1/chat/completions` (`tokeness/free`) — yazılmadan önce **her** anahtar için | gerçek içerikle **200** — çalıştırma her anahtarı tamamladı |
| **bu paketten tek bir tam üretim** (`--count 1`, doğrudan, havuz yok) | **57 sn'de her anahtar** — posta kutusu, 730 karakterlik token, kod, kayıt 200, giriş 200, anahtar 200, sohbet 200 |
| `keys.txt`'in bağımsız yeniden kontrolü (ayrı süreç, `--verify-only`) | **her anahtar doğrulandı** — onu için `tokeness/free`, on birincisi için `mimo-v2.6-flash` |
| karışık bir çıkış örneği üzerinde `--screen` | konut tipi çıkış ve bir veri merkezi çıkışı `/api/status` + Turnstile varlık kapılarını geçti; diğer ikisi zaman aşımına uğradı — tarayıcı hattı yine de widget'ın kabul ettiği bir çıkış sınıfına ihtiyaç duyar |

> **Kalite kapıları.** Buradaki her anahtar `keys.txt` dosyasına yazılmadan önce canlı bir `chat-200` geçti
> (ölü anahtarlar asla gönderilmez). Yönlendirici kombinasyonları model düzeyinde aynı kuralı izler: bir giriş
> **yalnızca model `chat-200` yanıtlıyorsa ve araçları çağırabiliyorsa** eklenir — araç desteği olmayan bir model,
> ölü bir anahtar veya ölü bir sağlayıcı eklenmek yerine çıkarılır. Doğrulama adımını istediğiniz zaman yeniden çalıştırın;
> başarısızlıklar bildirilir, asla gizlenmez.

## 🧭 Nasıl çalışır

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Tokeness page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://tokeness.ai/v1/chat/completions → real content = the key is live
```

| Adım | Çağrı | Notlar |
| --- | --- | --- |
| 1 çıkışı denetle | `GET /api/status` + `challenges.cloudflare.com/turnstile/v0/api.js` | ikisini de yükleyemeyen bir çıkış, bir hesap harcanmadan önce atlanır |
| 2 posta kutusu | Emailnator `POST /api/generate-email` | hesap başına bir yeni gmail, **noktasız** biçiminde kullanılır: panel `+` ve noktaları reddeder ve Emailnator'ın kendisi de aynı sade adresi yoklar |
| 3 tarayıcı | CDP üzerinden Chrome, `GET /register` | sıfır olmayan bir `--remote-debugging-port`, `navigator.webdriver` değerini false tutar |
| 4 kod gönder | `GET /api/verification?email=…&turnstile=<fresh>` | sayfa içi fetch, böylece oturum çerezi de gelir |
| 5 kodu oku | Emailnator `/api/message-list` → `/api/message/<id>` | yalnızca tokeness adını taşıyan posta sayılır (kutular ortak bir havuzdur); kod gövdede altı onaltılık karakterdir |
| 6 kaydol | `POST /api/user/register?turnstile=<fresh>` | `verification_code` alan adıdır; token hem sorguda **hem de** gövdede gelir |
| 7 giriş yap | `POST /api/user/login?turnstile=<fresh>` | düz parola (`password_login_encryption_enabled: false`); `access_token`'ı yakala |
| anahtar | `POST /api/token/` → liste → `POST /api/token/<id>/key` | bearer gerekli; oluşturma yanıtında anahtar yok ve liste maskelenmiş |
| 9 kapı | `GET /v1/models` + bir tamamlama | içerikle 200 = anahtar canlı ve ancak o zaman yazılır |

## ⚙️ CLI seçenekleri

```bash
node src/cli.js --count 1 --pool proxies.txt   # mint (serial; one account = one key)
node src/cli.js --model mimo-v2.6-flash        # another gate model (advertised ids)
node src/cli.js --verify-only                  # re-check every key in keys.txt with a live chat call
node src/cli.js --screen                       # exit self-test: /api/status + the Turnstile asset
node src/cli.js --connect-9router              # register keys.txt with a local 9Router
node src/cli.js --help
```

| Ortam değişkeni / bayrak | Varsayılan | Anlamı |
| --- | --- | --- |
| `TOKENESS_PROXIES` | `proxies.txt` | çıkış havuzu, proxy başına bir satır |
| `TOKENESS_MODEL` | `tokeness/free` | canlı kapı için kullanılan model |
| `CHROME_PATH` | otomatik algılanır | captcha tarayıcısı için Chrome/Edge ikili dosyası |
| `--auto` | `on` | Turnstile'ı yerleşik tarayıcı hattında çöz (varsayılan) |
| `--dry` | `off` | çözümlenen planı yazdır ve çık — dosya yazımı yok, istek yok |

CLI aynı anda bir hesap çalıştırır: panel bir hesabı adresine ve çıkışına bağlar, bu yüzden paralel çalıştırmalar yalnızca aynı kaynak için yarışır.

## 🛰️ Proxy arkasında

**İsteğe bağlı — ve araç proxysiz de çalışır, ancak kimin üretebileceğine çıkış sınıfı karar verir.**

- **Bir havuzla:** `--pool <file>` geçirin (veya `TOKENESS_PROXIES` ayarlayın) ve bir hesap için her istek — captcha tarayıcısı dahil — o listeden sabitlenmiş tek bir çıkış üzerinden gider, fail-closed: erişilebilir çıkış vermeyen bir havuz, kendi adresinizden bir istek sızdırmak yerine çalıştırmayı başarısız kılar. `--screen`, her çıkışı kullanılmadan önce `/api/status` **ve** Turnstile betiği üzerinde denetler.
- **Havuz olmadan:** CLI `running WITHOUT a proxy (direct)` yazdırır ve doğrudan bağlanır. Ölçüldü: konut tipi bir ana makinede widget yönetilen modda yine çözüldü ve tam bir hesap 57 sn'de üretildi, oysa aynı sayfa bir veri merkezi IP'sinden challenge'ı hiç bağlamaz (`600010`, bir denemede 0/60 tıklama). Yani doğrudan bağlantı ev bağlantısından sorunsuz, bir VPS'ten umutsuzdur.
- Chrome bir SOCKS5 proxy'sine kimlik doğrulayamaz, bu yüzden `socks5://user:pass@host:port` satırları bir notla birlikte çıkarılır; düz `socks5://host:port` ve `http://host:port` çalışır.

## 📄 Dosyalar

| Yol | İçerik |
| --- | --- |
| `keys.txt` | satır başına bir canlı doğrulanmış anahtar — git tarafından yok sayılır |
| `accounts.json` | e-posta / kullanıcı adı / parola / anahtar / çıkış / kota / adım durumları — git tarafından yok sayılır |
| `proxies.txt` | çıkışlarınız — git tarafından yok sayılır |
| `keys-dead.txt` | `--verify-only` yanıtını vermeyi bırakan anahtarlar — git tarafından yok sayılır |
| `out/` | çalıştırma günlükleri, ekran görüntüleri ve `attempts.jsonl` (başarısız deneme başına bir satır, hata sınıfıyla birlikte) — git tarafından yok sayılır |

## 🔌 9Router'a bağlan

[9Router](https://9router.com) kendi kendine barındırılan, OpenAI uyumlu bir yönlendiricidir:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
node src/cli.js --connect-9router      # same, from the CLI
```

Varsayılanlar: `--prefix tokeness`, `--base-url https://tokeness.ai/v1`, `--model tokeness/free`. Modeller `tokeness/<model id>` olarak sunulur.

## 🔌 OmniRoute'a bağlan

[OmniRoute](https://omniroute.online) kendi kendine barındırılan, OpenAI uyumlu bir yönlendiricidir:

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
node src/cli.js --connect-omniroute      # same, from the CLI
```

Varsayılanlar: `--prefix tokeness`, `--base-url https://tokeness.ai/v1`, `--model tokeness/free`. Modeller `tokeness/<model id>` olarak sunulur.

## 🔑 Bir anahtar size ne kazandırır

| | |
| --- | --- |
| 🏢 Sağlayıcı | **Tokeness** — [tokeness.ai](https://tokeness.ai) |
| 🎁 Sağlayıcının verdikleri | 18000 kota birimi (≈ $0.036) olan yeni bir hesap ve kendi captcha'sının arkasına kapıladığı bir giriş bonusu |
| 🔑 Bir anahtarın size kazandırdıkları | kendi hesabında `unlimited_quota` ile oluşturulmuş ve `tokeness/free` üzerinde sohbetle doğrulanmış 48 karakterlik bir anahtar |
| 🌐 API biçimi | OpenAI uyumlu: `POST https://tokeness.ai/v1/chat/completions` |
| 🔒 Verileriniz | yalnızca `tokeness.ai` ve posta kutusu arka ucunuzla iletişim kurulur; anahtarlar makinenizde kalır |

## 🐞 Sorunlar

Tokeness e-posta kuralını (beyaz liste, takma ad politikası), Turnstile sitekey'ini veya anahtar açığa çıkarma rotasını değiştirirse, araç o adımda durur ve `out/attempts.jsonl` satırı hangi hata sınıfına çarptığını söyler (`address-policy`, `mail`, `register`, `login`, `token`, `chat-gate`, `turnstile`, `exit`). Komut ve tam çıktıyla birlikte **[bir sorun açın](../../issues)**.

## 📄 Lisans

MIT © 2026 — bkz. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 tokeness-bulk-apikey contributors

</div>