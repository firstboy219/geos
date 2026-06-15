"""crises.auto_grouped (dynamic situations) + news_articles.title_original

Revision ID: 0009
Revises: 0008
Create Date: 2026-06-16
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "crises",
        sa.Column("auto_grouped", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "news_articles",
        sa.Column("title_original", sa.String(length=512), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("news_articles", "title_original")
    op.drop_column("crises", "auto_grouped")
