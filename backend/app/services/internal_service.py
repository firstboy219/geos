"""Business logic untuk endpoint /internal/* (dipanggil n8n)."""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, func, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.actor import Actor
from app.models.crisis import Crisis
from app.models.crisis_actor import CrisisActor
from app.models.impact import Impact
from app.models.market_data import MarketData
from app.models.news_article import NewsArticle
from app.models.personal_impact import PersonalImpact
from app.models.scenario import Scenario
from app.models.scenario_mutation import ScenarioMutation
from app.models.tripwire import Tripwire
from app.models.tripwire_event import TripwireEvent
from app.models.user import User
from app.models.user_portfolio import UserPortfolio
from app.schemas.internal import MarketItemIn, NewsArticleIn


async def ingest_news(
    db: AsyncSession, articles: list[NewsArticleIn]
) -> list[uuid.UUID]:
    """Bulk insert news_articles, skip URL duplikat. Return id yang baru."""
    if not articles:
        return []

    # Dedup terhadap URL yang sudah ada.
    urls = [a.url for a in articles]
    existing = set(
        (
            await db.scalars(
                select(NewsArticle.url).where(NewsArticle.url.in_(urls))
            )
        ).all()
    )

    new_ids: list[uuid.UUID] = []
    seen: set[str] = set()
    for art in articles:
        if art.url in existing or art.url in seen:
            continue
        seen.add(art.url)
        row = NewsArticle(
            id=uuid.uuid4(),
            title=art.title,
            source_name=art.source_name or art.source,
            url=art.url,
            image_url=art.image_url,
            content_summary=art.content_summary or art.content,
            published_at=art.published_at,
            credibility_score=art.credibility_score,
            language=art.language,
            crisis_id=art.crisis_id,
        )
        db.add(row)
        new_ids.append(row.id)

    await db.commit()
    return new_ids


async def purge_old_news(db: AsyncSession, *, months: int = 4) -> dict:
    """Retention — hapus news_articles yang umurnya > `months` (by ingested_at)."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=months * 30)
    res = await db.execute(
        delete(NewsArticle).where(NewsArticle.ingested_at < cutoff)
    )
    await db.commit()
    return {"deleted": int(res.rowcount or 0), "cutoff": cutoff.isoformat()}


async def purge_old_data(db: AsyncSession, *, months: int = 4) -> dict:
    """Retention — hapus SEMUA data yang di-generate (situasi + skenario + dampak
    + berita + personal impact) yang umurnya > `months`. FK ondelete tidak
    lengkap (tripwires/news/scenario_mutations), jadi hapus berurutan eksplisit.
    Situasi dihitung dari created_at; berita dari ingested_at."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=months * 30)
    counts: dict[str, int] = {}

    old_crises = select(Crisis.id).where(Crisis.created_at < cutoff)
    scen_ids = select(Scenario.id).where(Scenario.crisis_id.in_(old_crises))
    trip_ids = select(Tripwire.id).where(Tripwire.crisis_id.in_(old_crises))

    async def _del(name, stmt):
        res = await db.execute(stmt)
        counts[name] = int(res.rowcount or 0)

    # children first → parents last (works regardless of FK ondelete)
    await _del("scenario_mutations", delete(ScenarioMutation).where(
        ScenarioMutation.scenario_id.in_(scen_ids)
        | ScenarioMutation.tripwire_id.in_(trip_ids)
    ))
    await _del("tripwire_events", delete(TripwireEvent).where(
        TripwireEvent.tripwire_id.in_(trip_ids)
    ))
    await _del("scenarios", delete(Scenario).where(Scenario.crisis_id.in_(old_crises)))
    await _del("impacts", delete(Impact).where(Impact.crisis_id.in_(old_crises)))
    await _del("crisis_actors", delete(CrisisActor).where(CrisisActor.crisis_id.in_(old_crises)))
    await _del("tripwires", delete(Tripwire).where(Tripwire.crisis_id.in_(old_crises)))
    # detach any still-referencing articles so the crisis delete won't be blocked
    await db.execute(
        NewsArticle.__table__.update()
        .where(NewsArticle.crisis_id.in_(old_crises))
        .values(crisis_id=None)
    )
    await _del("crises", delete(Crisis).where(Crisis.created_at < cutoff))
    await _del("news_articles", delete(NewsArticle).where(NewsArticle.ingested_at < cutoff))
    await _del("personal_impacts", delete(PersonalImpact).where(PersonalImpact.created_at < cutoff))
    # orphaned auto-generated actors (no remaining crisis link), aged out
    await _del("actors", delete(Actor).where(
        Actor.created_at < cutoff,
        Actor.id.notin_(select(CrisisActor.actor_id)),
    ))

    await db.commit()
    return {"cutoff": cutoff.isoformat(), "deleted": counts}


