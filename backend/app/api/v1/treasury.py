"""Treasury endpoints (/treasury) — user asset tracker with valuation (F4)."""

import uuid

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.core.limiter import limiter, user_or_ip_key
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.treasury import AssetCreate, AssetUpdate, AssetView, TreasuryResponse
from app.services import treasury_service

router = APIRouter(prefix="/treasury", tags=["treasury"])


@router.get("", response_model=TreasuryResponse)
@limiter.limit("100/minute", key_func=user_or_ip_key)
async def list_treasury(
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TreasuryResponse:
    return TreasuryResponse(**await treasury_service.list_assets(db, user.id))


@router.post("", response_model=AssetView, status_code=status.HTTP_201_CREATED)
@limiter.limit("60/minute", key_func=user_or_ip_key)
async def create_treasury_asset(
    request: Request,
    payload: AssetCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AssetView:
    return AssetView(**await treasury_service.create_asset(db, user.id, payload.model_dump()))


@router.patch("/{asset_id}", response_model=AssetView)
async def update_treasury_asset(
    asset_id: uuid.UUID,
    payload: AssetUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AssetView:
    changes = payload.model_dump(exclude_unset=True)
    return AssetView(**await treasury_service.update_asset(db, user.id, asset_id, changes))


@router.delete("/{asset_id}", response_model=MessageResponse)
async def delete_treasury_asset(
    asset_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    await treasury_service.delete_asset(db, user.id, asset_id)
    return MessageResponse(message="Aset dihapus")
