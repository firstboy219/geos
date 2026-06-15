"""ORM: user_assets — Treasury (harta user: rumah/mobil/saham/crypto/emas...)."""
from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import Date, Float, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

ASSET_TYPES = (
    "house", "land", "car", "stock", "crypto", "forex",
    "gold", "silver", "diamond", "cash", "other",
)


class UserAsset(Base):
    __tablename__ = "user_assets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    asset_type: Mapped[str] = mapped_column(String(20), nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    # symbol used to look up market_data for tradables (BTC, XAU, USD, BBCA...)
    symbol: Mapped[str | None] = mapped_column(String(20), nullable=True)
    quantity: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    buy_price: Mapped[float | None] = mapped_column(Float, nullable=True)  # per unit
    currency: Mapped[str] = mapped_column(String(8), default="IDR", nullable=False)
    buy_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    # optional manual override of current unit price (else valued automatically)
    manual_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now(), nullable=False
    )
