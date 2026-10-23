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
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 빠른 시작](#-quick-start) · [🎁 무료 티어](#-free-tier--how-much-you-get) · [🤖 모델](#-models--all-22-of-them) · [🧪 API 사용하기](#-how-to-use-the-api) · [✅ 검증됨](#-verified-working--every-key-is-tested) · [🧭 작동 방식](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ 옵션](#️-cli-options) · [🛰️ 프록시](#️-behind-a-proxy) · [🐞 이슈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 왜 만들었나

Tokeness는 글로벌 CDN 뒤에 있는 **New-API 포크**(`v1.0.0-rc.40-tokeness-intl.15`)입니다. 모든 인증 경로는 Cloudflare Turnstile **그리고** 이메일 규칙 뒤에 있으며, 순진한 스크립트를 막는 것은 캡차가 아니라 이메일 규칙입니다. 패널은 **도메인 화이트리스트**(`gmail.com` / `outlook.com`만)를 유지하고 `+`가 들어간 주소는 "특수 문자"로 거부합니다. 주소가 평범해지고 주거용 출구가 위젯을 통과하면, 가입은 평범한 `코드 전송 → 가입 → 로그인` 흐름이 되고 각 계정은 **`unlimited_quota: true`인 키 하나**를 내줍니다. 이 도구는 두 번에 걸쳐 처음부터 끝까지 입증되었습니다: 실험실 레일은 **각 계정이 자기 키를 발급**했고, 이 패키지화된 CLI는 **57초 직접 실행**에서 11번째 키를 발급했습니다 — 그중 하나하나가 기록되기 전에 `tokeness/free`에서 채팅 검증되었고, 독립 재검사에서도 **11/11 모두 살아 있었습니다**.

## 🎁 무료 티어 — 얼마나 받나

| 항목 | 값 |
| --- | --- |
| 계정당 가입 할당량 | **18000 단위** — `GET /api/user/self`는 모든 새 계정에서 `quota: 18000`을 응답합니다 |
| 그 가치 | `quota_per_unit 500000`, `usd_exchange_rate 7`, `price 7` → 부여량은 **≈ $0.036** |
| 키 할당량 | 키는 `unlimited_quota: true`로 생성되므로 토큰 수준 검사는 꺼져 있습니다; 계정 자체의 할당량이 여전히 릴레이를 제한합니다 |
| 일일 체크인 | `checkin_enabled: true`이지만, 세션을 가지고 있으면 `200 {"success":false,"message":"Turnstile token 为空"}`를 응답합니다 — 자체 토큰을 요구하므로 도구는 이를 청구하지 않고 둡니다 |
| 주소 정책 | **gmail.com과 outlook.com만** (실제 토큰으로 도메인별로 탐침); `+` 별칭은 그대로 거부됩니다 — `管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。` |
| 주소당 하나의 계정 | 주소는 한 번 소비됩니다; 거부되거나 이미 사용된 메일함은 새 Emailnator 메일함으로 교체됩니다 |
| 출구 등급 | Turnstile 위젯은 **주거용 출구**에서 관리 모드로 통과합니다 (WARP와 일반 주거용 호스트 모두 측정됨); 데이터센터 IP는 브라우저에서 `600010`을 응답합니다 (0/60 클릭) |
| 확장되는 단위 | **계정 하나 = 키 하나**, 그리고 키는 실시간 채팅 200 이후에만 기록됩니다 |

> 💡 무료 티어는 Tokeness가 정하며 변경될 수 있습니다. 실시간 수치는 [tokeness.ai](https://tokeness.ai)에서 확인하세요 — 그리고 도구 자체의 게이트가 판단하게 하세요:

```bash
node src/cli.js --verify-only     # keys.txt의 모든 키가 실제 채팅 호출로 재검사됩니다
```

## 🤖 모델 — 22개 전부

`GET /v1/models`(실시간 키로 200)는 **22개의 id**를 알립니다:

| 모델 ID | 비고 |
| --- | --- |
| `tokeness/free` | **검증된 라인 — 모든 키가 여기서 200을 응답했습니다 (재검사에서 11/11)** |
| `mimo-v2.6-flash` | **역시 200이 기록됨** — 독립 재검사 중 한 키가 여기서 `ok`를 응답했습니다 |
| `deepseek-v4.1-flash`, `deepseek-v4.1-flash-1017`, `deepseek-v4-flash`, `deepseek-v4-flash-vision-exp`, `deepseek-v4-pro` | 알려짐, 개별 게이트되지 않음 |
| `glm-5.3`, `glm-5.3-flash`, `glm-5.3-flashx` | 알려짐, 개별 게이트되지 않음 |
| `qwen3.8-flash`, `qwen3.7-plus`, `qwen3.8-max` | 알려짐, 개별 게이트되지 않음 |
| `mimo-v2.5`, `mimo-v2.5-pro`, `mimo-v2.6-pro` | 알려짐, 개별 게이트되지 않음 |
| `kimi-k2.6`, `kimi-k2.7-code`, `kimi-k3` | 알려짐, 개별 게이트되지 않음 |
| `minimax-m3`, `muse-spark-1.3-contributor`, `hy3` | 알려짐, 개별 게이트되지 않음 |

`tokeness/free`는 모든 키가 게이트된 모델입니다; `mimo-v2.6-flash`도 200을 받았습니다. 나머지 id는 `/v1/models`가 알리지만 개별적으로 채팅 게이트되지 않았으므로 여기서 주장하지 않습니다.

```bash
curl https://tokeness.ai/v1/chat/completions \
  -H "Authorization: Bearer <key>" -H "Content-Type: application/json" \
  -d '{"model":"tokeness/free","messages":[{"role":"user","content":"Reply with the single word: ok"}],"max_tokens":16}'
```

## 🧪 API 사용 방법

베이스 URL **`https://tokeness.ai/v1`** — OpenAI 호환. `tokeness.io`는 `tokeness.ai`로의 `301`이며, 패널 자체의 `/api/status`는 CDN 호스트 `n.tokeness.dev`를 알립니다 (같은 `/v1`을 제공하므로 메인 호스트가 바쁠 때 유용한 두 번째 엔드포인트입니다).

```python
from openai import OpenAI
c = OpenAI(base_url="https://tokeness.ai/v1", api_key="<your key>")
print(c.chat.completions.create(model="tokeness/free",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 빠른 시작

```bash
cd tokeness-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # 선택 사항이지만, 위젯이 좋아하는 것은 주거용 등급 출구입니다
node src/launcher.js        # 대화형: 발급 / 검증 / 스크린 / 설정 / 9Router

# 또는: node src/cli.js --count 1 --pool proxies.txt
```

키는 `POST /v1/chat/completions`가 실제 콘텐츠나 추론 콘텐츠로 200을 응답한 **후에만** `keys.txt`에 기록됩니다; `accounts.json`은 이메일 / 사용자 이름 / 비밀번호 / 키 / 출구 / 할당량과 단계별 상태를 보관합니다.

### 🖱️ 런처

런처는 한 명령 경로입니다: 원하는 키 개수를 묻고(Enter = `10`) `--auto`로 CLI를 실행합니다; `proxies.txt`가 있으면 자동으로 선택되고, 없으면 직접 실행됩니다. 또한 모든 키를 재검사하고, 출구 목록을 스크린하고, 기억된 설정을 보여주고, 키를 9Router / OmniRoute에 연결합니다 — 그리고 Chrome을 미리 확인하므로, 브라우저가 없으면 실행이 시작되기 전에 보고됩니다.

### 🚀 한 명령

```bash
node src/launcher.js       # 메뉴 → "1) Mint keys" → how many keys? [10]
node src/cli.js --count 10 # 동일한 실행, 비대화형
```

이것이 도구의 전부입니다: `--auto`는 기본적으로 켜져 있습니다 — Turnstile은 내장 브라우저 레일에서 해결되고(`proxies.txt`에서 고정된 하나의 출구를 통한 실제 Chrome, 없으면 DIRECT) 키는 자체 실시간 채팅 200 이후에만 `keys.txt`에 도달합니다. `--dry`는 해결된 계획 — 개수, 출구, 솔버, 모델 — 을 출력하고 파일이나 네트워크를 건드리지 않고 종료합니다:

```bash
node src/cli.js --count 10 --dry
```

> ⚠️ **약관 및 계정 위험.** 제3자 가입을 자동화하는 것은 이 저장소가 아니라 당신의 결정이자 책임입니다. 실행하기 전에 Tokeness의 약관을 읽고 준수하세요: 패널은 하나의 계정을 하나의 주소에 묶고, 플러스 별칭 메일을 거부하며, 눈에 띄는 것을 차단할 수 있고, 이메일/캡차 규칙은 예고 없이 변경될 수 있습니다. 실제로 사용하는 만큼만 발급하세요.

## ✅ 검증됨 — 모든 키가 테스트됩니다

| 검사 | 결과 |
| --- | --- |
| `GET /api/status` | **200** — 가입 켜짐, 이메일 검증 켜짐, `turnstile_check: true`, 체크인 켜짐, 사이트키 `0x4AAAAAADUMi6GTHDf1f5T7` 공개 |
| `GET /api/verification?email=<plain gmail>&turnstile=<fresh>` | **200** `{"message":"","success":true}` |
| `+` 별칭을 사용한 동일 호출 | **200** `{"message":"管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。","success":false}` — 별칭 벽, 측정됨 |
| 패널의 메일 | `noreply@<panel-mail>`에서 온 **«Tokeness email verification»**; 코드는 본문에 있는 6자리 16진수(`Your verification code is: 7ca362`), TTL 10분, 전달 시간 34초 – 4분 측정됨 |
| `POST /api/user/register?turnstile=<fresh>` | **200** `{"success":true}` (`{username, password, email, verification_code, aff_code, turnstile}`와 함께) |
| `POST /api/user/login?turnstile=<fresh>` (평문 비밀번호) | **200** — 응답에 인증 번들(`data.access_token`)이 담겨 있습니다 |
| `GET /api/user/self` | **200** `id`, `quota 18000`, `group default` — **오직** `Authorization: Bearer <access_token>`와 함께만: 쿠키만으로는 `401 {"code":"AUTH_UNAUTHORIZED","message":"Unauthorized, invalid access token"}` |
| `POST /api/token/` | **200**이지만 **응답에 키가 없음**; 목록은 마스킹된 형태로 내줍니다(`xxek**********VKbX`); `POST /api/token/<id>/key` → 실제 48자 키와 함께 **200** |
| `GET /v1/models` | **200**, **22**개 id |
| `POST /v1/chat/completions` (`tokeness/free`) — 기록되기 전 **모든** 키에 대해 | 실제 콘텐츠와 함께 **200** — 실행이 모든 키를 완료했습니다 |
| **이 패키지에서의 전체 발급 한 번** (`--count 1`, 직접, 풀 없음) | **모든 키가 57초** — 메일함, 730자 토큰, 코드, 가입 200, 로그인 200, 키 200, 채팅 200 |
| `keys.txt`의 독립 재검사 (별도 프로세스, `--verify-only`) | **모든 키 검증됨** — 그중 열 개는 `tokeness/free`, 열한 번째는 `mimo-v2.6-flash` |
| 혼합 출구 샘플에 대한 `--screen` | 주거용 출구와 하나의 데이터센터 출구가 `/api/status` + Turnstile 자산 게이트를 통과했습니다; 나머지 둘은 타임아웃 — 브라우저 레일은 여전히 위젯이 받아들이는 출구 등급이 필요합니다 |

> **품질 게이트.** 여기 있는 모든 키는 `keys.txt`에 기록되기 전에 실시간 `chat-200`을 통과했습니다
> (죽은 키는 절대 배포되지 않습니다). 라우터 조합도 모델 수준에서 같은 규칙을 따릅니다: 항목은
> **모델이 `chat-200`을 응답하고 도구를 호출할 수 있을 때만** 추가됩니다 — 도구 지원이 없는 모델,
> 죽은 키 또는 죽은 제공자는 추가되지 않고 제거됩니다. 언제든지 검증 단계를 다시 실행하세요;
> 실패는 보고되며, 절대 숨겨지지 않습니다.

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
| 1 출구 검증 | `GET /api/status` + `challenges.cloudflare.com/turnstile/v0/api.js` | 둘 중 하나도 로드할 수 없는 출구는 계정이 소비되기 전에 건너뜁니다 |
| 2 메일함 | Emailnator `POST /api/generate-email` | 계정당 새 gmail 하나, **점 없는** 형태로 사용: 패널은 `+`와 점을 거부하고, Emailnator 자체도 같은 평문 주소를 폴링합니다 |
| 3 브라우저 | CDP를 통한 Chrome, `GET /register` | 0이 아닌 `--remote-debugging-port`가 `navigator.webdriver`를 false로 유지합니다 |
| 4 코드 전송 | `GET /api/verification?email=…&turnstile=<fresh>` | 페이지 내 fetch이므로 세션 쿠키가 함께 갑니다 |
| 5 코드 읽기 | Emailnator `/api/message-list` → `/api/message/<id>` | tokeness를 언급한 메일만 카운트됩니다 (메일함은 공용 풀입니다); 코드는 본문에 있는 6자리 16진수입니다 |
| 6 가입 | `POST /api/user/register?turnstile=<fresh>` | `verification_code`가 필드 이름입니다; 토큰은 쿼리 **그리고** 본문에 함께 갑니다 |
| 7 로그인 | `POST /api/user/login?turnstile=<fresh>` | 평문 비밀번호 (`password_login_encryption_enabled: false`); `access_token` 캡처 |
| 키 | `POST /api/token/` → 목록 → `POST /api/token/<id>/key` | 베어러 필요; 생성 응답에는 키가 없고 목록은 마스킹됩니다 |
| 9 게이트 | `GET /v1/models` + 완료 한 번 | 콘텐츠와 함께 200 = 키가 살아 있음, 그때서야 기록됩니다 |

## ⚙️ CLI 옵션

```bash
node src/cli.js --count 1 --pool proxies.txt   # mint (serial; one account = one key)
node src/cli.js --model mimo-v2.6-flash        # another gate model (advertised ids)
node src/cli.js --verify-only                  # re-check every key in keys.txt with a live chat call
node src/cli.js --screen                       # exit self-test: /api/status + the Turnstile asset
node src/cli.js --connect-9router              # register keys.txt with a local 9Router
node src/cli.js --help
```

| 환경 변수 / 플래그 | 기본값 | 의미 |
| --- | --- | --- |
| `TOKENESS_PROXIES` | `proxies.txt` | 출구 풀, 프록시당 한 줄 |
| `TOKENESS_MODEL` | `tokeness/free` | 실시간 게이트에 사용되는 모델 |
| `CHROME_PATH` | 자동 감지 | 캡차 브라우저용 Chrome/Edge 바이너리 |
| `--auto` | `on` | 내장 브라우저 레일에서 Turnstile 해결 (기본) |
| `--dry` | `off` | 해결된 계획을 출력하고 종료 — 파일 쓰기 없음, 요청 없음 |

CLI는 한 번에 하나의 계정을 실행합니다: 패널은 계정을 그 주소와 출구에 묶으므로, 병렬 실행은 같은 자원을 두고 경쟁할 뿐입니다.

## 🛰️ 프록시 뒤에서

**선택 사항 — 도구는 프록시 없이도 작동하지만, 출구 등급이 누가 발급할 수 있는지를 결정합니다.**

- **풀 사용 시:** `--pool <file>`을 전달하거나(또는 `TOKENESS_PROXIES` 설정) 계정에 대한 모든 요청 — 캡차 브라우저 포함 — 이 그 목록에서 고정된 하나의 출구를 통해 갑니다, fail-closed: 도달 가능한 출구를 내놓지 못하는 풀은 자신의 주소에서 요청이 새는 대신 실행을 실패시킵니다. `--screen`은 사용되기 전에 각 출구를 `/api/status` **그리고** Turnstile 스크립트에서 검증합니다.
- **풀 없을 시:** CLI는 `running WITHOUT a proxy (direct)`를 출력하고 직접 연결합니다. 측정됨: 주거용 호스트에서는 위젯이 여전히 관리 모드로 해결되고 전체 계정이 57초에 발급되었지만, 데이터센터 IP에서 같은 페이지는 챌린지를 마운트하지 못했습니다 (`600010`, 한 탐침에서 0/60 클릭). 따라서 직접은 가정 연결에서는 괜찮고 VPS에서는 희망이 없습니다.
- Chrome은 SOCKS5 프록시에 인증할 수 없으므로, `socks5://user:pass@host:port` 줄은 메모와 함께 버려집니다; 평문 `socks5://host:port`와 `http://host:port`는 작동합니다.

## 📄 파일

| 경로 | 내용 |
| --- | --- |
| `keys.txt` | 한 줄에 하나의 실시간 검증된 키 — git-ignored |
| `accounts.json` | 이메일 / 사용자 이름 / 비밀번호 / 키 / 출구 / 할당량 / 단계 상태 — git-ignored |
| `proxies.txt` | 당신의 출구 — git-ignored |
| `keys-dead.txt` | `--verify-only`에 응답을 멈춘 키 — git-ignored |
| `out/` | 실행 로그, 스크린샷 및 `attempts.jsonl` (실패한 시도당 한 줄, 실패 클래스 포함) — git-ignored |

## 🔌 9Router에 연결

[9Router](https://9router.com)는 자체 호스팅, OpenAI 호환 라우터입니다:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
node src/cli.js --connect-9router      # same, from the CLI
```

기본값: `--prefix tokeness`, `--base-url https://tokeness.ai/v1`, `--model tokeness/free`. 모델은 `tokeness/<model id>`로 제공됩니다.

## 🔌 OmniRoute에 연결

[OmniRoute](https://omniroute.online)는 자체 호스팅, OpenAI 호환 라우터입니다:

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
node src/cli.js --connect-omniroute      # same, from the CLI
```

기본값: `--prefix tokeness`, `--base-url https://tokeness.ai/v1`, `--model tokeness/free`. 모델은 `tokeness/<model id>`로 제공됩니다.

## 🔑 키 하나로 얻는 것

| | |
| --- | --- |
| 🏢 제공자 | **Tokeness** — [tokeness.ai](https://tokeness.ai) |
| 🎁 제공자가 주는 것 | 18000 할당량 단위(≈ $0.036)의 새 계정과 자체 캡차 뒤에 게이트된 체크인 보너스 |
| 🔑 키 하나로 얻는 것 | 자체 계정에 있는 48자 키 하나, `unlimited_quota`로 생성되고 `tokeness/free`에서 채팅 검증됨 |
| 🌐 API 형태 | OpenAI 호환: `POST https://tokeness.ai/v1/chat/completions` |
| 🔒 당신의 데이터 | `tokeness.ai`와 당신의 메일함 백엔드만 접촉됩니다; 키는 당신의 기기에 남습니다 |

## 🐞 이슈

Tokeness가 이메일 규칙(화이트리스트, 별칭 정책), Turnstile 사이트키 또는 키 공개 경로를 변경하면, 도구는 그 단계에서 멈추고 `out/attempts.jsonl` 줄이 어떤 실패 클래스에 부딪혔는지 알려줍니다 (`address-policy`, `mail`, `register`, `login`, `token`, `chat-gate`, `turnstile`, `exit`). 명령과 정확한 출력을 가지고 **[이슈를 열어주세요](../../issues)**.

## 📄 라이선스

MIT © 2026 — [LICENSE](LICENSE) 참조.

<div align="center">

**[MIT](LICENSE)** © 2026 tokeness-bulk-apikey contributors

</div>