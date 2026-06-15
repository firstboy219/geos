"""Layer 2 — News Grouping & Situasi.

Clusters ingested `news_articles` into *situations* (crises) by semantic
similarity. Embeddings via Gemini (`embed_text`, already normalized) → cosine =
dot product. Online greedy clustering: each article joins the most-similar
existing situation if score ≥ threshold, otherwise seeds a new cluster; new
clusters with ≥ MIN_CLUSTER_SIZE members become new Crisis rows. Singletons are
left ungrouped (they still appear in the raw news feed) until enough related
news arrives.

Situation centroids are persisted in a Qdrant collection so later runs can
attach fresh articles to already-existing situations incrementally.
"""
from __future__ import annotations

import asyncio
import logging
import math
import uuid
from datetime import datetime, timezone

import httpx
from sqlalchemy import select, update

from app.core.config import settings
from app.models.crisis import Crisis
from app.models.news_article import NewsArticle
from app.services.ai.llm_client import embed_text

logger = logging.getLogger("geoscan.ai.grouping")

SIT_COLLECTION = "geoscan_situations"
DIM = settings.PINECONE_DIMENSION
DEFAULT_THRESHOLD = 0.72          # "Sedang" granularity
MIN_CLUSTER_SIZE = 2              # ≥2 related articles ⇒ a real situation
MAX_PER_RUN = 600
_EMBED_CONCURRENCY = 4


# ── vector helpers ────────────────────────────────────────────
def _cos(a: list[float], b: list[float]) -> float:
    # embed_text already L2-normalizes, so cosine == dot product.
    return sum(x * y for x, y in zip(a, b))


def _normalize(v: list[float]) -> list[float]:
    n = math.sqrt(sum(x * x for x in v)) or 1.0
    return [x / n for x in v]


def _text_of(a: NewsArticle) -> str:
    # Prefer AI points (cleaner signal) when available, else raw summary.
    points = " ".join(p for p in (a.summary_points or []) if isinstance(p, str))
    body = points or (a.content_summary or "")
    return f"{a.title}. {body}".strip()[:2000]


# ── Qdrant (centroid store) ───────────────────────────────────
def _url(path: str) -> str:
    return f"{settings.QDRANT_URL.rstrip('/')}{path}"


def _pid(orig_id: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_URL, str(orig_id)))


async def _ensure_sit_collection() -> None:
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.get(_url(f"/collections/{SIT_COLLECTION}"))
        if r.status_code == 200:
            return
        await c.put(
            _url(f"/collections/{SIT_COLLECTION}"),
            json={"vectors": {"size": DIM, "distance": "Cosine"}},
        )
        logger.info("Qdrant collection '%s' created (dim=%d)", SIT_COLLECTION, DIM)


async def _load_centroids(crisis_ids: list) -> dict:
    """Return {crisis_id: centroid_vec} for situations that already have a
    stored centroid in Qdrant (lets incremental runs skip re-embedding members)."""
    if not crisis_ids:
        return {}
    id_map = {_pid(str(cid)): cid for cid in crisis_ids}
    try:
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post(
                _url(f"/collections/{SIT_COLLECTION}/points"),
                json={"ids": list(id_map), "with_vector": True, "with_payload": False},
            )
        if r.status_code != 200:
            return {}
        out: dict = {}
        for p in r.json().get("result", []):
            cid = id_map.get(p.get("id"))
            vec = p.get("vector")
            if cid is not None and vec:
                out[cid] = vec
        return out
    except Exception:  # noqa: BLE001 — collection may not exist yet
        return {}


async def _upsert_centroids(clusters: list[dict]) -> None:
    points = [
        {
            "id": _pid(str(cl["crisis_id"])),
            "vector": cl["centroid"],
            "payload": {"crisis_id": str(cl["crisis_id"]), "count": cl["count"]},
        }
        for cl in clusters
        if cl.get("crisis_id")
    ]
    if not points:
        return
    await _ensure_sit_collection()
    async with httpx.AsyncClient(timeout=60) as c:
        await c.put(
            _url(f"/collections/{SIT_COLLECTION}/points?wait=true"),
            json={"points": points},
        )


# ── cluster bookkeeping ───────────────────────────────────────
def _new_cluster(article: NewsArticle, vec: list[float], existing: bool, crisis_id=None) -> dict:
    return {
        "crisis_id": crisis_id,
        "existing": existing,
        "sum": list(vec),
        "centroid": list(vec),
        "count": 1,
        "seed_title": article.title if article else None,
        "seed_summary": article.content_summary if article else None,
        "member_ids": [] if existing else [article.id],
        "cred_sum": float(article.credibility_score or 0.7) if article else 0.0,
        "earliest": article.published_at if article else None,
    }


def _add(cl: dict, a: NewsArticle, vec: list[float]) -> None:
    cl["sum"] = [s + x for s, x in zip(cl["sum"], vec)]
    cl["count"] += 1
    cl["centroid"] = _normalize(cl["sum"])
    cl["member_ids"].append(a.id)
    cl["cred_sum"] += float(a.credibility_score or 0.7)
    if a.published_at and (cl["earliest"] is None or a.published_at < cl["earliest"]):
        cl["earliest"] = a.published_at


