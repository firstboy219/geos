"""add personal_impacts table (F3 — store personal impact results)

Revision ID: 0007
Revises: 0006
Create Date: 2026-06-16
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB, UUID

revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "personal_impacts",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("crisis_id", UUID(as_uuid=True),
                  sa.ForeignKey("crises.id", ondelete="SET NULL"), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("items", JSONB(), nullable=True),
        sa.Column("disclaimer", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=False),
    )
    op.create_index("idx_personal_impacts_user", "personal_impacts", ["user_id"])
    op.create_index("idx_personal_impacts_created", "personal_impacts", ["created_at"])


def downgrade() -> None:
    op.drop_index("idx_personal_impacts_created", table_name="personal_impacts")
    op.drop_index("idx_personal_impacts_user", table_name="personal_impacts")
    op.drop_table("personal_impacts")
