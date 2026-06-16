"""Public news feed schemas (Home / Beranda)."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class QuoteOut(BaseModel):
    text: str
    cite: str | None = None


class NewsFeedItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    source_name: str | None = None
    url: str
    category: str | None = None  # for client-side category filtering on Beranda
    image_url: str | None = None
    summary_points: list[str] | None = None
    summary_quotes: list[QuoteOut] | None = None
    published_at: datetime | None = None
    ingested_at: datetime
    crisis_id: uuid.UUID | None = None
