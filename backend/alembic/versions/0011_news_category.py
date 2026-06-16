"""add news_articles.category (non-AI keyword classification) + index

Revision ID: 0011
Revises: 0010
Create Date: 2026-06-16
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0011"
down_revision = "0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("news_articles", sa.Column("category", sa.String(length=30), nullable=True))
    op.create_index("idx_news_category", "news_articles", ["category"])


def downgrade() -> None:
    op.drop_index("idx_news_category", table_name="news_articles")
    op.drop_column("news_articles", "category")
