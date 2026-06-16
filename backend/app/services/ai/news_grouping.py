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
import re
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
DEFAULT_THRESHOLD = 0.86          # Gemini embeddings sit high; ~0.86 separates topics
MIN_CLUSTER_SIZE = 2              # ≥2 related articles ⇒ a real situation
MAX_PER_RUN = 600
_EMBED_CONCURRENCY = 4

# ── Situation-worthiness filter (Situasi-1) ───────────────────
# A situation = news with real global/national geopolitical or economic impact.
# Topic categories below are always worthy. Note 'indonesia' is NOT here: the
# classifier tags EVERY Indonesian-outlet article 'indonesia' (incl. cooking,
# sport, lifestyle), so it must instead pass the impact-keyword gate. Low-impact
# items still appear in the raw home feed — they just never form a situation.
# NOTE: 'internasional' is NOT here — it's the classifier's DEFAULT bucket, so it
# also holds gossip/accidents/celebrity news. It must pass the impact-keyword gate.
_ALWAYS_WORTHY = frozenset({
    "politik", "keamanan", "ekonomi", "energi", "teknologi",
})
# Word-boundary matched (avoids substrings like 'war' in 'warga').
_IMPACT_WORDS = frozenset({
    "perang", "militer", "military", "troops", "pasukan", "sanksi", "sanction",
    "embargo", "tarif", "tariff", "nuklir", "nuclear", "rudal", "missile",
    "pemilu", "election", "pilpres", "presiden", "president", "parlemen",
    "parliament", "diplomat", "diplomasi", "perjanjian", "treaty", "konflik",
    "conflict", "krisis", "crisis", "invasi", "invasion", "serangan", "attack",
    "demo", "protes", "protest", "kudeta", "coup", "ekonomi", "economy",
    "inflasi", "inflation", "resesi", "recession", "rupiah", "ihsg",
    "geopolitik", "geopolitical", "keamanan", "security", "teror", "terror",
    "terrorism", "sengketa", "dispute", "perbatasan", "border", "ktt", "summit",
    "gencatan", "ceasefire", "pengungsi", "refugee", "opec", "nikel", "ekspor",
    "impor", "export", "import", "perdagangan", "trade", "menteri", "minister",
    "kebijakan", "nato", "asean", "sanctions", "tariffs",
})
_IMPACT_PHRASES = (
    "suku bunga", "harga minyak", "bank sentral", "trade war", "oil price",
    "united nations", "unjuk rasa", "laut china selatan", "south china sea",
)
# kept for any external import compatibility
SITUATION_WORTHY_CATEGORIES = _ALWAYS_WORTHY


def _is_worthy(a) -> bool:
    if (a.url or "").startswith("trend://"):
        return False  # Google Trends search-trends are not news situations
    if (a.category or "") in _ALWAYS_WORTHY:
        return True
    blob = f"{a.title} {a.content_summary or ''}".lower()
    words = set(re.findall(r"[a-z]+", blob))
    if words & _IMPACT_WORDS:
        return True
    return any(p in blob for p in _IMPACT_PHRASES)

# ── Title de-duplication (Situasi-2) ──────────────────────────
# Strip a trailing " - Outlet" / " | Outlet" source suffix (Google News style).
_SRC_SUFFIX_RE = re.compile(r"\s*[-|–—]\s*[^-|–—]{1,60}$")
# Drop everything that isn't a letter/digit/space so punctuation never blocks a
# near-duplicate match.
_TITLE_PUNCT_RE = re.compile(r"[^\w\s]", re.UNICODE)
_WS_RE = re.compile(r"\s+")


def _normalize_title(title: str | None) -> str:
    """Normalize a headline for duplicate detection: lowercase, drop a trailing
    ' - Outlet' source suffix, strip punctuation, collapse whitespace."""
    t = (title or "").strip().lower()
    if not t:
        return ""
    t = _SRC_SUFFIX_RE.sub("", t).strip()  # remove source-name suffix
    t = _TITLE_PUNCT_RE.sub(" ", t)
    return _WS_RE.sub(" ", t).strip()

# ── Region classification (Layer A1) ──────────────────────────
# Region values written to Crisis.region (must match the mobile chips:
# 'Internasional' | 'Regional' | 'Nasional').
REGION_NASIONAL = "Nasional"
REGION_REGIONAL = "Regional"
REGION_INTERNASIONAL = "Internasional"

# Indonesia-related → Nasional.
_NASIONAL_KEYWORDS = (
    "indonesia", "jakarta", "natuna", "ihsg", "rupiah", "idr ", "papua",
    "aceh", "bali", "sumatra", "sumatera", "kalimantan", "sulawesi", "jawa",
    "prabowo", "jokowi", "tni", "polri", "nkri", "bumn", "kpk", "dpr",
)
# Asia / ASEAN neighbourhood → Regional.
_REGIONAL_KEYWORDS = (
    "asean", "malaysia", "singapore", "singapura", "thailand", "vietnam",
    "filipina", "philippines", "myanmar", "kamboja", "cambodia", "laos",
    "brunei", "timor", "china", "tiongkok", "taiwan", "japan", "jepang",
    "korea", "india", "asia", "laut china selatan", "south china sea",
    "selat taiwan", "indo-pasifik", "indo-pacific", "pasifik",
)


