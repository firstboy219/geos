# Geoscan Backend (FastAPI)

Internal brain of Geoscan: auth, CRUD, WebSocket, and the AI-engine task queue.
**Never calls external third-party APIs** — that is n8n's job. The only outbound
calls are to n8n webhooks (`N8N_WEBHOOK_URL`).

## Stack
FastAPI · SQLAlchemy 2.0 async · asyncpg · Alembic · Pydantic v2 · Celery (Redis broker) · slowapi · python-jose · passlib[bcrypt].

## Layout
```
app/
  main.py            # app, CORS, slowapi, /health, /
  core/              # config, database, security (JWT/bcrypt), dependencies, redis_client, limiter
  models/            # SQLAlchemy ORM (BAB 4)
  schemas/           # Pydantic v2 (BAB 5)
  api/v1/            # auth, crises, scenarios, actors, alerts, portfolio, pasar, internal, ws
  services/          # business logic (thin routers)
  celery_app.py      # Celery + task STUBS (real AI logic = Phase 5)
alembic/             # async env + 0001 baseline migration (built from ORM metadata)
scripts/seed_data.py # 3 crises, scenarios, 4 actors, 5 tripwires, demo user
Dockerfile           # multi-stage python:3.11-slim, single uvicorn worker
```

## Build & run (on the server)
```bash
# 1. build image
cd /opt/geoscan/backend && docker build -t geoscan-backend:latest .
#    (or: make backend-build)

# 2. start container (joins postgres_default + n8n_default)
bash infra/docker/run-backend.sh     # make backend-run
bash infra/docker/run-celery.sh      # make celery-run

# 3. migrate + seed
docker exec geoscan-backend alembic upgrade head
docker exec geoscan-backend python scripts/seed_data.py

# 4. verify
curl -s http://127.0.0.1:8000/health        # {"status":"ok","db":true,"redis":true,...}
open https://apigeo.cosger.online/docs       # once nginx + certbot are set up
```

## Auth model
JWT access (30 min) + refresh (30 days) with rotation; logout blacklists the
`jti` in Redis until expiry. Internal endpoints (`/internal/*`) require the
`X-Internal-Key` header (= `INTERNAL_API_KEY`), used only by n8n.

## AI engine (Phase 5 — Google Gemini + Pinecone)
LLM is **Google Gemini** (not OpenAI). `app/services/ai/`:
`llm_client` (Gemini wrapper) · `historical_matcher` (L1, Pinecone) ·
`anachronism_filter` (L2) · `maverick_factor` (L3) · `tripwire_engine` (L4) ·
`mutation_engine` (orchestrator) · `pipeline` (async entrypoints for Celery).
Celery tasks (`celery_app.py`) now run the real engine.

Prereqs in `/opt/geoscan/.env`: `GEMINI_API_KEY`, `GEMINI_MODEL_ANALYSIS`
(default `gemini-2.0-flash`), `GEMINI_MODEL_EMBEDDING` (`gemini-embedding-001`),
`PINECONE_API_KEY`, `PINECONE_INDEX_NAME`, `PINECONE_DIMENSION=1536`.
**Create the Pinecone index** `geoscan-historical` with **dimension 1536, metric cosine**
(we truncate gemini-embedding-001 via MRL to 1536 to match).

```bash
docker exec geoscan-backend python scripts/seed_historical_data.py            # 50 events → Pinecone
docker exec geoscan-backend python scripts/seed_historical_data.py --verify   # query test
docker exec geoscan-backend python -c "import asyncio; ..."                    # or trigger via n8n WF-09
```

## Notes
- Server is 2 vCPU / 3.7 GB RAM → single uvicorn worker, Celery `-c 1`.
- Demo login after seed: `demo@geoscan.app` / `password123`.
