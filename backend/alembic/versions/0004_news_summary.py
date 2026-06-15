"""add news_articles image_url + AI summary (points/quotes)

Revision ID: 0004
Revises: 0003
Create Date: 2026-06-16
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("news_articles", sa.Column("image_url", sa.String(length=1024), nullable=True))
    op.add_column("news_articles", sa.Column("summary_points", postgresql.JSONB(), nullable=True))
    op.add_column("news_articles", sa.Column("summary_quotes", postgresql.JSONB(), nullable=True))
    # Retention helper: purge by age uses ingested_at.
    op.create_index("idx_news_ingested_at", "news_articles", ["ingested_at"])


def downgrade() -> None:
    op.drop_index("idx_news_ingested_at", table_name="news_articles")
    op.drop_column("news_articles", "summary_quotes")
    op.drop_column("news_articles", "summary_points")
    op.drop_column("news_articles", "image_url")
