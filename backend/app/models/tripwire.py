"""ORM: tripwires (BAB 4.6)."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TRIPWIRE_CATEGORIES = ("military", "cyber", "diplomatic", "economic", "nuclear")
TRIPWIRE_SEVERITIES = ("critical", "high", "medium", "low")


class Tripwire(Base):
    __tablename__ = "tripwires"
    __table_args__ = (
        CheckConstraint(
            "category IN ('military','cyber','diplomatic','economic','nuclear')",
            name="ck_tripwires_category",
        ),
        CheckConstraint(
            "severity IN ('critical','high','medium','low')",
            name="ck_tripwires_severity",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    keywords: Mapped[list[Any] | None] = mapped_column(JSONB, nullable=True)
    threshold: Mapped[float] = mapped_column(Float, default=0.75)
    crisis_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("crises.id"), nullable=True
    )
    escalation_impact: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    severity: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    cooldown_minutes: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    last_fired_at: Mapped[datetime | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)

    crisis: Mapped["Crisis"] = relationship(  # noqa: F821
        back_populates="tripwires", lazy="noload"
    )
    events: Mapped[list["TripwireEvent"]] = relationship(  # noqa: F821
        back_populates="tripwire", cascade="all, delete-orphan", lazy="noload"
    )
