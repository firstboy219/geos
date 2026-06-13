"""ORM: actors (BAB 4.5)."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, Float, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

DECISION_STYLES = ("pragmatic", "ideological", "opportunistic", "unpredictable")
RISK_APPETITES = ("low", "medium", "high", "extreme")


class Actor(Base):
    __tablename__ = "actors"
    __table_args__ = (
        CheckConstraint(
            "decision_style IN ('pragmatic','ideological','opportunistic','unpredictable')",
            name="ck_actors_decision_style",
        ),
        CheckConstraint(
            "risk_appetite IN ('low','medium','high','extreme')",
            name="ck_actors_risk_appetite",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    organization: Mapped[str | None] = mapped_column(String(255), nullable=True)
    decision_style: Mapped[str | None] = mapped_column(String(50), nullable=True)
    rcs_score: Mapped[float] = mapped_column(Float, default=50.0)   # 0-100
    risk_appetite: Mapped[str | None] = mapped_column(String(20), nullable=True)
    csi_score: Mapped[float] = mapped_column(Float, default=5.0)    # Layer K 0-10
    rfs_score: Mapped[float] = mapped_column(Float, default=5.0)    # Layer O 0-10
    bio_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    last_statement: Mapped[str | None] = mapped_column(Text, nullable=True)
    last_statement_date: Mapped[datetime | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now(), nullable=False
    )

    crisis_links: Mapped[list["CrisisActor"]] = relationship(  # noqa: F821
        back_populates="actor", cascade="all, delete-orphan", lazy="noload"
    )
