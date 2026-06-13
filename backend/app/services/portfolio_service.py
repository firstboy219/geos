"""Business logic portfolio + deterministic impact calculation.

Impact dihitung deterministik (tanpa LLM) berdasarkan skenario aktif:
- Setiap asset_type punya sensitivitas terhadap eskalasi geopolitik.
- Bobot per skenario = probability * (severity_level/10) * shock_multiplier.
- LLM-based recommendations menyusul di fase berikut.
"""
from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.crisis import Crisis
from app.models.scenario import Scenario
from app.models.user import User
from app.models.user_portfolio import UserPortfolio
from app.schemas.portfolio import (
    AssetImpact,
    PortfolioCreate,
    PortfolioImpactResponse,
    PortfolioUpdate,
)

# Sensitivitas tiap asset_type terhadap eskalasi geopolitik (heuristik).
# Positif = cenderung naik saat eskalasi (safe haven), negatif = cenderung turun.
_ASSET_SENSITIVITY: dict[str, float] = {
    "gold": 0.8,        # safe haven → naik
    "commodity": 0.5,   # energi/logam naik saat konflik
    "deposit": 0.1,     # relatif stabil
    "property": -0.2,
    "stock": -0.7,      # ekuitas tertekan
    "crypto": -0.5,     # risk-off
}


async def list_portfolio(db: AsyncSession, user_id: uuid.UUID) -> list[UserPortfolio]:
    stmt = (
        select(UserPortfolio)
        .where(UserPortfolio.user_id == user_id)
        .order_by(UserPortfolio.created_at.desc())
    )
    return list((await db.scalars(stmt)).all())


async def create_asset(
    db: AsyncSession, user: User, data: PortfolioCreate
) -> UserPortfolio:
    # Free tier dibatasi max aset (BAB 12).
    if user.tier == "free":
        count = await db.scalar(
            select(func.count(UserPortfolio.id)).where(
                UserPortfolio.user_id == user.id
            )
        )
        if int(count or 0) >= settings.FREE_TIER_MAX_PORTFOLIO_ASSETS:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Free tier limited to {settings.FREE_TIER_MAX_PORTFOLIO_ASSETS} "
                    "assets. Upgrade to Pro for unlimited."
                ),
            )

    asset = UserPortfolio(user_id=user.id, **data.model_dump())
    db.add(asset)
    await db.commit()
    await db.refresh(asset)
    return asset


async def _get_owned_asset(
    db: AsyncSession, user_id: uuid.UUID, asset_id: uuid.UUID
) -> UserPortfolio:
    asset = await db.get(UserPortfolio, asset_id)
    if asset is None or asset.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found"
        )
    return asset


async def update_asset(
    db: AsyncSession, user_id: uuid.UUID, asset_id: uuid.UUID, data: PortfolioUpdate
) -> UserPortfolio:
    asset = await _get_owned_asset(db, user_id, asset_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(asset, field, value)
    await db.commit()
    await db.refresh(asset)
    return asset


async def delete_asset(
    db: AsyncSession, user_id: uuid.UUID, asset_id: uuid.UUID
) -> None:
    asset = await _get_owned_asset(db, user_id, asset_id)
    await db.delete(asset)
    await db.commit()


async def compute_impact(
    db: AsyncSession, user_id: uuid.UUID
) -> PortfolioImpactResponse:
    assets = await list_portfolio(db, user_id)

    # Ambil skenario aktif beserta krisisnya untuk faktor bobot.
    stmt = (
        select(Scenario, Crisis)
        .join(Crisis, Crisis.id == Scenario.crisis_id)
        .where(Scenario.is_current.is_(True), Crisis.status == "active")
        .order_by(Scenario.probability.desc())
    )
    rows = list((await db.execute(stmt)).all())

    # Faktor eskalasi global tertimbang (0..1) dari semua skenario aktif.
    escalation_weight = 0.0
    scenario_summaries: list[dict] = []
    for scenario, crisis in rows:
        sev = (crisis.severity_level or 5) / 10.0
        weight = scenario.probability * sev * (crisis.shock_multiplier or 1.0)
        escalation_weight += weight
        scenario_summaries.append(
            {
                "scenario_id": str(scenario.id),
                "crisis_id": str(crisis.id),
                "crisis_title": crisis.title,
                "scenario_name": scenario.name,
                "probability": round(scenario.probability, 3),
                "weight": round(weight, 3),
            }
        )

    # Normalisasi ke 0..1 (cap agar tidak meledak bila banyak skenario).
    escalation_weight = min(escalation_weight, 1.0)

    asset_impacts: list[AssetImpact] = []
    total_value = 0.0
    weighted_sum = 0.0
    for asset in assets:
        price = asset.current_price or asset.purchase_price or 0.0
        value = price * asset.quantity
        total_value += value
        sensitivity = _ASSET_SENSITIVITY.get(asset.asset_type or "", -0.3)
        # impact_score: sensitivitas dimodulasi tingkat eskalasi.
        impact_score = round(sensitivity * escalation_weight, 3)
        direction = "up" if impact_score > 0.05 else "down" if impact_score < -0.05 else "neutral"
        weighted_sum += impact_score * value
        asset_impacts.append(
            AssetImpact(
                asset_id=asset.id,
                asset_name=asset.asset_name,
                asset_type=asset.asset_type,
                estimated_value=round(value, 2),
                impact_score=impact_score,
                direction=direction,
            )
        )

    weighted_impact = round(weighted_sum / total_value, 3) if total_value > 0 else 0.0

    recommendations = _build_recommendations(weighted_impact, escalation_weight, assets)

    return PortfolioImpactResponse(
        scenarios=scenario_summaries,
        assets=asset_impacts,
        weighted_impact=weighted_impact,
        recommendations=recommendations,
    )


def _build_recommendations(
    weighted_impact: float, escalation: float, assets: list[UserPortfolio]
) -> list[str]:
    recs: list[str] = []
    if not assets:
        return ["Belum ada aset di portofolio. Tambahkan aset untuk melihat dampak."]
    if escalation < 0.15:
        recs.append("Tingkat eskalasi geopolitik saat ini rendah. Portofolio relatif aman.")
    if weighted_impact < -0.2:
        recs.append(
            "Portofolio berisiko tertekan oleh eskalasi. Pertimbangkan menambah aset "
            "lindung nilai (emas/komoditas)."
        )
    elif weighted_impact > 0.2:
        recs.append("Portofolio cenderung diuntungkan oleh kondisi geopolitik saat ini.")
    has_haven = any((a.asset_type in ("gold", "commodity")) for a in assets)
    if not has_haven and escalation > 0.3:
        recs.append("Tidak ada aset safe-haven; diversifikasi ke emas dapat menurunkan risiko.")
    if not recs:
        recs.append("Portofolio terdiversifikasi wajar terhadap kondisi saat ini.")
    return recs