async def reset_auto_situations(db: AsyncSession) -> dict:
    """Detach articles from + delete all auto-grouped situations (for recluster).
    FK-safe order (some FKs lack ondelete)."""
    auto = select(Crisis.id).where(Crisis.auto_grouped.is_(True))
    scen = select(Scenario.id).where(Scenario.crisis_id.in_(auto))
    trip = select(Tripwire.id).where(Tripwire.crisis_id.in_(auto))
    await db.execute(delete(ScenarioMutation).where(
        ScenarioMutation.scenario_id.in_(scen) | ScenarioMutation.tripwire_id.in_(trip)))
    await db.execute(delete(TripwireEvent).where(TripwireEvent.tripwire_id.in_(trip)))
    await db.execute(delete(Scenario).where(Scenario.crisis_id.in_(auto)))
    await db.execute(delete(Impact).where(Impact.crisis_id.in_(auto)))
    await db.execute(delete(CrisisActor).where(CrisisActor.crisis_id.in_(auto)))
    await db.execute(delete(Tripwire).where(Tripwire.crisis_id.in_(auto)))
    await db.execute(
        NewsArticle.__table__.update()
        .where(NewsArticle.crisis_id.in_(auto))
        .values(crisis_id=None)
    )
    res = await db.execute(delete(Crisis).where(Crisis.auto_grouped.is_(True)))
    await db.commit()
    return {"deleted_situations": int(res.rowcount or 0)}


async def update_actor_statement(
    db: AsyncSession,
    *,
    actor_id: uuid.UUID,
    statement_text: str,
    published_at: datetime | None,
) -> Actor | None:
    actor = await db.get(Actor, actor_id)
    if actor is None:
        return None
    actor.last_statement = statement_text
    actor.last_statement_date = published_at or datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(actor)
    return actor


async def upsert_market(db: AsyncSession, items: list[MarketItemIn]) -> int:
    """Insert baris market_data baru (time-series append)."""
    if not items:
        return 0
    rows = [
        {
            "id": uuid.uuid4(),
            "symbol": it.symbol,
            "price": it.price,
            "change_pct": it.change_pct,
            "volume": it.volume,
            "recorded_at": it.timestamp or datetime.now(timezone.utc),
            "source": it.source,
        }
        for it in items
    ]
    await db.execute(pg_insert(MarketData), rows)
    await db.commit()
    return len(rows)


async def active_crisis_ids(db: AsyncSession) -> list[Crisis]:
    stmt = select(Crisis).where(Crisis.status == "active").order_by(Crisis.title)
    return list((await db.scalars(stmt)).all())


async def pro_users_with_portfolio(db: AsyncSession) -> list[dict]:
    stmt = (
        select(
            User.id,
            User.email,
            func.count(UserPortfolio.id).label("portfolio_count"),
        )
        .join(UserPortfolio, UserPortfolio.user_id == User.id)
        .where(User.tier.in_(("pro", "enterprise")), User.is_active.is_(True))
        .group_by(User.id, User.email)
        .having(func.count(UserPortfolio.id) > 0)
    )
    rows = (await db.execute(stmt)).all()
    return [
        {"user_id": r.id, "email": r.email, "portfolio_count": int(r.portfolio_count)}
        for r in rows
    ]


async def monitored_actors(db: AsyncSession) -> list[dict]:
    """Aktor yang terhubung ke krisis aktif → kandidat untuk monitor n8n."""
    stmt = (
        select(Actor)
        .join(CrisisActor, CrisisActor.actor_id == Actor.id)
        .join(Crisis, Crisis.id == CrisisActor.crisis_id)
        .where(Crisis.status == "active")
        .distinct()
        .order_by(Actor.full_name)
    )
    actors = list((await db.scalars(stmt)).all())
    return [
        {
            "actor_id": a.id,
            "full_name": a.full_name,
            "search_query": f'"{a.full_name}" statement OR speech OR says',
        }
        for a in actors
    ]


async def crisis_subscriptions(db: AsyncSession, crisis_id: uuid.UUID) -> dict:
    """Subscriber sebuah krisis.

    Saat ini disederhanakan: semua user aktif dianggap subscriber krisis aktif
    (belum ada tabel subscriptions di BAB 4). Mengembalikan user_ids + fcm_tokens.
    """
    stmt = select(User.id, User.fcm_token).where(User.is_active.is_(True))
    rows = (await db.execute(stmt)).all()
    user_ids = [r.id for r in rows]
    fcm_tokens = [r.fcm_token for r in rows if r.fcm_token]
    return {"user_ids": user_ids, "fcm_tokens": fcm_tokens}


async def recent_tripwire_events(
    db: AsyncSession, minutes: int
) -> list[TripwireEvent]:
    since = datetime.now(timezone.utc) - timedelta(minutes=minutes)
    stmt = (
        select(TripwireEvent)
        .where(TripwireEvent.detected_at >= since)
        .order_by(TripwireEvent.detected_at.desc())
    )
    return list((await db.scalars(stmt)).all())
