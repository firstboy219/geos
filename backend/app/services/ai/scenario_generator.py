"""16-layer scenario GENERATION for a situation (crisis).

mutation_engine only *mutates* existing scenarios; this module *creates* the
initial framework analysis for an auto-grouped situation: framework scores,
key actors, projection scenarios, and tripwires — via one Gemini JSON call
grounded in the situation's member news (+ optional historical matches).

Idempotent: skips a crisis that already has current scenarios unless force=True.
"""
from __future__ import annotations

import json
import logging
import uuid

from sqlalchemy import func, select

from app.models.actor import Actor
from app.models.crisis import Crisis
from app.models.crisis_actor import CrisisActor
from app.models.news_article import NewsArticle
from app.models.scenario import Scenario
from app.models.tripwire import Tripwire
from app.services.ai.llm_client import generate_json

logger = logging.getLogger("geoscan.ai.scenario_gen")

_CRISIS_TYPES = {"military", "economic", "cyber", "diplomatic", "hybrid"}

_SYSTEM = (
    "Anda mesin analisis geopolitik dengan framework 16 lapis (Redline, "
    "Perception/Misread, Escalation Ladder rung 1-6, Bayesian probability, "
    "Gray Zone, Cognitive Stress CSI, Regime Fragility RFS, Shock Multiplier). "
    "Diberikan sebuah SITUASI beserta berita-berita anggotanya, hasilkan "
    "analisis terstruktur dalam Bahasa Indonesia. Balas HANYA JSON valid:\n"
    "{\n"
    '  "framework": {"severity_level": <1-10>, "redline_index": <0-10>, '
    '"misread_score": <0-10>, "csi_average": <0-10>, "rfs_average": <0-10>, '
    '"gray_zone": <bool>, "shock_multiplier": <1.0-1.3>, "region": <str>, '
    '"crisis_type": "military|economic|cyber|diplomatic|hybrid"},\n'
    '  "actors": [{"full_name": <str>, "country": <str>, "decision_style": '
    '"Ideological|Pragmatic|Opportunistic", "rcs_score": <0-100>, '
    '"csi_score": <0-10>, "rfs_score": <0-10>, "role": "primary|secondary"}],\n'
    '  "scenarios": [{"name": <str>, "probability": <int %>, "rung": <1-6>, '
    '"vector_escalation": <str>, "vector_hybrid": <str>, "vector_duration": '
    '<str>, "confidence_score": <0-100>, "narrative": <str ringkas, dampak '
    'nyata ke investor/ekonomi>}],\n'
    '  "tripwires": [{"name": <str>, "category": <str>, "description": <str>, '
    '"severity": "low|medium|high|critical", "threshold": <0-1>}]\n'
    "}\n"
    "Buat 3-5 skenario; total probability ~100. 1-3 aktor kunci. 2-4 tripwire."
)


def _f(v, default: float, lo: float, hi: float) -> float:
    try:
        return max(lo, min(hi, float(v)))
    except (TypeError, ValueError):
        return default


async def _build_user(db, crisis: Crisis) -> str:
    arts = (
        await db.execute(
            select(NewsArticle.title, NewsArticle.summary_points)
            .where(NewsArticle.crisis_id == crisis.id)
            .limit(15)
        )
    ).all()
    lines = []
    for title, points in arts:
        pts = " ".join(p for p in (points or []) if isinstance(p, str))[:300]
        lines.append({"title": title, "points": pts})
    payload = {
        "situation": crisis.title,
        "description": crisis.description or "",
        "articles": lines,
    }
    return "SITUASI:\n" + json.dumps(payload, ensure_ascii=False)


