"""ORM: user_portfolio (BAB 4.7)."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, Float, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

ASSET_TYPES = ("stock", "crypto", "gold", "property", "deposit", "commodity")


class UserPortfolio(Base):
    __tablename__ = "user_portfolio"
    __table_args__ = (
        CheckConstraint(
            "asset_type IN ('stock','crypto','gold','property','deposit','commodity')",
            name="ck_portfolio_asset_type",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    asset_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    asset_name: Mapped[str] = mapped_column(String(255), nullable=False)
    ticker: Mapped[str | None] = mapped_column(String(20), nullable=True)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    purchase_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    current_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    currency: Mapped[str] = mapped_column(String(3), default="IDR", nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(  # noqa: F821
        back_populates="portfolio", lazy="noload"
    )
