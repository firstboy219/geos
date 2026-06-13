"""Layer 2 — Anachronism Filter (modern-era discounting via Gemini)."""
from __future__ import annotations

import logging

from app.services.ai.llm_client import generate_json

logger = logging.getLogger("geoscan.ai.anachronism")

# 21st-century restraining factors considered when discounting historical analogies.
MODERN_CONSTRAINTS = {
    "nuclear_deterrence": "MAD doctrine restrains direct great-power war",
    "economic_interdependence": "trade/supply-chain links raise the cost of conflict",
    "international_law": "UN/WTO/ICC regimes constrain options",
    "information_warfare": "social-media/OSINT era reshapes escalation",
    "supply_chain_globalization": "globalized production amplifies spillover",
    "digital_surveillance": "transparency reduces strategic surprise",
}

_SYSTEM = (
    "You are a 21st-century geopolitical analyst skeptical of raw historical "
    "analogies. Modern constraints make many pre-1990 patterns less applicable. "
    "Return ONLY valid JSON."
)


async def apply_filter(matches: list[dict], crisis_context: dict) -> list[dict]:
    """Adjust each historical match's relevance for the modern era."""
    crisis_desc = crisis_context.get("description") or crisis_context.get("title") or ""
    out: list[dict] = []

    for m in matches:
        original = float(m.get("similarity_score") or 0.0)
        year = _as_int(m.get("year"))
        user = (
            f"Historical event: {m.get('title')} ({year}, {m.get('region')}). "
            f"Outcome: {m.get('outcome')}.\n"
            f"Current crisis: {crisis_desc}.\n"
            "Evaluate relevance considering: nuclear deterrence (MAD), economic "
            "interdependence, international law (UN/WTO/ICC), information-warfare era, "
            "and global supply-chain dependencies.\n"
            f"Original similarity: {original}.\n"
            'Return JSON: {"adjusted_score": 0.0-1.0, "discount_factors": [], '
            '"modern_amplifiers": [], "reasoning": "string"}'
        )
        try:
            data = await generate_json(_SYSTEM, user, temperature=0.2)
            adjusted = float(data.get("adjusted_score"))
            adjusted = max(0.0, min(1.0, adjusted))
            reasoning = data.get("reasoning", "")
            discounts = data.get("discount_factors", [])
            amplifiers = data.get("modern_amplifiers", [])
        except Exception as exc:
            logger.warning("anachronism LLM failed for %s: %s", m.get("id"), exc)
            adjusted, reasoning, discounts, amplifiers = original * 0.85, "fallback", [], []

        # Era-based guardrails on top of the LLM judgment.
        adjusted = _era_cap(year, original, adjusted)

        out.append(
            {
                **m,
                "adjusted_score": round(adjusted, 4),
                "reasoning": reasoning,
                "discount_factors": discounts,
                "modern_amplifiers": amplifiers,
            }
        )
    out.sort(key=lambda x: x["adjusted_score"], reverse=True)
    return out


def _era_cap(year: int | None, original: float, adjusted: float) -> float:
    if not year:
        return adjusted
    if year < 1945:  # pre-nuclear: cap discount at 40% (floor at 60% of original)
        return max(adjusted, original * 0.6)
    if year < 1990:  # Cold War: at least a 15% discount
        return min(adjusted, original * 0.85)
    return adjusted  # post-1990: minimal extra discount


def _as_int(v) -> int | None:
    try:
        return int(v)
    except (TypeError, ValueError):
        return None
