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

**Crie contas Tokeness em massa com chaves de API geradas automaticamente — inferência compatível com OpenAI + conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-22%20served-412991?style=for-the-badge)](https://tokeness.ai/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Início rápido](#-quick-start) · [🎁 Nível gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-22-of-them) · [🧪 Use a API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Como funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Opções](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por que isto existe

Tokeness é um **fork do New-API** (`v1.0.0-rc.40-tokeness-intl.15`) atrás de um CDN global. Toda rota de autenticação está atrás de um Cloudflare Turnstile **e** de uma regra de e-mail, e a regra de e-mail — não o captcha — é o que impede um script ingênuo: o painel mantém uma **lista de domínios permitidos** (apenas `gmail.com` / `outlook.com`) e recusa qualquer endereço que contenha `+` como "símbolos especiais". Uma vez que o endereço seja simples e uma saída residencial resolva o widget, o cadastro é um fluxo normal de `enviar código → registrar → login` e cada conta entrega **uma chave com `unlimited_quota: true`**. A ferramenta foi comprovada de ponta a ponta duas vezes: o trilho de laboratório gerou **10 contas → 10 chaves**, e este CLI empacotado então gerou uma 11ª em uma **execução direta de 57 segundos** — cada uma delas verificada por chat em `tokeness/free` antes de ser gravada, todas as **11/11 ainda ativas** na reverificação independente.

## 🎁 Nível gratuito — quanto você recebe

| O quê | Valor |
| --- | --- |
| Cota de cadastro por conta | **18000 unidades** — `GET /api/user/self` responde `quota: 18000` em toda conta nova |
| Quanto isso vale | `quota_per_unit 500000`, `usd_exchange_rate 7`, `price 7` → a concessão é de **≈ $0.036** |
| Cota da chave | a chave é criada com `unlimited_quota: true`, então a verificação no nível do token está desligada; a cota da própria conta ainda controla o relay |
| Check-in diário | `checkin_enabled: true`, mas com uma sessão ele responde `200 {"success":false,"message":"Turnstile token 为空"}` — ele quer seu próprio token, então a ferramenta deixa isso sem reivindicar |
| Política de endereço | **apenas gmail.com e outlook.com** (testado domínio por domínio com tokens reais); um alias com `+` é recusado literalmente — `管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。` |
| Uma conta por endereço | um endereço é usado uma vez; uma caixa recusada/ocupada é substituída por uma nova caixa do Emailnator |
| Classe de saída | o widget Turnstile passa em modo gerenciado a partir de uma **saída residencial** (proxy e um host residencial comum foram medidos); um IP de datacenter responde `600010` no navegador (0/60 cliques) |
| A unidade que escala | **uma conta = uma chave**, e a chave só é gravada após um chat 200 ao vivo |

> 💡 O nível gratuito é definido pela Tokeness e pode mudar. Confira os números ao vivo em [tokeness.ai](https://tokeness.ai) — e deixe o próprio gate da ferramenta decidir:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — todos os 22

`GET /v1/models` (200 com uma chave ativa) anuncia **22 ids**:

| ID do modelo | observação |
| --- | --- |
| `tokeness/free` | **a linha verificada — toda chave respondeu 200 nela (11/11 na reverificação)** |
| `mimo-v2.6-flash` | **também registrou 200** — uma chave respondeu `ok` nela durante a reverificação independente |
| `deepseek-v4.1-flash`, `deepseek-v4.1-flash-1017`, `deepseek-v4-flash`, `deepseek-v4-flash-vision-exp`, `deepseek-v4-pro` | anunciados, não verificados individualmente |
| `glm-5.3`, `glm-5.3-flash`, `glm-5.3-flashx` | anunciados, não verificados individualmente |
| `qwen3.8-flash`, `qwen3.7-plus`, `qwen3.8-max` | anunciados, não verificados individualmente |
| `mimo-v2.5`, `mimo-v2.5-pro`, `mimo-v2.6-pro` | anunciados, não verificados individualmente |
| `kimi-k2.6`, `kimi-k2.7-code`, `kimi-k3` | anunciados, não verificados individualmente |
| `minimax-m3`, `muse-spark-1.3-contributor`, `hy3` | anunciados, não verificados individualmente |

`tokeness/free` é o modelo no qual toda chave foi verificada; `mimo-v2.6-flash` também obteve um 200. Os ids restantes são anunciados por `/v1/models`, mas não foram verificados individualmente por chat, então não são reivindicados aqui.

```bash
curl https://tokeness.ai/v1/chat/completions \
  -H "Authorization: Bearer <key>" -H "Content-Type: application/json" \
  -d '{"model":"tokeness/free","messages":[{"role":"user","content":"Reply with the single word: ok"}],"max_tokens":16}'
```

## 🧪 Como usar a API

URL base **`https://tokeness.ai/v1`** — compatível com OpenAI. `tokeness.io` é um `301` para `tokeness.ai`, e o próprio `/api/status` do painel anuncia um host CDN `n.tokeness.dev` (ele serve o mesmo `/v1`, então é um segundo endpoint útil quando o host principal está ocupado).

```python
from openai import OpenAI
c = OpenAI(base_url="https://tokeness.ai/v1", api_key="<your key>")
print(c.chat.completions.create(model="tokeness/free",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 Início rápido

```bash
cd tokeness-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional, but a residential-class exit is what the widget likes
node src/launcher.js        # interactive: mint / verify / screen / settings / 9Router
# or: node src/cli.js --count 1 --pool proxies.txt
```

Uma chave é gravada em `keys.txt` **somente** após `POST /v1/chat/completions` responder 200 com conteúdo real ou conteúdo de raciocínio; `accounts.json` mantém e-mail / nome de usuário / senha / chave / saída / cota e os status de cada etapa.

### 🖱️ O launcher

O launcher pede a lista de proxies e a contagem, memoriza-os em `launcher.config.json` e executa o CLI — mint, verify, screen exits, settings, help, Connect to 9Router.

## ✅ Verificado e funcionando — toda chave é testada

| Verificação | Resultado |
| --- | --- |
| `GET /api/status` | **200** — registro ativado, verificação de e-mail ativada, `turnstile_check: true`, check-in ativado, sitekey `0x4AAAAAADUMi6GTHDf1f5T7` publicada |
| `GET /api/verification?email=<plain gmail>&turnstile=<fresh>` | **200** `{"message":"","success":true}` |
| a mesma chamada com um alias `+` | **200** `{"message":"管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。","success":false}` — a barreira do alias, medida |
| o e-mail do painel | **«Tokeness email verification»** de `send@<panel-mail>`; o código tem seis caracteres hexadecimais no corpo (`Your verification code is: 7ca362`), TTL de 10 minutos, entrega medida entre 34 s – 4 min |
| `POST /api/user/register?turnstile=<fresh>` | **200** `{"success":true}` com `{username, password, email, verification_code, aff_code, turnstile}` |
| `POST /api/user/login?turnstile=<fresh>` (senha simples) | **200** — a resposta carrega o pacote de autenticação (`data.access_token`) |
| `GET /api/user/self` | **200** `id`, `quota 18000`, `group default` — **somente** com `Authorization: Bearer <access_token>`: apenas com cookie responde `401 {"code":"AUTH_UNAUTHORIZED","message":"Unauthorized, invalid access token"}` |
| `POST /api/token/` | **200** mas **sem chave na resposta**; a lista a entrega mascarada (`xxek**********VKbX`); `POST /api/token/<id>/key` → **200** com a chave real de 48 caracteres |
| `GET /v1/models` | **200**, **22** ids |
| `POST /v1/chat/completions` (`tokeness/free`) — para **toda** chave antes de ser gravada | **200** com conteúdo real — a execução completou **10/10 chaves** |
| **um mint completo a partir deste pacote** (`--count 1`, direto, sem pool) | **1/1 chave em 57 s** — caixa de correio, token de 730 caracteres, código, register 200, login 200, key 200, chat 200 |
| reverificação independente de `keys.txt` (processo separado, `--verify-only`) | **11/11 chaves ativas** — `tokeness/free` para dez delas, `mimo-v2.6-flash` para a décima primeira |
| `--screen` sobre uma amostra mista de saídas | a saída residencial e uma saída de datacenter passaram nos gates de `/api/status` + asset do Turnstile; duas outras deram timeout — o trilho do navegador ainda precisa de uma classe de saída que o widget aceite |

## 🧭 Como funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Tokeness page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://tokeness.ai/v1/chat/completions → real content = the key is live
```

| Etapa | Chamada | Observações |
| --- | --- | --- |
| 1 verificar saída | `GET /api/status` + `challenges.cloudflare.com/turnstile/v0/api.js` | uma saída que não consegue carregar nenhum dos dois é descartada antes de gastar uma conta |
| 2 caixa de correio | Emailnator `POST /api/generate-email` | um gmail novo por conta, usado em sua forma **sem pontos**: o painel recusa `+` e pontos, e o próprio Emailnator consulta esse mesmo endereço simples |
| 3 navegador | Chrome via CDP, `GET /register` | uma `--remote-debugging-port` diferente de zero mantém `navigator.webdriver` falso |
| 4 enviar código | `GET /api/verification?email=…&turnstile=<fresh>` | fetch na página, então o cookie de sessão acompanha |
| 5 ler código | Emailnator `/api/message-list` → `/api/message/<id>` | apenas e-mails que mencionam tokeness contam (as caixas são um pool público); o código tem seis caracteres hexadecimais no corpo |
| 6 registrar | `POST /api/user/register?turnstile=<fresh>` | `verification_code` é o nome do campo; o token vai na query **e** no corpo |
| 7 login | `POST /api/user/login?turnstile=<fresh>` | senha simples (`password_login_encryption_enabled: false`); capture o `access_token` |
| 8 chave | `POST /api/token/` → list → `POST /api/token/<id>/key` | bearer obrigatório; a resposta de criação não tem chave e a lista é mascarada |
| 9 gate | `GET /v1/models` + uma completion | 200 com conteúdo = a chave está ativa e só então ela é gravada |

## ⚙️ Opções do CLI

```bash
node src/cli.js --count 1 --pool proxies.txt   # mint (serial; one account = one key)
node src/cli.js --model mimo-v2.6-flash        # another gate model (advertised ids)
node src/cli.js --verify-only                  # re-check every key in keys.txt with a live chat call
node src/cli.js --screen                       # exit self-test: /api/status + the Turnstile asset
node src/cli.js --connect-9router              # register keys.txt with a local 9Router
node src/cli.js --help
```

| Env | Padrão | Significado |
| --- | --- | --- |
| `TOKENESS_PROXIES` | `proxies.txt` | pool de saídas, uma linha por proxy |
| `TOKENESS_MODEL` | `tokeness/free` | modelo usado para o gate ao vivo |
| `CHROME_PATH` | detectado automaticamente | binário do Chrome/Edge para o navegador do captcha |

O CLI executa uma conta por vez: o painel vincula uma conta ao seu endereço e à sua saída, então execuções paralelas só disputam o mesmo recurso.

## 🛰️ Atrás de um proxy

**Opcional — e a ferramenta funciona sem um, mas a classe de saída decide quem pode gerar.**

- **Com um pool:** passe `--pool <file>` (ou defina `TOKENESS_PROXIES`) e toda requisição de uma conta — incluindo o navegador do captcha — passa por uma saída fixada dessa lista, fail-closed: um pool que não produz nenhuma saída alcançável faz a execução falhar em vez de vazar uma requisição do seu próprio endereço. `--screen` verifica cada saída em `/api/status` **e** no script do Turnstile antes de ser usada.
- **Sem um pool:** o CLI imprime `running WITHOUT a proxy (direct)` e conecta diretamente. Medido: em um host residencial o widget ainda foi resolvido em modo gerenciado e uma conta completa foi gerada em 57 s, enquanto a mesma página a partir de um IP de datacenter nunca monta o desafio (`600010`, 0/60 cliques em uma sondagem). Então direto funciona bem a partir de uma conexão doméstica e é inútil a partir de um VPS.
- O Chrome não consegue autenticar em um proxy SOCKS5, então linhas `socks5://user:pass@host:port` são descartadas com uma observação; `socks5://host:port` simples e `http://host:port` funcionam.

## 📄 Arquivos

| Caminho | Conteúdo |
| --- | --- |
| `keys.txt` | uma chave verificada ao vivo por linha — ignorado pelo git |
| `accounts.json` | e-mail / nome de usuário / senha / chave / saída / cota / status das etapas — ignorado pelo git |
| `proxies.txt` | suas saídas — ignorado pelo git |
| `out/` | logs de execução, capturas de tela e `attempts.jsonl` (uma linha por tentativa falha com sua classe de falha) — ignorado pelo git |

## 🔌 Conectar ao 9Router

[9Router](https://9router.com) é um roteador auto-hospedado e compatível com OpenAI:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
node src/cli.js --connect-9router      # same, from the CLI
```

Padrões: `--prefix tokeness`, `--base-url https://tokeness.ai/v1`, `--model tokeness/free`. Os modelos são servidos como `tokeness/<model id>`.

## 🔑 O que uma chave te dá

| | |
| --- | --- |
| 🏢 Provedor | **Tokeness** — [tokeness.ai](https://tokeness.ai) |
| 🎁 O que o provedor dá | uma conta nova com 18000 unidades de cota (≈ $0.036) e um bônus de check-in que ele protege atrás de seu próprio captcha |
| 🔑 O que uma chave te dá | uma chave de 48 caracteres em sua própria conta, criada com `unlimited_quota` e verificada por chat em `tokeness/free` |
| 🌐 Formato da API | Compatível com OpenAI: `POST https://tokeness.ai/v1/chat/completions` |
| 🔒 Seus dados | apenas `tokeness.ai` e seu backend de caixa de correio são contatados; as chaves ficam na sua máquina |

## 🐞 Problemas

Se a Tokeness mudar sua regra de e-mail (lista de permissões, política de alias), sua sitekey do Turnstile ou a rota de revelação de chave, a ferramenta para nessa etapa e a linha de `out/attempts.jsonl` diz qual classe de falha foi atingida (`address-policy`, `mail`, `register`, `login`, `token`, `chat-gate`, `turnstile`, `exit`). **[Abra uma issue](../../issues)** com o comando e a saída exata.

## 📄 Licença

MIT © 2026 — veja [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 tokeness-bulk-apikey contributors

</div>