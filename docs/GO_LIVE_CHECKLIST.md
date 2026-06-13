# Geoscan — Go-Live Checklist

## Infrastructure (server)
- [ ] `scripts/audit_server.sh` reviewed — no port/network conflicts (8000, 6379 free)
- [ ] `setup_db.sh` ran → db `geoscan` + user created, `/opt/geoscan/.env` generated (chmod 600)
- [ ] `setup_redis.sh` ran → `geoscan-redis` Up, `redis-cli ping` → PONG
- [ ] `.env` placeholders filled: `GEMINI_API_KEY`, `PINECONE_API_KEY`, SMTP/Telegram/Stripe/Sentry
- [ ] Pinecone index `geoscan-historical` created — **dimension 1536, metric cosine**

## Backend
- [ ] `geoscan-backend` built & running (joined `postgres_default` + `n8n_default`)
- [ ] `geoscan-celery` running with `-c 1`
- [ ] `alembic upgrade head` applied; `seed_data.py` ran (3 crises, demo user)
- [ ] `seed_historical_data.py` ran → 50 events in Pinecone; `--verify` returns matches
- [ ] `GET https://apigeo.cosger.online/health` → `{status:'ok', db:true, redis:true}`
- [ ] `GET /metrics` reachable from internal network only
- [ ] Nginx server block installed + Certbot cert issued (TLS 1.2/1.3, security headers, gzip, rate limit)
- [ ] `POST /auth/register` works → n8n WF-03 welcome email arrives

## n8n (11 workflows)
- [ ] Credentials set: `geoscanInternalKey`, `newsApiKey`, `smtpCredentials`, `telegramAdmin`; var `TELEGRAM_ADMIN_CHAT_ID`
- [ ] All 11 workflows imported and **Active**, no un-handled errors in execution log
- [ ] WF-01 ran ≥2 cycles (30 min) → `news_articles` has rows
- [ ] WF-07: stop backend → Telegram alert within 5 min
- [ ] WF-11: trigger manually → backup file created (or host cron `backup_db.sh` installed)

## Mobile
- [ ] `baseUrl`/`wsBaseUrl` point to `apigeo.cosger.online`
- [ ] Firebase config added; push notification arrives when app backgrounded
- [ ] Login with real user → live data; token auto-refresh works
- [ ] WebSocket: trigger a mutation → scenario probabilities update in real time
- [ ] Release APK builds (`--release --obfuscate`) and installs on a device

## Monitoring & ops
- [ ] Sentry receives a test error
- [ ] `docker stats`: backend < 512MB, celery < 400MB, redis < 128MB (server 3.7GB total)
- [ ] Gemini usage dashboard checked — no unexpected spend
- [ ] Daily DB backup verified (WF-11 / host cron) with 7-day retention
- [ ] Rotate the PostgreSQL `admin` password after setup (per server notes)
