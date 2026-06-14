"""Admin panel auth — password login + signed session cookie (itsdangerous)."""
from __future__ import annotations

import logging

from fastapi import HTTPException, Request, status
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from app.core import settings_store
from app.core.config import settings
from app.core.security import hash_password, verify_password

logger = logging.getLogger("geoscan.admin.security")

COOKIE_NAME = "geoscan_admin"
_MAX_AGE = 60 * 60 * 8  # 8 hours


def _serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(settings.SECRET_KEY, salt="geoscan-admin")


def issue_session() -> str:
    return _serializer().dumps({"admin": True})


def is_authed(request: Request) -> bool:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return False
    try:
        data = _serializer().loads(token, max_age=_MAX_AGE)
        return bool(data.get("admin"))
    except (BadSignature, SignatureExpired):
        return False


def require_admin(request: Request) -> bool:
    """Dependency: 303-redirect to /admin/login when not authenticated."""
    if not is_authed(request):
        raise HTTPException(
            status_code=status.HTTP_303_SEE_OTHER, headers={"Location": "/admin/login"}
        )
    return True


async def verify_admin_password(password: str) -> bool:
    stored = await settings_store.get("admin_password_hash")
    if stored:
        try:
            return verify_password(password, stored)
        except Exception:
            return False
    # Bootstrap from env ADMIN_PASSWORD, then persist a hash.
    if settings.ADMIN_PASSWORD and password == settings.ADMIN_PASSWORD:
        await settings_store.set_many({"admin_password_hash": hash_password(password)})
        return True
    return False


async def set_admin_password(new_password: str) -> None:
    await settings_store.set_many({"admin_password_hash": hash_password(new_password)})
