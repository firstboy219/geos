"""F3 — "Dampak ke diri sendiri": AI analysis tailored to the user's profile.

Runs synchronously in the request (user taps the button, expects a result).
Combines the user's profile (country, city, profession, gender, age) with the
current situations + their impacts, and asks Gemini for concrete personal
consequences + recommendations (incl. cost-comparison style guidance).
"""
from __future__ import annotations

import json
import logging
from datetime import datetime, timezone

from sqlalchemy import select

from app.models.crisis import Crisis
from app.models.impact import Impact
from app.models.personal_impact import PersonalImpact
from app.models.user import User
from app.services.ai.llm_client import generate_json

logger = logging.getLogger("geoscan.ai.personal")

_SYSTEM = (
    "Anda penasihat strategis personal. Berdasarkan PROFIL pengguna dan "
    "SITUASI geopolitik + dampaknya, jelaskan dampak KONKRET ke kehidupan "
    "pengguna ini secara spesifik (pekerjaan, biaya hidup, keuangan, "
    "keputusan besar) beserta REKOMENDASI yang actionable termasuk perbandingan "
    "biaya bila relevan. Bahasa Indonesia, realistis, tidak menakut-nakuti. "
    "Balas HANYA JSON: {\"summary\": <str>, \"items\": [{\"area\": <str cth "
    "'Pekerjaan'/'Biaya hidup'/'Investasi'>, \"finding\": <str dampak>, "
    "\"recommendation\": <str saran konkret>, \"timeframe\": <str>}], "
    "\"disclaimer\": <str singkat>}"
)


def _profile(user: User) -> dict:
    age = None
    if user.birth_year:
        age = max(0, datetime.now(timezone.utc).year - int(user.birth_year))
    return {
        "negara": user.country,
        "kota": user.city,
        "profesi": user.profession,
        "gender": user.gender,
        "umur": age,
    }


def profile_complete(user: User) -> bool:
    return bool(user.profession and user.country)


async def analyze_personal(db, user: User, crisis_id=None) -> dict:
    if not profile_complete(user):
        return {
            "profile_complete": False,
            "summary": "Lengkapi profil Anda (minimal profesi & negara) agar AI "
            "dapat menganalisa dampak personal.",
            "items": [],
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    # Situations + impacts context.
    if crisis_id:
        crises = [c for c in [await db.get(Crisis, crisis_id)] if c]
    else:
        crises = (
            await db.execute(
                select(Crisis)
                .where(Crisis.status == "active")
                .order_by(Crisis.severity_level.desc().nullslast())
                .limit(4)
            )
        ).scalars().all()

    sit_ctx = []
    for c in crises:
        imps = (
            await db.execute(
                select(Impact.category, Impact.title, Impact.detail)
                .where(Impact.crisis_id == c.id)
                .limit(10)
            )
        ).all()
        sit_ctx.append({
            "situasi": c.title,
            "dampak": [{"kategori": cat, "judul": t, "detail": (d or "")[:200]}
                       for cat, t, d in imps],
        })

    user_msg = "PROFIL:\n" + json.dumps(_profile(user), ensure_ascii=False) + \
        "\n\nSITUASI & DAMPAK:\n" + json.dumps(sit_ctx, ensure_ascii=False)

    try:
        data = await generate_json(_SYSTEM, user_msg, temperature=0.5)
    except Exception as exc:  # noqa: BLE001
        logger.warning("personal impact failed: %s", exc)
        return {
            "profile_complete": True,
            "summary": "Analisis gagal dibuat saat ini. Coba lagi nanti.",
            "items": [],
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    items = []
    for it in (data.get("items") or [])[:8]:
        if isinstance(it, dict) and (it.get("finding") or it.get("recommendation")):
            items.append({
                "area": str(it.get("area") or ""),
                "finding": str(it.get("finding") or ""),
                "recommendation": str(it.get("recommendation") or ""),
                "timeframe": str(it.get("timeframe") or ""),
            })
    summary = str(data.get("summary") or "")
    disclaimer = str(data.get("disclaimer") or "")

    # Persist the AI result (kept 4 months by retention).
    try:
        db.add(
            PersonalImpact(
                user_id=user.id,
                crisis_id=(crises[0].id if crisis_id and crises else None),
                summary=summary,
                items=items,
                disclaimer=disclaimer,
            )
        )
        await db.commit()
    except Exception as exc:  # noqa: BLE001 — non-fatal, still return result
        logger.warning("persist personal impact failed: %s", exc)
        await db.rollback()

    return {
        "profile_complete": True,
        "summary": summary,
        "items": items,
        "disclaimer": disclaimer,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
