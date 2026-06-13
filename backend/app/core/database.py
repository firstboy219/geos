"""SQLAlchemy 2.0 async engine, session factory, dan declarative Base."""
from __future__ import annotations

from collections.abc import AsyncGenerator
from datetime import datetime

from sqlalchemy import DateTime
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    """Base class untuk semua ORM model.

    Semua kolom `Mapped[datetime]` dipetakan ke TIMESTAMPTZ (timezone-aware)
    sesuai BAB 4, supaya penulisan datetime tz-aware konsisten di seluruh app.
    """

    type_annotation_map = {datetime: DateTime(timezone=True)}


engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=5,          # server kecil — pool tipis
    max_overflow=5,
    pool_recycle=1800,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield AsyncSession; commit/rollback dikelola caller atau service."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
