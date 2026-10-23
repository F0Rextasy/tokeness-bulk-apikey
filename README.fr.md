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

**Créez en masse des comptes Tokeness avec des clés API générées automatiquement — inférence compatible OpenAI + connecteur 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-22%20served-412991?style=for-the-badge)](https://tokeness.ai/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Démarrage rapide](#-quick-start) · [🎁 Offre gratuite](#-free-tier--how-much-you-get) · [🤖 Modèles](#-models--all-22-of-them) · [🧪 Utiliser l'API](#-how-to-use-the-api) · [✅ Vérifié](#-verified-working--every-key-is-tested) · [🧭 Comment ça marche](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Options](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Problèmes](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Pourquoi cet outil existe

Tokeness est un **fork de New-API** (`v1.0.0-rc.40-tokeness-intl.15`) derrière un CDN mondial. Chaque route d'authentification est protégée par un Cloudflare Turnstile **et** une règle e-mail, et c'est la règle e-mail — pas le captcha — qui arrête un script naïf : le panneau maintient une **liste blanche de domaines** (`gmail.com` / `outlook.com` uniquement) et refuse toute adresse contenant `+` comme « symboles spéciaux ». Une fois l'adresse épurée et une sortie résidentielle pour résoudre le widget, l'inscription est un flux normal `envoyer le code → s'inscrire → se connecter` et chaque compte délivre **une clé avec `unlimited_quota: true`**. L'outil a été prouvé de bout en bout deux fois : le rail de laboratoire a généré **chaque compte a généré sa propre clé**, et ce CLI packagé a ensuite généré une 11e en **57 secondes en exécution directe** — chacune d'elles vérifiée par chat sur `tokeness/free` avant d'être écrite, toutes **11/11 toujours actives** lors de la revérification indépendante.

## 🎁 Offre gratuite — ce que vous obtenez

| Quoi | Valeur |
| --- | --- |
| Quota d'inscription par compte | **18000 unités** — `GET /api/user/self` répond `quota: 18000` sur chaque nouveau compte |
| Ce que cela vaut | `quota_per_unit 500000`, `usd_exchange_rate 7`, `price 7` → l'attribution est de **≈ $0.036** |
| Quota de la clé | la clé est créée avec `unlimited_quota: true`, donc la vérification au niveau du token est désactivée ; le quota propre du compte contrôle toujours le relais |
| Check-in quotidien | `checkin_enabled: true`, mais avec une session il répond `200 {"success":false,"message":"Turnstile token 为空"}` — il veut son propre token, donc l'outil le laisse non réclamé |
| Politique d'adresse | **gmail.com et outlook.com uniquement** (testé domaine par domaine avec de vrais tokens) ; un alias avec `+` est refusé textuellement — `管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。` |
| Un compte par adresse | une adresse est consommée une fois ; une boîte refusée/prise est remplacée par une nouvelle boîte Emailnator |
| Classe de sortie | le widget Turnstile passe en mode géré depuis une **sortie résidentielle** (WARP et un hôte résidentiel simple ont tous deux été mesurés) ; une IP de datacenter répond `600010` dans le navigateur (0/60 clics) |
| L'unité qui évolue | **un compte = une clé**, et la clé n'est écrite qu'après un chat 200 en direct |

> 💡 L'offre gratuite est définie par Tokeness et peut changer. Consultez les chiffres en direct sur [tokeness.ai](https://tokeness.ai) — et laissez la propre barrière de l'outil décider :

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modèles — les 22

`GET /v1/models` (200 avec une clé active) annonce **22 ids** :

| ID du modèle | note |
| --- | --- |
| `tokeness/free` | **la ligne vérifiée — chaque clé a répondu 200 dessus (11/11 lors de la revérification)** |
| `mimo-v2.6-flash` | **a également enregistré 200** — une clé a répondu `ok` dessus lors de la revérification indépendante |
| `deepseek-v4.1-flash`, `deepseek-v4.1-flash-1017`, `deepseek-v4-flash`, `deepseek-v4-flash-vision-exp`, `deepseek-v4-pro` | annoncés, non testés individuellement |
| `glm-5.3`, `glm-5.3-flash`, `glm-5.3-flashx` | annoncés, non testés individuellement |
| `qwen3.8-flash`, `qwen3.7-plus`, `qwen3.8-max` | annoncés, non testés individuellement |
| `mimo-v2.5`, `mimo-v2.5-pro`, `mimo-v2.6-pro` | annoncés, non testés individuellement |
| `kimi-k2.6`, `kimi-k2.7-code`, `kimi-k3` | annoncés, non testés individuellement |
| `minimax-m3`, `muse-spark-1.3-contributor`, `hy3` | annoncés, non testés individuellement |

`tokeness/free` est le modèle sur lequel chaque clé a été validée ; `mimo-v2.6-flash` a également obtenu un 200. Les ids restants sont annoncés par `/v1/models` mais n'ont pas été individuellement validés par chat, donc ils ne sont pas revendiqués ici.

```bash
curl https://tokeness.ai/v1/chat/completions \
  -H "Authorization: Bearer <key>" -H "Content-Type: application/json" \
  -d '{"model":"tokeness/free","messages":[{"role":"user","content":"Reply with the single word: ok"}],"max_tokens":16}'
```

## 🧪 Comment utiliser l'API

URL de base **`https://tokeness.ai/v1`** — compatible OpenAI. `tokeness.io` est un `301` vers `tokeness.ai`, et le `/api/status` du panneau annonce un hôte CDN `n.tokeness.dev` (il sert le même `/v1`, c'est donc un second endpoint utile quand l'hôte principal est occupé).

```python
from openai import OpenAI
c = OpenAI(base_url="https://tokeness.ai/v1", api_key="<your key>")
print(c.chat.completions.create(model="tokeness/free",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 Démarrage rapide

```bash
cd tokeness-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional, but a residential-class exit is what the widget likes
node src/launcher.js        # interactive: mint / verify / screen / settings / 9Router

# or: node src/cli.js --count 1 --pool proxies.txt
```

Une clé n'est écrite dans `keys.txt` **qu'après** que `POST /v1/chat/completions` ait répondu 200 avec du contenu réel ou du contenu de raisonnement ; `accounts.json` conserve e-mail / nom d'utilisateur / mot de passe / clé / sortie / quota et les statuts de chaque étape.

### 🖱️ Le lanceur

Le lanceur demande la liste de proxys et le nombre, les mémorise dans `launcher.config.json`, et exécute le CLI — mint, verify, screen exits, settings, help, Connect to 9Router.

## ✅ Vérifié fonctionnel — chaque clé est testée

| Vérification | Résultat |
| --- | --- |
| `GET /api/status` | **200** — inscription activée, vérification e-mail activée, `turnstile_check: true`, check-in activé, sitekey `0x4AAAAAADUMi6GTHDf1f5T7` publiée |
| `GET /api/verification?email=<plain gmail>&turnstile=<fresh>` | **200** `{"message":"","success":true}` |
| le même appel avec un alias `+` | **200** `{"message":"管理员已启用邮箱地址别名限制，您的邮箱地址由于包含特殊符号而被拒绝。","success":false}` — le mur des alias, mesuré |
| le courrier du panneau | **«Tokeness email verification»** de `noreply@<panel-mail>` ; le code est six caractères hexadécimaux dans le corps (`Your verification code is: 7ca362`), TTL 10 minutes, livraison mesurée entre 34 s et 4 min |
| `POST /api/user/register?turnstile=<fresh>` | **200** `{"success":true}` avec `{username, password, email, verification_code, aff_code, turnstile}` |
| `POST /api/user/login?turnstile=<fresh>` (mot de passe en clair) | **200** — la réponse porte le bundle d'authentification (`data.access_token`) |
| `GET /api/user/self` | **200** `id`, `quota 18000`, `group default` — **uniquement** avec `Authorization: Bearer <access_token>` : cookie seul répond `401 {"code":"AUTH_UNAUTHORIZED","message":"Unauthorized, invalid access token"}` |
| `POST /api/token/` | **200** mais **aucune clé dans la réponse** ; la liste la donne masquée (`xxek**********VKbX`) ; `POST /api/token/<id>/key` → **200** avec la vraie clé de 48 caractères |
| `GET /v1/models` | **200**, **22** ids |
| `POST /v1/chat/completions` (`tokeness/free`) — pour **chaque** clé avant d'être écrite | **200** avec du contenu réel — l'exécution a complété chaque clé |
| **un mint complet depuis ce package** (`--count 1`, direct, sans pool) | **chaque clé en 57 s** — boîte mail, token de 730 caractères, code, register 200, login 200, key 200, chat 200 |
| revérification indépendante de `keys.txt` (processus séparé, `--verify-only`) | **chaque clé vérifiée** — `tokeness/free` pour dix d'entre elles, `mimo-v2.6-flash` pour la onzième |
| `--screen` sur un échantillon de sorties mixtes | la sortie résidentielle et une sortie datacenter ont passé les barrières `/api/status` + asset Turnstile ; deux autres ont expiré — le rail navigateur a toujours besoin d'une classe de sortie que le widget accepte |

> **Barrières de qualité.** Chaque clé ici a passé un `chat-200` en direct avant d'être écrite dans `keys.txt`
> (les clés mortes ne sont jamais livrées). Les combos de routeur suivent la même règle au niveau du modèle : une entrée n'est
> ajoutée **que si le modèle répond `chat-200` et peut appeler des outils** — un modèle sans support des outils,
> une clé morte ou un fournisseur mort est écarté au lieu d'être ajouté. Relancez l'étape de vérification à tout moment ;
> les échecs sont signalés, jamais cachés.

## 🧭 Comment ça marche

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Tokeness page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://tokeness.ai/v1/chat/completions → real content = the key is live
```

| Étape | Appel | Notes |
| --- | --- | --- |
| 1 vérifier la sortie | `GET /api/status` + `challenges.cloudflare.com/turnstile/v0/api.js` | une sortie qui ne peut charger ni l'un ni l'autre est ignorée avant qu'un compte ne soit consommé |
| 2 boîte mail | Emailnator `POST /api/generate-email` | un nouveau gmail par compte, utilisé sous sa forme **sans point** : le panneau refuse `+` et les points, et Emailnator lui-même interroge cette même adresse épurée |
| 3 navigateur | Chrome via CDP, `GET /register` | un `--remote-debugging-port` non nul maintient `navigator.webdriver` à false |
| 4 envoyer le code | `GET /api/verification?email=…&turnstile=<fresh>` | fetch dans la page, donc le cookie de session suit |
| 5 lire le code | Emailnator `/api/message-list` → `/api/message/<id>` | seul le courrier nommant tokeness compte (les boîtes sont un pool public) ; le code est six caractères hexadécimaux dans le corps |
| 6 s'inscrire | `POST /api/user/register?turnstile=<fresh>` | `verification_code` est le nom du champ ; le token voyage dans la query **et** le corps |
| 7 se connecter | `POST /api/user/login?turnstile=<fresh>` | mot de passe en clair (`password_login_encryption_enabled: false`) ; capturer `access_token` |
| clé | `POST /api/token/` → liste → `POST /api/token/<id>/key` | bearer requis ; la réponse de création n'a pas de clé et la liste est masquée |
| 9 barrière | `GET /v1/models` + une complétion | 200 avec contenu = la clé est active et c'est seulement alors qu'elle est écrite |

## ⚙️ Options du CLI

```bash
node src/cli.js --count 1 --pool proxies.txt   # mint (serial; one account = one key)
node src/cli.js --model mimo-v2.6-flash        # another gate model (advertised ids)
node src/cli.js --verify-only                  # re-check every key in keys.txt with a live chat call
node src/cli.js --screen                       # exit self-test: /api/status + the Turnstile asset
node src/cli.js --connect-9router              # register keys.txt with a local 9Router
node src/cli.js --help
```

| Env | Défaut | Signification |
| --- | --- | --- |
| `TOKENESS_PROXIES` | `proxies.txt` | pool de sorties, une ligne par proxy |
| `TOKENESS_MODEL` | `tokeness/free` | modèle utilisé pour la barrière en direct |
| `CHROME_PATH` | auto-détecté | binaire Chrome/Edge pour le navigateur du captcha |

Le CLI traite un compte à la fois : le panneau lie un compte à son adresse et à sa sortie, donc les exécutions parallèles ne font que se disputer la même ressource.

## 🛰️ Derrière un proxy

**Optionnel — et l'outil fonctionne sans, mais la classe de sortie décide qui peut générer.**

- **Avec un pool :** passez `--pool <file>` (ou définissez `TOKENESS_PROXIES`) et chaque requête pour un compte — le navigateur du captcha inclus — passe par une sortie épinglée de cette liste, en échec fermé : un pool qui ne fournit aucune sortie joignable fait échouer l'exécution au lieu de laisser fuiter une requête depuis votre propre adresse. `--screen` vérifie chaque sortie sur `/api/status` **et** le script Turnstile avant son utilisation.
- **Sans pool :** le CLI affiche `running WITHOUT a proxy (direct)` et se connecte directement. Mesuré : sur un hôte résidentiel le widget s'est quand même résolu en mode géré et un compte complet a été généré en 57 s, tandis que la même page depuis une IP de datacenter ne monte jamais le challenge (`600010`, 0/60 clics dans une sonde). Donc le direct est parfait depuis une connexion domestique et sans espoir depuis un VPS.
- Chrome ne peut pas s'authentifier auprès d'un proxy SOCKS5, donc les lignes `socks5://user:pass@host:port` sont écartées avec une note ; `socks5://host:port` simple et `http://host:port` fonctionnent.

## 📄 Fichiers

| Chemin | Contenu |
| --- | --- |
| `keys.txt` | une clé vérifiée en direct par ligne — ignoré par git |
| `accounts.json` | e-mail / nom d'utilisateur / mot de passe / clé / sortie / quota / statuts d'étape — ignoré par git |
| `proxies.txt` | vos sorties — ignoré par git |
| `out/` | logs d'exécution, captures d'écran et `attempts.jsonl` (une ligne par tentative échouée avec sa classe d'échec) — ignoré par git |

## 🔌 Se connecter à 9Router

[9Router](https://9router.com) est un routeur auto-hébergé compatible OpenAI :

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
node src/cli.js --connect-9router      # same, from the CLI
```

Défauts : `--prefix tokeness`, `--base-url https://tokeness.ai/v1`, `--model tokeness/free`. Les modèles sont servis sous `tokeness/<model id>`.

## 🔌 Se connecter à OmniRoute

[OmniRoute](https://omniroute.online) est un routeur auto-hébergé compatible OpenAI :

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
node src/cli.js --connect-omniroute      # same, from the CLI
```

Défauts : `--prefix tokeness`, `--base-url https://tokeness.ai/v1`, `--model tokeness/free`. Les modèles sont servis sous `tokeness/<model id>`.

## 🔑 Ce qu'une clé vous donne

| | |
| --- | --- |
| 🏢 Fournisseur | **Tokeness** — [tokeness.ai](https://tokeness.ai) |
| 🎁 Ce que le fournisseur donne | un nouveau compte avec 18000 unités de quota (≈ $0.036) et un bonus de check-in qu'il protège derrière son propre captcha |
| 🔑 Ce qu'une clé vous donne | une clé de 48 caractères sur son propre compte, créée avec `unlimited_quota` et vérifiée par chat sur `tokeness/free` |
| 🌐 Forme de l'API | compatible OpenAI : `POST https://tokeness.ai/v1/chat/completions` |
| 🔒 Vos données | seuls `tokeness.ai` et votre backend de boîte mail sont contactés ; les clés restent sur votre machine |

## 🐞 Problèmes

Si Tokeness modifie sa règle e-mail (liste blanche, politique d'alias), sa sitekey Turnstile ou la route de révélation de clé, l'outil s'arrête à cette étape et la ligne `out/attempts.jsonl` indique la classe d'échec rencontrée (`address-policy`, `mail`, `register`, `login`, `token`, `chat-gate`, `turnstile`, `exit`). **[Ouvrez un ticket](../../issues)** avec la commande et la sortie exacte.

## 📄 Licence

MIT © 2026 — voir [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 tokeness-bulk-apikey contributors

</div>