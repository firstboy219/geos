"""Pasar (market) schemas (BAB 5.3)."""
from __future__ import annotations

from pydantic import BaseModel


class AssetWithGeoSignal(BaseModel):
    symbol: str
    name: str
    category: str            # saham | kurs | komoditas | crypto
    price: float
    change_pct: float | None = None
    geo_signal: str          # bullish | bearish | neutral
    signal_strength: float   # 0.0 .. 1.0


class MatrixResponse(BaseModel):
    headers: list[str]                 # nama aset (kolom)
    rows: list[str]                    # nama skenario (baris)
    cells: list[list[dict]]            # [[{dir, pct}]]


class HeatmapResponse(BaseModel):
    assets: list[str]
    situations: list[str]
    values: list[list[float]]          # intensitas 0.0 .. 1.0
