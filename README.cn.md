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

**批量创建 Tokeness 账户并自动生成 API 密钥 — 兼容 OpenAI 的推理 + 9Router 连接器。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-22%20served-412991?style=for-the-badge)](https://tokeness.ai/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 快速开始](#-quick-start) · [🎁 免费额度](#-free-tier--how-much-you-get) · [🤖 模型](#-models--all-22-of-them) · [🧪 使用 API](#-how-to-use-the-api) · [✅ 已验证](#-verified-working--every-key-is-tested) · [🧭 工作原理](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ 选项](#️-cli-options) · [🛰️ 代理](#️-behind-a-proxy) · [🐞 问题反馈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 为什么会有这个项目

Tokeness 是一个位于全球 CDN 之后的 **New-API 分支**（`v1.0.0-rc.40-tokeness-intl.15`）。每条认证路由都同时受 Cloudflare Turnstile **和**一条邮箱规则保护，而真正拦住简单脚本的是邮箱规则——不是验证码：面板维护一份**域名白名单**（仅 `gmail.com` / `outlook.com`），并拒绝任何包含 `+` 的地址，理由是"特殊符号"。一旦地址是纯地址、并且用住宅出口解决了验证组件，注册就是普通的 `发送验证码 → 注册 → 登录` 流程，每个账户都会发放**一个 `unlimited_quota: true` 的密钥**。该工具已两次端到端验证：实验轨道上**每个账户都铸造出了自己的密钥**，而这个打包好的 CLI 随后在一次 **57 秒的直接运行**中铸造出第 11 个——每一个在写入之前都在 `tokeness/free` 上通过了聊天验证，全部 **11/11 在独立复检中仍然有效**。

## 🎁 免费额度 — 你能拿到多少

| 项目 | 值 |
| --- | --- |
| 每个账户的注册额度 | **18000 单位** — 每个新账户上 `GET /api/user/self` 都返回 `quota: 18000` |
| 这值多少 | `quota_per_unit 500000`、`usd_exchange_rate 7`、`price 7` → 该赠额约为 **≈ $0.036** |
| 密钥额度 | 密钥以 `unlimited_quota: true` 创建，因此令牌级检查被关闭；账户自身的额度仍然限制中继 |
| 每日签到 | `checkin_enabled: true`，但带会话访问时返回 `200 {"success":false,"message":"Turnstile token 为空"}` — 它需要自己的令牌，因此工具不去领取 |
| 地址策略 | **仅 gmail.com 和 outlook.com**（用真实令牌逐域名探测）；`+` 别名会被原样拒绝 — `管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。` |
| 每个地址一个账户 | 一个地址只能用一次；被拒绝或已被占用的邮箱会被新的 Emailnator 邮箱替换 |
| 出口类别 | Turnstile 组件在托管模式下从**住宅出口**通过（WARP 和普通住宅主机均已实测）；数据中心 IP 在浏览器中返回 `600010`（0/60 次点击） |
| 可扩展的单位 | **一个账户 = 一个密钥**，且密钥只有在实时聊天返回 200 之后才会被写入 |

> 💡 免费额度由 Tokeness 设定，可能发生变化。请到 [tokeness.ai](https://tokeness.ai) 查看实时数字——并让工具自身的关卡来判定：

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 模型 — 全部 22 个

`GET /v1/models`（带有效密钥返回 200）公布 **22 个 id**：

| 模型 ID | 备注 |
| --- | --- |
| `tokeness/free` | **已验证的线路 — 每个密钥都在它上面返回 200（复检中 11/11）** |
| `mimo-v2.6-flash` | **同样记录到 200** — 在独立复检中有一个密钥在它上面返回 `ok` |
| `deepseek-v4.1-flash`、`deepseek-v4.1-flash-1017`、`deepseek-v4-flash`、`deepseek-v4-flash-vision-exp`、`deepseek-v4-pro` | 已公布，未逐一验证 |
| `glm-5.3`、`glm-5.3-flash`、`glm-5.3-flashx` | 已公布，未逐一验证 |
| `qwen3.8-flash`、`qwen3.7-plus`、`qwen3.8-max` | 已公布，未逐一验证 |
| `mimo-v2.5`、`mimo-v2.5-pro`、`mimo-v2.6-pro` | 已公布，未逐一验证 |
| `kimi-k2.6`、`kimi-k2.7-code`、`kimi-k3` | 已公布，未逐一验证 |
| `minimax-m3`、`muse-spark-1.3-contributor`、`hy3` | 已公布，未逐一验证 |

`tokeness/free` 是每个密钥都通过验证的模型；`mimo-v2.6-flash` 也拿到了一个 200。其余 id 由 `/v1/models` 公布，但未逐一进行聊天验证，因此此处不作声明。

```bash
curl https://tokeness.ai/v1/chat/completions \
  -H "Authorization: Bearer <key>" -H "Content-Type: application/json" \
  -d '{"model":"tokeness/free","messages":[{"role":"user","content":"Reply with the single word: ok"}],"max_tokens":16}'
```

## 🧪 如何使用 API

基础 URL **`https://tokeness.ai/v1`** — 兼容 OpenAI。`tokeness.io` 会 `301` 重定向到 `tokeness.ai`，而面板自身的 `/api/status` 公布了一个 CDN 主机 `n.tokeness.dev`（它提供相同的 `/v1`，因此当主主机繁忙时它是一个有用的备用端点）。

```python
from openai import OpenAI
c = OpenAI(base_url="https://tokeness.ai/v1", api_key="<your key>")
print(c.chat.completions.create(model="tokeness/free",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 快速开始

```bash
cd tokeness-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional, but a residential-class exit is what the widget likes
node src/launcher.js        # interactive: mint / verify / screen / settings / 9Router

# or: node src/cli.js --count 1 --pool proxies.txt
```

只有当 `POST /v1/chat/completions` 返回 200 且带有真实内容或推理内容时，密钥才会被写入 `keys.txt`；`accounts.json` 保存邮箱 / 用户名 / 密码 / 密钥 / 出口 / 额度以及各步骤的状态。

### 🖱️ 启动器

启动器是一条命令的路径：它询问你想要多少个密钥（回车 = `10`）并以 `--auto` 运行 CLI；`proxies.txt` 存在时会自动被采用，否则直接运行。它还会重新检查每个密钥、筛选你的出口列表、显示已记住的设置、将密钥连接到 9Router / OmniRoute——并且它会预先检查 Chrome，因此缺少浏览器会在运行开始前就被报告出来。

### 🚀 一条命令

```bash
node src/launcher.js       # menu → "1) Mint keys" → how many keys? [10]
node src/cli.js --count 10 # the same run, non-interactive
```

这就是整个工具：`--auto` 默认开启——Turnstile 在内置浏览器轨道中解决（真实 Chrome 通过 `proxies.txt` 中一个固定出口，或没有出口时 DIRECT），密钥只有在自身实时聊天返回 200 之后才会进入 `keys.txt`。`--dry` 打印解析后的计划——数量、出口、求解器、模型——然后退出，不触碰任何文件或网络：

```bash
node src/cli.js --count 10 --dry
```

> ⚠️ **条款与账户风险。** 自动化第三方注册是你自己的决定和责任，不是本仓库的。运行前请阅读 Tokeness 的条款并遵守它们：面板将一个账户绑定到一个地址，拒绝加号别名邮件，可以封禁它发现的行为，且其邮箱/验证码规则可能随时更改。只铸造你实际使用的数量。

## ✅ 已验证可用 — 每个密钥都经过测试

| 检查 | 结果 |
| --- | --- |
| `GET /api/status` | **200** — 注册开启、邮箱验证开启、`turnstile_check: true`、签到开启、sitekey `0x4AAAAAADUMi6GTHDf1f5T7` 已公布 |
| `GET /api/verification?email=<plain gmail>&turnstile=<fresh>` | **200** `{"message":"","success":true}` |
| 同样的调用但使用 `+` 别名 | **200** `{"message":"管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。","success":false}` — 别名墙，已实测 |
| 面板的邮件 | 来自 `noreply@<panel-mail>` 的 **«Tokeness email verification»**；验证码是正文中的六个十六进制字符（`Your verification code is: 7ca362`），TTL 10 分钟，实测送达时间 34 秒 – 4 分钟 |
| `POST /api/user/register?turnstile=<fresh>` | **200** `{"success":true}`，请求体为 `{username, password, email, verification_code, aff_code, turnstile}` |
| `POST /api/user/login?turnstile=<fresh>`（明文密码） | **200** — 响应携带认证包（`data.access_token`） |
| `GET /api/user/self` | **200** `id`、`quota 18000`、`group default` — **仅**在带 `Authorization: Bearer <access_token>` 时：仅用 cookie 会返回 `401 {"code":"AUTH_UNAUTHORIZED","message":"Unauthorized, invalid access token"}` |
| `POST /api/token/` | **200** 但**响应中没有密钥**；列表以掩码形式给出（`xxek**********VKbX`）；`POST /api/token/<id>/key` → **200** 返回真实的 48 字符密钥 |
| `GET /v1/models` | **200**，**22** 个 id |
| `POST /v1/chat/completions`（`tokeness/free`）— 对**每个**密钥在写入之前 | **200** 且带真实内容 — 本次运行完成了每个密钥 |
| **本包的一次完整铸造**（`--count 1`，直接，无代理池） | **每个密钥 57 秒** — 邮箱、730 字符令牌、验证码、注册 200、登录 200、密钥 200、聊天 200 |
| 对 `keys.txt` 的独立复检（独立进程，`--verify-only`） | **每个密钥都验证通过** — 其中十个用 `tokeness/free`，第十一个用 `mimo-v2.6-flash` |
| 对混合出口样本执行 `--screen` | 住宅出口和一个数据中心出口通过了 `/api/status` + Turnstile 资源关卡；另外两个超时 — 浏览器轨道仍然需要一个验证组件接受的出口类别 |

> **质量关卡。** 这里的每个密钥在写入 `keys.txt` 之前都通过了实时 `chat-200`
> （失效密钥绝不发布）。路由器组合在模型层面遵循同样的规则：只有**当模型返回 `chat-200` 且能调用工具**时，
> 条目才会被添加——不支持工具的模型、失效的密钥或失效的提供商会直接被丢弃而不是添加。随时可重新运行验证步骤；
> 失败会被报告，绝不隐藏。

## 🧭 工作原理

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Tokeness page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://tokeness.ai/v1/chat/completions → real content = the key is live
```

| 步骤 | 调用 | 备注 |
| --- | --- | --- |
| 1 检查出口 | `GET /api/status` + `challenges.cloudflare.com/turnstile/v0/api.js` | 两者都无法加载的出口会在消耗账户之前被跳过 |
| 2 邮箱 | Emailnator `POST /api/generate-email` | 每个账户一个全新的 gmail，使用其**无点**形式：面板拒绝 `+` 和点号，而 Emailnator 自身轮询的正是同一个纯地址 |
| 3 浏览器 | Chrome over CDP，`GET /register` | 非零的 `--remote-debugging-port` 使 `navigator.webdriver` 保持为 false |
| 4 发送验证码 | `GET /api/verification?email=…&turnstile=<fresh>` | 页面内 fetch，因此会话 cookie 会随之携带 |
| 5 读取验证码 | Emailnator `/api/message-list` → `/api/message/<id>` | 只有提到 tokeness 的邮件才算数（这些邮箱是公共池）；验证码是正文中的六个十六进制字符 |
| 6 注册 | `POST /api/user/register?turnstile=<fresh>` | `verification_code` 是字段名；令牌同时出现在查询参数**和**请求体中 |
| 7 登录 | `POST /api/user/login?turnstile=<fresh>` | 明文密码（`password_login_encryption_enabled: false`）；捕获 `access_token` |
| 密钥 | `POST /api/token/` → 列表 → `POST /api/token/<id>/key` | 需要 bearer；创建响应中没有密钥，列表是掩码的 |
| 9 关卡 | `GET /v1/models` + 一次补全 | 200 且带内容 = 密钥有效，只有此时才会被写入 |

## ⚙️ CLI 选项

```bash
node src/cli.js --count 1 --pool proxies.txt   # mint (serial; one account = one key)
node src/cli.js --model mimo-v2.6-flash        # another gate model (advertised ids)
node src/cli.js --verify-only                  # re-check every key in keys.txt with a live chat call
node src/cli.js --screen                       # exit self-test: /api/status + the Turnstile asset
node src/cli.js --connect-9router              # register keys.txt with a local 9Router
node src/cli.js --help
```

| 环境变量 / 标志 | 默认值 | 含义 |
| --- | --- | --- |
| `TOKENESS_PROXIES` | `proxies.txt` | 出口池，每行一个代理 |
| `TOKENESS_MODEL` | `tokeness/free` | 用于实时关卡的模型 |
| `CHROME_PATH` | 自动检测 | 用于验证码浏览器的 Chrome/Edge 二进制文件 |
| `--auto` | `on` | 在内置浏览器轨道中解决 Turnstile（默认） |
| `--dry` | `off` | 打印解析后的计划并退出 — 不写文件，不发请求 |

CLI 一次运行一个账户：面板将一个账户绑定到它的地址和出口，因此并行运行只会争抢同一资源。

## 🛰️ 在代理之后

**可选——工具在没有代理时也能工作，但出口类别决定了谁能铸造。**

- **有代理池时：** 传入 `--pool <file>`（或设置 `TOKENESS_PROXIES`），账户的每个请求——包括验证码浏览器——都通过该列表中一个固定出口，失败即关闭：如果代理池没有可用出口，运行会失败，而不是从你自己的地址泄露请求。`--screen` 会在使用前对每个出口在 `/api/status` **和** Turnstile 脚本上进行检验。
- **没有代理池时：** CLI 打印 `running WITHOUT a proxy (direct)` 并直接连接。实测：在住宅主机上，验证组件在托管模式下仍能解决，一个完整账户在 57 秒内铸造完成；而同一页面从数据中心 IP 从未挂载挑战（`600010`，一次探测中 0/60 次点击）。因此从家庭连接直接运行没问题，从 VPS 则毫无希望。
- Chrome 无法向 SOCKS5 代理进行认证，因此 `socks5://user:pass@host:port` 行会被丢弃并附上说明；普通的 `socks5://host:port` 和 `http://host:port` 可以工作。

## 📄 文件

| 路径 | 内容 |
| --- | --- |
| `keys.txt` | 每行一个实时验证过的密钥 — 已被 git 忽略 |
| `accounts.json` | 邮箱 / 用户名 / 密码 / 密钥 / 出口 / 额度 / 步骤状态 — 已被 git 忽略 |
| `proxies.txt` | 你的出口 — 已被 git 忽略 |
| `keys-dead.txt` | 不再响应 `--verify-only` 的密钥 — 已被 git 忽略 |
| `out/` | 运行日志、截图和 `attempts.jsonl`（每次失败尝试一行，含其失败类别）— 已被 git 忽略 |

## 🔌 连接到 9Router

[9Router](https://9router.com) 是一个自托管、兼容 OpenAI 的路由器：

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
node src/cli.js --connect-9router      # same, from the CLI
```

默认值：`--prefix tokeness`、`--base-url https://tokeness.ai/v1`、`--model tokeness/free`。模型以 `tokeness/<model id>` 形式提供。

## 🔌 连接到 OmniRoute

[OmniRoute](https://omniroute.online) 是一个自托管、兼容 OpenAI 的路由器：

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
node src/cli.js --connect-omniroute      # same, from the CLI
```

默认值：`--prefix tokeness`、`--base-url https://tokeness.ai/v1`、`--model tokeness/free`。模型以 `tokeness/<model id>` 形式提供。

## 🔑 一个密钥能给你什么

| | |
| --- | --- |
| 🏢 提供商 | **Tokeness** — [tokeness.ai](https://tokeness.ai) |
| 🎁 提供商给什么 | 一个带 18000 额度单位（≈ $0.036）的新账户，以及一个被其自身验证码挡住的签到奖励 |
| 🔑 一个密钥能给你什么 | 在其自己账户上的一个 48 字符密钥，以 `unlimited_quota` 创建，并在 `tokeness/free` 上通过聊天验证 |
| 🌐 API 形态 | 兼容 OpenAI：`POST https://tokeness.ai/v1/chat/completions` |
| 🔒 你的数据 | 只联系 `tokeness.ai` 和你的邮箱后端；密钥留在你的机器上 |

## 🐞 问题反馈

如果 Tokeness 更改其邮箱规则（白名单、别名策略）、Turnstile sitekey 或密钥揭示路由，工具会在该步骤停止，`out/attempts.jsonl` 行会说明它命中了哪个失败类别（`address-policy`、`mail`、`register`、`login`、`token`、`chat-gate`、`turnstile`、`exit`）。请带上命令和确切输出**[提交 issue](../../issues)**。

## 📄 许可证

MIT © 2026 — 见 [LICENSE](LICENSE)。

<div align="center">

**[MIT](LICENSE)** © 2026 tokeness-bulk-apikey contributors

</div>