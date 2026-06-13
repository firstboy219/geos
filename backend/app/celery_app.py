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
