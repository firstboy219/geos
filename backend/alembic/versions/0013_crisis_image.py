"""add crises.image_url (representative source-article image, Layer 2 / Home-3)

Revision ID: 0013
Revises: 0012
Create Date: 2026-06-16
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0013"
down_revision = "0012"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "crises",
        sa.Column("image_url", sa.String(length=1024), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("crises", "image_url")
