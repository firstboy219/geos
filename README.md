# Geoscan Intelligence System

Predictive geopolitical-intelligence SaaS for Indonesian investors. The core IP is the
**Geoscan Framework v3.0 — 16 AI layers** that turn raw OSINT into *dynamic scenario
probabilities* and translate them into concrete impact on a user's investment portfolio,
in real time and in plain language.

> Source of truth: `Knowledge Base/project_knowledge_base.docx` (architecture, DB schema,
> API spec, design system, business rules) and `Knowledge Base/dev_step_prompt.docx`
> (the 26-prompt, 8-phase build guide).

## Architecture

| Component | Role |
|---|---|
| **Flutter** (`mobile/`) | Primary UI — dark "Bloomberg" theme, bilingual EN/ID, 5 tabs: Analisis · Pasar · Vectors · Portofolio · Profil |
| **FastAPI + Celery** (`backend/`) | Internal brain only — auth, CRUD, AI engine, WebSocket. **Never calls external APIs directly.** |
| **n8n** (`n8n/`) | The **only** external gateway — OSINT, market sync, email, actor monitor, health, backups (WF-01…WF-11) |
| **Redis / Pinecone / Gemini** | Cache + pub/sub / historical vector matches / LLM (gemini-2.0-flash + gemini-embedding-001) |

### Hard rules (do not violate)
- n8n is the sole external gateway; FastAPI never calls third-party APIs directly.
- Celery `worker_concurrency = 1` (server is 2 vCPU / 3.7 GB RAM).
- All secrets live in `.env` (gitignored). `.env.example` is the committed template.
- Async-first: all DB access via SQLAlchemy 2.0 async.

## Repository layout
```
backend/   FastAPI app, models, alembic, Dockerfile        (Phase 3)
mobile/    Flutter app                                      (Phase 1–2)
n8n/       Importable workflow JSON                         (Phase 4–5)
scripts/   Server setup & audit bash scripts               (Phase 0)
infra/     nginx server block, docker run scripts          (Phase 0)
docs/      Notes
```

## Server reality (audited 2026-06-13)
- PostgreSQL: container `postgres` (postgres:16-alpine), network `postgres_default`, superuser `admin`, default db `saasdb`. Geoscan gets a **new** db `geoscan`.
- n8n: container `n8n`, network `n8n_default` (a **different** network).
- RAM **3.7 GB** (~2.4 GB free), 2 vCPU. Free ports: 6379, 8000.
- API domain `apigeo.cosger.online` — subdomain created but **not yet configured on the server** (Nginx server block + Certbot are pending manual steps; see `infra/nginx/`).

### Networking
`geoscan-redis`, `geoscan-backend`, `geoscan-celery` join `postgres_default`. Additionally
`geoscan-backend` is connected to `n8n_default` so n8n reaches it as
`http://geoscan-backend:8000`. (`host.docker.internal` is provided only as a fallback via
`--add-host=host.docker.internal:host-gateway`.)

## Phase 0 — Server setup runbook (run via SSH on the server)
```bash
bash scripts/audit_server.sh          # 1. sanity-check the existing server
sudo bash scripts/setup_db.sh         # 2. create db/user, generate /opt/geoscan/.env
sudo bash scripts/setup_redis.sh      # 3. start geoscan-redis
# ... fill OPENAI/PINECONE/STRIPE/etc placeholders in /opt/geoscan/.env ...
# (Phase 3) build the backend image, then:
sudo bash infra/docker/run-backend.sh # 4. start FastAPI (joins both networks)
sudo bash infra/docker/run-celery.sh  # 5. start Celery worker (-c 1)
# 6. install infra/nginx/apigeo.cosger.online.conf + run certbot
```

## Current build scope
**Fase 0–3 (foundation)**: server scripts, Flutter app shell + auth + 5 screens (dummy data),
FastAPI backend + models + endpoints. n8n workflows (Fase 4) and the AI engine (Fase 5) come
after verification.
