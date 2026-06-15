"""add user_assets table (Treasury, F4)

Revision ID: 0008
Revises: 0007
Create Date: 2026-06-16
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_assets",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("asset_type", sa.String(length=20), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("symbol", sa.String(length=20), nullable=True),
        sa.Column("quantity", sa.Float(), nullable=False, server_default="1"),
        sa.Column("buy_price", sa.Float(), nullable=True),
        sa.Column("currency", sa.String(length=8), nullable=False, server_default="IDR"),
        sa.Column("buy_date", sa.Date(), nullable=True),
        sa.Column("manual_price", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=False),
    )
    op.create_index("idx_user_assets_user", "user_assets", ["user_id"])


def downgrade() -> None:
    op.drop_index("idx_user_assets_user", table_name="user_assets")
    op.drop_table("user_assets")
