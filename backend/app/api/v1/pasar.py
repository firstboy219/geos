"""Pasar (market) endpoints (/pasar)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.core.limiter import limiter, user_or_ip_key
from app.models.user import User
from app.schemas.pasar import AssetWithGeoSignal, HeatmapResponse, MatrixResponse
from app.services import pasar_service

router = APIRouter(prefix="/pasar", tags=["pasar"])


@router.get("/assets", response_model=list[AssetWithGeoSignal])
@limiter.limit("100/minute", key_func=user_or_ip_key)
async def list_assets(
    request: Request,
    category: str | None = Query(None, description="saham|kurs|komoditas|crypto"),
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[AssetWithGeoSignal]:
    return await pasar_service.list_assets(db, category)


@router.get("/matrix", response_model=MatrixResponse)
@limiter.limit("100/minute", key_func=user_or_ip_key)
async def matrix(
    request: Request,
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MatrixResponse:
    return await pasar_service.build_matrix(db)


@router.get("/heatmap", response_model=HeatmapResponse)
@limiter.limit("100/minute", key_func=user_or_ip_key)
async def heatmap(
    request: Request,
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HeatmapResponse:
    return await pasar_service.build_heatmap(db)