def _classify_region(title: str, texts: list[str]) -> str:
    """Classify a situation's region — TITLE-first (the situation's representative
    headline), since after translation every article is 'id' so language is no
    signal and a single 'Indonesia' mention in a big cluster must not flip it.

      * 'Nasional'      — title clearly about Indonesia (or strong body density).
      * 'Regional'      — title/body about Asia-Pacific neighbours.
      * 'Internasional' — default.
    """
    t = (title or "").lower()
    words = set(re.findall(r"[a-z]+", t))  # word-boundary (avoid 'bali' in 'kembali')
    nas_single = {kw for kw in _NASIONAL_KEYWORDS if " " not in kw}
    reg_single = {kw for kw in _REGIONAL_KEYWORDS if " " not in kw}
    if words & nas_single:
        return REGION_NASIONAL
    if (words & reg_single) or any(kw in t for kw in _REGIONAL_KEYWORDS if " " in kw):
        return REGION_REGIONAL
    # Body fallback: only strong, unambiguous Indonesia tokens (no substrings).
    blob = " ".join(x.lower() for x in texts if x)
    nas = sum(blob.count(s) for s in ("indonesia", "jakarta", "prabowo", "jokowi", "natuna", "rupiah", "ihsg"))
    reg = sum(1 for kw in _REGIONAL_KEYWORDS if kw in blob)
    if nas >= 2 and nas > reg:
        return REGION_NASIONAL
    if reg >= 1:
        return REGION_REGIONAL
    return REGION_INTERNASIONAL


# ── Theme merge (Layer A3 — concept-level clustering) ─────────
# A second, deterministic pass that merges situations sharing a dominant
# real-world THEME across countries (e.g. protests in Ghana + UK + USA become
# one situation "Demo merebak di berbagai negara"). Keyword-based & safe: only
# fires when the SAME theme is detected in ≥2 distinct situations.
#
# theme key -> (concept title, matching keywords)
_THEMES: dict[str, tuple[str, tuple[str, ...]]] = {
    "demo": (
        "Demo merebak di berbagai negara",
        ("demo", "protes", "protest", "rally", "unjuk rasa", "demonstrasi",
         "demonstration", "kerusuhan", "riot"),
    ),
    "perang": (
        "Eskalasi perang di berbagai kawasan",
        ("perang", "war", "invasi", "invasion", "offensive", "gencatan",
         "ceasefire"),
    ),
    "banjir": (
        "Banjir melanda berbagai wilayah",
        ("banjir", "flood", "flooding", "inundation"),
    ),
    "pemilu": (
        "Pemilu di berbagai negara",
        ("pemilu", "election", "pilpres", "vote", "ballot", "pemungutan suara"),
    ),
    "gempa": (
        "Gempa mengguncang berbagai wilayah",
        ("gempa", "earthquake", "seismic", "tsunami"),
    ),
    "serangan": (
        "Serangan terjadi di berbagai tempat",
        ("serangan", "attack", "bombing", "ledakan", "blast", "airstrike",
         "shooting", "penembakan"),
    ),
}


def _detect_theme(text: str) -> str | None:
    """Return the theme key whose keywords most strongly match the text."""
    low = (text or "").lower()
    best_key, best_hits = None, 0
    for key, (_title, kws) in _THEMES.items():
        hits = sum(1 for kw in kws if kw in low)
        if hits > best_hits:
            best_key, best_hits = key, hits
    return best_key if best_hits >= 1 else None


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
        # Situasi-3 / Home-3 — first non-null member image (representative).
        "image_url": (article.image_url if article else None),
        # A1/A3 — accumulate signals for region & theme classification.
        "texts": [_text_of(article)] if article else [],
        "langs": [article.language] if article else [],
    }


def _add(cl: dict, a: NewsArticle, vec: list[float]) -> None:
    cl["sum"] = [s + x for s, x in zip(cl["sum"], vec)]
    cl["count"] += 1
    cl["centroid"] = _normalize(cl["sum"])
    cl["member_ids"].append(a.id)
    cl["cred_sum"] += float(a.credibility_score or 0.7)
    cl.setdefault("texts", []).append(_text_of(a))
    cl.setdefault("langs", []).append(a.language)
    if not cl.get("image_url") and a.image_url:
        cl["image_url"] = a.image_url
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


