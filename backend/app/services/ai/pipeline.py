"""Async orchestration entrypoints called by Celery tasks (Phase 5).

Each opens its own AsyncSession. Celery tasks (sync) wrap these with asyncio.run.
"""
from __future__ import annotations

import logging
import uuid

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.actor import Actor
from app.models.crisis import Crisis
from app.models.news_article import NewsArticle
from app.services.ai.maverick_factor import calculate_actor_weight
from app.services.ai.mutation_engine import calculate_probabilities
from app.services.ai.tripwire_engine import scan_article_for_tripwires

logger = logging.getLogger("geoscan.ai.pipeline")


def _to_uuids(ids: list) -> list[uuid.UUID]:
    out = []
    for x in ids or []:
        try:
            out.append(uuid.UUID(str(x)))
        except (ValueError, AttributeError):
            continue
    return out


async def run_scan_articles(article_ids: list) -> dict:
    ids = _to_uuids(article_ids)
    if not ids:
        return {"scanned": 0, "triggered": 0}
    async with AsyncSessionLocal() as db:
        articles = (
            await db.execute(select(NewsArticle).where(NewsArticle.id.in_(ids)))
        ).scalars().all()
        triggered = 0
        for a in articles:
            triggered += len(await scan_article_for_tripwires(db, a))
    return {"scanned": len(articles), "triggered": triggered}


async def run_analyze_statement(actor_id: str, statement_text: str | None = None) -> dict:
    async with AsyncSessionLocal() as db:
        actor = await db.get(Actor, uuid.UUID(str(actor_id)))
        if actor is None:
            return {"status": "actor_not_found", "actor_id": actor_id}
        weight = await calculate_actor_weight(
            {
                "id": str(actor.id),
                "full_name": actor.full_name,
                "country": actor.country,
                "decision_style": actor.decision_style,
                "rcs_score": actor.rcs_score,
                "csi_score": actor.csi_score,
                "rfs_score": actor.rfs_score,
            },
            statement_text or actor.last_statement or "",
            actor.country or "",
        )
    return weight


async def run_trigger_mutation(crisis_id: str, trigger_reason: str) -> dict:
    async with AsyncSessionLocal() as db:
        updated = await calculate_probabilities(db, crisis_id, trigger_reason)
    return {"crisis_id": crisis_id, "mutations": len(updated), "scenarios": updated}


async def run_scheduled_analysis() -> dict:
    async with AsyncSessionLocal() as db:
        ids = (
            await db.execute(select(Crisis.id).where(Crisis.status == "active"))
        ).scalars().all()
    results = []
    for cid in ids:
        try:
            r = await run_trigger_mutation(str(cid), "scheduled_analysis")
            results.append({"crisis_id": str(cid), "mutations": r["mutations"]})
        except Exception as exc:
            logger.warning("scheduled mutation failed for %s: %s", cid, exc)
    return {"crises": len(ids), "results": results}
