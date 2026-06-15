"""WhatsApp OTP login — sends OTP via n8n (reusing xtracker's WhatsApp node).

Flow: request_otp(phone) -> store code in Redis (5 min) + POST n8n /webhook/wa-otp
(which sends WhatsApp using the shared whatsAppApi credential). verify_otp(phone,code)
-> find/create user by phone -> caller issues JWT pair.
"""
from __future__ import annotations

import logging
import re
import secrets

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.redis_client import get_redis
from app.core.security import hash_password
from app.models.user import User

logger = logging.getLogger("geoscan.wa_auth")

OTP_TTL = 300          # 5 minutes
MAX_PER_WINDOW = 3     # max OTP requests
RL_WINDOW = 900        # per 15 minutes


class OtpError(Exception):
    """User-facing OTP error (rate limit / invalid phone)."""


def normalize_phone(raw: str) -> str:
    """Digits-only international format. Indonesian local 0xx -> 62xx."""
    digits = re.sub(r"\D", "", raw or "")
    if digits.startswith("0"):
        digits = "62" + digits[1:]
    return digits


async def request_otp(phone: str) -> str:
    p = normalize_phone(phone)
    if len(p) < 8:
        raise OtpError("Nomor WhatsApp tidak valid.")
    r = get_redis()
    rl_key = f"wa_otp_rl:{p}"
    count = await r.incr(rl_key)
    if count == 1:
        await r.expire(rl_key, RL_WINDOW)
    if count > MAX_PER_WINDOW:
        raise OtpError("Terlalu banyak permintaan OTP. Coba lagi nanti.")

    code = f"{secrets.randbelow(1000000):06d}"
    await r.setex(f"wa_otp:{p}", OTP_TTL, code)

    # Send via n8n WhatsApp node (fire-and-forget; don't leak delivery errors).
    import httpx

    url = settings.N8N_WEBHOOK_URL.rstrip("/") + "/webhook/wa-otp"
    try:
        async with httpx.AsyncClient(timeout=10) as c:
            await c.post(url, json={"phone": p, "code": code})
    except Exception as exc:
        logger.warning("wa-otp webhook failed: %s", exc)
    return p


async def verify_otp(db: AsyncSession, phone: str, code: str) -> User | None:
    p = normalize_phone(phone)
    r = get_redis()
    stored = await r.get(f"wa_otp:{p}")
    if not stored or str(stored) != str(code).strip():
        return None
    await r.delete(f"wa_otp:{p}")

    user = (
        await db.execute(select(User).where(User.phone == p))
    ).scalar_one_or_none()
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
