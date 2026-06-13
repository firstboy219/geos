"""Alert endpoints (/alerts)."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.alert import AlertResponse, UnreadCountResponse
from app.schemas.common import MessageResponse
from app.services import alert_service

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertResponse])
async def list_alerts(
    unread_only: bool = Query(False),
    type: str | None = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[AlertResponse]:
    alerts = await alert_service.list_alerts(
        db,
        user_id=user.id,
        unread_only=unread_only,
        type_filter=type,
        page=page,
        size=size,
    )
    return [AlertResponse.model_validate(a) for a in alerts]


@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_count(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UnreadCountResponse:
    return UnreadCountResponse(count=await alert_service.unread_count(db, user.id))


@router.patch("/read-all", response_model=MessageResponse)
async def mark_all_read(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    n = await alert_service.mark_all_read(db, user.id)
    return MessageResponse(message=f"{n} alerts marked as read")


@router.patch("/{alert_id}/read", response_model=AlertResponse)
async def mark_read(
    alert_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AlertResponse:
    alert = await alert_service.mark_read(db, user.id, alert_id)
    return AlertResponse.model_validate(alert)
