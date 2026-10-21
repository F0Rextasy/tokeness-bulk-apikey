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

**자동 생성된 API 키로 Tokeness 계정을 대량 생성 — OpenAI 호환 추론 + 9Router 커넥터.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-22%20served-412991?style=for-the-badge)](https://tokeness.ai/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 빠른 시작](#-quick-start) · [🎁 무료 티어](#-free-tier--how-much-you-get) · [🤖 모델](#-models--all-22-of-them) · [🧪 API 사용하기](#-how-to-use-the-api) · [✅ 검증됨](#-verified-working--every-key-is-tested) · [🧭 작동 방식](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ 옵션](#️-cli-options) · [🛰️ 프록시](#️-behind-a-proxy) · [🐞 이슈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 왜 이 도구가 필요한가

Tokeness는 글로벌 CDN 뒤에 있는 **New-API 포크**(`v1.0.0-rc.40-tokeness-intl.15`)입니다. 모든 인증 경로는 Cloudflare Turnstile **그리고** 이메일 규칙 뒤에 있으며, 순진한 스크립트를 막는 것은 캡차가 아니라 이메일 규칙입니다. 패널은 **도메인 화이트리스트**(`gmail.com` / `outlook.com`만 허용)를 유지하며 `+`가 포함된 주소는 "특수 기호"로 간주하여 거부합니다. 주소가 일반 형식이고 주거용 출구가 위젯을 통과하면, 가입은 평범한 `코드 전송 → 등록 → 로그인` 흐름이며 각 계정은 **`unlimited_quota: true`인 키 하나**를 발급합니다. 이 도구는 두 번에 걸쳐 처음부터 끝까지 입증되었습니다. 실험 환경에서 **계정 10개 → 키 10개**를 생성했고, 이 패키지화된 CLI가 **57초의 직접 실행**으로 11번째를 생성했습니다. 기록되기 전에 모두 `tokeness/free`에서 채팅 검증되었으며, 독립적인 재검사에서도 **11/11 모두 살아 있었습니다**.

## 🎁 무료 티어 — 얼마나 받을 수 있나

| 항목 | 값 |
| --- | --- |
| 계정당 가입 할당량 | **18000 단위** — `GET /api/user/self`는 모든 새 계정에서 `quota: 18000`을 응답합니다 |
| 그 가치 | `quota_per_unit 500000`, `usd_exchange_rate 7`, `price 7` → 부여량은 **≈ $0.036** |
| 키 할당량 | 키는 `unlimited_quota: true`로 생성되므로 토큰 수준 검사는 꺼져 있습니다. 계정 자체의 할당량이 여전히 릴레이를 제한합니다 |
| 일일 체크인 | `checkin_enabled: true`이지만 세션이 있으면 `200 {"success":false,"message":"Turnstile token 为空"}`을 응답합니다 — 자체 토큰을 요구하므로 도구는 이를 청구하지 않고 둡니다 |
| 주소 정책 | **gmail.com과 outlook.com만 허용**(실제 토큰으로 도메인별로 탐색함). `+` 별칭은 그대로 거부됩니다 — `管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。` |
| 주소당 하나의 계정 | 주소는 한 번만 사용됩니다. 거부되거나 이미 사용된 메일함은 새 Emailnator 메일함으로 교체됩니다 |
| 출구 등급 | Turnstile 위젯은 **주거용 출구**에서 관리 모드로 통과합니다(proxy와 일반 주거용 호스트 모두 측정됨). 데이터센터 IP는 브라우저에서 `600010`을 응답합니다(60회 클릭 중 0회) |
| 확장되는 단위 | **계정 하나 = 키 하나**이며, 키는 실시간 채팅 200 이후에만 기록됩니다 |

> 💡 무료 티어는 Tokeness가 설정하며 변경될 수 있습니다. 실시간 수치는 [tokeness.ai](https://tokeness.ai)에서 확인하세요 — 그리고 도구 자체의 게이트가 판단하게 하세요:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 모델 — 22개 전부

`GET /v1/models`(실제 키로 200)는 **22개의 id**를 알립니다:

| 모델 ID | 비고 |
| --- | --- |
| `tokeness/free` | **검증된 라인 — 모든 키가 여기서 200을 응답했습니다(재검사에서 11/11)** |
| `mimo-v2.6-flash` | **역시 200이 기록됨** — 독립 재검사 중 한 키가 여기서 `ok`를 응답했습니다 |
| `deepseek-v4.1-flash`, `deepseek-v4.1-flash-1017`, `deepseek-v4-flash`, `deepseek-v4-flash-vision-exp`, `deepseek-v4-pro` | 알려져 있으나 개별적으로 게이트되지 않음 |
| `glm-5.3`, `glm-5.3-flash`, `glm-5.3-flashx` | 알려져 있으나 개별적으로 게이트되지 않음 |
| `qwen3.8-flash`, `qwen3.7-plus`, `qwen3.8-max` | 알려져 있으나 개별적으로 게이트되지 않음 |
| `mimo-v2.5`, `mimo-v2.5-pro`, `mimo-v2.6-pro` | 알려져 있으나 개별적으로 게이트되지 않음 |
| `kimi-k2.6`, `kimi-k2.7-code`, `kimi-k3` | 알려져 있으나 개별적으로 게이트되지 않음 |
| `minimax-m3`, `muse-spark-1.3-contributor`, `hy3` | 알려져 있으나 개별적으로 게이트되지 않음 |

`tokeness/free`는 모든 키가 게이트된 모델이며, `mimo-v2.6-flash`도 200을 받았습니다. 나머지 id는 `/v1/models`가 알리지만 개별적으로 채팅 게이트되지 않았으므로 여기서 주장하지 않습니다.

```bash
curl https://tokeness.ai/v1/chat/completions \
  -H "Authorization: Bearer <key>" -H "Content-Type: application/json" \
  -d '{"model":"tokeness/free","messages":[{"role":"user","content":"Reply with the single word: ok"}],"max_tokens":16}'
```

## 🧪 API 사용 방법

Base URL **`https://tokeness.ai/v1`** — OpenAI 호환. `tokeness.io`는 `tokeness.ai`로의 `301`이며, 패널 자체의 `/api/status`는 CDN 호스트 `n.tokeness.dev`를 알립니다(동일한 `/v1`을 제공하므로 메인 호스트가 바쁠 때 유용한 두 번째 엔드포인트입니다).

```python
from openai import OpenAI
c = OpenAI(base_url="https://tokeness.ai/v1", api_key="<your key>")
print(c.chat.completions.create(model="tokeness/free",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 빠른 시작

```bash
cd tokeness-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional, but a residential-class exit is what the widget likes
node src/launcher.js        # interactive: mint / verify / screen / settings / 9Router
# or: node src/cli.js --count 1 --pool proxies.txt
```

키는 `POST /v1/chat/completions`가 실제 콘텐츠 또는 추론 콘텐츠와 함께 200을 응답한 **후에만** `keys.txt`에 기록됩니다. `accounts.json`은 이메일 / 사용자 이름 / 비밀번호 / 키 / 출구 / 할당량과 각 단계의 상태를 보관합니다.

### 🖱️ 런처

런처는 프록시 목록과 개수를 묻고, 이를 `launcher.config.json`에 기억한 뒤 CLI를 실행합니다 — 생성, 검증, 출구 스크리닝, 설정, 도움말, 9Router 연결.

## ✅ 검증됨 — 모든 키가 테스트됩니다

| 검사 | 결과 |
| --- | --- |
| `GET /api/status` | **200** — 등록 켜짐, 이메일 인증 켜짐, `turnstile_check: true`, 체크인 켜짐, sitekey `0x4AAAAAADUMi6GTHDf1f5T7` 공개됨 |
| `GET /api/verification?email=<plain gmail>&turnstile=<fresh>` | **200** `{"message":"","success":true}` |
| `+` 별칭을 사용한 동일 호출 | **200** `{"message":"管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。","success":false}` — 별칭 장벽, 측정됨 |
| 패널의 메일 | `send@<panel-mail>`에서 온 **«Tokeness email verification»**; 코드는 본문에 있는 6자리 16진수(`Your verification code is: 7ca362`), TTL 10분, 전달 시간 34초 – 4분으로 측정됨 |
| `POST /api/user/register?turnstile=<fresh>` | `{username, password, email, verification_code, aff_code, turnstile}`와 함께 **200** `{"success":true}` |
| `POST /api/user/login?turnstile=<fresh>` (일반 비밀번호) | **200** — 응답에 인증 번들(`data.access_token`)이 포함됨 |
| `GET /api/user/self` | **200** `id`, `quota 18000`, `group default` — **오직** `Authorization: Bearer <access_token>`이 있을 때만: 쿠키만으로는 `401 {"code":"AUTH_UNAUTHORIZED","message":"Unauthorized, invalid access token"}` |
| `POST /api/token/` | **200**이지만 **응답에 키가 없음**; 목록은 마스킹된 형태로 제공(`xxek**********VKbX`); `POST /api/token/<id>/key` → 실제 48자 키와 함께 **200** |
| `GET /v1/models` | **200**, **22**개 id |
| `POST /v1/chat/completions` (`tokeness/free`) — 기록되기 전 **모든** 키에 대해 | 실제 콘텐츠와 함께 **200** — 실행이 **10/10 키**를 완료함 |
| **이 패키지에서의 전체 생성 한 번** (`--count 1`, 직접, 풀 없음) | **57초에 1/1 키** — 메일함, 730자 토큰, 코드, 등록 200, 로그인 200, 키 200, 채팅 200 |
| `keys.txt`의 독립 재검사 (별도 프로세스, `--verify-only`) | **11/11 키 살아 있음** — 그중 열 개는 `tokeness/free`, 열한 번째는 `mimo-v2.6-flash` |
| 혼합 출구 샘플에 대한 `--screen` | 주거용 출구와 데이터센터 출구 하나가 `/api/status` + Turnstile 자산 게이트를 통과함; 나머지 둘은 시간 초과 — 브라우저 레일은 여전히 위젯이 허용하는 출구 등급이 필요함 |

## 🧭 작동 방식

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Tokeness page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://tokeness.ai/v1/chat/completions → real content = the key is live
```

| 단계 | 호출 | 비고 |
| --- | --- | --- |
| 1 출구 검증 | `GET /api/status` + `challenges.cloudflare.com/turnstile/v0/api.js` | 둘 중 하나도 로드할 수 없는 출구는 계정을 소모하기 전에 건너뜁니다 |
| 2 메일함 | Emailnator `POST /api/generate-email` | 계정당 새 gmail 하나, **점 없는** 형식으로 사용: 패널은 `+`와 점을 거부하며, Emailnator 자체도 동일한 일반 주소를 폴링합니다 |
| 3 브라우저 | CDP를 통한 Chrome, `GET /register` | 0이 아닌 `--remote-debugging-port`가 `navigator.webdriver`를 false로 유지합니다 |
| 4 코드 전송 | `GET /api/verification?email=…&turnstile=<fresh>` | 페이지 내 fetch이므로 세션 쿠키가 함께 전달됩니다 |
| 5 코드 읽기 | Emailnator `/api/message-list` → `/api/message/<id>` | tokeness를 언급한 메일만 집계됩니다(메일함은 공용 풀입니다); 코드는 본문에 있는 6자리 16진수입니다 |
| 6 등록 | `POST /api/user/register?turnstile=<fresh>` | `verification_code`가 필드 이름입니다; 토큰은 쿼리 **그리고** 본문에 함께 전달됩니다 |
| 7 로그인 | `POST /api/user/login?turnstile=<fresh>` | 일반 비밀번호(`password_login_encryption_enabled: false`); `access_token`을 캡처합니다 |
| 8 키 | `POST /api/token/` → 목록 → `POST /api/token/<id>/key` | bearer 필요; 생성 응답에는 키가 없고 목록은 마스킹됩니다 |
| 9 게이트 | `GET /v1/models` + 완료 한 번 | 콘텐츠와 함께 200 = 키가 살아 있으며, 그때서야 기록됩니다 |

## ⚙️ CLI 옵션

```bash
node src/cli.js --count 1 --pool proxies.txt   # mint (serial; one account = one key)
node src/cli.js --model mimo-v2.6-flash        # another gate model (advertised ids)
node src/cli.js --verify-only                  # re-check every key in keys.txt with a live chat call
node src/cli.js --screen                       # exit self-test: /api/status + the Turnstile asset
node src/cli.js --connect-9router              # register keys.txt with a local 9Router
node src/cli.js --help
```

| 환경 변수 | 기본값 | 의미 |
| --- | --- | --- |
| `TOKENESS_PROXIES` | `proxies.txt` | 출구 풀, 프록시당 한 줄 |
| `TOKENESS_MODEL` | `tokeness/free` | 실시간 게이트에 사용되는 모델 |
| `CHROME_PATH` | 자동 감지 | 캡차 브라우저용 Chrome/Edge 바이너리 |

CLI는 한 번에 하나의 계정을 실행합니다. 패널은 계정을 주소와 출구에 묶으므로, 병렬 실행은 동일한 자원을 두고 경쟁할 뿐입니다.

## 🛰️ 프록시 뒤에서

**선택 사항 — 도구는 프록시 없이도 작동하지만, 출구 등급이 누가 생성할 수 있는지를 결정합니다.**

- **풀이 있을 때:** `--pool <file>`을 전달하거나(또는 `TOKENESS_PROXIES` 설정) 계정에 대한 모든 요청 — 캡차 브라우저 포함 — 이 해당 목록의 고정된 출구 하나를 통해 나가며, fail-closed 방식입니다. 도달 가능한 출구를 내놓지 못하는 풀은 자체 주소에서 요청이 유출되는 대신 실행을 실패시킵니다. `--screen`은 사용 전에 각 출구를 `/api/status` **그리고** Turnstile 스크립트로 검증합니다.
- **풀이 없을 때:** CLI는 `running WITHOUT a proxy (direct)`를 출력하고 직접 연결합니다. 측정 결과: 주거용 호스트에서는 위젯이 여전히 관리 모드로 해결되었고 전체 계정이 57초에 생성되었지만, 데이터센터 IP에서 동일한 페이지는 챌린지를 전혀 마운트하지 못했습니다(한 번의 탐색에서 `600010`, 60회 클릭 중 0회). 따라서 직접 연결은 가정용 연결에서는 괜찮고 VPS에서는 희망이 없습니다.
- Chrome은 SOCKS5 프록시에 인증할 수 없으므로 `socks5://user:pass@host:port` 줄은 안내와 함께 삭제됩니다. 일반 `socks5://host:port`와 `http://host:port`는 작동합니다.

## 📄 파일

| 경로 | 내용 |
| --- | --- |
| `keys.txt` | 한 줄에 하나의 실시간 검증된 키 — git 무시됨 |
| `accounts.json` | 이메일 / 사용자 이름 / 비밀번호 / 키 / 출구 / 할당량 / 단계 상태 — git 무시됨 |
| `proxies.txt` | 사용자의 출구 — git 무시됨 |
| `out/` | 실행 로그, 스크린샷 및 `attempts.jsonl`(실패한 시도마다 실패 등급과 함께 한 줄) — git 무시됨 |

## 🔌 9Router에 연결

[9Router](https://9router.com)는 자체 호스팅되는 OpenAI 호환 라우터입니다:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
node src/cli.js --connect-9router      # same, from the CLI
```

기본값: `--prefix tokeness`, `--base-url https://tokeness.ai/v1`, `--model tokeness/free`. 모델은 `tokeness/<model id>`로 제공됩니다.

## 🔑 키 하나로 얻는 것

| | |
| --- | --- |
| 🏢 제공자 | **Tokeness** — [tokeness.ai](https://tokeness.ai) |
| 🎁 제공자가 주는 것 | 18000 할당량 단위(≈ $0.036)의 새 계정과 자체 캡차 뒤에 게이트된 체크인 보너스 |
| 🔑 키 하나로 얻는 것 | 자체 계정에 있는 48자 키 하나, `unlimited_quota`로 생성되고 `tokeness/free`에서 채팅 검증됨 |
| 🌐 API 형태 | OpenAI 호환: `POST https://tokeness.ai/v1/chat/completions` |
| 🔒 데이터 | `tokeness.ai`와 사용자의 메일함 백엔드만 접촉됩니다; 키는 사용자의 컴퓨터에 남습니다 |

## 🐞 이슈

Tokeness가 이메일 규칙(화이트리스트, 별칭 정책), Turnstile sitekey 또는 키 공개 경로를 변경하면, 도구는 해당 단계에서 멈추고 `out/attempts.jsonl` 줄이 어떤 실패 등급에 도달했는지 알려줍니다(`address-policy`, `mail`, `register`, `login`, `token`, `chat-gate`, `turnstile`, `exit`). 명령과 정확한 출력을 포함하여 **[이슈를 열어주세요](../../issues)**.

## 📄 라이선스

MIT © 2026 — [LICENSE](LICENSE) 참조.

<div align="center">

**[MIT](LICENSE)** © 2026 tokeness-bulk-apikey contributors

</div>