# ── embedding ─────────────────────────────────────────────────
async def _embed_articles(articles: list[NewsArticle]) -> list[list[float] | None]:
    sem = asyncio.Semaphore(_EMBED_CONCURRENCY)

    async def one(a: NewsArticle):
        async with sem:
            try:
                return await embed_text(_text_of(a), task_type="RETRIEVAL_DOCUMENT")
            except Exception as exc:  # noqa: BLE001
                logger.warning("embed failed for article %s: %s", a.id, exc)
                return None

    return list(await asyncio.gather(*[one(a) for a in articles]))


# ── main ──────────────────────────────────────────────────────
async def group_news(db, *, threshold: float | None = None, max_articles: int = MAX_PER_RUN) -> dict:
    thr = threshold if threshold is not None else DEFAULT_THRESHOLD

    # 1. Seed clusters from existing active/monitoring situations.
    crises = (
        await db.execute(
            select(Crisis).where(Crisis.status.in_(("active", "monitoring")))
        )
    ).scalars().all()

    stored = await _load_centroids([c.id for c in crises])
    clusters: list[dict] = []
    for c in crises:
        if c.id in stored:
            centroid = _normalize(stored[c.id])
        else:
            # No stored centroid yet (e.g. seeded crises, first run): derive
            # one from existing members if any, else from title + description.
            members = (
                await db.execute(
                    select(NewsArticle).where(NewsArticle.crisis_id == c.id).limit(40)
                )
            ).scalars().all()
            vecs = [v for v in await _embed_articles(members) if v] if members else []
            if vecs:
                centroid = _normalize([sum(col) for col in zip(*vecs)])
            else:
                centroid = await embed_text(
                    f"{c.title}. {c.description or ''}"[:2000],
                    task_type="RETRIEVAL_DOCUMENT",
                )
        clusters.append({
            "crisis_id": c.id, "existing": True, "sum": list(centroid),
            "centroid": centroid, "count": 1,
            "member_ids": [], "cred_sum": 0.0, "earliest": None,
            "seed_title": c.title, "seed_summary": c.description,
        })

    # 2. Fetch ungrouped articles (oldest first for stable seeds).
    arts = (
        await db.execute(
            select(NewsArticle)
            .where(NewsArticle.crisis_id.is_(None))
            .order_by(NewsArticle.published_at.asc().nullslast(),
                      NewsArticle.ingested_at.asc())
            .limit(max_articles)
        )
    ).scalars().all()
    if not arts:
        return {"processed": 0, "assigned_existing": 0, "new_situations": 0,
                "leftover_singletons": 0, "situations": []}

    # 3. Embed.
    vecs = await _embed_articles(arts)

    # 4. Greedy online clustering.
    assigned_existing = 0
    embedded = 0
    for a, v in zip(arts, vecs):
        if v is None:
            continue
        embedded += 1
        best, best_score = None, -1.0
        for cl in clusters:
            s = _cos(v, cl["centroid"])
            if s > best_score:
                best_score, best = s, cl
        if best is not None and best_score >= thr:
            _add(best, a, v)
            if best["existing"]:
                assigned_existing += 1
        else:
            clusters.append(_new_cluster(a, v, existing=False))

    # 5. Persist: update existing situations, create new ones (size ≥ MIN).
    new_situations: list[dict] = []
    leftover = 0
    for cl in clusters:
        if cl["existing"]:
            if cl["member_ids"]:
                await db.execute(
                    update(NewsArticle)
                    .where(NewsArticle.id.in_(cl["member_ids"]))
                    .values(crisis_id=cl["crisis_id"],
                            processed_at=datetime.now(timezone.utc))
                )
        elif cl["count"] >= MIN_CLUSTER_SIZE:
            crisis = Crisis(
                title=(cl["seed_title"] or "Situasi")[:255],
                description=cl["seed_summary"],
                crisis_type="hybrid",
                severity_level=5,
                status="active",
                credibility_score=round(cl["cred_sum"] / cl["count"], 3),
                started_at=cl["earliest"],
            )
            db.add(crisis)
            await db.flush()
            await db.execute(
                update(NewsArticle)
                .where(NewsArticle.id.in_(cl["member_ids"]))
                .values(crisis_id=crisis.id, processed_at=datetime.now(timezone.utc))
            )
            cl["crisis_id"] = crisis.id
            new_situations.append({"id": str(crisis.id), "title": crisis.title,
                                   "articles": cl["count"]})
        else:
            leftover += cl["count"]

    await db.commit()

    # 6. Persist centroids for incremental future runs.
    try:
        await _upsert_centroids([cl for cl in clusters if cl.get("crisis_id")])
    except Exception as exc:  # noqa: BLE001 — non-fatal
        logger.warning("centroid upsert failed: %s", exc)

    result = {
        "processed": len(arts),
        "embedded": embedded,
        "assigned_existing": assigned_existing,
        "new_situations": len(new_situations),
        "leftover_singletons": leftover,
        "threshold": thr,
        "situations": new_situations,
    }
    logger.info("group_news done: %s", result)
    return result
