# Geoscan — n8n Workflows (Phase 4)

n8n is the **only** component allowed to call external APIs. These 8 importable
workflows connect Geoscan to the outside world. The backend exposes `/internal/*`
endpoints (header-authed) that these workflows call.

## Workflows
| File | What it does | Trigger |
|---|---|---|
| `WF-01_osint_news_ingestion.json` | GDELT + NewsAPI → `/internal/news/ingest` → trigger AI scan | Schedule 15 min |
| `WF-02_tripwire_push.json` | Tripwire fired → fetch subscribers → `/internal/notifications/send` | Webhook `/webhook/tripwire-fired` |
| `WF-03_welcome_email.json` | New user → welcome email (SMTP) | Webhook `/webhook/user-registered` |
| `WF-04_daily_digest.json` | Daily digest email to Pro users with portfolio | Schedule 00:00 UTC |
| `WF-05_market_sync.json` | Yahoo Finance quotes → `/internal/market/update`; big moves → news signal | Schedule 1 h |
| `WF-06_actor_monitor.json` | NewsAPI search per monitored actor → `/internal/actors/statement` | Schedule 2 h |
| `WF-07_health_check.json` | `GET /health` → Telegram alert if degraded/down | Schedule 5 min |
| `WF-08_ai_trigger.json` | After ingestion → scan → recent tripwire events → trigger mutation | Webhook `/webhook/articles-ready` |
| `WF-09_scheduled_analysis.json` | Loop active crises → `/internal/tasks/trigger-mutation` (3 min apart) | Schedule 00/06/12/18 UTC |
| `WF-10_portfolio_report.json` | Pro users w/ portfolio → `/internal/notifications/send` (portfolio report) | Schedule 01:00 UTC |

## Backend URL (important)
All HTTP nodes call the backend at **`http://geoscan-backend:8000`**. This works because
`geoscan-backend` is connected to the `n8n_default` Docker network (see
`infra/docker/run-backend.sh`). If you prefer the dev-doc default, replace it with
`http://host.docker.internal:8000` — but on Linux Docker that requires the backend/n8n
containers to be run with `--add-host=host.docker.internal:host-gateway`.

## Credentials to create in n8n (Settings → Credentials)
On import, each node shows a red "credential not set" badge — pick the matching credential.

| Credential (node name reference) | Type | Value |
|---|---|---|
| `geoscanInternalKey` | **Header Auth** | Name: `X-Internal-Key`, Value: `INTERNAL_API_KEY` from `/opt/geoscan/.env` |
| `newsApiKey` | **Header Auth** | Name: `X-Api-Key`, Value: your key from newsapi.org |
| `smtpCredentials` | **SMTP** | Your SMTP host/user/pass (or use Resend SMTP) |
| `telegramAdmin` | **Telegram API** | Bot token from @BotFather |

Also set an n8n **variable** `TELEGRAM_ADMIN_CHAT_ID` (Settings → Variables) to your admin chat id,
referenced as `{{ $vars.TELEGRAM_ADMIN_CHAT_ID }}`.

## Import steps
1. Open n8n → Workflows → **Import from File** (or `…` menu → Import from JSON).
2. Import each `WF-*.json`.
3. For every node with a credential badge, select the credential you created above.
4. For webhook workflows (WF-02/03/08), copy the **Production URL** shown on the Webhook node —
   the backend must call these paths:
   - backend `auth/register` → `${N8N_WEBHOOK_URL}/webhook/user-registered` (WF-03)
   - tripwire engine (Phase 5) → `${N8N_WEBHOOK_URL}/webhook/tripwire-fired` (WF-02)
   - WF-01 → `${N8N_WEBHOOK_URL}/webhook/articles-ready` (WF-08) *(optional wiring)*
   `N8N_WEBHOOK_URL` defaults to `http://n8n:5678` (backend reaches n8n internally).
5. Toggle each workflow **Active**.

## Verify (per dev-doc Fase 4 checklist)
- WF-01: wait 15 min → `GET /internal/tripwire-events/recent` has data (after Phase 5 AI is live).
- WF-02: POST manually to `/webhook/tripwire-fired` → `alerts` table grows.
- WF-03: register a user → welcome email arrives.
- WF-05: trigger manually → `market_data` table grows.
- WF-07: stop the backend → within 5 min a Telegram alert arrives.

## Notes
- These reference `/internal/tasks/*` which currently enqueue **stub** Celery tasks
  (real AI engine = Phase 5). The pipeline wiring is fully functional now; the AI logic
  lands in Phase 5.
- WF-04 uses `/internal/crises/active-ids` (header-authed) rather than the user-authed
  `GET /crises`, so the digest needs no user token.
