"""add scenario_id to impacts (Dampak per scenario, D1)

Revision ID: 0012
Revises: 0011
Create Date: 2026-06-16
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "0012"
down_revision = "0011"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "impacts",
        sa.Column("scenario_id", UUID(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        "fk_impacts_scenario",
        "impacts",
        "scenarios",
        ["scenario_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index("idx_impacts_scenario", "impacts", ["scenario_id"])


def downgrade() -> None:
    op.drop_index("idx_impacts_scenario", table_name="impacts")
    op.drop_constraint("fk_impacts_scenario", "impacts", type_="foreignkey")
    op.drop_column("impacts", "scenario_id")
