"""Celery instance + tasks (BAB 8.3).

Tasks orchestrate the Phase 5 AI engine (Gemini + Pinecone) via
`app.services.ai.pipeline`. AI modules are imported lazily inside each task so the
web process can import this module (to enqueue) without the AI SDKs loaded.
Config: queue 'geoscan', concurrency=1 (WAJIB — server 2vCPU/3.7GB), time limits,
acks_late.
"""
from __future__ import annotations

import asyncio
import logging

from celery import Celery

from app.core.config import settings

logger = logging.getLogger("geoscan.celery")


def _run(coro):
    """Run an async pipeline function from a sync Celery task."""
    return asyncio.run(coro)

celery_app = Celery("geoscan")

celery_app.conf.update(
    broker_url=settings.CELERY_BROKER_URL,
    result_backend=settings.CELERY_RESULT_BACKEND,
    task_queues={
        "geoscan": {"exchange": "geoscan", "routing_key": "geoscan"},
    },
    task_default_queue=settings.CELERY_TASK_QUEUE,
    task_default_exchange="geoscan",
    task_default_routing_key="geoscan",
    worker_concurrency=1,            # WAJIB — server kecil
    worker_max_tasks_per_child=50,   # cegah memory leak
    task_soft_time_limit=300,        # 5 menit
    task_time_limit=600,             # 10 menit hard limit
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    timezone="UTC",
    enable_utc=True,
)


# ── Tasks (Phase 5 — real AI engine via app.services.ai.pipeline) ──
@celery_app.task(name="scan_articles")
def scan_articles_task(article_ids: list[str] | None = None) -> dict:
    from app.services.ai import pipeline

    logger.info("scan_articles: %d articles", len(article_ids or []))
    return _run(pipeline.run_scan_articles(article_ids or []))


@celery_app.task(name="translate_news")
def translate_news_task(max_articles: int = 300) -> dict:
    from app.services.ai import pipeline

    logger.info("translate_news: max=%s", max_articles)
    return _run(pipeline.run_translate_news(max_articles))


@celery_app.task(name="summarize_news")
def summarize_news_task(max_articles: int = 200) -> dict:
    from app.services.ai import pipeline

    logger.info("summarize_news: max=%s", max_articles)
    return _run(pipeline.run_summarize_news(max_articles))


@celery_app.task(name="group_news")
def group_news_task(threshold: float | None = None, max_articles: int = 600) -> dict:
    from app.services.ai import pipeline

    logger.info("group_news: threshold=%s max=%s", threshold, max_articles)
    res = _run(pipeline.run_group_news(threshold, max_articles))
    # F1 — analyze each newly-formed situation with the 16-layer framework.
    for sit in res.get("situations", []) or []:
        if sit.get("id"):
            generate_scenarios_task.delay(sit["id"])
    return res


@celery_app.task(name="generate_scenarios", rate_limit="30/h", max_retries=1)
def generate_scenarios_task(crisis_id: str, force: bool = False) -> dict:
    from app.services.ai import pipeline

    logger.info("generate_scenarios: crisis=%s force=%s", crisis_id, force)
    res = _run(pipeline.run_generate_scenarios(crisis_id, force))
    # F2 — once analyzed, derive the Dampak (impacts) for this situation.
    if res.get("status") == "ok":
        generate_impacts_task.delay(crisis_id, force)
    return res


@celery_app.task(name="generate_missing_scenarios")
def generate_missing_scenarios_task(limit: int = 20) -> dict:
    from app.services.ai import pipeline

    logger.info("generate_missing_scenarios: limit=%s", limit)
    return _run(pipeline.run_generate_missing_scenarios(limit))


@celery_app.task(name="generate_impacts", rate_limit="30/h", max_retries=1)
def generate_impacts_task(crisis_id: str, force: bool = False) -> dict:
    from app.services.ai import pipeline

    logger.info("generate_impacts: crisis=%s force=%s", crisis_id, force)
    return _run(pipeline.run_generate_impacts(crisis_id, force))


@celery_app.task(name="generate_missing_impacts")
def generate_missing_impacts_task(limit: int = 20) -> dict:
    from app.services.ai import pipeline

    logger.info("generate_missing_impacts: limit=%s", limit)
    return _run(pipeline.run_generate_missing_impacts(limit))


@celery_app.task(name="purge_old_news")
def purge_old_news_task(months: int = 4) -> dict:
    from app.services.ai import pipeline

    logger.info("purge_old_news: months=%s", months)
    return _run(pipeline.run_purge_old_news(months))


@celery_app.task(name="analyze_statement")
def analyze_statement_task(actor_id: str, statement_text: str | None = None) -> dict:
    from app.services.ai import pipeline

    logger.info("analyze_statement: actor %s", actor_id)
    return _run(pipeline.run_analyze_statement(actor_id, statement_text))


@celery_app.task(name="trigger_mutation", rate_limit="10/h", max_retries=2)
def trigger_mutation_task(crisis_id: str, trigger_reason: str = "scheduled") -> dict:
    from app.services.ai import pipeline

    logger.info("trigger_mutation: crisis=%s reason=%s", crisis_id, trigger_reason)
    return _run(pipeline.run_trigger_mutation(crisis_id, trigger_reason))


@celery_app.task(name="scheduled_analysis")
def scheduled_analysis_task() -> dict:
    from app.services.ai import pipeline

    logger.info("scheduled_analysis: enqueue mutation per active crisis")
    return _run(pipeline.run_scheduled_analysis())
