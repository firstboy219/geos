"""ORM: impacts — general consequences of a situation (Dampak menu, F2)."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Float, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

# category buckets the UI can filter by
IMPACT_CATEGORIES = (
    "general", "stocks", "industry", "crypto", "forex",
    "property", "gold", "commodity", "energy",
)


class Impact(Base):
    __tablename__ = "impacts"
    __table_args__ = (Index("idx_impacts_crisis", "crisis_id"),
                      Index("idx_impacts_category", "category"))

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    crisis_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("crises.id", ondelete="CASCADE"), nullable=False
    )
    category: Mapped[str] = mapped_column(String(30), default="general", nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    direction: Mapped[str | None] = mapped_column(String(10), nullable=True)  # up|down|neutral|mixed
    severity: Mapped[str | None] = mapped_column(String(10), nullable=True)   # low|medium|high
    timeframe: Mapped[str | None] = mapped_column(String(50), nullable=True)
    detail: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.6)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