async def _theme_merge(db, new_clusters: list[dict]) -> list[dict]:
    """A3 — concept-level merge of freshly-created situations.

    Groups the just-created situations by detected theme and, for any theme
    shared by ≥2 situations, merges them into the earliest situation: re-points
    member articles, renames the survivor to the concept title, deletes the rest.
    Deterministic and best-effort; situations without a theme are untouched.

    Returns the list of merge actions performed (for reporting).
    """
    by_theme: dict[str, list[dict]] = {}
    for cl in new_clusters:
        theme = cl.get("theme")
        if theme and cl.get("crisis_id"):
            by_theme.setdefault(theme, []).append(cl)

    merges: list[dict] = []
    for theme, group in by_theme.items():
        if len(group) < 2:
            continue
        # Survivor = situation with the earliest start (most established).
        group.sort(key=lambda c: (c.get("earliest") is None, c.get("earliest")))
        survivor = group[0]
        losers = group[1:]
        survivor_crisis = await db.get(Crisis, survivor["crisis_id"])
        if survivor_crisis is None:
            continue
        concept_title = _THEMES[theme][0]
        survivor_crisis.title = concept_title[:255]
        loser_ids = [c["crisis_id"] for c in losers]
        # Re-point all member articles of the losers onto the survivor.
        await db.execute(
            update(NewsArticle)
            .where(NewsArticle.crisis_id.in_(loser_ids))
            .values(crisis_id=survivor["crisis_id"])
        )
        for c in losers:
            loser = await db.get(Crisis, c["crisis_id"])
            if loser is not None:
                await db.delete(loser)
        merges.append({
            "theme": theme, "title": concept_title,
            "survivor": str(survivor["crisis_id"]),
            "merged": [str(i) for i in loser_ids],
        })
    if merges:
        await db.commit()
    return merges


# ── main ──────────────────────────────────────────────────────
async def group_news(db, *, threshold: float | None = None, max_articles: int = MAX_PER_RUN) -> dict:
    thr = threshold if threshold is not None else DEFAULT_THRESHOLD

    # 1. Anchor clusters ONLY from existing *auto-grouped* situations, so news
    #    forms dynamic situations and is not absorbed by seeded/manual crises.
    crises = (
        await db.execute(
            select(Crisis).where(
                Crisis.status.in_(("active", "monitoring")),
                Crisis.auto_grouped.is_(True),
            )
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

    # 2b. Situasi-1 — keep only situation-worthy articles, and
    #     Situasi-2 — drop exact/near-duplicate titles (same wire story repeated
    #     across Google News feeds). Excluded/dup articles stay ungrouped (they
    #     still appear in the raw home feed) — they simply never form a situation.
    fetched = len(arts)
    seen_titles: set[str] = set()
    filtered: list[NewsArticle] = []
    skipped_category = 0
    skipped_duplicate = 0
    for a in arts:
        if not _is_worthy(a):
            skipped_category += 1
            continue
        norm = _normalize_title(a.title)
        if norm and norm in seen_titles:
            skipped_duplicate += 1
            continue
        if norm:
            seen_titles.add(norm)
        filtered.append(a)
    arts = filtered
    if not arts:
        return {"processed": fetched, "assigned_existing": 0, "new_situations": 0,
                "leftover_singletons": 0,
                "skipped_category": skipped_category,
                "skipped_duplicate": skipped_duplicate, "situations": []}

    # 3. Embed — reuse cached embeddings, only embed the ones missing (so
    #    re-clustering at a new threshold costs no embedding quota).
    missing = [a for a in arts if not a.embedding]
    if missing:
        new_vecs = await _embed_articles(missing)
        for a, v in zip(missing, new_vecs):
            if v:
                a.embedding = v
        await db.commit()
    vecs = [a.embedding for a in arts]

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
            region = _classify_region(cl.get("seed_title") or "", cl.get("texts", []))
            crisis = Crisis(
                title=(cl["seed_title"] or "Situasi")[:255],
                description=cl["seed_summary"],
                image_url=cl.get("image_url"),
                crisis_type="hybrid",
                region=region,
                severity_level=5,
                status="active",
                auto_grouped=True,
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
            cl["region"] = region
            cl["theme"] = _detect_theme(" ".join(cl.get("texts", [])))
            new_situations.append({"id": str(crisis.id), "title": crisis.title,
                                   "articles": cl["count"], "region": region})
        else:
            leftover += cl["count"]

    await db.commit()

    # 5b. A3 — concept-level theme merge of the just-created situations.
    new_clusters = [cl for cl in clusters if not cl["existing"] and cl.get("crisis_id")]
    try:
        merges = await _theme_merge(db, new_clusters)
    except Exception as exc:  # noqa: BLE001 — non-fatal
        logger.warning("theme merge failed: %s", exc)
        merges = []
    merged_ids = {m_id for m in merges for m_id in m["merged"]}

    # 6. Persist centroids for incremental future runs (skip merged-away ones).
    try:
        await _upsert_centroids([
            cl for cl in clusters
            if cl.get("crisis_id") and str(cl["crisis_id"]) not in merged_ids
        ])
    except Exception as exc:  # noqa: BLE001 — non-fatal
        logger.warning("centroid upsert failed: %s", exc)

    result = {
        "processed": len(arts),
        "fetched": fetched,
        "skipped_category": skipped_category,
        "skipped_duplicate": skipped_duplicate,
        "embedded": embedded,
        "assigned_existing": assigned_existing,
        "new_situations": len(new_situations),
        "leftover_singletons": leftover,
        "threshold": thr,
        "situations": new_situations,
        "theme_merges": merges,
    }
    logger.info("group_news done: %s", result)
    return result
