"""ORM: news_articles (BAB 4.7)."""
from __future__ import annotations

import uuid
from datetime import datetime

from typing import Any

from sqlalchemy import Float, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class NewsArticle(Base):
    __tablename__ = "news_articles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    # original (pre-translation) title; title itself is stored in Bahasa Indonesia
    title_original: Mapped[str | None] = mapped_column(String(512), nullable=True)
    source_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    url: Mapped[str] = mapped_column(String(1024), unique=True, nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    content_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    # AI-generated (Layer: home-news summarize). points = intisari bullets;
    # quotes = [{text, cite}] verbatim quotes from people in the article.
    summary_points: Mapped[list[Any] | None] = mapped_column(JSONB, nullable=True)
    summary_quotes: Mapped[list[Any] | None] = mapped_column(JSONB, nullable=True)
    # Cached embedding vector (so re-clustering/threshold tuning costs no quota).
    embedding: Mapped[list[Any] | None] = mapped_column(JSONB, nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(nullable=True)
    credibility_score: Mapped[float] = mapped_column(Float, default=0.7)
    crisis_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("crises.id"), nullable=True
    )
    language: Mapped[str] = mapped_column(String(5), default="en", nullable=False)
    # Non-AI keyword classification (see app.services.news_classifier). One of:
    # indonesia, internasional, politik, ekonomi, teknologi, olahraga,
    # keamanan, energi, kesehatan, hiburan.
    category: Mapped[str | None] = mapped_column(String(30), nullable=True)
    processed_at: Mapped[datetime | None] = mapped_column(nullable=True)
    ingested_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
