"""Treasury — user asset tracking + non-AI valuation (F4).

Current value comes from market_data for tradables (crypto/forex/gold/...),
else a deterministic growth/depreciation model (editable). No AI → no quota.
Missing buy price ⇒ a dummy is generated on create (user can edit later).
"""
from __future__ import annotations

import uuid
from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.market_data import MarketData
from app.models.user_asset import UserAsset

# Tradables we try to value from market_data (by symbol).
_TRADABLE = {"stock", "crypto", "forex", "gold", "silver"}

# Deterministic annual change when no market price (appreciation/depreciation).
_RATE = {
    "house": 0.06, "land": 0.08, "car": -0.15, "stock": 0.05, "crypto": 0.10,
    "forex": 0.02, "gold": 0.08, "silver": 0.06, "diamond": 0.03,
    "cash": 0.0, "other": 0.02,
}

# Dummy per-unit buy price (IDR) when the user doesn't provide one.
_DUMMY_BUY = {
    "house": 1_500_000_000.0, "land": 800_000_000.0, "car": 250_000_000.0,
    "stock": 5_000.0, "crypto": 500_000_000.0, "forex": 16_000.0,
    "gold": 1_200_000.0, "silver": 15_000.0, "diamond": 50_000_000.0,
    "cash": 1.0, "other": 10_000_000.0,
}


def dummy_buy_price(asset_type: str) -> float:
    return _DUMMY_BUY.get(asset_type, 10_000_000.0)


async def _latest_prices(db: AsyncSession) -> dict[str, float]:
    rows = (await db.scalars(
        select(MarketData).order_by(MarketData.recorded_at.desc())
    )).all()
    latest: dict[str, float] = {}
    for r in rows:
        latest.setdefault(r.symbol.upper(), r.price)
    return latest


def _years(a: UserAsset) -> float:
    base = a.buy_date or (a.created_at.date() if a.created_at else date.today())
    return max(0.0, (date.today() - base).days / 365.0)


def _value(a: UserAsset, latest: dict[str, float]) -> dict:
    unit_buy = a.buy_price if a.buy_price is not None else dummy_buy_price(a.asset_type)
    if a.manual_price is not None:
        unit_now = a.manual_price
    elif a.asset_type in _TRADABLE and a.symbol and a.symbol.upper() in latest:
        unit_now = latest[a.symbol.upper()]
    else:
        unit_now = unit_buy * (1 + _RATE.get(a.asset_type, 0.02) * _years(a))
    qty = a.quantity or 1.0
    buy_value = unit_buy * qty
    current_value = unit_now * qty
    gain_value = current_value - buy_value
    gain_pct = ((unit_now / unit_buy - 1) * 100) if unit_buy else 0.0
    direction = "up" if gain_value > 0.5 else "down" if gain_value < -0.5 else "neutral"
    return {
        "id": a.id, "asset_type": a.asset_type, "name": a.name, "symbol": a.symbol,
        "quantity": qty, "currency": a.currency, "buy_date": a.buy_date,
        "buy_price": round(unit_buy, 2), "current_price": round(unit_now, 2),
        "buy_value": round(buy_value, 2), "current_value": round(current_value, 2),
        "gain_value": round(gain_value, 2), "gain_pct": round(gain_pct, 2),
        "direction": direction,
    }


async def list_assets(db: AsyncSession, user_id: uuid.UUID) -> dict:
    assets = (await db.scalars(
        select(UserAsset).where(UserAsset.user_id == user_id)
        .order_by(UserAsset.created_at.desc())
    )).all()
    latest = await _latest_prices(db)
    items = [_value(a, latest) for a in assets]
    total_buy = round(sum(i["buy_value"] for i in items), 2)
    total_now = round(sum(i["current_value"] for i in items), 2)
    return {
        "items": items,
        "total_buy_value": total_buy,
        "total_current_value": total_now,
        "total_gain_value": round(total_now - total_buy, 2),
        "total_gain_pct": round((total_now / total_buy - 1) * 100, 2) if total_buy else 0.0,
    }


async def create_asset(db: AsyncSession, user_id: uuid.UUID, data: dict) -> dict:
    atype = data.get("asset_type") or "other"
    asset = UserAsset(
        user_id=user_id,
        asset_type=atype,
        name=data.get("name") or atype.title(),
        symbol=data.get("symbol"),
        quantity=float(data.get("quantity") or 1.0),
        buy_price=data.get("buy_price") if data.get("buy_price") is not None else dummy_buy_price(atype),
        currency=data.get("currency") or "IDR",
        buy_date=data.get("buy_date"),
        manual_price=data.get("manual_price"),
    )
    db.add(asset)
    await db.commit()
    await db.refresh(asset)
    latest = await _latest_prices(db)
    return _value(asset, latest)


async def _owned(db: AsyncSession, user_id: uuid.UUID, asset_id: uuid.UUID) -> UserAsset:
    asset = await db.get(UserAsset, asset_id)
    if asset is None or asset.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    return asset


async def update_asset(db: AsyncSession, user_id: uuid.UUID, asset_id: uuid.UUID, changes: dict) -> dict:
    asset = await _owned(db, user_id, asset_id)
    for field, value in changes.items():
        setattr(asset, field, value)
    await db.commit()
    await db.refresh(asset)
    latest = await _latest_prices(db)
    return _value(asset, latest)


async def delete_asset(db: AsyncSession, user_id: uuid.UUID, asset_id: uuid.UUID) -> None:
    asset = await _owned(db, user_id, asset_id)
    await db.delete(asset)
    await db.commit()
