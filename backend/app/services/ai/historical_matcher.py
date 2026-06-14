"""Layer 1 — Historical Pattern Matching.

Vector store = self-hosted **Qdrant** (container geoscan-qdrant) accessed via REST
(httpx) — no external SaaS account, no extra Python dependency. Embeddings via
Gemini (gemini-embedding-001) truncated to PINECONE_DIMENSION.
"""
from __future__ import annotations

import logging
import uuid

import httpx

from app.core.config import settings
from app.services.ai.llm_client import embed_text

logger = logging.getLogger("geoscan.ai.historical")

COLLECTION = settings.PINECONE_INDEX_NAME  # reuse configured name as Qdrant collection
DIM = settings.PINECONE_DIMENSION


def _url(path: str) -> str:
    return f"{settings.QDRANT_URL.rstrip('/')}{path}"


def _point_id(orig_id: str) -> str:
    """Qdrant point ids must be uint or UUID — derive a stable UUID from our string id."""
    return str(uuid.uuid5(uuid.NAMESPACE_URL, str(orig_id)))


async def _ensure_collection() -> None:
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.get(_url(f"/collections/{COLLECTION}"))
        if r.status_code == 200:
            return
        await c.put(
            _url(f"/collections/{COLLECTION}"),
            json={"vectors": {"size": DIM, "distance": "Cosine"}},
        )
        logger.info("Qdrant collection '%s' created (dim=%d)", COLLECTION, DIM)


async def find_similar_events(
    crisis_description: str, top_k: int = 8, min_score: float = 0.65
) -> list[dict]:
    """Embed the crisis description and search Qdrant for similar historical events."""
    try:
        vec = await embed_text(crisis_description, task_type="RETRIEVAL_QUERY")
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post(
                _url(f"/collections/{COLLECTION}/points/search"),
                json={
                    "vector": vec,
                    "limit": top_k,
                    "with_payload": True,
                    "score_threshold": min_score,
                },
            )
            r.raise_for_status()
            result = r.json().get("result", [])
    except Exception as exc:  # graceful degradation
        logger.warning("find_similar_events failed: %s", exc)
        return []

    out: list[dict] = []
    for m in result:
        p = m.get("payload", {}) or {}
        out.append(
            {
                "id": p.get("orig_id"),
                "similarity_score": float(m.get("score") or 0.0),
                "title": p.get("title"),
                "year": p.get("year"),
                "region": p.get("region"),
                "outcome": p.get("outcome"),
                "crisis_type": p.get("crisis_type"),
                "metadata": p,
            }
        )
    return out  # Qdrant returns sorted by score DESC


async def seed_historical_events(events: list[dict]) -> dict:
    """Embed + upsert historical events into Qdrant. Returns {success, failed}."""
    await _ensure_collection()
    success, failed = 0, 0
    points: list[dict] = []

    async def flush():
        nonlocal points
        if not points:
            return
        batch, points = points, []
        async with httpx.AsyncClient(timeout=60) as c:
            rr = await c.put(
                _url(f"/collections/{COLLECTION}/points?wait=true"),
                json={"points": batch},
            )
            rr.raise_for_status()

    for ev in events:
        try:
            text = (
                f"{ev.get('title','')} ({ev.get('year','')}, {ev.get('region','')}). "
                f"{ev.get('description','')} Outcome: {ev.get('outcome','')}"
            )
            vec = await embed_text(text, task_type="RETRIEVAL_DOCUMENT")
            points.append(
                {
                    "id": _point_id(ev["id"]),
                    "vector": vec,
                    "payload": {
                        "orig_id": str(ev["id"]),
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
            if len(points) >= 25:
                await flush()
        except Exception as exc:
            failed += 1
            logger.warning("seed event %s failed: %s", ev.get("id"), exc)

    await flush()
    logger.info("seed_historical_events: success=%d failed=%d", success, failed)
    return {"success": success, "failed": failed}
