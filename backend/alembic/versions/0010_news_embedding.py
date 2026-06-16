"""cache news_articles.embedding (free re-clustering / threshold tuning)

Revision ID: 0010
Revises: 0009
Create Date: 2026-06-16
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "0010"
down_revision = "0009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("news_articles", sa.Column("embedding", JSONB(), nullable=True))


def downgrade() -> None:
    op.drop_column("news_articles", "embedding")
