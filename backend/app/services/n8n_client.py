"""Outbound webhook helper ke n8n.

Ini SATU-SATUNYA outbound dependency backend. Backend tidak pernah memanggil
API pihak ketiga (news/OpenAI/market) langsung — itu tugas n8n.
Semua panggilan fire-and-forget: kegagalan n8n tidak boleh menggagalkan request.
"""
from __future__ import annotations

import logging
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger("geoscan.n8n")


async def post_webhook(path: str, payload: dict[str, Any]) -> bool:
    """POST ke {N8N_WEBHOOK_URL}{path}. Return True jika 2xx, else False.

    Tidak pernah raise — caller memanggil ini fire-and-forget.
    """
    url = f"{settings.N8N_WEBHOOK_URL.rstrip('/')}{path}"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(url, json=payload)
        if resp.status_code >= 400:
            logger.warning("n8n webhook %s returned %s", path, resp.status_code)
            return False
        return True
    except Exception as exc:  # noqa: BLE001 — fire-and-forget
        logger.warning("n8n webhook %s failed: %s", path, exc)
        return False
