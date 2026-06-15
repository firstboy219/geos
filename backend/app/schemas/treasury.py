"""Treasury (user assets) schemas."""
from __future__ import annotations

import uuid
from datetime import date

from pydantic import BaseModel, Field


class AssetCreate(BaseModel):
    asset_type: str = Field(max_length=20)
    name: str = Field(min_length=1, max_length=160)
    symbol: str | None = Field(default=None, max_length=20)
    quantity: float = Field(default=1.0, gt=0)
    buy_price: float | None = Field(default=None, ge=0)
    currency: str = Field(default="IDR", max_length=8)
    buy_date: date | None = None
    manual_price: float | None = Field(default=None, ge=0)


class AssetUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=160)
    symbol: str | None = Field(default=None, max_length=20)
    quantity: float | None = Field(default=None, gt=0)
    buy_price: float | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, max_length=8)
    buy_date: date | None = None
    manual_price: float | None = Field(default=None, ge=0)


class AssetView(BaseModel):
    id: uuid.UUID
    asset_type: str
    name: str
    symbol: str | None = None
    quantity: float
    currency: str
    buy_date: date | None = None
    buy_price: float
    current_price: float
    buy_value: float
    current_value: float
    gain_value: float
    gain_pct: float
    direction: str


class TreasuryResponse(BaseModel):
    items: list[AssetView] = []
    total_buy_value: float
    total_current_value: float
    total_gain_value: float
    total_gain_pct: float
