"""Layer 4 (signals) — Tripwire Engine: scan articles, fire tripwires, fan out."""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.redis_client import get_redis
from app.models.tripwire import Tripwire
from app.models.tripwire_event import TripwireEvent
from app.services.ai.llm_client import generate_json

logger = logging.getLogger("geoscan.ai.tripwire")

_SYSTEM = (
    "You analyze news articles for specific geopolitical indicators. Be precise and "
    "conservative — false positives are costly. Return ONLY valid JSON."
)


def _g(obj, key, default=None):
    return obj.get(key, default) if isinstance(obj, dict) else getattr(obj, key, default)


async def scan_article_for_tripwires(db: AsyncSession, article) -> list[dict]:
    """Scan one article against active tripwires. Returns list of triggered dicts."""
    title = _g(article, "title", "") or ""
    summary = _g(article, "content_summary", "") or ""
    haystack = f"{title}. {summary}".lower()
    article_id = _g(article, "id")

    tripwires = (
        await db.execute(select(Tripwire).where(Tripwire.is_active.is_(True)))
    ).scalars().all()

    triggered: list[dict] = []
    redis = get_redis()

    for tw in tripwires:
        keywords = [str(k).lower() for k in (tw.keywords or [])]
        if keywords and not any(k in haystack for k in keywords):
            continue  # fast path: no keyword → skip LLM

        # Semantic validation (Gemini)
        try:
            data = await generate_json(
                _SYSTEM,
                (
                    f"Tripwire indicator: {tw.name}\nDescription: {tw.description}\n"
                    f"Article: '{title}. {summary}'\n"
                    "Does this article substantively indicate this tripwire? "
                    "Score 0.0=no, 1.0=definitely.\n"
                    'Return JSON: {"score": float, "triggered": bool, "reasoning": "string"}'
                ),
                temperature=0.1,
            )
            score = float(data.get("score") or 0.0)
            reasoning = data.get("reasoning", "")
        except Exception as exc:
            logger.warning("tripwire LLM failed (%s): %s", tw.name, exc)
            continue

        if score < float(tw.threshold or 0.75):
            continue

        # Cooldown to prevent spam
        cd_key = f"tw_cooldown:{tw.id}"
        try:
            if await redis.exists(cd_key):
                continue
            await redis.setex(cd_key, max(1, (tw.cooldown_minutes or 30) * 60), "1")
        except Exception:
            pass  # redis down → still fire

        # Persist event
        event = TripwireEvent(
            tripwire_id=tw.id,
            article_id=article_id,
            confidence=score,
            raw_data={"reasoning": reasoning, "article_title": title},
        )
        db.add(event)
        tw.last_fired_at = datetime.now(timezone.utc)
        await db.commit()

        # Metrics
        try:
            from app.core.observability import inc_tripwire

            inc_tripwire(tw.category or "", tw.severity or "")
        except Exception:
            pass

        # Fan out: notify n8n + enqueue mutation
        await _notify_n8n(tw, score)
        _enqueue_mutation(str(tw.crisis_id) if tw.crisis_id else None)

        triggered.append(
            {"tripwire_id": str(tw.id), "name": tw.name, "score": score, "crisis_id": str(tw.crisis_id) if tw.crisis_id else None}
        )

    return triggered


async def _notify_n8n(tw: Tripwire, score: float) -> None:
    import httpx  # lazy

    url = f"{settings.N8N_WEBHOOK_URL.rstrip('/')}/webhook/tripwire-fired"
    payload = {
        "tripwire_id": str(tw.id),
        "crisis_id": str(tw.crisis_id) if tw.crisis_id else None,
        "tripwire_name": tw.name,
        "severity": tw.severity or "high",
        "detected_at": datetime.now(timezone.utc).isoformat(),
        "confidence": score,
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(url, json=payload)
    except Exception as exc:
        logger.warning("n8n tripwire webhook failed: %s", exc)


def _enqueue_mutation(crisis_id: str | None) -> None:
    if not crisis_id:
        return
    try:
        from app.celery_app import celery_app  # lazy

        celery_app.send_task(
            "trigger_mutation",
            kwargs={"crisis_id": crisis_id, "trigger_reason": "tripwire_fired"},
            queue=settings.CELERY_TASK_QUEUE,
        )
    except Exception as exc:
        logger.warning("enqueue trigger_mutation failed: %s", exc)
