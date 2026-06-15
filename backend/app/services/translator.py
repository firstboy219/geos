"""News translation → Bahasa Indonesia (NON-AI / no Gemini quota).

Uses the free Google Translate endpoint (translate_a/single) so ALL ingested
news is stored in Indonesian even before the Gemini key is ready. Idempotent:
only rows with language != 'id' are translated; on success language is set 'id'.
The original title is preserved in title_original.
"""
from __future__ import annotations

import asyncio
import logging

import httpx
from sqlalchemy import select

from app.models.news_article import NewsArticle

logger = logging.getLogger("geoscan.translator")

_URL = "https://translate.googleapis.com/translate_a/single"
_CONCURRENCY = 3
_MAX_PER_RUN = 300


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
    rows = (
        await db.execute(
            select(NewsArticle)
            .where(NewsArticle.language != "id")
            .order_by(NewsArticle.ingested_at.asc())
            .limit(max_articles)
        )
    ).scalars().all()
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
