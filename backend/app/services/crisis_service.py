"""Business logic crisis & scenario."""
from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.actor import Actor
from app.models.crisis import Crisis
from app.models.crisis_actor import CrisisActor
from app.models.news_article import NewsArticle
from app.models.scenario import Scenario
from app.models.scenario_mutation import ScenarioMutation
from app.models.tripwire import Tripwire


async def list_crises(
    db: AsyncSession,
    *,
    page: int,
    size: int,
    status_filter: str | None,
    region: str | None,
    crisis_type: str | None,
) -> tuple[list[Crisis], int]:
    stmt = select(Crisis)
    count_stmt = select(func.count(Crisis.id))

    if status_filter:
        stmt = stmt.where(Crisis.status == status_filter)
        count_stmt = count_stmt.where(Crisis.status == status_filter)
    if region:
        stmt = stmt.where(Crisis.region == region)
        count_stmt = count_stmt.where(Crisis.region == region)
    if crisis_type:
        stmt = stmt.where(Crisis.crisis_type == crisis_type)
        count_stmt = count_stmt.where(Crisis.crisis_type == crisis_type)

    total = int(await db.scalar(count_stmt) or 0)
    stmt = (
        stmt.order_by(Crisis.severity_level.desc().nullslast(), Crisis.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    rows = list((await db.scalars(stmt)).all())
    return rows, total


async def news_counts(db: AsyncSession, crisis_ids: list[uuid.UUID]) -> dict:
    """Map {crisis_id: number of grouped news_articles} (Layer 2)."""
    if not crisis_ids:
        return {}
    rows = await db.execute(
        select(NewsArticle.crisis_id, func.count(NewsArticle.id))
        .where(NewsArticle.crisis_id.in_(crisis_ids))
        .group_by(NewsArticle.crisis_id)
    )
    return {cid: int(n) for cid, n in rows.all()}


async def list_crisis_news(
    db: AsyncSession, crisis_id: uuid.UUID, *, limit: int = 50
) -> list[NewsArticle]:
    stmt = (
        select(NewsArticle)
        .where(NewsArticle.crisis_id == crisis_id)
        .order_by(NewsArticle.published_at.desc().nullslast(),
                  NewsArticle.ingested_at.desc())
        .limit(limit)
    )
    return list((await db.scalars(stmt)).all())


async def get_crisis(db: AsyncSession, crisis_id: uuid.UUID) -> Crisis:
    crisis = await db.get(Crisis, crisis_id)
    if crisis is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Crisis not found"
        )
    return crisis


async def get_current_scenarios(
    db: AsyncSession, crisis_id: uuid.UUID
) -> list[Scenario]:
    stmt = (
        select(Scenario)
        .where(Scenario.crisis_id == crisis_id, Scenario.is_current.is_(True))
        .order_by(Scenario.probability.desc())
    )
    return list((await db.scalars(stmt)).all())


async def get_crisis_actors(db: AsyncSession, crisis_id: uuid.UUID) -> list[Actor]:
    stmt = (
        select(Actor)
        .join(CrisisActor, CrisisActor.actor_id == Actor.id)
        .where(CrisisActor.crisis_id == crisis_id)
        .order_by(Actor.full_name)
    )
    return list((await db.scalars(stmt)).all())


async def get_active_tripwires(
    db: AsyncSession, crisis_id: uuid.UUID
) -> list[Tripwire]:
    stmt = (
        select(Tripwire)
        .where(Tripwire.crisis_id == crisis_id, Tripwire.is_active.is_(True))
        .order_by(Tripwire.severity)
    )
    return list((await db.scalars(stmt)).all())


async def get_scenario_history(
    db: AsyncSession, scenario_id: uuid.UUID
) -> list[ScenarioMutation]:
    scenario = await db.get(Scenario, scenario_id)
    if scenario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found"
        )
    stmt = (
        select(ScenarioMutation)
        .where(ScenarioMutation.scenario_id == scenario_id)
        .order_by(ScenarioMutation.mutated_at.desc())
    )
    return list((await db.scalars(stmt)).all())
