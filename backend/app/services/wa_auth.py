"""Phone-based OTP login (mirrors xtracker logic).

Input is always the phone number. Channel auto-selected like xtracker:
  - EMAIL if the user (looked up by phone) has a REAL email + OTP_VIA_EMAIL on
  - otherwise WhatsApp.
Both channels deliver through n8n webhooks (email via geoscanSmtp, WA via the
shared xtracker WhatsApp node). Returns {channel, dest} for the UI.
"""
from __future__ import annotations

import logging
import re
import secrets

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import settings_store
from app.core.config import settings
from app.core.redis_client import get_redis
from app.core.security import hash_password
from app.models.user import User

logger = logging.getLogger("geoscan.wa_auth")

OTP_TTL = 300          # 5 minutes
MAX_PER_WINDOW = 3     # max OTP requests
RL_WINDOW = 3600       # per hour (per-phone, like xtracker)

_SYNTH_RE = re.compile(r"^wa-\d+@cosger\.online$")


class OtpError(Exception):
    """User-facing OTP error (rate limit / invalid phone)."""


def normalize_phone(raw: str) -> str:
    digits = re.sub(r"\D", "", raw or "")
    if digits.startswith("0"):
        digits = "62" + digits[1:]
    return digits


def _is_synth_email(email: str | None) -> bool:
    """True for the placeholder email assigned to WA-created users (not a real inbox)."""
    return bool(email and _SYNTH_RE.match(email))


def mask_email(e: str) -> str:
    try:
        name, dom = e.split("@", 1)
        return (name[0] + "***") + "@" + dom
    except Exception:
        return "email"


def mask_phone(p: str) -> str:
    return (p[:3] + "****" + p[-3:]) if len(p) >= 7 else p


async def _post_n8n(path: str, body: dict) -> bool:
    url = settings.N8N_WEBHOOK_URL.rstrip("/") + path
    try:
        async with httpx.AsyncClient(timeout=10) as c:
            r = await c.post(url, json=body)
        return r.status_code < 500
    except Exception as exc:
        logger.warning("n8n %s failed: %s", path, exc)
        return False


async def request_otp(db: AsyncSession, phone: str) -> dict:
    p = normalize_phone(phone)
    if len(p) < 8:
        raise OtpError("Nomor WhatsApp/telepon tidak valid.")

    r = get_redis()
    rl_key = f"wa_otp_rl:{p}"
    count = await r.incr(rl_key)
    if count == 1:
        await r.expire(rl_key, RL_WINDOW)
    if count > MAX_PER_WINDOW:
        raise OtpError("Terlalu banyak permintaan OTP untuk nomor ini. Coba lagi nanti.")

    code = f"{secrets.randbelow(1000000):06d}"
    await r.setex(f"wa_otp:{p}", OTP_TTL, code)

    # Channel selection (xtracker logic): email if user-by-phone has a real email.
    user = (await db.execute(select(User).where(User.phone == p))).scalar_one_or_none()
    via_email = (await settings_store.get("otp_via_email")) not in ("false", "0", "no")
    want_email = via_email and user and user.email and not _is_synth_email(user.email)

    if want_email:
        if await _post_n8n("/webhook/email-otp", {"email": user.email, "code": code}):
            return {"channel": "email", "dest": mask_email(user.email)}
        # fallback to WhatsApp if email delivery couldn't be dispatched
    await _post_n8n("/webhook/wa-otp", {"phone": p, "code": code})
    return {"channel": "whatsapp", "dest": mask_phone(p)}


async def verify_otp(db: AsyncSession, phone: str, code: str) -> User | None:
    p = normalize_phone(phone)
    r = get_redis()
    stored = await r.get(f"wa_otp:{p}")
    if not stored or str(stored) != str(code).strip():
        return None
    await r.delete(f"wa_otp:{p}")

    user = (await db.execute(select(User).where(User.phone == p))).scalar_one_or_none()
    if user is None:
        user = User(
            phone=p,
            email=f"wa-{p}@cosger.online",
            full_name=f"WhatsApp {p[-4:]}",
            hashed_password=hash_password(secrets.token_hex(16)),
            tier="free",
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user
