"""Internal endpoints (/internal) — KHUSUS n8n, gated X-Internal-Key.

Rate limit 1000/min per default (slowapi by IP) sesuai BAB 12.3.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.celery_app import scan_articles_task, trigger_mutation_task, analyze_statement_task
from app.core.dependencies import get_db, verify_internal_key
from app.core.limiter import limiter
from app.schemas.common import MessageResponse
from app.schemas.internal import (
    ActorStatementRequest,
    CrisisActiveId,
    CrisisSubscriptions,
    MarketItemIn,
    MarketUpdateResponse,
    MonitoredActor,
    NewsIngestRequest,
    NewsIngestResponse,
    NotificationSendRequest,
    NotificationSendResponse,
    ProUserPortfolio,
    ScanArticlesRequest,
    TaskAcceptedResponse,
    TripwireEventRecent,
    TriggerMutationRequest,
)
from app.services import internal_service, notifications

router = APIRouter(
    prefix="/internal",
    tags=["internal"],
    dependencies=[Depends(verify_internal_key)],
)

_RL = "1000/minute"


@router.post("/news/ingest", response_model=NewsIngestResponse)
@limiter.limit(_RL)
async def ingest_news(
    request: Request,
    payload: NewsIngestRequest,
    db: AsyncSession = Depends(get_db),
) -> NewsIngestResponse:
    new_ids = await internal_service.ingest_news(db, payload.articles)
    task_id = None
    if new_ids:
        result = scan_articles_task.delay([str(i) for i in new_ids])
        task_id = result.id
    return NewsIngestResponse(
        accepted=len(new_ids),
        queued=len(new_ids),
        queued_ids=new_ids,
        task_id=task_id,
    )


@router.post("/actors/statement", response_model=MessageResponse)
@limiter.limit(_RL)
async def actor_statement(
    request: Request,
    payload: ActorStatementRequest,
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    actor = await internal_service.update_actor_statement(
        db,
        actor_id=payload.actor_id,
        statement_text=payload.statement_text,
        published_at=payload.published_at,
    )
    if actor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Actor not found"
        )
    analyze_statement_task.delay(str(payload.actor_id), payload.statement_text)
    return MessageResponse(message="Statement recorded and queued for analysis")


@router.post("/market/update", response_model=MarketUpdateResponse)
@limiter.limit(_RL)
async def market_update(
    request: Request,
    payload: list[MarketItemIn],
    db: AsyncSession = Depends(get_db),
) -> MarketUpdateResponse:
    n = await internal_service.upsert_market(db, payload)
    return MarketUpdateResponse(upserted=n)


@router.post("/notifications/send", response_model=NotificationSendResponse)
@limiter.limit(_RL)
async def send_notification(
    request: Request,
    payload: NotificationSendRequest,
    db: AsyncSession = Depends(get_db),
) -> NotificationSendResponse:
    inserted, fcm = await notifications.send_notifications(
        db,
        user_ids=payload.user_ids,
        title=payload.title,
        body=payload.body,
        data=payload.data,
    )
    return NotificationSendResponse(inserted=inserted, fcm_attempted=fcm)


@router.get("/config/news-sources")
@limiter.limit(_RL)
async def config_news_sources(request: Request):
    """Active news/OSINT sources for WF-01 to fetch (CMS-managed)."""
    from app.core import settings_store

    sources = await settings_store.get_news_sources()
    return {"sources": [s for s in sources if s.get("enabled", True)]}


@router.get("/crises/active-ids", response_model=list[CrisisActiveId])
@limiter.limit(_RL)
async def crises_active_ids(
    request: Request, db: AsyncSession = Depends(get_db)
) -> list[CrisisActiveId]:
    crises = await internal_service.active_crisis_ids(db)
    return [CrisisActiveId(id=c.id, title=c.title) for c in crises]


@router.get("/users/pro-with-portfolio", response_model=list[ProUserPortfolio])
@limiter.limit(_RL)
async def pro_users(
    request: Request, db: AsyncSession = Depends(get_db)
) -> list[ProUserPortfolio]:
    rows = await internal_service.pro_users_with_portfolio(db)
    return [ProUserPortfolio(**r) for r in rows]


@router.get("/actors/monitored", response_model=list[MonitoredActor])
@limiter.limit(_RL)
async def monitored_actors(
    request: Request, db: AsyncSession = Depends(get_db)
) -> list[MonitoredActor]:
    rows = await internal_service.monitored_actors(db)
    return [MonitoredActor(**r) for r in rows]


@router.get(
    "/subscriptions/crisis/{crisis_id}", response_model=CrisisSubscriptions
)
@limiter.limit(_RL)
async def crisis_subscriptions(
    request: Request,
    crisis_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> CrisisSubscriptions:
    data = await internal_service.crisis_subscriptions(db, crisis_id)
    return CrisisSubscriptions(**data)


@router.get("/tripwire-events/recent", response_model=list[TripwireEventRecent])
@limiter.limit(_RL)
async def recent_tripwire_events(
    request: Request,
    minutes: int = Query(5, ge=1, le=1440),
    db: AsyncSession = Depends(get_db),
) -> list[TripwireEventRecent]:
    events = await internal_service.recent_tripwire_events(db, minutes)
    return [TripwireEventRecent.model_validate(e, from_attributes=True) for e in events]


@router.post("/tasks/scan-articles", response_model=TaskAcceptedResponse)
@limiter.limit(_RL)
async def task_scan_articles(
    request: Request, payload: ScanArticlesRequest
) -> TaskAcceptedResponse:
    result = scan_articles_task.delay([str(i) for i in payload.article_ids])
    return TaskAcceptedResponse(task_id=result.id)


@router.post("/tasks/trigger-mutation", response_model=TaskAcceptedResponse)
@limiter.limit(_RL)
async def task_trigger_mutation(
    request: Request, payload: TriggerMutationRequest
) -> TaskAcceptedResponse:
    result = trigger_mutation_task.delay(str(payload.crisis_id), payload.trigger_reason)
    return TaskAcceptedResponse(task_id=result.id)
