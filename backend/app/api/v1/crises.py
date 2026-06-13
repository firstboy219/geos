"""Crisis endpoints (/crises)."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.core.limiter import limiter, user_or_ip_key
from app.models.user import User
from app.schemas.actor import ActorResponse
from app.schemas.common import PaginatedResponse
from app.schemas.crisis import (
    CrisisDetailResponse,
    CrisisListItem,
    CrisisResponse,
    ScenarioResponse,
    TripwireResponse,
)
from app.services import crisis_service

router = APIRouter(prefix="/crises", tags=["crises"])


@router.get("", response_model=PaginatedResponse[CrisisListItem])
@limiter.limit("100/minute", key_func=user_or_ip_key)
async def list_crises(
    request: Request,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    region: str | None = Query(None),
    crisis_type: str | None = Query(None),
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[CrisisListItem]:
    rows, total = await crisis_service.list_crises(
        db,
        page=page,
        size=size,
        status_filter=status,
        region=region,
        crisis_type=crisis_type,
    )
    return PaginatedResponse(
        data=[CrisisListItem.model_validate(c) for c in rows],
        total=total,
        page=page,
        size=size,
    )


@router.get("/{crisis_id}", response_model=CrisisDetailResponse)
async def get_crisis_detail(
    crisis_id: uuid.UUID,
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CrisisDetailResponse:
    crisis = await crisis_service.get_crisis(db, crisis_id)
    scenarios = await crisis_service.get_current_scenarios(db, crisis_id)
    actors = await crisis_service.get_crisis_actors(db, crisis_id)
    tripwires = await crisis_service.get_active_tripwires(db, crisis_id)

    base = CrisisResponse.model_validate(crisis).model_dump()
    return CrisisDetailResponse(
        **base,
        scenarios=[ScenarioResponse.model_validate(s) for s in scenarios],
        actors=[ActorResponse.model_validate(a) for a in actors],
        tripwires=[TripwireResponse.model_validate(t) for t in tripwires],
    )


@router.get("/{crisis_id}/scenarios", response_model=list[ScenarioResponse])
async def get_crisis_scenarios(
    crisis_id: uuid.UUID,
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ScenarioResponse]:
    await crisis_service.get_crisis(db, crisis_id)  # 404 jika tidak ada
    scenarios = await crisis_service.get_current_scenarios(db, crisis_id)
    return [ScenarioResponse.model_validate(s) for s in scenarios]


@router.get("/{crisis_id}/actors", response_model=list[ActorResponse])
async def get_crisis_actors(
    crisis_id: uuid.UUID,
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ActorResponse]:
    await crisis_service.get_crisis(db, crisis_id)
    actors = await crisis_service.get_crisis_actors(db, crisis_id)
    return [ActorResponse.model_validate(a) for a in actors]
