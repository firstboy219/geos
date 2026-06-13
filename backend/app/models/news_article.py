"""ORM: news_articles (BAB 4.7)."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Float, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class NewsArticle(Base):
    __tablename__ = "news_articles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    source_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    url: Mapped[str] = mapped_column(String(1024), unique=True, nullable=False)
    content_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(nullable=True)
    credibility_score: Mapped[float] = mapped_column(Float, default=0.7)
    crisis_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("crises.id"), nullable=True
    )
    language: Mapped[str] = mapped_column(String(5), default="en", nullable=False)
    processed_at: Mapped[datetime | None] = mapped_column(nullable=True)
    ingested_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
