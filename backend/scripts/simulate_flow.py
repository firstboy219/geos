"""End-to-end pipeline simulation / verification.

Runs the full chain in order and prints DB counts at each stage so you can
confirm every AI-generated artifact is persisted, and previews what the
4-month retention would purge.

Run inside the backend container:
    docker exec -it geoscan-backend python scripts/simulate_flow.py
Optional: pass a phone/email of an existing user for the personal-impact step.
"""
from __future__ import annotations

import asyncio
import sys
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select

from app.core.database import AsyncSessionLocal
from app.models.crisis import Crisis
from app.models.impact import Impact
from app.models.news_article import NewsArticle
from app.models.personal_impact import PersonalImpact
from app.models.scenario import Scenario
from app.models.tripwire import Tripwire
from app.models.user import User
from app.services.ai import pipeline, personal_impact


async def _counts(db) -> dict:
    async def c(model, *where):
        stmt = select(func.count()).select_from(model)
        for w in where:
            stmt = stmt.where(w)
        return int(await db.scalar(stmt) or 0)

    return {
        "news_articles": await c(NewsArticle),
        "  summarized": await c(NewsArticle, NewsArticle.summary_points.isnot(None)),
        "  grouped": await c(NewsArticle, NewsArticle.crisis_id.isnot(None)),
        "crises (situasi)": await c(Crisis),
        "scenarios": await c(Scenario),
        "tripwires": await c(Tripwire),
        "impacts (dampak)": await c(Impact),
        "personal_impacts": await c(PersonalImpact),
    }


def _print(title: str, d: dict) -> None:
    print(f"\n── {title} ──")
    for k, v in d.items():
        print(f"   {k:<22} {v}")


async def main() -> None:
    user_key = sys.argv[1] if len(sys.argv) > 1 else None

    async with AsyncSessionLocal() as db:
        _print("BEFORE", await _counts(db))

    print("\n[1/5] summarize_news (AI points+quotes) ...")
    print("   ", await pipeline.run_summarize_news(500))
    print("[2/5] group_news (→ situasi) ...")
    print("   ", await pipeline.run_group_news())
    print("[3/5] generate_missing_scenarios (16-layer) ...")
    print("   ", await pipeline.run_generate_missing_scenarios(50))
    print("[4/5] generate_missing_impacts (dampak) ...")
    print("   ", await pipeline.run_generate_missing_impacts(50))

    print("[5/5] personal impact ...")
    async with AsyncSessionLocal() as db:
        user = None
        if user_key:
            user = (
                await db.execute(
                    select(User).where(
                        (User.email == user_key) | (User.phone == user_key)
                    )
                )
            ).scalar_one_or_none()
        if user is None:
            user = (await db.execute(select(User).limit(1))).scalar_one_or_none()
        if user is not None:
            if not user.profession:
                user.profession, user.country = "Software Engineer", "Indonesia"
                user.city, user.birth_year = "Surabaya", 1990
                await db.commit()
            res = await personal_impact.analyze_personal(db, user)
            print("   ", {"profile_complete": res["profile_complete"],
                          "items": len(res.get("items", []))})
        else:
            print("   (no user found — skipped)")

    async with AsyncSessionLocal() as db:
        _print("AFTER", await _counts(db))
        # retention preview (4 months)
        cutoff = datetime.now(timezone.utc) - timedelta(days=4 * 30)
        old_news = int(await db.scalar(
            select(func.count()).select_from(NewsArticle).where(NewsArticle.ingested_at < cutoff)) or 0)
        old_cris = int(await db.scalar(
            select(func.count()).select_from(Crisis).where(Crisis.created_at < cutoff)) or 0)
        print(f"\n── RETENTION (cutoff {cutoff.date()}) ──")
        print(f"   news_articles older than 4mo : {old_news}")
        print(f"   crises older than 4mo        : {old_cris}")
        print("   (run POST /internal/news/purge or scripts/purge_old_news.sh to delete)")


if __name__ == "__main__":
    asyncio.run(main())
