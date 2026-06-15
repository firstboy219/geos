"""Impact (Dampak) schemas."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ImpactItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    crisis_id: uuid.UUID
    crisis_title: str | None = None
    category: str
    title: str
    direction: str | None = None
    severity: str | None = None
    timeframe: str | None = None
    detail: str | None = None
    confidence: float
    created_at: datetime


class PersonalImpactRequest(BaseModel):
    crisis_id: uuid.UUID | None = None


class PersonalImpactItem(BaseModel):
    area: str
    finding: str
    recommendation: str
    timeframe: str = ""


class PersonalImpactResponse(BaseModel):
    profile_complete: bool
    summary: str
    items: list[PersonalImpactItem] = []
    disclaimer: str = ""
    generated_at: str
