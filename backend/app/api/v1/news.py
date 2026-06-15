"""Public news feed endpoint (/news) — powers the mobile Beranda screen."""

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.core.limiter import limiter, user_or_ip_key
from app.models.news_article import NewsArticle
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.news import NewsFeedItem

router = APIRouter(prefix="/news", tags=["news"])


@router.get("", response_model=PaginatedResponse[NewsFeedItem])
@limiter.limit("100/minute", key_func=user_or_ip_key)
async def list_news(
    request: Request,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    source: str | None = Query(None),
    summarized: bool = Query(False, description="Only articles with AI summary"),
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[NewsFeedItem]:
    stmt = select(NewsArticle)
    count_stmt = select(func.count(NewsArticle.id))
    if source:
        stmt = stmt.where(NewsArticle.source_name == source)
        count_stmt = count_stmt.where(NewsArticle.source_name == source)
    if summarized:
        stmt = stmt.where(NewsArticle.summary_points.isnot(None))
        count_stmt = count_stmt.where(NewsArticle.summary_points.isnot(None))

    total = int(await db.scalar(count_stmt) or 0)
    stmt = (
        stmt.order_by(
            NewsArticle.published_at.desc().nullslast(),
            NewsArticle.ingested_at.desc(),
        )
        .offset((page - 1) * size)
        .limit(size)
    )
    rows = list((await db.scalars(stmt)).all())
    return PaginatedResponse(
        data=[NewsFeedItem.model_validate(a) for a in rows],
        total=total,
        page=page,
        size=size,
    )
