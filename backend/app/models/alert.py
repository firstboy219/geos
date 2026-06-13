"""ORM: alerts (BAB 4.7)."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

ALERT_TYPES = ("tripwire", "scenario_update", "portfolio_impact", "system")
ALERT_SEVERITIES = ("critical", "high", "medium", "low", "info")


class Alert(Base):
    __tablename__ = "alerts"
    __table_args__ = (
        Index("idx_alerts_user_read", "user_id", "is_read", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    severity: Mapped[str | None] = mapped_column(String(20), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    crisis_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("crises.id"), nullable=True
    )
    tripwire_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tripwires.id"), nullable=True
    )
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    fcm_delivered: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship(  # noqa: F821
        back_populates="alerts", lazy="noload"
    )
