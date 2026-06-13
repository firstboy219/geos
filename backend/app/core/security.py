"""JWT (access + refresh dengan rotation), bcrypt hashing, token blacklist.

Token blacklist disimpan di Redis dengan TTL = sisa umur token, jadi entri
otomatis hilang setelah token expire (hemat memori di server kecil).
"""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.core.redis_client import get_redis

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ACCESS_TOKEN_TYPE = "access"
REFRESH_TOKEN_TYPE = "refresh"
_BLACKLIST_PREFIX = "blacklist:jti:"


# ── Password ──
def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── JWT create ──
def _create_token(subject: str, token_type: str, expires_delta: timedelta) -> str:
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
        "jti": uuid.uuid4().hex,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_access_token(user_id: str) -> str:
    return _create_token(
        user_id,
        ACCESS_TOKEN_TYPE,
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def create_refresh_token(user_id: str) -> str:
    return _create_token(
        user_id,
        REFRESH_TOKEN_TYPE,
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )


def create_token_pair(user_id: str) -> dict[str, str]:
    return {
        "access_token": create_access_token(user_id),
        "refresh_token": create_refresh_token(user_id),
        "token_type": "bearer",
    }


# ── JWT decode ──
def decode_token(token: str) -> dict[str, Any]:
    """Decode + verify signature/exp. Raise JWTError jika invalid."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])


def safe_decode(token: str) -> dict[str, Any] | None:
    try:
        return decode_token(token)
    except JWTError:
        return None


# ── Blacklist (Redis) ──
async def blacklist_token(payload: dict[str, Any]) -> None:
    """Blacklist jti hingga token expire."""
    jti = payload.get("jti")
    exp = payload.get("exp")
    if not jti:
        return
    ttl = 60
    if exp:
        ttl = max(1, int(exp - datetime.now(timezone.utc).timestamp()))
    await get_redis().setex(f"{_BLACKLIST_PREFIX}{jti}", ttl, "1")


async def is_blacklisted(payload: dict[str, Any]) -> bool:
    jti = payload.get("jti")
    if not jti:
        return False
    return bool(await get_redis().exists(f"{_BLACKLIST_PREFIX}{jti}"))
