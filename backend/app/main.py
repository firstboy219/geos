"""Geoscan FastAPI application entrypoint.

- CORS dari ALLOWED_ORIGINS
- slowapi rate limiter
- include semua router v1 + internal + ws
- /health (db, redis, celery), / root
Tidak ada panggilan API eksternal di sini — itu tugas n8n.
"""
from __future__ import annotations

import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy import text

from app.api.v1 import api_router
from app.core.config import settings
from app.core.database import engine
from app.core.limiter import limiter
from app.core.observability import (
    setup_logging,
    setup_metrics,
    setup_sentry,
)
from app.core.redis_client import close_redis, get_redis, ping_redis

setup_logging()
setup_sentry()
logger = logging.getLogger("geoscan")

_STARTED_AT = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Geoscan API starting (env=%s)", settings.ENVIRONMENT)
    # warm redis connection (non-fatal)
    try:
        await get_redis().ping()
    except Exception as exc:  # pragma: no cover
        logger.warning("Redis not reachable at startup: %s", exc)
    yield
    await close_redis()
    await engine.dispose()
    logger.info("Geoscan API stopped")


app = FastAPI(
    title=settings.APP_NAME,
    version="0.3.0",
    description="Geoscan Intelligence System — backend (Phase 3 foundation).",
    lifespan=lifespan,
)

# ── Rate limiting (slowapi) ──
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Prometheus /metrics (Phase 7) ──
setup_metrics(app)

# ── Routers ──
app.include_router(api_router)


@app.get("/health", tags=["system"])
async def health() -> dict:
    """Liveness + dependency check: db, redis, celery workers."""
    # DB
    db_ok = False
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception as exc:
        logger.warning("health: db check failed: %s", exc)

    # Redis
    redis_ok = await ping_redis()

    # Celery workers (best-effort; broker ping)
    celery_workers = 0
    try:
        from app.celery_app import celery_app

        replies = celery_app.control.ping(timeout=0.5) or []
        celery_workers = len(replies)
    except Exception:
        celery_workers = 0

    status = "ok" if (db_ok and redis_ok) else "degraded"
    return {
        "status": status,
        "db": db_ok,
        "redis": redis_ok,
        "celery_workers": celery_workers,
        "uptime": round(time.time() - _STARTED_AT, 1),
    }


@app.get("/", tags=["system"])
async def root() -> dict:
    return {"service": settings.APP_NAME, "version": app.version, "docs": "/docs"}
