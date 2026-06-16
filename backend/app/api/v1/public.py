"""Public (no-auth) read endpoints for the web news portal (viewgeo).

Read-only; served same-origin via the viewgeo nginx /api proxy. Rate-limited
by IP. Mirrors the authed /news + /crises data the mobile app uses.
"""
import uuid

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.core.limiter import limiter
from app.models.crisis import Crisis
from app.models.impact import Impact
from app.models.news_article import NewsArticle
from app.schemas.common import PaginatedResponse
from app.schemas.crisis import CrisisListItem, CrisisNewsItem, ScenarioResponse
from app.schemas.impact import ImpactItem
from app.schemas.news import NewsFeedItem
from app.services import crisis_service

router = APIRouter(prefix="/public", tags=["public"])
_RL = "120/minute"


@router.get("/news", response_model=PaginatedResponse[NewsFeedItem])
@limiter.limit(_RL)
async def public_news(
    request: Request,
    page: int = Query(1, ge=1),
    size: int = Query(24, ge=1, le=100),
    category: str | None = Query(None),
    summarized: bool = Query(False),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[NewsFeedItem]:
    stmt = select(NewsArticle)
    count_stmt = select(func.count(NewsArticle.id))
    if category:
        stmt = stmt.where(NewsArticle.category == category)
        count_stmt = count_stmt.where(NewsArticle.category == category)
    if summarized:
        stmt = stmt.where(NewsArticle.summary_points.isnot(None))
        count_stmt = count_stmt.where(NewsArticle.summary_points.isnot(None))
    total = int(await db.scalar(count_stmt) or 0)
    stmt = (
        stmt.order_by(NewsArticle.published_at.desc().nullslast(),
                      NewsArticle.ingested_at.desc())
        .offset((page - 1) * size).limit(size)
    )
    rows = list((await db.scalars(stmt)).all())
    return PaginatedResponse(
        data=[NewsFeedItem.model_validate(a) for a in rows],
        total=total, page=page, size=size,
    )


@router.get("/situations", response_model=PaginatedResponse[CrisisListItem])
@limiter.limit(_RL)
async def public_situations(
    request: Request,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[CrisisListItem]:
    rows, total = await crisis_service.list_crises(
        db, page=page, size=size, status_filter="active", region=None, crisis_type=None
    )
    counts = await crisis_service.news_counts(db, [c.id for c in rows])
    items = []
    for c in rows:
        item = CrisisListItem.model_validate(c)
        item.news_count = counts.get(c.id, 0)
        items.append(item)
    return PaginatedResponse(data=items, total=total, page=page, size=size)


@router.get("/situations/{crisis_id}")
@limiter.limit(_RL)
async def public_situation_detail(
    request: Request,
    crisis_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    crisis = await crisis_service.get_crisis(db, crisis_id)
    scenarios = await crisis_service.get_current_scenarios(db, crisis_id)
    news = await crisis_service.list_crisis_news(db, crisis_id, limit=30)
    impacts = (
        await db.scalars(select(Impact).where(Impact.crisis_id == crisis_id))
    ).all()
    item = CrisisListItem.model_validate(crisis)
    item.news_count = len(news)
    return {
        "situation": item.model_dump(mode="json"),
        "description": crisis.description,
        "scenarios": [ScenarioResponse.model_validate(s).model_dump(mode="json") for s in scenarios],
        "impacts": [ImpactItem.model_validate(i).model_dump(mode="json") for i in impacts],
        "news": [CrisisNewsItem.model_validate(n).model_dump(mode="json") for n in news],
    }
