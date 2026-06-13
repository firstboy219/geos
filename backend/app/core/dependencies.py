"""FastAPI dependencies: DB session, current user, tier gating, internal key."""
from __future__ import annotations

import uuid

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_session
from app.core.security import (
    ACCESS_TOKEN_TYPE,
    is_blacklisted,
    safe_decode,
)
from app.models.user import User

_bearer = HTTPBearer(auto_error=False)

# Hierarki tier untuk require_tier()
_TIER_RANK = {"free": 0, "pro": 1, "enterprise": 2}


async def get_db() -> AsyncSession:  # type: ignore[misc]
    async for session in get_session():
        yield session


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Validate access token, cek blacklist, ambil user aktif."""
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = safe_decode(credentials.credentials)
    if payload is None or payload.get("type") != ACCESS_TOKEN_TYPE:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if await is_blacklisted(payload):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
        )

    try:
        user_id = uuid.UUID(payload["sub"])
    except (KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject"
        )

    user = await db.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive"
        )
    return user


def require_tier(min_tier: str):
    """Dependency factory: tolak jika tier user di bawah min_tier."""
    required_rank = _TIER_RANK.get(min_tier, 0)

    async def _checker(user: User = Depends(get_current_user)) -> User:
        if _TIER_RANK.get(user.tier, 0) < required_rank:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This feature requires '{min_tier}' tier or higher",
            )
        return user

    return _checker


async def verify_internal_key(
    x_internal_key: str | None = Header(default=None, alias="X-Internal-Key"),
) -> None:
    """Gate untuk semua endpoint /internal/* (dipanggil n8n)."""
    if not x_internal_key or x_internal_key != settings.INTERNAL_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal key",
        )
