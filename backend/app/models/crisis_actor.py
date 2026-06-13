"""ORM: crisis_actors junction (BAB 4.5)."""
from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class CrisisActor(Base):
    __tablename__ = "crisis_actors"

    crisis_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("crises.id", ondelete="CASCADE"),
        primary_key=True,
    )
    actor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("actors.id", ondelete="CASCADE"),
        primary_key=True,
    )
    role: Mapped[str | None] = mapped_column(String(100), nullable=True)  # primary|secondary|proxy

    crisis: Mapped["Crisis"] = relationship(  # noqa: F821
        back_populates="actor_links", lazy="noload"
    )
    actor: Mapped["Actor"] = relationship(  # noqa: F821
        back_populates="crisis_links", lazy="noload"
    )
