"""initial schema — baseline from ORM metadata

Revision ID: 0001
Revises:
Create Date: 2026-06-13

Baseline migration: builds the full schema directly from the SQLAlchemy
metadata (app.models). This guarantees the migration never diverges from the
ORM models. Subsequent migrations should be normal autogenerate diffs.
"""
from __future__ import annotations

from alembic import op

from app.core.database import Base
import app.models  # noqa: F401  (populate Base.metadata)

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    # gen_random_uuid() berasal dari pgcrypto (Postgres 13+ punya built-in,
    # tapi pastikan extension ada untuk default UUID server-side).
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')
    Base.metadata.create_all(bind=bind)


def downgrade() -> None:
    bind = op.get_bind()
    Base.metadata.drop_all(bind=bind)
