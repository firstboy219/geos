"""Notifications: insert alerts + best-effort FCM (stub di Phase 3).

FCM push nyata (firebase-admin) menyusul; sekarang hanya tandai fcm_delivered
sesuai ketersediaan fcm_token, dan publish ke Redis untuk WS realtime.
"""
from __future__ import annotations

import logging
import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.redis_client import crisis_channel, publish_event
from app.models.alert import Alert
from app.models.user import User

logger = logging.getLogger("geoscan.notifications")


async def send_notifications(
    db: AsyncSession,
    *,
    user_ids: list[uuid.UUID],
    title: str,
    body: str | None,
    data: dict[str, Any],
) -> tuple[int, int]:
    """Insert satu alert per user. Return (inserted, fcm_attempted)."""
    if not user_ids:
        return 0, 0

    users = list(
        (await db.scalars(select(User).where(User.id.in_(user_ids)))).all()
    )

    crisis_id = data.get("crisis_id")
    tripwire_id = data.get("tripwire_id")
    alert_type = data.get("type", "system")
    severity = data.get("severity", "info")

    inserted = 0
    fcm_attempted = 0
    for user in users:
        alert = Alert(
            user_id=user.id,
            type=alert_type,
            severity=severity,
            title=title,
            body=body,
            crisis_id=_as_uuid(crisis_id),
            tripwire_id=_as_uuid(tripwire_id),
        )
        if user.fcm_token:
            # TODO Phase 5+: kirim FCM via firebase-admin. Best-effort stub.
            fcm_attempted += 1
            alert.fcm_delivered = False
        db.add(alert)
        inserted += 1

    await db.commit()

    # Realtime broadcast: publish alert_new ke channel crisis (jika ada).
    if crisis_id:
        await publish_event(
            crisis_channel(str(crisis_id)),
            {"type": "alert_new", "data": {"title": title, "severity": severity}},
        )

    logger.info("Inserted %d alerts (%d fcm-eligible)", inserted, fcm_attempted)
    return inserted, fcm_attempted


def _as_uuid(value: Any) -> uuid.UUID | None:
    if value is None:
        return None
    if isinstance(value, uuid.UUID):
        return value
    try:
        return uuid.UUID(str(value))
    except (ValueError, TypeError):
        return None
