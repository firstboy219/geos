"""Portfolio endpoints (/portfolio)."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.core.limiter import limiter, user_or_ip_key
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.portfolio import (
    PortfolioCreate,
    PortfolioImpactResponse,
    PortfolioResponse,
    PortfolioUpdate,
)
from app.services import portfolio_service

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("", response_model=list[PortfolioResponse])
async def list_portfolio(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[PortfolioResponse]:
    assets = await portfolio_service.list_portfolio(db, user.id)
    return [PortfolioResponse.model_validate(a) for a in assets]


@router.post("", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/hour", key_func=user_or_ip_key)
async def create_asset(
    request: Request,
    payload: PortfolioCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PortfolioResponse:
    asset = await portfolio_service.create_asset(db, user, payload)
    return PortfolioResponse.model_validate(asset)


@router.get("/impact", response_model=PortfolioImpactResponse)
@limiter.limit("10/hour", key_func=user_or_ip_key)
async def portfolio_impact(
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PortfolioImpactResponse:
    return await portfolio_service.compute_impact(db, user.id)


@router.patch("/{asset_id}", response_model=PortfolioResponse)
async def update_asset(
    asset_id: uuid.UUID,
    payload: PortfolioUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PortfolioResponse:
    asset = await portfolio_service.update_asset(db, user.id, asset_id, payload)
    return PortfolioResponse.model_validate(asset)


@router.delete("/{asset_id}", response_model=MessageResponse)
async def delete_asset(
    asset_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    await portfolio_service.delete_asset(db, user.id, asset_id)
    return MessageResponse(message="Asset deleted")
