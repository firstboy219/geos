"""Home-news summarization — intisari (points) + kutipan (quotes).

NON-AI: uses app.services.news_extractor (extractive summary + quote detection)
so it scales to high volume with no Gemini quota/cost. Idempotent: only rows
with summary_points IS NULL are processed.
"""
from __future__ import annotations

import logging

from sqlalchemy import select

from app.models.news_article import NewsArticle
from app.services.news_extractor import extract_points, extract_quotes

logger = logging.getLogger("geoscan.ai.summarizer")

MAX_PER_RUN = 2000  # local extraction is cheap → large batches OK


async def summarize_news(db, *, max_articles: int = MAX_PER_RUN) -> dict:
    rows = (
        await db.execute(
            select(NewsArticle)
            .where(NewsArticle.summary_points.is_(None))
            .order_by(NewsArticle.ingested_at.asc())
            .limit(max_articles)
        )
    ).scalars().all()
    if not rows:
        return {"summarized": 0}

    n = 0
    for a in rows:
        text = a.content_summary or ""
        a.summary_points = extract_points(text, max_points=3, fallback=a.title)
        a.summary_quotes = extract_quotes(text, max_quotes=3)
        n += 1

    await db.commit()
    logger.info("summarize_news (non-AI): %d articles", n)
    return {"summarized": n}
