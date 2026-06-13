"""Mutation Engine — orchestrates the 4 AI layers into updated scenario probabilities.

Flow (per dev-doc Fase 5 / KB BAB 8.1):
  Layer 1 find_similar_events → Layer 2 apply_filter → Layer 3 actor weights →
  Layer 4 tripwire pressure → Bayesian-style normalize → narrative → persist →
  Redis pub/sub broadcast for WebSocket.
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.redis_client import crisis_channel, publish_event
from app.models.actor import Actor
from app.models.crisis import Crisis
from app.models.crisis_actor import CrisisActor
from app.models.scenario import Scenario
from app.models.scenario_mutation import ScenarioMutation
from app.models.tripwire import Tripwire
from app.models.tripwire_event import TripwireEvent
from app.services.ai.anachronism_filter import apply_filter
from app.services.ai.historical_matcher import find_similar_events
from app.services.ai.maverick_factor import calculate_actor_weight

logger = logging.getLogger("geoscan.ai.mutation")

_NARRATIVE_SYSTEM = (
    "You are a senior geopolitical analyst writing for educated non-expert "
    "audiences. Write clearly, avoid jargon, connect events to real-world impacts."
)


async def calculate_probabilities(
    db: AsyncSession, crisis_id: str, trigger_reason: str
) -> list[dict]:
    crisis = await db.get(Crisis, crisis_id)
    if crisis is None:
        logger.warning("calculate_probabilities: crisis %s not found", crisis_id)
        return []

    scenarios = (
        await db.execute(
            select(Scenario).where(
                Scenario.crisis_id == crisis.id, Scenario.is_current.is_(True)
            )
        )
    ).scalars().all()
    if not scenarios:
        return []

    actors = (
        await db.execute(
            select(Actor)
            .join(CrisisActor, CrisisActor.actor_id == Actor.id)
            .where(CrisisActor.crisis_id == crisis.id)
        )
    ).scalars().all()

    # ── Layer 1 + 2 ──
    matches = await find_similar_events(crisis.description or crisis.title or "")
    filtered = await apply_filter(matches, {"title": crisis.title, "description": crisis.description})
    hist_top = filtered[0]["adjusted_score"] if filtered else 0.5

    # ── Layer 3 ──
    weights, confs = [], []
    for a in actors:
        w = await calculate_actor_weight(
            {
                "id": str(a.id),
                "full_name": a.full_name,
                "country": a.country,
                "decision_style": a.decision_style,
                "rcs_score": a.rcs_score,
                "csi_score": a.csi_score,
                "rfs_score": a.rfs_score,
            },
            a.last_statement or f"No recent statement from {a.full_name}.",
            crisis.title,
        )
        weights.append(w["weight"])
        confs.append(w["confidence"])
    mean_weight = sum(weights) / len(weights) if weights else 1.0
    mean_conf = sum(confs) / len(confs) if confs else 0.5

    # ── Layer 4: tripwire pressure (last 24h) ──
    since = datetime.now(timezone.utc) - timedelta(hours=24)
    recent_events = (
        await db.execute(
            select(func.count(TripwireEvent.id))
            .join(Tripwire, Tripwire.id == TripwireEvent.tripwire_id)
            .where(Tripwire.crisis_id == crisis.id, TripwireEvent.detected_at >= since)
        )
    ).scalar() or 0
    pressure = min(0.5, recent_events * 0.05) * mean_weight

    # ── Recompute: escalation pressure shifts mass toward higher-rung scenarios.
    #    Shock Multiplier (Layer M) amplifies that pressure. Then normalize to 1.0.
    shock = crisis.shock_multiplier or 1.0
    raw: list[float] = []
    for s in scenarios:
        rung = s.rung or 1
        factor = 1.0 + pressure * shock * (rung - 1) / 5.0
        raw.append(max(1e-4, (s.probability or 0.0) * factor))
    total = sum(raw) or 1.0
    new_probs = [r / total for r in raw]

    # ── Narrative + persist ──
    updated: list[dict] = []
    hist_summary = "; ".join(
        f"{m.get('title')} ({m.get('year')})" for m in filtered[:3]
    ) or "no strong historical analogues"
    actors_summary = ", ".join(a.full_name for a in actors) or "n/a"

    for s, new_p in zip(scenarios, new_probs):
        old_p = s.probability or 0.0
        narrative = await _narrative(crisis, s, new_p, hist_summary, actors_summary)

        s.probability = round(new_p, 4)
        s.confidence_score = round(
            max(0.4, min(0.95, 0.5 + 0.3 * hist_top + 0.2 * mean_conf)), 4
        )
        s.narrative_text = narrative or s.narrative_text
        s.version = (s.version or 1) + 1
        db.add(
            ScenarioMutation(
                scenario_id=s.id,
                old_probability=old_p,
                new_probability=s.probability,
                reason=trigger_reason,
            )
        )
        updated.append(
            {
                "scenario_id": str(s.id),
                "name": s.name,
                "old_probability": round(old_p, 4),
                "probability": s.probability,
                "confidence_score": s.confidence_score,
            }
        )

    crisis.updated_at = datetime.now(timezone.utc)
    await db.commit()

    try:
        from app.core.observability import inc_mutation

        inc_mutation(trigger_reason)
    except Exception:
        pass

    # ── Broadcast for WebSocket subscribers ──
    try:
        await publish_event(
            crisis_channel(str(crisis.id)),
            {
                "type": "scenario_update",
                "data": {
                    "crisis_id": str(crisis.id),
                    "trigger_reason": trigger_reason,
                    "scenarios": updated,
                },
            },
        )
    except Exception as exc:
        logger.warning("publish scenario_update failed: %s", exc)

    logger.info(
        "mutation crisis=%s reason=%s scenarios=%d events24h=%d",
        crisis.id, trigger_reason, len(updated), recent_events,
    )
    return updated


async def _narrative(crisis, scenario, prob, hist_summary, actors_summary) -> str:
    from app.services.ai.llm_client import generate_text

    user = (
        f"Crisis: {crisis.title} ({crisis.region})\n"
        f"Scenario: {scenario.name}\nProbability: {round(prob * 100)}%\n"
        f"Escalation vector: {scenario.vector_escalation}\n"
        f"Historical precedents: {hist_summary}\n"
        f"Key actors: {actors_summary}\n"
        "Write a 2-3 paragraph analysis explaining WHY this scenario has this "
        "probability, what conditions support it, and what it means for Indonesia "
        "specifically. Clear, direct language. No bullet points."
    )
    try:
        return await generate_text(_NARRATIVE_SYSTEM, user, temperature=0.6)
    except Exception as exc:
        logger.warning("narrative generation failed: %s", exc)
        return ""
