"""Business logic auth: register, login, refresh (rotation), profil."""
from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    REFRESH_TOKEN_TYPE,
    blacklist_token,
    create_token_pair,
    hash_password,
    is_blacklisted,
    safe_decode,
    verify_password,
)
from app.models.alert import Alert
from app.models.user import User
from app.models.user_portfolio import UserPortfolio
from app.schemas.auth import RegisterRequest
from app.services.n8n_client import post_webhook


async def register_user(db: AsyncSession, data: RegisterRequest) -> User:
    existing = await db.scalar(select(User).where(User.email == data.email))
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    user = User(
        email=str(data.email),
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        tier="free",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Fire-and-forget welcome workflow (WF-03). Jangan gagalkan registrasi.
    await post_webhook(
        "/webhook/user-registered",
        {"user_id": str(user.id), "email": user.email, "full_name": user.full_name},
    )
    return user


async def authenticate(db: AsyncSession, email: str, password: str) -> User:
    user = await db.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled"
        )
    return user


async def rotate_refresh_token(db: AsyncSession, refresh_token: str) -> dict[str, str]:
    payload = safe_decode(refresh_token)
    if payload is None or payload.get("type") != REFRESH_TOKEN_TYPE:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )
    if await is_blacklisted(payload):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked"
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

    # Rotation: blacklist refresh lama, terbitkan pair baru.
    await blacklist_token(payload)
    return create_token_pair(str(user.id))


async def get_user_stats(db: AsyncSession, user_id: uuid.UUID) -> tuple[int, int]:
    """Return (portfolio_count, unread_alerts)."""
    portfolio_count = await db.scalar(
        select(func.count(UserPortfolio.id)).where(UserPortfolio.user_id == user_id)
    )
    unread = await db.scalar(
        select(func.count(Alert.id)).where(
            Alert.user_id == user_id, Alert.is_read.is_(False)
        )
    )
    return int(portfolio_count or 0), int(unread or 0)
