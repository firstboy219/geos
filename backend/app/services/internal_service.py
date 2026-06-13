"""Business logic untuk endpoint /internal/* (dipanggil n8n)."""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.actor import Actor
from app.models.crisis import Crisis
from app.models.crisis_actor import CrisisActor
from app.models.market_data import MarketData
from app.models.news_article import NewsArticle
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
