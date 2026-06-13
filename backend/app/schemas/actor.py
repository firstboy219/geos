"""Actor schemas (BAB 5.3)."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ActorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    title: str | None = None
    country: str | None = None
    organization: str | None = None
    decision_style: str | None = None
    rcs_score: float
    risk_appetite: str | None = None
    csi_score: float
    rfs_score: float
    bio_summary: str | None = None
    last_statement: str | None = None
    last_statement_date: datetime | None = None
    created_at: datetime


class ActorListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    title: str | None = None
    country: str | None = None
    decision_style: str | None = None
    rcs_score: float
    risk_appetite: str | None = None
