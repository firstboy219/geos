"""Portfolio schemas (BAB 5.3)."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

ASSET_TYPES = ("stock", "crypto", "gold", "property", "deposit", "commodity")


class PortfolioCreate(BaseModel):
    asset_type: str = Field(pattern="^(stock|crypto|gold|property|deposit|commodity)$")
    asset_name: str = Field(min_length=1, max_length=255)
    ticker: str | None = Field(default=None, max_length=20)
    quantity: float = Field(gt=0)
    purchase_price: float | None = Field(default=None, ge=0)
    current_price: float | None = Field(default=None, ge=0)
    currency: str = Field(default="IDR", min_length=3, max_length=3)
    notes: str | None = None


class PortfolioUpdate(BaseModel):
    asset_type: str | None = Field(
        default=None, pattern="^(stock|crypto|gold|property|deposit|commodity)$"
    )
    asset_name: str | None = Field(default=None, min_length=1, max_length=255)
    ticker: str | None = Field(default=None, max_length=20)
    quantity: float | None = Field(default=None, gt=0)
    purchase_price: float | None = Field(default=None, ge=0)
    current_price: float | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    notes: str | None = None


class PortfolioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    asset_type: str | None = None
    asset_name: str
    ticker: str | None = None
    quantity: float
    purchase_price: float | None = None
    current_price: float | None = None
    currency: str
    notes: str | None = None
    created_at: datetime
    updated_at: datetime


class AssetImpact(BaseModel):
    asset_id: uuid.UUID
    asset_name: str
    asset_type: str | None = None
    estimated_value: float
    impact_score: float       # -1.0 .. +1.0 (negatif = berisiko turun)
    direction: str            # up | down | neutral


class PortfolioImpactResponse(BaseModel):
    scenarios: list[dict]
    assets: list[AssetImpact]
    weighted_impact: float    # agregat tertimbang -1.0 .. +1.0
    recommendations: list[str]
