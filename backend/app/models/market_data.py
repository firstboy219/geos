"""ORM: market_data (BAB 4.7)."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Float, Index, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class MarketData(Base):
    __tablename__ = "market_data"
    __table_args__ = (
        Index("idx_market_symbol_time", "symbol", "recorded_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    change_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    volume: Mapped[float | None] = mapped_column(Float, nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
    source: Mapped[str | None] = mapped_column(String(50), nullable=True)
