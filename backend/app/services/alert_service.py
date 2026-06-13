"""Business logic alerts."""
from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert


async def list_alerts(
    db: AsyncSession,
    *,
    user_id: uuid.UUID,
    unread_only: bool,
    type_filter: str | None,
    page: int,
    size: int,
) -> list[Alert]:
    stmt = select(Alert).where(Alert.user_id == user_id)
    if unread_only:
        stmt = stmt.where(Alert.is_read.is_(False))
    if type_filter:
        stmt = stmt.where(Alert.type == type_filter)
    stmt = (
        stmt.order_by(Alert.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    return list((await db.scalars(stmt)).all())


async def unread_count(db: AsyncSession, user_id: uuid.UUID) -> int:
    return int(
        await db.scalar(
            select(func.count(Alert.id)).where(
                Alert.user_id == user_id, Alert.is_read.is_(False)
            )
        )
        or 0
    )


async def mark_read(db: AsyncSession, user_id: uuid.UUID, alert_id: uuid.UUID) -> Alert:
    alert = await db.get(Alert, alert_id)
    if alert is None or alert.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found"
        )
    alert.is_read = True
    await db.commit()
    await db.refresh(alert)
    return alert


async def mark_all_read(db: AsyncSession, user_id: uuid.UUID) -> int:
    result = await db.execute(
        update(Alert)
        .where(Alert.user_id == user_id, Alert.is_read.is_(False))
        .values(is_read=True)
    )
    await db.commit()
    return result.rowcount or 0
