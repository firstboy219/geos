"""add user profile fields (F3 personal impact)

Revision ID: 0006
Revises: 0005
Create Date: 2026-06-16
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("country", sa.String(length=80), nullable=True))
    op.add_column("users", sa.Column("city", sa.String(length=120), nullable=True))
    op.add_column("users", sa.Column("profession", sa.String(length=120), nullable=True))
    op.add_column("users", sa.Column("gender", sa.String(length=20), nullable=True))
    op.add_column("users", sa.Column("birth_year", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "birth_year")
    op.drop_column("users", "gender")
    op.drop_column("users", "profession")
    op.drop_column("users", "city")
    op.drop_column("users", "country")
