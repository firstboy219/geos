"""Business logic actors."""
from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.actor import Actor


async def list_actors(
    db: AsyncSession, *, country: str | None, decision_style: str | None
) -> list[Actor]:
    stmt = select(Actor)
    if country:
        stmt = stmt.where(Actor.country == country)
    if decision_style:
        stmt = stmt.where(Actor.decision_style == decision_style)
    stmt = stmt.order_by(Actor.full_name)
    return list((await db.scalars(stmt)).all())


async def get_actor(db: AsyncSession, actor_id: uuid.UUID) -> Actor:
    actor = await db.get(Actor, actor_id)
    if actor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Actor not found"
        )
    return actor
