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
from app.services.translator import _looks_english

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
        a.summary_quotes = extract_quotes(
            text, max_quotes=3, drop_english=(a.language == "id")
        )
        n += 1

    await db.commit()
    logger.info("summarize_news (non-AI): %d articles", n)
    return {"summarized": n}


def _points_look_english(points) -> bool:
    """True if the existing intisari looks English (reuse translator heuristic on
    the first point). Conservative — only fires on clearly-English text."""
    if not points or not isinstance(points, list):
        return False
    first = next((p for p in points if isinstance(p, str) and p.strip()), None)
    return bool(first) and _looks_english(first)


async def resummarize_news(db, *, max_articles: int = MAX_PER_RUN) -> dict:
    """Home-1a recovery (NON-AI): some rows were summarized BEFORE translation,
    so summary_points stayed English while the article is now language 'id'
    (summarize is idempotent & never redone). Detect those — id articles whose
    first intisari point looks English — and RE-extract points/quotes from the
    now-translated content_summary. Idempotent & safe: only English-looking
    summaries on id rows are touched.
    """
    rows = (
        await db.execute(
            select(NewsArticle)
            .where(
                NewsArticle.language == "id",
                NewsArticle.summary_points.isnot(None),
            )
            .order_by(NewsArticle.ingested_at.asc())
            .limit(max_articles)
        )
    ).scalars().all()

    n = 0
    for a in rows:
        if not _points_look_english(a.summary_points):
            continue
        text = a.content_summary or ""
        a.summary_points = extract_points(text, max_points=3, fallback=a.title)
        a.summary_quotes = extract_quotes(text, max_quotes=3, drop_english=True)
        n += 1

    if n:
        await db.commit()
    logger.info("resummarize_news (non-AI English recovery): %d articles", n)
    return {"resummarized": n}
