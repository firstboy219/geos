"""ORM: scenario_mutations — audit trail (BAB 4.4)."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Float, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ScenarioMutation(Base):
    __tablename__ = "scenario_mutations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    scenario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("scenarios.id"), nullable=False
    )
    old_probability: Mapped[float | None] = mapped_column(Float, nullable=True)
    new_probability: Mapped[float | None] = mapped_column(Float, nullable=True)
    # reason: tripwire_fired | scheduled | pivot
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    tripwire_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tripwires.id"), nullable=True
    )
    mutated_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)

    scenario: Mapped["Scenario"] = relationship(  # noqa: F821
        back_populates="mutations", lazy="noload"
    )
