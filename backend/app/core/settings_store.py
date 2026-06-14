"""Runtime settings store (CMS) — DB-backed key/value overriding .env defaults.

Used so the admin panel can change AI provider/model/credentials live. Reads are
cached in Redis (short TTL) and shared across web + Celery worker processes.
"""
from __future__ import annotations

import json
import logging

from sqlalchemy import select

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.redis_client import get_redis
from app.models.app_setting import AppSetting

logger = logging.getLogger("geoscan.settings_store")

_AI_CACHE_KEY = "settings:ai"
_AI_TTL = 60  # seconds — CMS changes propagate within a minute

# key -> (env-default callable, is_secret)
DEFAULTS: dict[str, tuple] = {
    "ai_provider": (lambda: "gemini", False),
    "ai_model_analysis": (lambda: settings.GEMINI_MODEL_ANALYSIS, False),
    "ai_model_embedding": (lambda: settings.GEMINI_MODEL_EMBEDDING, False),
    "ai_embedding_dimension": (lambda: str(settings.PINECONE_DIMENSION), False),
    "gemini_api_key": (lambda: settings.GEMINI_API_KEY, True),
    "openai_api_key": (lambda: settings.OPENAI_API_KEY, True),
    "openai_model_analysis": (lambda: settings.OPENAI_MODEL_ANALYSIS, False),
    "openai_model_embedding": (lambda: settings.OPENAI_MODEL_EMBEDDING, False),
    "qdrant_url": (lambda: settings.QDRANT_URL, False),
    "n8n_webhook_url": (lambda: settings.N8N_WEBHOOK_URL, False),
}
_SECRET_KEYS = {k for k, (_, sec) in DEFAULTS.items() if sec}


async def get_all() -> dict[str, str]:
    async with AsyncSessionLocal() as db:
        rows = (await db.execute(select(AppSetting))).scalars().all()
    return {r.key: (r.value or "") for r in rows}


def env_default(key: str) -> str:
    d = DEFAULTS.get(key)
    return (d[0]() if d else "") or ""


async def get(key: str, default: str | None = None) -> str | None:
    async with AsyncSessionLocal() as db:
        row = await db.get(AppSetting, key)
    if row and row.value not in (None, ""):
        return row.value
    ev = env_default(key)
    return ev if ev else default


async def set_many(values: dict[str, str]) -> None:
    async with AsyncSessionLocal() as db:
        for k, v in values.items():
            row = await db.get(AppSetting, k)
            if row:
                row.value = v
            else:
                db.add(AppSetting(key=k, value=v, is_secret=(k in _SECRET_KEYS)))
        await db.commit()
    await invalidate()


async def invalidate() -> None:
    try:
        await get_redis().delete(_AI_CACHE_KEY)
    except Exception:
        pass


async def get_ai_config() -> dict:
    """Effective AI config (provider-resolved), cached in Redis."""
    try:
        cached = await get_redis().get(_AI_CACHE_KEY)
        if cached:
            return json.loads(cached)
    except Exception:
        pass

    db_vals = await get_all()

    def val(k: str) -> str:
        v = db_vals.get(k)
        return v if v not in (None, "") else env_default(k)

    provider = (val("ai_provider") or "gemini").lower()
    if provider == "openai":
        cfg = {
            "provider": "openai",
            "analysis_model": val("openai_model_analysis") or "gpt-4o-mini",
            "embedding_model": val("openai_model_embedding") or "text-embedding-3-small",
            "api_key": val("openai_api_key"),
        }
    else:
        cfg = {
            "provider": "gemini",
            "analysis_model": val("ai_model_analysis") or "gemini-2.5-flash",
            "embedding_model": val("ai_model_embedding") or "gemini-embedding-001",
            "api_key": val("gemini_api_key"),
        }
    try:
        cfg["embedding_dimension"] = int(val("ai_embedding_dimension") or 1536)
    except ValueError:
        cfg["embedding_dimension"] = 1536
    cfg["qdrant_url"] = val("qdrant_url")
    try:
        await get_redis().setex(_AI_CACHE_KEY, _AI_TTL, json.dumps(cfg))
    except Exception:
        pass
    return cfg
