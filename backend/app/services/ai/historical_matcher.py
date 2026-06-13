"""Layer 1 — Historical Pattern Matching (Pinecone + Gemini embeddings)."""
from __future__ import annotations

import asyncio
import logging
from functools import lru_cache

from app.core.config import settings
from app.services.ai.llm_client import embed_text

logger = logging.getLogger("geoscan.ai.historical")


@lru_cache(maxsize=1)
def _index():
    from pinecone import Pinecone  # lazy

    if not settings.PINECONE_API_KEY:
        raise RuntimeError("PINECONE_API_KEY is not set")
    pc = Pinecone(api_key=settings.PINECONE_API_KEY)
    return pc.Index(settings.PINECONE_INDEX_NAME)


def _match_fields(m) -> dict:
    """Normalize a Pinecone match (object or dict) into a plain dict."""
    get = (lambda k: m.get(k)) if isinstance(m, dict) else (lambda k: getattr(m, k, None))
    md = get("metadata") or {}
    if not isinstance(md, dict):
        md = dict(md)
    return {
        "id": get("id"),
        "similarity_score": float(get("score") or 0.0),
        "title": md.get("title"),
        "year": md.get("year"),
        "region": md.get("region"),
        "outcome": md.get("outcome"),
        "crisis_type": md.get("crisis_type"),
        "metadata": md,
    }


async def find_similar_events(
    crisis_description: str, top_k: int = 8, min_score: float = 0.65
) -> list[dict]:
    """Embed the crisis description and query Pinecone for similar historical events."""
    try:
        vec = await embed_text(crisis_description, task_type="RETRIEVAL_QUERY")
        res = await asyncio.to_thread(
            lambda: _index().query(
                vector=vec, top_k=top_k, include_metadata=True
            )
        )
    except Exception as exc:  # graceful degradation
        logger.warning("find_similar_events failed: %s", exc)
        return []

    raw = getattr(res, "matches", None)
    if raw is None and isinstance(res, dict):
        raw = res.get("matches", [])
    matches = [_match_fields(m) for m in (raw or [])]
    matches = [m for m in matches if m["similarity_score"] >= min_score]
    matches.sort(key=lambda m: m["similarity_score"], reverse=True)
    return matches


async def seed_historical_events(events: list[dict]) -> dict:
    """Embed + upsert historical events into Pinecone. Returns {success, failed}."""
    success, failed = 0, 0
    batch: list[dict] = []

    async def flush():
        nonlocal batch
        if not batch:
            return
        vectors = list(batch)
        batch = []
        await asyncio.to_thread(lambda: _index().upsert(vectors=vectors))

    for ev in events:
        try:
            text = (
                f"{ev.get('title','')} ({ev.get('year','')}, {ev.get('region','')}). "
                f"{ev.get('description','')} Outcome: {ev.get('outcome','')}"
            )
            vec = await embed_text(text, task_type="RETRIEVAL_DOCUMENT")
            batch.append(
                {
                    "id": str(ev["id"]),
                    "values": vec,
                    "metadata": {
                        "title": ev.get("title", ""),
                        "year": ev.get("year", 0),
                        "region": ev.get("region", ""),
                        "crisis_type": ev.get("crisis_type", ""),
                        "outcome": ev.get("outcome", ""),
                        "nuclear_involved": ev.get("nuclear_involved", False),
                        "economic_sanctions": ev.get("economic_sanctions", False),
                    },
                }
            )
            success += 1
            if len(batch) >= 25:
                await flush()
        except Exception as exc:
            failed += 1
            logger.warning("seed event %s failed: %s", ev.get("id"), exc)

    await flush()
    logger.info("seed_historical_events: success=%d failed=%d", success, failed)
    return {"success": success, "failed": failed}
