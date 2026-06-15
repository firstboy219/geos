"""add impacts table (Dampak menu, F2)

Revision ID: 0005
Revises: 0004
Create Date: 2026-06-16
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "impacts",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("crisis_id", UUID(as_uuid=True),
                  sa.ForeignKey("crises.id", ondelete="CASCADE"), nullable=False),
        sa.Column("category", sa.String(length=30), nullable=False, server_default="general"),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("direction", sa.String(length=10), nullable=True),
        sa.Column("severity", sa.String(length=10), nullable=True),
        sa.Column("timeframe", sa.String(length=50), nullable=True),
        sa.Column("detail", sa.Text(), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=False, server_default="0.6"),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=False),
    )
    op.create_index("idx_impacts_crisis", "impacts", ["crisis_id"])
    op.create_index("idx_impacts_category", "impacts", ["category"])


def downgrade() -> None:
    op.drop_index("idx_impacts_category", table_name="impacts")
    op.drop_index("idx_impacts_crisis", table_name="impacts")
    op.drop_table("impacts")