async def generate_for_crisis(db, crisis_id, *, force: bool = False) -> dict:
    crisis = await db.get(Crisis, uuid.UUID(str(crisis_id)))
    if crisis is None:
        return {"status": "crisis_not_found", "crisis_id": str(crisis_id)}

    existing = int(
        await db.scalar(
            select(func.count(Scenario.id)).where(
                Scenario.crisis_id == crisis.id, Scenario.is_current.is_(True)
            )
        )
        or 0
    )
    if existing and not force:
        return {"status": "skipped_has_scenarios", "crisis_id": str(crisis.id)}

    try:
        data = await generate_json(_SYSTEM, await _build_user(db, crisis), temperature=0.4)
    except Exception as exc:  # noqa: BLE001
        logger.warning("scenario gen failed for %s: %s", crisis.id, exc)
        return {"status": "ai_error", "crisis_id": str(crisis.id), "error": str(exc)}

    # ── framework fields on the crisis ──
    fw = data.get("framework") or {}
    crisis.severity_level = int(_f(fw.get("severity_level"), 5, 1, 10))
    crisis.redline_index = _f(fw.get("redline_index"), 5, 0, 10)
    crisis.misread_score = _f(fw.get("misread_score"), 5, 0, 10)
    crisis.csi_average = _f(fw.get("csi_average"), 5, 0, 10)
    crisis.rfs_average = _f(fw.get("rfs_average"), 5, 0, 10)
    crisis.shock_multiplier = _f(fw.get("shock_multiplier"), 1.0, 1.0, 1.5)
    crisis.gray_zone = bool(fw.get("gray_zone"))
    ctype = str(fw.get("crisis_type") or "").lower()
    crisis.crisis_type = ctype if ctype in _CRISIS_TYPES else "hybrid"
    if fw.get("region"):
        crisis.region = str(fw["region"])[:100]

    # ── retire old current scenarios (regen) ──
    if existing:
        for s in (
            await db.execute(
                select(Scenario).where(
                    Scenario.crisis_id == crisis.id, Scenario.is_current.is_(True)
                )
            )
        ).scalars().all():
            s.is_current = False

    # ── scenarios (normalize probabilities to ~100) ──
    raw_scen = [s for s in (data.get("scenarios") or []) if isinstance(s, dict)][:6]
    probs = [_f(s.get("probability"), 0, 0, 100) for s in raw_scen]
    total = sum(probs) or 1.0
    n_scen = 0
    for s, p in zip(raw_scen, probs):
        db.add(
            Scenario(
                crisis_id=crisis.id,
                name=str(s.get("name") or "Skenario")[:255],
                probability=round(p / total * 100, 1),
                rung=int(_f(s.get("rung"), 2, 1, 6)),
                vector_escalation=(s.get("vector_escalation") or None),
                vector_hybrid=(s.get("vector_hybrid") or None),
                vector_duration=(s.get("vector_duration") or None),
                narrative_text=(s.get("narrative") or None),
                confidence_score=_f(s.get("confidence_score"), 60, 0, 100),
                version=1,
                is_current=True,
            )
        )
        n_scen += 1

    # ── actors ──
    n_act = 0
    for a in [a for a in (data.get("actors") or []) if isinstance(a, dict)][:3]:
        if not a.get("full_name"):
            continue
        actor = Actor(
            full_name=str(a["full_name"])[:255],
            country=(str(a.get("country"))[:100] if a.get("country") else None),
            decision_style=(str(a.get("decision_style"))[:50] if a.get("decision_style") else None),
            rcs_score=_f(a.get("rcs_score"), 50, 0, 100),
            csi_score=_f(a.get("csi_score"), 5, 0, 10),
            rfs_score=_f(a.get("rfs_score"), 5, 0, 10),
        )
        db.add(actor)
        await db.flush()
        role = str(a.get("role") or "primary")[:100]
        db.add(CrisisActor(crisis_id=crisis.id, actor_id=actor.id, role=role))
        n_act += 1

    # ── tripwires ──
    n_tw = 0
    for t in [t for t in (data.get("tripwires") or []) if isinstance(t, dict)][:5]:
        if not t.get("name"):
            continue
        db.add(
            Tripwire(
                crisis_id=crisis.id,
                name=str(t["name"])[:255],
                category=(str(t.get("category"))[:50] if t.get("category") else None),
                description=(t.get("description") or None),
                severity=(str(t.get("severity"))[:20] if t.get("severity") else None),
                threshold=_f(t.get("threshold"), 0.75, 0, 1),
                is_active=True,
            )
        )
        n_tw += 1

    await db.commit()
    result = {
        "status": "ok",
        "crisis_id": str(crisis.id),
        "scenarios": n_scen,
        "actors": n_act,
        "tripwires": n_tw,
    }
    logger.info("scenario gen %s", result)
    return result


async def generate_missing(db, *, limit: int = 20) -> dict:
    """Generate scenarios for active crises that have none yet (backfill)."""
    sub = (
        select(Scenario.crisis_id)
        .where(Scenario.is_current.is_(True))
        .distinct()
        .subquery()
    )
    ids = (
        await db.execute(
            select(Crisis.id)
            .where(Crisis.status == "active", Crisis.id.notin_(select(sub.c.crisis_id)))
            .limit(limit)
        )
    ).scalars().all()
    results = []
    for cid in ids:
        results.append(await generate_for_crisis(db, cid))
    return {"processed": len(ids), "results": results}
