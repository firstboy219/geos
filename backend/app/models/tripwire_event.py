"""ORM: tripwire_events (BAB 4.6)."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import Float, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TripwireEvent(Base):
    __tablename__ = "tripwire_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tripwire_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tripwires.id"), nullable=False
    )
    article_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("news_articles.id"), nullable=True
    )
    detected_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    raw_data: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    notified_at: Mapped[datetime | None] = mapped_column(nullable=True)

    tripwire: Mapped["Tripwire"] = relationship(  # noqa: F821
        back_populates="events", lazy="noload"
    )
