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

**自動生成された API キーで Tokeness アカウントを一括作成 — OpenAI 互換の推論 + 9Router コネクタ。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-22%20served-412991?style=for-the-badge)](https://tokeness.ai/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 クイックスタート](#-quick-start) · [🎁 無料枠](#-free-tier--how-much-you-get) · [🤖 モデル](#-models--all-22-of-them) · [🧪 API の使い方](#-how-to-use-the-api) · [✅ 検証済み](#-verified-working--every-key-is-tested) · [🧭 仕組み](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ オプション](#️-cli-options) · [🛰️ プロキシ](#️-behind-a-proxy) · [🐞 問題報告](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ なぜこれが存在するのか

Tokeness はグローバル CDN の背後にある **New-API フォーク**（`v1.0.0-rc.40-tokeness-intl.15`）です。すべての認証ルートは Cloudflare Turnstile **および** メールアドレスのルールの背後にあり、素朴なスクリプトを止めるのはキャプチャではなくメールアドレスのルールです。パネルは**ドメインのホワイトリスト**（`gmail.com` / `outlook.com` のみ）を保持し、`+` を含むアドレスは「特殊記号」として拒否します。アドレスがプレーンで、レジデンシャル回線の出口がウィジェットを解決できれば、サインアップは通常の `コード送信 → 登録 → ログイン` フローとなり、各アカウントは **`unlimited_quota: true` のキーを 1 つ**発行します。このツールはエンドツーエンドで 2 回実証されています。ラボ環境では **10 アカウント → 10 キー**を発行し、このパッケージ化された CLI はその後 **57 秒の直接実行**で 11 個目を発行しました。そのすべてが書き込まれる前に `tokeness/free` でチャット検証され、独立した再チェックでも **11/11 が依然として有効**でした。

## 🎁 無料枠 — どれだけ得られるか

| 項目 | 値 |
| --- | --- |
| アカウントごとのサインアップクォータ | **18000 ユニット** — `GET /api/user/self` はすべての新規アカウントで `quota: 18000` を返します |
| その価値 | `quota_per_unit 500000`、`usd_exchange_rate 7`、`price 7` → 付与分は **約 $0.036** |
| キーのクォータ | キーは `unlimited_quota: true` で作成されるため、トークンレベルのチェックは無効です。アカウント自体のクォータがリレーを制限します |
| 毎日のチェックイン | `checkin_enabled: true` ですが、セッションがあっても `200 {"success":false,"message":"Turnstile token 为空"}` を返します — 独自のトークンを要求するため、ツールはこれを未取得のままにします |
| アドレスポリシー | **gmail.com と outlook.com のみ**（実際のトークンでドメインごとに検証済み）。`+` エイリアスはそのまま拒否されます — `管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。` |
| 1 アドレスにつき 1 アカウント | アドレスは 1 回使い切ります。拒否された／使用済みのボックスは新しい Emailnator ボックスに置き換えられます |
| 出口のクラス | Turnstile ウィジェットは**レジデンシャル出口**からマネージドモードで通過します（proxy と通常のレジデンシャルホストの両方で計測）。データセンター IP はブラウザで `600010` を返します（0/60 クリック） |
| スケールする単位 | **1 アカウント = 1 キー**、キーはライブチャットが 200 を返した後にのみ書き込まれます |

> 💡 無料枠は Tokeness によって設定され、変更される可能性があります。最新の数値は [tokeness.ai](https://tokeness.ai) で確認してください — そしてツール自身のゲートに判断させてください：

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 モデル — 全 22 個

`GET /v1/models`（有効なキーで 200）は **22 個の id** を通知します：

| モデル ID | 備考 |
| --- | --- |
| `tokeness/free` | **検証済みのライン — すべてのキーがこれで 200 を返しました（再チェックで 11/11）** |
| `mimo-v2.6-flash` | **これも 200 を記録** — 独立した再チェック中に 1 つのキーがこれで `ok` を返しました |
| `deepseek-v4.1-flash`、`deepseek-v4.1-flash-1017`、`deepseek-v4-flash`、`deepseek-v4-flash-vision-exp`、`deepseek-v4-pro` | 通知されているが、個別にはゲート検証されていない |
| `glm-5.3`、`glm-5.3-flash`、`glm-5.3-flashx` | 通知されているが、個別にはゲート検証されていない |
| `qwen3.8-flash`、`qwen3.7-plus`、`qwen3.8-max` | 通知されているが、個別にはゲート検証されていない |
| `mimo-v2.5`、`mimo-v2.5-pro`、`mimo-v2.6-pro` | 通知されているが、個別にはゲート検証されていない |
| `kimi-k2.6`、`kimi-k2.7-code`、`kimi-k3` | 通知されているが、個別にはゲート検証されていない |
| `minimax-m3`、`muse-spark-1.3-contributor`、`hy3` | 通知されているが、個別にはゲート検証されていない |

`tokeness/free` はすべてのキーがゲート検証されたモデルです。`mimo-v2.6-flash` も 200 を記録しました。残りの id は `/v1/models` によって通知されていますが、個別にチャットゲート検証されていないため、ここでは主張しません。

```bash
curl https://tokeness.ai/v1/chat/completions \
  -H "Authorization: Bearer <key>" -H "Content-Type: application/json" \
  -d '{"model":"tokeness/free","messages":[{"role":"user","content":"Reply with the single word: ok"}],"max_tokens":16}'
```

## 🧪 API の使い方

ベース URL は **`https://tokeness.ai/v1`** — OpenAI 互換です。`tokeness.io` は `tokeness.ai` への `301` であり、パネル自身の `/api/status` は CDN ホスト `n.tokeness.dev` を通知します（同じ `/v1` を提供するため、メインホストが混雑しているときの有用な第 2 エンドポイントになります）。

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

キーは `POST /v1/chat/completions` が実際のコンテンツまたは推論コンテンツとともに 200 を返した**後にのみ** `keys.txt` に書き込まれます。`accounts.json` はメール / ユーザー名 / パスワード / キー / 出口 / クォータと各ステップのステータスを保持します。

### 🖱️ ランチャー

ランチャーはプロキシリストと件数を尋ね、それらを `launcher.config.json` に記憶し、CLI を実行します — mint、verify、screen exits、settings、help、Connect to 9Router。

## ✅ 動作検証済み — すべてのキーがテストされています

| チェック | 結果 |
| --- | --- |
| `GET /api/status` | **200** — 登録オン、メール認証オン、`turnstile_check: true`、チェックインオン、sitekey `0x4AAAAAADUMi6GTHDf1f5T7` が公開 |
| `GET /api/verification?email=<plain gmail>&turnstile=<fresh>` | **200** `{"message":"","success":true}` |
| `+` エイリアスを使った同じ呼び出し | **200** `{"message":"管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。","success":false}` — エイリアスの壁、計測済み |
| パネルのメール | `send@<panel-mail>` からの **«Tokeness email verification»**。コードは本文中の 6 桁の 16 進文字（`Your verification code is: 7ca362`）、TTL 10 分、配信は 34 秒〜4 分で計測 |
| `POST /api/user/register?turnstile=<fresh>` | **200** `{"success":true}`、`{username, password, email, verification_code, aff_code, turnstile}` とともに |
| `POST /api/user/login?turnstile=<fresh>`（プレーンパスワード） | **200** — 応答は認証バンドル（`data.access_token`）を含みます |
| `GET /api/user/self` | **200** `id`、`quota 18000`、`group default` — **`Authorization: Bearer <access_token>` がある場合のみ**：Cookie のみでは `401 {"code":"AUTH_UNAUTHORIZED","message":"Unauthorized, invalid access token"}` |
| `POST /api/token/` | **200** だが**応答にキーはない**。リストはマスクされて返します（`xxek**********VKbX`）。`POST /api/token/<id>/key` → **200** で実際の 48 文字のキー |
| `GET /v1/models` | **200**、**22** 個の id |
| `POST /v1/chat/completions`（`tokeness/free`）— 書き込まれる前の**すべての**キーに対して | 実際のコンテンツとともに **200** — 実行は **10/10 キー**を完了 |
| **このパッケージからの完全な mint 1 回**（`--count 1`、直接、プールなし） | **57 秒で 1/1 キー** — メールボックス、730 文字のトークン、コード、register 200、login 200、key 200、chat 200 |
| `keys.txt` の独立した再チェック（別プロセス、`--verify-only`） | **11/11 キーが有効** — そのうち 10 個は `tokeness/free`、11 個目は `mimo-v2.6-flash` |
| 混合出口サンプルに対する `--screen` | レジデンシャル出口と 1 つのデータセンター出口が `/api/status` + Turnstile アセットのゲートを通過。他 2 つはタイムアウト — ブラウザレールには依然としてウィジェットが受け入れる出口クラスが必要 |

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
| 1 出口の審査 | `GET /api/status` + `challenges.cloudflare.com/turnstile/v0/api.js` | どちらも読み込めない出口は、アカウントを使う前にスキップされます |
| 2 メールボックス | Emailnator `POST /api/generate-email` | アカウントごとに 1 つの新しい gmail を、**ドットなし**の形式で使用：パネルは `+` とドットを拒否し、Emailnator 自体も同じプレーンアドレスをポーリングします |
| 3 ブラウザ | CDP 経由の Chrome、`GET /register` | 非ゼロの `--remote-debugging-port` が `navigator.webdriver` を false に保ちます |
| 4 コード送信 | `GET /api/verification?email=…&turnstile=<fresh>` | ページ内 fetch なので、セッション Cookie が一緒に送られます |
| 5 コード読み取り | Emailnator `/api/message-list` → `/api/message/<id>` | tokeness に言及したメールのみが対象（ボックスは公開プール）；コードは本文中の 6 桁の 16 進文字 |
| 6 登録 | `POST /api/user/register?turnstile=<fresh>` | `verification_code` がフィールド名；トークンはクエリ**および**ボディに乗ります |
| 7 ログイン | `POST /api/user/login?turnstile=<fresh>` | プレーンパスワード（`password_login_encryption_enabled: false`）；`access_token` を取得 |
| 8 キー | `POST /api/token/` → list → `POST /api/token/<id>/key` | bearer が必要；作成応答にキーはなく、リストはマスクされています |
| 9 ゲート | `GET /v1/models` + 1 回の completion | コンテンツとともに 200 = キーが有効、そのときにのみ書き込まれます |

## ⚙️ CLI オプション

```bash
node src/cli.js --count 1 --pool proxies.txt   # mint (serial; one account = one key)
node src/cli.js --model mimo-v2.6-flash        # another gate model (advertised ids)
node src/cli.js --verify-only                  # re-check every key in keys.txt with a live chat call
node src/cli.js --screen                       # exit self-test: /api/status + the Turnstile asset
node src/cli.js --connect-9router              # register keys.txt with a local 9Router
node src/cli.js --help
```

| 環境変数 | デフォルト | 意味 |
| --- | --- | --- |
| `TOKENESS_PROXIES` | `proxies.txt` | 出口プール、1 行につき 1 プロキシ |
| `TOKENESS_MODEL` | `tokeness/free` | ライブゲートに使用するモデル |
| `CHROME_PATH` | 自動検出 | キャプチャブラウザ用の Chrome/Edge バイナリ |

CLI は一度に 1 アカウントを実行します。パネルはアカウントをそのアドレスと出口に結びつけるため、並列実行は同じリソースを奪い合うだけです。

## 🛰️ プロキシの背後で

**任意 — プロキシなしでもツールは動作しますが、誰が mint できるかは出口クラスが決めます。**

- **プールあり：** `--pool <file>` を渡す（または `TOKENESS_PROXIES` を設定する）と、アカウントに対するすべてのリクエスト — キャプチャブラウザを含む — がそのリストから固定された 1 つの出口を経由し、フェイルクローズドで動作します。到達可能な出口を 1 つも返さないプールは、自分のアドレスからリクエストを漏らす代わりに実行を失敗させます。`--screen` は使用前に各出口を `/api/status` **および** Turnstile スクリプトで審査します。
- **プールなし：** CLI は `running WITHOUT a proxy (direct)` と表示し、直接接続します。計測結果：レジデンシャルホストではウィジェットがマネージドモードで解決し、完全なアカウントが 57 秒で mint されましたが、同じページをデータセンター IP から開くとチャレンジがマウントされません（`600010`、1 回のプローブで 0/60 クリック）。つまり、直接接続は家庭の回線からは問題なく、VPS からは絶望的です。
- Chrome は SOCKS5 プロキシに認証できないため、`socks5://user:pass@host:port` の行は注記とともに破棄されます。プレーンな `socks5://host:port` と `http://host:port` は動作します。

## 📄 ファイル

| パス | 内容 |
| --- | --- |
| `keys.txt` | 1 行につき 1 つのライブ検証済みキー — git 無視 |
| `accounts.json` | メール / ユーザー名 / パスワード / キー / 出口 / クォータ / ステップステータス — git 無視 |
| `proxies.txt` | あなたの出口 — git 無視 |
| `out/` | 実行ログ、スクリーンショット、`attempts.jsonl`（失敗した試行ごとに 1 行、その失敗クラス付き） — git 無視 |

## 🔌 9Router に接続

[9Router](https://9router.com) はセルフホスト型の OpenAI 互換ルーターです：

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
node src/cli.js --connect-9router      # same, from the CLI
```

デフォルト：`--prefix tokeness`、`--base-url https://tokeness.ai/v1`、`--model tokeness/free`。モデルは `tokeness/<model id>` として提供されます。

## 🔌 OmniRoute に接続

[OmniRoute](https://omniroute.online) はセルフホスト型の OpenAI 互換ルーターです：

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
node src/cli.js --connect-omniroute      # same, from the CLI
```

デフォルト：`--prefix tokeness`、`--base-url https://tokeness.ai/v1`、`--model tokeness/free`。モデルは `tokeness/<model id>` として提供されます。
## 🔑 1 つのキーで得られるもの

| | |
| --- | --- |
| 🏢 プロバイダー | **Tokeness** — [tokeness.ai](https://tokeness.ai) |
| 🎁 プロバイダーが提供するもの | 18000 クォータユニット（約 $0.036）の新規アカウントと、独自のキャプチャの背後にゲートされたチェックインボーナス |
| 🔑 1 つのキーで得られるもの | 独自のアカウント上の 48 文字のキー 1 つ、`unlimited_quota` で作成され、`tokeness/free` でチャット検証済み |
| 🌐 API の形式 | OpenAI 互換：`POST https://tokeness.ai/v1/chat/completions` |
| 🔒 あなたのデータ | 接触するのは `tokeness.ai` とあなたの受信箱バックエンドのみ。キーはあなたのマシン上に留まります |

## 🐞 問題報告

Tokeness がメールアドレスのルール（ホワイトリスト、エイリアスポリシー）、Turnstile sitekey、またはキー公開ルートを変更した場合、ツールはそのステップで停止し、`out/attempts.jsonl` の行がどの失敗クラスに当たったかを示します（`address-policy`、`mail`、`register`、`login`、`token`、`chat-gate`、`turnstile`、`exit`）。コマンドと正確な出力を添えて **[issue を作成してください](../../issues)**。

## 📄 ライセンス

MIT © 2026 — [LICENSE](LICENSE) を参照。

<div align="center">

**[MIT](LICENSE)** © 2026 tokeness-bulk-apikey contributors

</div>