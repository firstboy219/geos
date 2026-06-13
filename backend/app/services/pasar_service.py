"""Business logic pasar (market) — derive dari market_data + skenario aktif.

Semua bentuk respons mengikuti BAB 5.3. Perhitungan deterministik.
"""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.crisis import Crisis
from app.models.market_data import MarketData
from app.models.scenario import Scenario
from app.schemas.pasar import AssetWithGeoSignal, HeatmapResponse, MatrixResponse

# Pemetaan symbol → (nama tampilan, kategori).
_SYMBOL_META: dict[str, tuple[str, str]] = {
    "^JKSE": ("IHSG", "saham"),
    "JKSE": ("IHSG", "saham"),
    "GC=F": ("Emas (Gold)", "komoditas"),
    "XAU": ("Emas (Gold)", "komoditas"),
    "CL=F": ("Minyak (WTI)", "komoditas"),
    "NICKEL": ("Nikel (LME)", "komoditas"),
    "USDIDR": ("USD/IDR", "kurs"),
    "USD/IDR": ("USD/IDR", "kurs"),
    "BTC": ("Bitcoin", "crypto"),
    "BTC-USD": ("Bitcoin", "crypto"),
    "ETH": ("Ethereum", "crypto"),
}

# Sensitivitas kategori terhadap eskalasi (untuk geo-signal & matrix).
_CATEGORY_SENSITIVITY: dict[str, float] = {
    "komoditas": 0.6,   # naik saat konflik
    "kurs": 0.4,        # USD menguat
    "saham": -0.7,
    "crypto": -0.5,
}


def _meta(symbol: str) -> tuple[str, str]:
    return _SYMBOL_META.get(symbol, (symbol, "saham"))


async def _latest_per_symbol(db: AsyncSession) -> dict[str, MarketData]:
    """Ambil baris market_data terbaru per symbol."""
    rows = list(
        (
            await db.scalars(
                select(MarketData).order_by(MarketData.recorded_at.desc())
            )
        ).all()
    )
    latest: dict[str, MarketData] = {}
    for row in rows:
        latest.setdefault(row.symbol, row)
    return latest


async def _escalation_weight(db: AsyncSession) -> float:
    stmt = (
        select(Scenario, Crisis)
        .join(Crisis, Crisis.id == Scenario.crisis_id)
        .where(Scenario.is_current.is_(True), Crisis.status == "active")
    )
    total = 0.0
    for scenario, crisis in (await db.execute(stmt)).all():
        sev = (crisis.severity_level or 5) / 10.0
        total += scenario.probability * sev * (crisis.shock_multiplier or 1.0)
    return min(total, 1.0)


async def list_assets(
    db: AsyncSession, category: str | None
) -> list[AssetWithGeoSignal]:
    latest = await _latest_per_symbol(db)
    escalation = await _escalation_weight(db)

    out: list[AssetWithGeoSignal] = []
    for symbol, md in latest.items():
        name, cat = _meta(symbol)
        if category and cat != category:
            continue
        sensitivity = _CATEGORY_SENSITIVITY.get(cat, -0.3)
        signal_value = sensitivity * escalation
        geo_signal = (
            "bullish" if signal_value > 0.05
            else "bearish" if signal_value < -0.05
            else "neutral"
        )
        out.append(
            AssetWithGeoSignal(
                symbol=symbol,
                name=name,
                category=cat,
                price=md.price,
                change_pct=md.change_pct,
                geo_signal=geo_signal,
                signal_strength=round(abs(signal_value), 3),
            )
        )
    out.sort(key=lambda a: a.signal_strength, reverse=True)
    return out


async def build_matrix(db: AsyncSession) -> MatrixResponse:
    """Matrix skenario (baris) × aset (kolom) → {dir, pct}."""
    latest = await _latest_per_symbol(db)
    symbols = list(latest.keys())
    headers = [_meta(s)[0] for s in symbols]

    stmt = (
        select(Scenario, Crisis)
        .join(Crisis, Crisis.id == Scenario.crisis_id)
        .where(Scenario.is_current.is_(True), Crisis.status == "active")
        .order_by(Scenario.probability.desc())
        .limit(8)
    )
    pairs = list((await db.execute(stmt)).all())

    rows: list[str] = []
    cells: list[list[dict]] = []
    for scenario, crisis in pairs:
        rows.append(f"{crisis.title}: {scenario.name}")
        sev = (crisis.severity_level or 5) / 10.0
        weight = scenario.probability * sev * (crisis.shock_multiplier or 1.0)
        row_cells: list[dict] = []
        for symbol in symbols:
            cat = _meta(symbol)[1]
            sensitivity = _CATEGORY_SENSITIVITY.get(cat, -0.3)
            pct = round(sensitivity * weight * 100, 1)  # estimasi % pergerakan
            direction = "up" if pct > 0.5 else "down" if pct < -0.5 else "flat"
            row_cells.append({"dir": direction, "pct": pct})
        cells.append(row_cells)

    return MatrixResponse(headers=headers, rows=rows, cells=cells)


async def build_heatmap(db: AsyncSession) -> HeatmapResponse:
    """Heatmap aset (baris) × situasi/krisis (kolom) → intensitas 0..1."""
    latest = await _latest_per_symbol(db)
    symbols = list(latest.keys())
    asset_names = [_meta(s)[0] for s in symbols]

    crises = list(
        (
            await db.scalars(
                select(Crisis)
                .where(Crisis.status == "active")
                .order_by(Crisis.severity_level.desc().nullslast())
            )
        ).all()
    )
    situations = [c.title for c in crises]

    values: list[list[float]] = []
    for symbol in symbols:
        cat = _meta(symbol)[1]
        sensitivity = abs(_CATEGORY_SENSITIVITY.get(cat, -0.3))
        row: list[float] = []
        for c in crises:
            sev = (c.severity_level or 5) / 10.0
            intensity = round(min(sensitivity * sev * (c.shock_multiplier or 1.0), 1.0), 3)
            row.append(intensity)
        values.append(row)

    return HeatmapResponse(assets=asset_names, situations=situations, values=values)
