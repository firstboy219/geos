"""Alert schemas (BAB 5.3)."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    type: str | None = None
    severity: str | None = None
    title: str
    body: str | None = None
    crisis_id: uuid.UUID | None = None
    tripwire_id: uuid.UUID | None = None
    is_read: bool
    created_at: datetime


class UnreadCountResponse(BaseModel):
    count: int
