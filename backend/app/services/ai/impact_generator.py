"""F2 — Dampak: generate the general consequences of a situation.

Given a situation (crisis) + its scenarios + member news, ask Gemini for broad
real-world impacts (umum) plus per-category impacts (saham/industri, crypto,
forex, properti, emas, komoditas, energi). Stored in `impacts`, served to the
Dampak menu (filterable by category).

Idempotent: skips a crisis that already has impacts unless force=True.
"""
from __future__ import annotations

import json
import logging
import uuid

from sqlalchemy import func, select

from app.models.crisis import Crisis
from app.models.impact import IMPACT_CATEGORIES, Impact
from app.models.news_article import NewsArticle
from app.models.scenario import Scenario
from app.services.ai.llm_client import generate_json

logger = logging.getLogger("geoscan.ai.impact_gen")

_DIRS = {"up", "down", "neutral", "mixed"}
_SEV = {"low", "medium", "high"}

_SYSTEM = (
    "Anda analis dampak. Diberikan sebuah SITUASI geopolitik dan SATU SKENARIO "
    "proyeksinya beserta beritanya, jabarkan DAMPAK UMUM yang luas dan konkret "
    "bagi masyarakat dan ekonomi JIKA SKENARIO INI TERJADI (contoh: ekspor-impor "
    "turun, harga BBM retail naik, sekolah tutup, pariwisata anjlok) DAN dampak "
    "ke kategori aset. Balas HANYA JSON:\n"
    '{"impacts":[{"category":"general|stocks|industry|crypto|forex|property|'
    'gold|commodity|energy","title":<str ringkas>,"direction":"up|down|neutral|'
    'mixed","severity":"low|medium|high","timeframe":<str cth \'1-3 bulan\'>,'
    '"detail":<str penjelasan singkat & alasan>,"confidence":<0-1>}]}\n'
    "Berikan 6-10 dampak untuk skenario ini; usahakan mencakup kategori "
    "'general' dan beberapa kelas aset (saham/emas/forex/crypto/properti). "
    "Bahasa Indonesia."
)


def _f(v, default: float, lo: float, hi: float) -> float:
    try:
        return max(lo, min(hi, float(v)))
    except (TypeError, ValueError):
        return default


async def _build_user(db, crisis: Crisis, scenario: Scenario) -> str:
    news = (
        await db.execute(
            select(NewsArticle.title).where(NewsArticle.crisis_id == crisis.id).limit(10)
        )
    ).scalars().all()
    payload = {
        "situation": crisis.title,
        "description": crisis.description or "",
        "scenario": {
            "name": scenario.name,
            "probability": scenario.probability,
            "narrative": (scenario.narrative_text or "")[:400],
        },
        "headlines": list(news),
    }
    return "SITUASI:\n" + json.dumps(payload, ensure_ascii=False)


def _persist_impacts(db, crisis: Crisis, scenario: Scenario, data: dict) -> int:
    """Persist the AI impact items for one scenario; returns count stored."""
    n = 0
    for it in [x for x in (data.get("impacts") or []) if isinstance(x, dict)][:20]:
        if not it.get("title"):
            continue
        cat = str(it.get("category") or "general").lower()
        if cat not in IMPACT_CATEGORIES:
            cat = "general"
        direction = str(it.get("direction") or "").lower()
        severity = str(it.get("severity") or "").lower()
        db.add(
            Impact(
                crisis_id=crisis.id,
                scenario_id=scenario.id,
                category=cat,
                title=str(it["title"])[:255],
                direction=direction if direction in _DIRS else None,
                severity=severity if severity in _SEV else None,
                timeframe=(str(it.get("timeframe"))[:50] if it.get("timeframe") else None),
                detail=(it.get("detail") or None),
                confidence=_f(it.get("confidence"), 0.6, 0, 1),
            )
        )
        n += 1
    return n


async def generate_for_crisis(db, crisis_id, *, force: bool = False) -> dict:
    crisis = await db.get(Crisis, uuid.UUID(str(crisis_id)))
    if crisis is None:
        return {"status": "crisis_not_found", "crisis_id": str(crisis_id)}

    existing = int(
        await db.scalar(select(func.count(Impact.id)).where(Impact.crisis_id == crisis.id))
        or 0
    )
    if existing and not force:
        return {"status": "skipped_has_impacts", "crisis_id": str(crisis.id)}

    # D1 — generate impacts PER current scenario of the situation.
    scenarios = (
        await db.execute(
            select(Scenario)
            .where(Scenario.crisis_id == crisis.id, Scenario.is_current.is_(True))
            .order_by(Scenario.probability.desc())
            .limit(8)
        )
    ).scalars().all()
    if not scenarios:
        return {"status": "no_scenarios", "crisis_id": str(crisis.id)}

    if force and existing:
        for imp in (
            await db.execute(select(Impact).where(Impact.crisis_id == crisis.id))
        ).scalars().all():
            await db.delete(imp)

    total = 0
    per_scenario: list[dict] = []
    errors = 0
    for scenario in scenarios:
        try:
            data = await generate_json(
                _SYSTEM, await _build_user(db, crisis, scenario), temperature=0.5
            )
        except Exception as exc:  # noqa: BLE001 — AI quota etc.; keep going
            logger.warning(
                "impact gen failed for %s / scenario %s: %s",
                crisis.id, scenario.id, exc,
            )
            errors += 1
            per_scenario.append(
                {"scenario_id": str(scenario.id), "status": "ai_error", "impacts": 0}
            )
            continue
        n = _persist_impacts(db, crisis, scenario, data)
        total += n
        per_scenario.append(
            {"scenario_id": str(scenario.id), "status": "ok", "impacts": n}
        )

    await db.commit()
    status = "ok" if total else ("ai_error" if errors else "no_impacts")
    result = {
        "status": status,
        "crisis_id": str(crisis.id),
        "impacts": total,
        "scenarios": per_scenario,
    }
    logger.info("impact gen %s", result)
    return result


async def generate_missing(db, *, limit: int = 20) -> dict:
    """Generate impacts for active crises (that have scenarios but no impacts)."""
    sub = select(Impact.crisis_id).distinct().subquery()
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
