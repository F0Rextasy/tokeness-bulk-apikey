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

**APIキーを自動生成してTokenessアカウントを一括作成 — OpenAI互換の推論 + 9Routerコネクタ。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-22%20served-412991?style=for-the-badge)](https://tokeness.ai/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 クイックスタート](#-quick-start) · [🎁 無料枠](#-free-tier--how-much-you-get) · [🤖 モデル](#-models--all-22-of-them) · [🧪 APIの使い方](#-how-to-use-the-api) · [✅ 検証済み](#-verified-working--every-key-is-tested) · [🧭 仕組み](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ オプション](#️-cli-options) · [🛰️ プロキシ](#️-behind-a-proxy) · [🐞 問題報告](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ なぜこれが存在するのか

TokenessはグローバルCDNの背後にある**New-APIフォーク**(`v1.0.0-rc.40-tokeness-intl.15`)です。すべての認証ルートはCloudflare Turnstile**と**メールルールの背後にあり、素朴なスクリプトを止めるのはキャプチャではなくメールルールです。パネルは**ドメインホワイトリスト**(`gmail.com` / `outlook.com`のみ)を保持し、`+`を含むアドレスは「特殊記号」として拒否します。アドレスがプレーンで、レジデンシャル出口がウィジェットを解決できれば、サインアップは通常の`コード送信 → 登録 → ログイン`フローとなり、各アカウントは**`unlimited_quota: true`のキーを1つ**発行します。このツールはエンドツーエンドで2回証明されています。ラボのレールでは**各アカウントが自身のキーを発行**し、このパッケージ化されたCLIはその後**57秒の直接実行**で11個目を発行しました — そのすべてが書き込まれる前に`tokeness/free`でチャット検証され、独立した再チェックでも**11/11が依然として稼働中**です。

## 🎁 無料枠 — どれだけ得られるか

| 項目 | 値 |
| --- | --- |
| アカウントごとのサインアップクォータ | **18000ユニット** — `GET /api/user/self`は新規アカウントごとに`quota: 18000`を返します |
| その価値 | `quota_per_unit 500000`、`usd_exchange_rate 7`、`price 7` → 付与額は**約$0.036** |
| キーのクォータ | キーは`unlimited_quota: true`で作成されるため、トークンレベルのチェックは無効です。アカウント自体のクォータがリレーを制限します |
| 毎日のチェックイン | `checkin_enabled: true`ですが、セッションがあると`200 {"success":false,"message":"Turnstile token 为空"}`を返します — 独自のトークンを要求するため、ツールはこれを未取得のままにします |
| アドレスポリシー | **gmail.comとoutlook.comのみ**(実際のトークンでドメインごとに検証済み)。`+`エイリアスはそのまま拒否されます — `管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。` |
| 1アドレスにつき1アカウント | アドレスは一度だけ使用されます。拒否された/使用済みのボックスは新しいEmailnatorボックスに置き換えられます |
| 出口クラス | Turnstileウィジェットは**レジデンシャル出口**からマネージドモードで通過します(WARPとプレーンなレジデンシャルホストの両方で計測)。データセンターIPはブラウザで`600010`を返します(0/60クリック) |
| スケールする単位 | **1アカウント = 1キー**、キーはライブチャット200の後にのみ書き込まれます |

> 💡 無料枠はTokenessによって設定され、変更される可能性があります。最新の数値は[tokeness.ai](https://tokeness.ai)で確認してください — そしてツール自身のゲートに判断させてください:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 モデル — 全22個

`GET /v1/models`(ライブキーで200)は**22個のID**を通知します:

| モデルID | 備考 |
| --- | --- |
| `tokeness/free` | **検証済みのライン — すべてのキーがこれで200を返しました(再チェックで11/11)** |
| `mimo-v2.6-flash` | **これも200を記録** — 独立した再チェック中にキーが`ok`を返しました |
| `deepseek-v4.1-flash`, `deepseek-v4.1-flash-1017`, `deepseek-v4-flash`, `deepseek-v4-flash-vision-exp`, `deepseek-v4-pro` | 通知済み、個別のゲートなし |
| `glm-5.3`, `glm-5.3-flash`, `glm-5.3-flashx` | 通知済み、個別のゲートなし |
| `qwen3.8-flash`, `qwen3.7-plus`, `qwen3.8-max` | 通知済み、個別のゲートなし |
| `mimo-v2.5`, `mimo-v2.5-pro`, `mimo-v2.6-pro` | 通知済み、個別のゲートなし |
| `kimi-k2.6`, `kimi-k2.7-code`, `kimi-k3` | 通知済み、個別のゲートなし |
| `minimax-m3`, `muse-spark-1.3-contributor`, `hy3` | 通知済み、個別のゲートなし |

`tokeness/free`はすべてのキーがゲートされたモデルです。`mimo-v2.6-flash`も200を記録しました。残りのIDは`/v1/models`によって通知されていますが、個別にチャットゲートされていないため、ここでは主張しません。

```bash
curl https://tokeness.ai/v1/chat/completions \
  -H "Authorization: Bearer <key>" -H "Content-Type: application/json" \
  -d '{"model":"tokeness/free","messages":[{"role":"user","content":"Reply with the single word: ok"}],"max_tokens":16}'
```

## 🧪 APIの使い方

ベースURL **`https://tokeness.ai/v1`** — OpenAI互換。`tokeness.io`は`tokeness.ai`への`301`であり、パネル自身の`/api/status`はCDNホスト`n.tokeness.dev`を通知します(同じ`/v1`を提供するため、メインホストが混雑しているときの有用な第二のエンドポイントです)。

```python
from openai import OpenAI
c = OpenAI(base_url="https://tokeness.ai/v1", api_key="<your key>")
print(c.chat.completions.create(model="tokeness/free",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 クイックスタート

```bash
cd tokeness-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional, but a residential-class exit is what the widget likes
node src/launcher.js        # interactive: mint / verify / screen / settings / 9Router

# or: node src/cli.js --count 1 --pool proxies.txt
```

キーは`POST /v1/chat/completions`が実際のコンテンツまたは推論コンテンツで200を返した**後にのみ**`keys.txt`に書き込まれます。`accounts.json`はメール / ユーザー名 / パスワード / キー / 出口 / クォータと各ステップのステータスを保持します。

### 🖱️ ランチャー

ランチャーはワンコマンドのパスです: キーをいくつ欲しいか尋ね(Enter = `10`)、`--auto`でCLIを実行します。`proxies.txt`が存在すれば自動的に読み込まれ、そうでなければ直接実行されます。また、すべてのキーを再チェックし、出口リストをスクリーニングし、記憶された設定を表示し、キーを9Router / OmniRouteに接続します — そして事前にChromeをチェックするため、ブラウザが見つからない場合は実行開始前に報告されます。

### 🚀 ワンコマンド

```bash
node src/launcher.js       # menu → "1) Mint keys" → how many keys? [10]
node src/cli.js --count 10 # the same run, non-interactive
```

これがツールのすべてです: `--auto`はデフォルトで有効 — Turnstileは組み込みブラウザレール(`proxies.txt`から1つの固定出口を経由する実際のChrome、なければDIRECT)で解決され、キーは自身のライブチャット200の後にのみ`keys.txt`に到達します。`--dry`は解決されたプラン — カウント、出口、ソルバー、モデル — を出力し、ファイルやネットワークに触れることなく終了します:

```bash
node src/cli.js --count 10 --dry
```

> ⚠️ **利用規約とアカウントのリスク。** サードパーティのサインアップを自動化するのはあなたの判断と責任であり、このリポジトリのものではありません。これを実行する前にTokenessの利用規約を読み、尊重してください: パネルは1つのアカウントを1つのアドレスに結び付け、プラスエイリアスメールを拒否し、気づいたものをBANする可能性があり、そのメール/キャプチャルールは予告なく変更される可能性があります。実際に使用する分だけを発行してください。

## ✅ 検証済み — すべてのキーがテストされています

| チェック | 結果 |
| --- | --- |
| `GET /api/status` | **200** — 登録オン、メール検証オン、`turnstile_check: true`、チェックインオン、sitekey `0x4AAAAAADUMi6GTHDf1f5T7` 公開 |
| `GET /api/verification?email=<plain gmail>&turnstile=<fresh>` | **200** `{"message":"","success":true}` |
| `+`エイリアスでの同じ呼び出し | **200** `{"message":"管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。","success":false}` — エイリアスの壁、計測済み |
| パネルのメール | `noreply@<panel-mail>`からの**«Tokeness email verification»**。コードは本文中の6桁の16進文字(`Your verification code is: 7ca362`)、TTL 10分、配信は34秒～4分で計測 |
| `POST /api/user/register?turnstile=<fresh>` | **200** `{"success":true}`、`{username, password, email, verification_code, aff_code, turnstile}`付き |
| `POST /api/user/login?turnstile=<fresh>`(プレーンパスワード) | **200** — 応答に認証バンドル(`data.access_token`)が含まれる |
| `GET /api/user/self` | **200** `id`、`quota 18000`、`group default` — **`Authorization: Bearer <access_token>`がある場合のみ**: クッキーのみの応答は`401 {"code":"AUTH_UNAUTHORIZED","message":"Unauthorized, invalid access token"}` |
| `POST /api/token/` | **200**だが**応答にキーなし**。リストはマスクされて返す(`xxek**********VKbX`)。`POST /api/token/<id>/key` → **200**で実際の48文字キー |
| `GET /v1/models` | **200**、**22**個のID |
| `POST /v1/chat/completions`(`tokeness/free`) — 書き込まれる前の**すべての**キーに対して | **200**で実際のコンテンツ — 実行はすべてのキーを完了 |
| **このパッケージからの完全な発行1回**(`--count 1`、直接、プールなし) | **すべてのキーが57秒で** — メールボックス、730文字トークン、コード、登録200、ログイン200、キー200、チャット200 |
| `keys.txt`の独立した再チェック(別プロセス、`--verify-only`) | **すべてのキーが検証済み** — 10個は`tokeness/free`、11個目は`mimo-v2.6-flash` |
| 混合出口サンプルに対する`--screen` | レジデンシャル出口と1つのデータセンター出口が`/api/status` + Turnstileアセットのゲートを通過。他2つはタイムアウト — ブラウザレールは依然としてウィジェットが受け入れる出口クラスを必要とする |

> **品質ゲート。** ここにあるすべてのキーは`keys.txt`に書き込まれる前にライブ`chat-200`を通過しています
> (デッドキーは決して出荷されません)。ルーターの組み合わせもモデルレベルで同じルールに従います: エントリは
> **モデルが`chat-200`を返し、ツールを呼び出せる場合にのみ**追加されます — ツールサポートのないモデル、
> デッドキー、デッドプロバイダーは追加されずに削除されます。検証ステップはいつでも再実行できます。
> 失敗は報告され、決して隠されません。

## 🧭 仕組み

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Tokeness page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://tokeness.ai/v1/chat/completions → real content = the key is live
```

| ステップ | 呼び出し | 備考 |
| --- | --- | --- |
| 1 出口の検査 | `GET /api/status` + `challenges.cloudflare.com/turnstile/v0/api.js` | どちらも読み込めない出口は、アカウントを消費する前にスキップされます |
| 2 メールボックス | Emailnator `POST /api/generate-email` | アカウントごとに1つの新しいgmailを、**ドットなし**の形式で使用: パネルは`+`とドットを拒否し、Emailnator自体も同じプレーンアドレスをポーリングします |
| 3 ブラウザ | CDP経由のChrome、`GET /register` | 非ゼロの`--remote-debugging-port`が`navigator.webdriver`をfalseに保ちます |
| 4 コード送信 | `GET /api/verification?email=…&turnstile=<fresh>` | ページ内フェッチなので、セッションクッキーが一緒に送られます |
| 5 コード読み取り | Emailnator `/api/message-list` → `/api/message/<id>` | tokenessを名指すメールのみがカウントされます(ボックスは公開プールです)。コードは本文中の6桁の16進文字です |
| 6 登録 | `POST /api/user/register?turnstile=<fresh>` | `verification_code`がフィールド名です。トークンはクエリ**と**ボディの両方に乗ります |
| 7 ログイン | `POST /api/user/login?turnstile=<fresh>` | プレーンパスワード(`password_login_encryption_enabled: false`)。`access_token`をキャプチャ |
| キー | `POST /api/token/` → リスト → `POST /api/token/<id>/key` | bearerが必要。作成応答にキーはなく、リストはマスクされています |
| 9 ゲート | `GET /v1/models` + 1回の補完 | コンテンツ付き200 = キーがライブ、そのときのみ書き込まれます |

## ⚙️ CLIオプション

```bash
node src/cli.js --count 1 --pool proxies.txt   # mint (serial; one account = one key)
node src/cli.js --model mimo-v2.6-flash        # another gate model (advertised ids)
node src/cli.js --verify-only                  # re-check every key in keys.txt with a live chat call
node src/cli.js --screen                       # exit self-test: /api/status + the Turnstile asset
node src/cli.js --connect-9router              # register keys.txt with a local 9Router
node src/cli.js --help
```

| 環境変数 / フラグ | デフォルト | 意味 |
| --- | --- | --- |
| `TOKENESS_PROXIES` | `proxies.txt` | 出口プール、1行につき1プロキシ |
| `TOKENESS_MODEL` | `tokeness/free` | ライブゲートに使用するモデル |
| `CHROME_PATH` | 自動検出 | キャプチャブラウザ用のChrome/Edgeバイナリ |
| `--auto` | `on` | 組み込みブラウザレールでTurnstileを解決(デフォルト) |
| `--dry` | `off` | 解決されたプランを出力して終了 — ファイル書き込みなし、リクエストなし |

CLIは一度に1つのアカウントを実行します: パネルはアカウントをそのアドレスと出口に結び付けるため、並列実行は同じリソースを奪い合うだけです。

## 🛰️ プロキシの背後で

**オプション — プロキシなしでもツールは動作しますが、誰が発行できるかは出口クラスが決めます。**

- **プールあり:** `--pool <file>`を渡す(または`TOKENESS_PROXIES`を設定する)と、アカウントのすべてのリクエスト — キャプチャブラウザを含む — がそのリストから1つの固定出口を経由し、フェイルクローズドになります: 到達可能な出口を生成しないプールは、自分のアドレスからリクエストを漏らすのではなく実行を失敗させます。`--screen`は使用前に各出口を`/api/status`**および**Turnstileスクリプトで検査します。
- **プールなし:** CLIは`running WITHOUT a proxy (direct)`を出力し、直接接続します。計測済み: レジデンシャルホストではウィジェットはマネージドモードで解決され、完全なアカウントが57秒で発行されましたが、データセンターIPからの同じページはチャレンジをマウントしません(`600010`、1回のプローブで0/60クリック)。したがって、直接接続は家庭の接続からは問題なく、VPSからは絶望的です。
- ChromeはSOCKS5プロキシに認証できないため、`socks5://user:pass@host:port`行は注記とともに削除されます。プレーンな`socks5://host:port`と`http://host:port`は動作します。

## 📄 ファイル

| パス | 内容 |
| --- | --- |
| `keys.txt` | 1行につき1つのライブ検証済みキー — git-ignored |
| `accounts.json` | メール / ユーザー名 / パスワード / キー / 出口 / クォータ / ステップステータス — git-ignored |
| `proxies.txt` | あなたの出口 — git-ignored |
| `keys-dead.txt` | `--verify-only`に応答しなくなったキー — git-ignored |
| `out/` | 実行ログ、スクリーンショット、`attempts.jsonl`(失敗した試行ごとに1行、その失敗クラス付き) — git-ignored |

## 🔌 9Routerへの接続

[9Router](https://9router.com)はセルフホストのOpenAI互換ルーターです:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
node src/cli.js --connect-9router      # same, from the CLI
```

デフォルト: `--prefix tokeness`、`--base-url https://tokeness.ai/v1`、`--model tokeness/free`。モデルは`tokeness/<model id>`として提供されます。

## 🔌 OmniRouteへの接続

[OmniRoute](https://omniroute.online)はセルフホストのOpenAI互換ルーターです:

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
node src/cli.js --connect-omniroute      # same, from the CLI
```

デフォルト: `--prefix tokeness`、`--base-url https://tokeness.ai/v1`、`--model tokeness/free`。モデルは`tokeness/<model id>`として提供されます。

## 🔑 1つのキーで得られるもの

| | |
| --- | --- |
| 🏢 プロバイダー | **Tokeness** — [tokeness.ai](https://tokeness.ai) |
| 🎁 プロバイダーが提供するもの | 18000クォータユニット(約$0.036)の新規アカウントと、独自のキャプチャの背後にゲートされたチェックインボーナス |
| 🔑 1つのキーで得られるもの | 独自のアカウント上の1つの48文字キー、`unlimited_quota`で作成され、`tokeness/free`でチャット検証済み |
| 🌐 API形状 | OpenAI互換: `POST https://tokeness.ai/v1/chat/completions` |
| 🔒 あなたのデータ | `tokeness.ai`とあなたの受信トレイバックエンドのみが接触されます。キーはあなたのマシンに留まります |

## 🐞 問題報告

Tokenessがメールルール(ホワイトリスト、エイリアスポリシー)、Turnstile sitekey、またはキー公開ルートを変更した場合、ツールはそのステップで停止し、`out/attempts.jsonl`の行がどの失敗クラスに当たったかを示します(`address-policy`、`mail`、`register`、`login`、`token`、`chat-gate`、`turnstile`、`exit`)。コマンドと正確な出力を添えて**[issueを開いてください](../../issues)**。

## 📄 ライセンス

MIT © 2026 — [LICENSE](LICENSE)を参照。

<div align="center">

**[MIT](LICENSE)** © 2026 tokeness-bulk-apikey contributors

</div>