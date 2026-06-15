"""Public Dampak (impacts) endpoint (/impacts) — powers the mobile Dampak menu."""

import uuid

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.core.limiter import limiter, user_or_ip_key
from app.models.crisis import Crisis
from app.models.impact import Impact
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.impact import (
    ImpactItem,
    PersonalImpactRequest,
    PersonalImpactResponse,
)
from app.services.ai import personal_impact

router = APIRouter(prefix="/impacts", tags=["impacts"])


@router.get("", response_model=PaginatedResponse[ImpactItem])
@limiter.limit("100/minute", key_func=user_or_ip_key)
async def list_impacts(
    request: Request,
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=200),
    category: str | None = Query(None, description="Filter: general/stocks/crypto/forex/property/gold/..."),
    crisis_id: uuid.UUID | None = Query(None),
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[ImpactItem]:
    base = select(Impact, Crisis.title).join(Crisis, Crisis.id == Impact.crisis_id)
    count_stmt = select(func.count(Impact.id))
    if category:
        base = base.where(Impact.category == category)
        count_stmt = count_stmt.where(Impact.category == category)
    if crisis_id:
        base = base.where(Impact.crisis_id == crisis_id)
        count_stmt = count_stmt.where(Impact.crisis_id == crisis_id)

    total = int(await db.scalar(count_stmt) or 0)
    rows = (
        await db.execute(
            base.order_by(Impact.created_at.desc()).offset((page - 1) * size).limit(size)
        )
    ).all()
    data = []
    for imp, title in rows:
        item = ImpactItem.model_validate(imp)
        item.crisis_title = title
        data.append(item)
    return PaginatedResponse(data=data, total=total, page=page, size=size)


@router.post("/personal", response_model=PersonalImpactResponse)
@limiter.limit("20/hour", key_func=user_or_ip_key)
async def personal_impact_analysis(
    request: Request,
    payload: PersonalImpactRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PersonalImpactResponse:
    """F3 — AI analyzes impact on the user based on their profile."""
    result = await personal_impact.analyze_personal(db, user, payload.crisis_id)
    return PersonalImpactResponse(**result)
