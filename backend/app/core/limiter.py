"""slowapi rate limiter — shared instance + key functions.

Beberapa endpoint dibatasi per-IP (login/register), sebagian per-user
(authenticated). Untuk per-user kita pakai 'sub' dari JWT bila ada,
fallback ke IP.
"""
from __future__ import annotations

from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request

from app.core.security import safe_decode


def user_or_ip_key(request: Request) -> str:
    """Key by user id (dari Bearer token) jika ada, else remote IP."""
    auth = request.headers.get("Authorization", "")
    if auth.lower().startswith("bearer "):
        payload = safe_decode(auth[7:])
        if payload and payload.get("sub"):
            return f"user:{payload['sub']}"
    return get_remote_address(request)


# Default key = IP. Endpoint per-user override pakai key_func=user_or_ip_key.
limiter = Limiter(key_func=get_remote_address, default_limits=[])
