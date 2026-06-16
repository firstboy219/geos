"""Crisis & scenario schemas (BAB 5.3)."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.actor import ActorResponse


class ScenarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    crisis_id: uuid.UUID
    name: str
    probability: float
    rung: int | None = None
    vector_escalation: str | None = None
    vector_hybrid: str | None = None
    vector_duration: str | None = None
    narrative_text: str | None = None
    confidence_score: float | None = None
    version: int
    is_current: bool
    created_at: datetime


class TripwireResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    category: str | None = None
    description: str | None = None
    severity: str | None = None
    threshold: float
    is_active: bool
    last_fired_at: datetime | None = None
    created_at: datetime


class CrisisListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    image_url: str | None = None  # Layer 2 / Home-3 — representative source image
    region: str | None = None
    sub_region: str | None = None
    crisis_type: str | None = None
    severity_level: int | None = None
    status: str
    redline_index: float
    misread_score: float
    shock_multiplier: float
    gray_zone: bool
    tdi_alert: bool
    started_at: datetime | None = None
    created_at: datetime
    news_count: int = 0  # Layer 2 — number of grouped source articles


class CrisisNewsItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    source_name: str | None = None
    url: str
    content_summary: str | None = None
    published_at: datetime | None = None
    credibility_score: float


class CrisisResponse(CrisisListItem):
    description: str | None = None
    csi_average: float
    rfs_average: float
    credibility_score: float
    nuclear_adjacent: bool
    resolved_at: datetime | None = None
    updated_at: datetime


class CrisisDetailResponse(CrisisResponse):
    scenarios: list[ScenarioResponse] = []
    actors: list[ActorResponse] = []
    tripwires: list[TripwireResponse] = []


class ScenarioMutationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    scenario_id: uuid.UUID
    old_probability: float | None = None
    new_probability: float | None = None
    reason: str | None = None
    tripwire_id: uuid.UUID | None = None
    mutated_at: datetime
