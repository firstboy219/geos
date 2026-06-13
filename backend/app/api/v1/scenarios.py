"""Scenario endpoints (/scenarios)."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, require_tier
from app.models.user import User
from app.schemas.crisis import ScenarioMutationResponse
from app.services import crisis_service

router = APIRouter(prefix="/scenarios", tags=["scenarios"])


@router.get("/{scenario_id}/history", response_model=list[ScenarioMutationResponse])
async def get_scenario_history(
    scenario_id: uuid.UUID,
    _user: User = Depends(require_tier("pro")),  # PRO required (BAB 5.2)
    db: AsyncSession = Depends(get_db),
) -> list[ScenarioMutationResponse]:
    mutations = await crisis_service.get_scenario_history(db, scenario_id)
    return [ScenarioMutationResponse.model_validate(m) for m in mutations]
