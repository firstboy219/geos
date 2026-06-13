"""Actor endpoints (/actors)."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.actor import ActorListItem, ActorResponse
from app.services import actor_service

router = APIRouter(prefix="/actors", tags=["actors"])


@router.get("", response_model=list[ActorListItem])
async def list_actors(
    country: str | None = Query(None),
    decision_style: str | None = Query(None),
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ActorListItem]:
    actors = await actor_service.list_actors(
        db, country=country, decision_style=decision_style
    )
    return [ActorListItem.model_validate(a) for a in actors]


@router.get("/{actor_id}", response_model=ActorResponse)
async def get_actor(
    actor_id: uuid.UUID,
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ActorResponse:
    actor = await actor_service.get_actor(db, actor_id)
    return ActorResponse.model_validate(actor)
