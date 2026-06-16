"""News translation → Bahasa Indonesia (NON-AI / no Gemini quota).

Uses the free Google Translate endpoint (translate_a/single) so ALL ingested
news is stored in Indonesian even before the Gemini key is ready. Idempotent:
only rows with language != 'id' are translated; on success language is set 'id'.
The original title is preserved in title_original.
"""
from __future__ import annotations

import asyncio
import logging
import re

import httpx
from sqlalchemy import or_, select

from app.models.news_article import NewsArticle

logger = logging.getLogger("geoscan.translator")

_URL = "https://translate.googleapis.com/translate_a/single"
_CONCURRENCY = 3
_MAX_PER_RUN = 300

# Common English function words. If a title has several of these AND lacks common
# Indonesian markers, it was almost certainly stored mis-tagged as 'id' while
# still being English → re-translate it.
_EN_STOPWORDS = {
    "the", "and", "of", "to", "in", "is", "for", "on", "with", "as",
    "at", "by", "from", "that", "this", "was", "are", "be", "has", "have",
}
# Strong Indonesian markers — presence means the text is already Indonesian.
_ID_MARKERS = {
    "yang", "dan", "di", "ke", "dari", "untuk", "dengan", "ini", "itu",
    "akan", "tidak", "adalah", "pada", "dalam", "para", "tahun", "juga",
    "sebagai", "telah", "atau", "karena", "oleh", "menjadi",
}
_EN_HEURISTIC_MIN_HITS = 2
_TOKEN_RE = re.compile(r"[a-zA-Z]+")


def _looks_english(text: str | None) -> bool:
    """Heuristic: title looks like English (mis-tagged as id). Conservative —
    only True when several EN stopwords appear and no ID markers do."""
    if not text:
        return False
    tokens = [t.lower() for t in _TOKEN_RE.findall(text)]
    if not tokens:
        return False
    if any(t in _ID_MARKERS for t in tokens):
        return False
    en_hits = sum(1 for t in tokens if t in _EN_STOPWORDS)
    return en_hits >= _EN_HEURISTIC_MIN_HITS


async def translate_to_id(text: str | None, *, source: str = "auto") -> str | None:
    text = (text or "").strip()
    if not text:
        return text
    params = {"client": "gtx", "sl": source, "tl": "id", "dt": "t", "q": text[:4500]}
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=20) as c:
                r = await c.get(_URL, params=params)
            if r.status_code == 200:
                data = r.json()
                return "".join(seg[0] for seg in data[0] if seg and seg[0]) or text
        except Exception as exc:  # noqa: BLE001
            logger.warning("translate attempt %d failed: %s", attempt + 1, exc)
        await asyncio.sleep(2 * (attempt + 1))
    return text  # fallback: keep original so ingestion never blocks


async def translate_news(db, *, max_articles: int = _MAX_PER_RUN) -> dict:
    # Primary set: anything not already Indonesian. Plus a recovery set: rows
    # tagged 'id' that were NEVER translated (title_original IS NULL) — some of
    # these are mis-tagged English. We fetch those and filter with the English
    # heuristic so we never re-translate genuinely-Indonesian text.
    candidates = (
        await db.execute(
            select(NewsArticle)
            .where(
                or_(
                    NewsArticle.language != "id",
                    NewsArticle.title_original.is_(None),
                )
            )
            .order_by(NewsArticle.ingested_at.asc())
            .limit(max_articles)
        )
    ).scalars().all()

    rows = [
        a
        for a in candidates
        if a.language != "id" or _looks_english(a.title)
    ]
    if not rows:
        return {"translated": 0}

    sem = asyncio.Semaphore(_CONCURRENCY)

    async def one(a: NewsArticle):
        async with sem:
            title = await translate_to_id(a.title)
            summary = (
                await translate_to_id(a.content_summary) if a.content_summary else a.content_summary
            )
            return a, title, summary

    results = await asyncio.gather(*[one(a) for a in rows])
    n = 0
    for a, title, summary in results:
        if a.title_original is None:
            a.title_original = a.title
        a.title = title or a.title
        a.content_summary = summary
        a.language = "id"
        n += 1
    await db.commit()
    logger.info("translate_news: %d articles → id", n)
    return {"translated": n}
