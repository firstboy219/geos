"""Home-news AI summarization (Layer: berita).

For each ingested article, generate:
  • points  — intisari (inti isi berita) sebagai beberapa bullet
  • quotes  — kutipan verbatim dari orang yang disebut di dalam berita ({text, cite})

Articles are summarized in BATCHES (one Gemini call covers several articles) to
keep quota/latency low. Idempotent: only rows with summary_points IS NULL are
picked; a successful pass writes a (possibly empty) list so they aren't redone.
"""
from __future__ import annotations

import json
import logging
from datetime import datetime, timezone

from sqlalchemy import select

from app.models.news_article import NewsArticle
from app.services.ai.llm_client import generate_json

logger = logging.getLogger("geoscan.ai.summarizer")

BATCH_SIZE = 8
MAX_PER_RUN = 200
_CONTENT_CAP = 800

_SYSTEM = (
    "Anda adalah editor intelijen berita berbahasa Indonesia. Untuk SETIAP "
    "artikel yang diberikan, hasilkan:\n"
    "1) points: 2-4 kalimat inti (intisari) isi berita, ringkas dan faktual, "
    "dalam Bahasa Indonesia.\n"
    "2) quotes: kutipan VERBATIM dari orang/pihak yang disebut di dalam berita "
    "beserta atribusinya (cite = nama/jabatan). Jika tidak ada kutipan jelas, "
    "kembalikan list kosong. JANGAN mengarang kutipan.\n"
    "Balas HANYA JSON valid dengan bentuk: "
    '{"results":[{"idx":<int>,"points":["..."],'
    '"quotes":[{"text":"...","cite":"..."}]}]} . '
    "Sertakan idx yang sama persis dengan input."
)


def _build_user(batch: list[NewsArticle]) -> str:
    items = []
    for j, a in enumerate(batch):
        body = (a.content_summary or "").strip().replace("\n", " ")[:_CONTENT_CAP]
        items.append({"idx": j, "title": a.title, "content": body})
    return "Artikel:\n" + json.dumps(items, ensure_ascii=False)


def _clean_points(raw) -> list[str]:
    return [str(p).strip() for p in (raw or []) if isinstance(p, str) and p.strip()][:6]


def _clean_quotes(raw) -> list[dict]:
    out: list[dict] = []
    for q in raw or []:
        if isinstance(q, dict) and str(q.get("text") or "").strip():
            out.append({"text": str(q["text"]).strip(),
                        "cite": str(q.get("cite") or "").strip()})
    return out[:4]


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
        return {"summarized": 0, "batches": 0, "failed_batches": 0}

    summarized = 0
    batches = 0
    failed = 0
    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i : i + BATCH_SIZE]
        try:
            data = await generate_json(_SYSTEM, _build_user(batch), temperature=0.3)
        except Exception as exc:  # noqa: BLE001 — leave NULL, retry next run
            logger.warning("summarize batch failed: %s", exc)
            failed += 1
            continue
        results = data.get("results") or data.get("articles") or []
        by_idx = {}
        for r in results:
            if isinstance(r, dict):
                try:
                    by_idx[int(r.get("idx"))] = r
                except (TypeError, ValueError):
                    continue
        for j, a in enumerate(batch):
            r = by_idx.get(j) or {}
            a.summary_points = _clean_points(r.get("points"))
            a.summary_quotes = _clean_quotes(r.get("quotes"))
            a.processed_at = datetime.now(timezone.utc)
            summarized += 1
        batches += 1

    await db.commit()
    result = {"summarized": summarized, "batches": batches, "failed_batches": failed}
    logger.info("summarize_news done: %s", result)
    return result
