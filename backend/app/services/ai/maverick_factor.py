"""Layer 3 — Maverick Factor (actor statement weighting via Gemini)."""
from __future__ import annotations

import logging

from app.services.ai.llm_client import generate_json

logger = logging.getLogger("geoscan.ai.maverick")

_SYSTEM = "You are an expert in political psychology and rhetorical analysis. Return ONLY valid JSON."


async def calculate_actor_weight(actor: dict, statement: str, context: str = "") -> dict:
    """Classify an actor statement (bluff/credible/ambiguous) and compute its weight.

    `actor` is a plain dict with: full_name, country, decision_style, rcs_score,
    csi_score, rfs_score.
    """
    rcs = float(actor.get("rcs_score") or 50.0)
    csi = float(actor.get("csi_score") or 5.0)
    rfs = float(actor.get("rfs_score") or 5.0)

    user = (
        f"Actor profile:\n- Name: {actor.get('full_name')}, Country: {actor.get('country')}\n"
        f"- Decision style: {actor.get('decision_style')}\n"
        f"- RCS (rhetorical consistency): {rcs}/100\n"
        f"- CSI (cognitive stress): {csi}/10\n"
        f"- RFS (regime fragility): {rfs}/10\n"
        f"Statement: '{statement}'\nCrisis context: {context}\n"
        "Classify this statement: A = pure bluff / political theater, "
        "B = credible warning / genuine signal, C = ambiguous.\n"
        'Return JSON: {"classification": "A"|"B"|"C", "confidence": 0.0-1.0, "reasoning": "string"}'
    )

    try:
        data = await generate_json(_SYSTEM, user, temperature=0.2)
        classification = str(data.get("classification", "C")).upper()[:1]
        if classification not in ("A", "B", "C"):
            classification = "C"
        confidence = float(data.get("confidence") or 0.5)
        reasoning = data.get("reasoning", "")
    except Exception as exc:
        logger.warning("maverick LLM failed for %s: %s", actor.get("full_name"), exc)
        classification, confidence, reasoning = "C", 0.4, "fallback"

    base = rcs / 100.0
    weight = {"A": base * 0.3, "B": base * 1.2, "C": base * 0.7}[classification]

    corrections = []
    if rfs > 7:  # desperate actor
        weight *= 1.4
        corrections.append("rfs>7 desperate_actor x1.4")
    if csi > 7:  # irrational decision risk
        weight *= 1.2
        corrections.append("csi>7 irrational_risk x1.2")
    weight = min(weight, 1.5)

    return {
        "actor_id": actor.get("id"),
        "weight": round(weight, 4),
        "classification": classification,
        "confidence": confidence,
        "reasoning": reasoning,
        "corrections_applied": corrections,
    }
