"""ORM: scenarios (BAB 4.3)."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Scenario(Base):
    __tablename__ = "scenarios"
    __table_args__ = (
        CheckConstraint("probability BETWEEN 0 AND 1", name="ck_scenarios_prob"),
        CheckConstraint("rung BETWEEN 1 AND 6", name="ck_scenarios_rung"),
        Index("idx_scenarios_crisis", "crisis_id", "is_current"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    crisis_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("crises.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    probability: Mapped[float] = mapped_column(Float, nullable=False)
    rung: Mapped[int | None] = mapped_column(Integer, nullable=True)  # Kahn ladder 1-6
    vector_escalation: Mapped[str | None] = mapped_column(String(50), nullable=True)
    vector_hybrid: Mapped[str | None] = mapped_column(String(50), nullable=True)
    vector_duration: Mapped[str | None] = mapped_column(String(50), nullable=True)
    narrative_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_current: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)

    crisis: Mapped["Crisis"] = relationship(  # noqa: F821
        back_populates="scenarios", lazy="noload"
    )
    mutations: Mapped[list["ScenarioMutation"]] = relationship(  # noqa: F821
        back_populates="scenario", cascade="all, delete-orphan", lazy="noload"
    )
