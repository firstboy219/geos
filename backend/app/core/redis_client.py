"""Async Redis connection + helper pub/sub untuk WebSocket broadcast.

Dipakai untuk: token blacklist (auth), pub/sub broadcast antar worker.
Channel convention: 'crisis:{crisis_id}' dan 'user:{user_id}'.
"""
from __future__ import annotations

import json
from typing import Any

import redis.asyncio as redis

from app.core.config import settings

# Single shared connection pool (decode_responses agar str, bukan bytes).
_redis: redis.Redis | None = None


def get_redis() -> redis.Redis:
    """Lazy singleton Redis client."""
    global _redis
    if _redis is None:
        _redis = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis


async def close_redis() -> None:
    global _redis
    if _redis is not None:
        await _redis.aclose()
        _redis = None


async def ping_redis() -> bool:
    try:
        return bool(await get_redis().ping())
    except Exception:
        return False


# ── Pub/Sub broadcast helper ──
def crisis_channel(crisis_id: str) -> str:
    return f"crisis:{crisis_id}"


async def publish_event(channel: str, payload: dict[str, Any]) -> None:
    """Publish JSON payload ke channel Redis (untuk broadcast WS)."""
    await get_redis().publish(channel, json.dumps(payload, default=str))
