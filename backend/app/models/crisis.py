"""ORM: crises (BAB 4.2)."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, Float, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

CRISIS_TYPES = ("military", "economic", "cyber", "diplomatic", "hybrid")
CRISIS_STATUSES = ("active", "monitoring", "resolved")


class Crisis(Base):
    __tablename__ = "crises"
    __table_args__ = (
        CheckConstraint(
            "crisis_type IN ('military','economic','cyber','diplomatic','hybrid')",
            name="ck_crises_type",
        ),
        CheckConstraint(
            "status IN ('active','monitoring','resolved')", name="ck_crises_status"
        ),
        CheckConstraint(
            "severity_level BETWEEN 1 AND 10", name="ck_crises_severity"
        ),
        Index("idx_crises_status", "status"),
        Index("idx_crises_region", "region"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    region: Mapped[str | None] = mapped_column(String(100), nullable=True)
    sub_region: Mapped[str | None] = mapped_column(String(100), nullable=True)
    crisis_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    severity_level: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)
    # True = auto-created by news grouping (Layer 2); False = seeded/manual.
    # Only auto_grouped situations act as grouping anchors (dynamic situations).
    auto_grouped: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Framework layers
    redline_index: Mapped[float] = mapped_column(Float, default=5.0)      # Layer A
    misread_score: Mapped[float] = mapped_column(Float, default=5.0)      # Layer B
    csi_average: Mapped[float] = mapped_column(Float, default=5.0)        # Layer K
    rfs_average: Mapped[float] = mapped_column(Float, default=5.0)        # Layer O
    credibility_score: Mapped[float] = mapped_column(Float, default=0.8)  # Layer L
    gray_zone: Mapped[bool] = mapped_column(Boolean, default=False)       # Layer F
    shock_multiplier: Mapped[float] = mapped_column(Float, default=1.0)   # Layer M
    tdi_alert: Mapped[bool] = mapped_column(Boolean, default=False)       # Layer N
    nuclear_adjacent: Mapped[bool] = mapped_column(Boolean, default=False)  # Layer I

    started_at: Mapped[datetime | None] = mapped_column(nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now(), nullable=False
    )

    scenarios: Mapped[list["Scenario"]] = relationship(  # noqa: F821
        back_populates="crisis", cascade="all, delete-orphan", lazy="noload"
    )
    actor_links: Mapped[list["CrisisActor"]] = relationship(  # noqa: F821
        back_populates="crisis", cascade="all, delete-orphan", lazy="noload"
    )
    tripwires: Mapped[list["Tripwire"]] = relationship(  # noqa: F821
        back_populates="crisis", lazy="noload"
    )
