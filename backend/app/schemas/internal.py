"""Internal (n8n) endpoint schemas (BAB 5.3 / Prompt 3-C)."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


# ── news/ingest ──
class NewsArticleIn(BaseModel):
    title: str = Field(max_length=512)
    source: str | None = Field(default=None, max_length=100)
    source_name: str | None = Field(default=None, max_length=100)
    url: str = Field(max_length=1024)
    content: str | None = None
    content_summary: str | None = None
    published_at: datetime | None = None
    credibility_score: float = 0.7
    language: str = "en"
    crisis_id: uuid.UUID | None = None


class NewsIngestRequest(BaseModel):
    articles: list[NewsArticleIn]


class NewsIngestResponse(BaseModel):
    accepted: int
    queued: int
    queued_ids: list[uuid.UUID] = []
    task_id: str | None = None


# ── actors/statement ──
class ActorStatementRequest(BaseModel):
    actor_id: uuid.UUID
    statement_text: str
    source_url: str | None = None
    published_at: datetime | None = None


# ── market/update ──
class MarketItemIn(BaseModel):
    symbol: str = Field(max_length=20)
    price: float
    change_pct: float | None = None
    volume: float | None = None
    timestamp: datetime | None = None
    source: str | None = Field(default=None, max_length=50)


class MarketUpdateResponse(BaseModel):
    upserted: int


# ── notifications/send ──
class NotificationSendRequest(BaseModel):
    user_ids: list[uuid.UUID]
    title: str = Field(max_length=255)
    body: str | None = None
    data: dict[str, Any] = Field(default_factory=dict)


class NotificationSendResponse(BaseModel):
    inserted: int
    fcm_attempted: int


# ── task triggers ──
class ScanArticlesRequest(BaseModel):
    article_ids: list[uuid.UUID] = []


class TriggerMutationRequest(BaseModel):
    crisis_id: uuid.UUID
    trigger_reason: str = "scheduled"


class TaskAcceptedResponse(BaseModel):
    task_id: str


# ── read-only internal lookups ──
class CrisisActiveId(BaseModel):
    id: uuid.UUID
    title: str


class ProUserPortfolio(BaseModel):
    user_id: uuid.UUID
    email: str
    portfolio_count: int


class MonitoredActor(BaseModel):
    actor_id: uuid.UUID
    full_name: str
    search_query: str


class CrisisSubscriptions(BaseModel):
    user_ids: list[uuid.UUID]
    fcm_tokens: list[str]


class TripwireEventRecent(BaseModel):
    id: uuid.UUID
    tripwire_id: uuid.UUID
    article_id: uuid.UUID | None = None
    confidence: float | None = None
    detected_at: datetime
    notified_at: datetime | None = None
