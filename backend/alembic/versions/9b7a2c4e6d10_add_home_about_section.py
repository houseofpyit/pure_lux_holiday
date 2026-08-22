"""add_home_about_section

Revision ID: 9b7a2c4e6d10
Revises: 414d59e18179
Create Date: 2026-08-04 00:00:00.000000
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9b7a2c4e6d10"
down_revision: Union[str, None] = "414d59e18179"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "home_about_sections",
        sa.Column("eyebrow", sa.String(length=255), nullable=True),
        sa.Column("heading", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("button_text", sa.String(length=255), nullable=True),
        sa.Column("button_url", sa.String(length=1024), nullable=True),
        sa.Column("image_id", sa.UUID(), nullable=True),
        sa.Column("image_alt", sa.String(length=500), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["image_id"], ["media.id"], name=op.f("fk_home_about_sections_image_id_media"), ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_home_about_sections")),
    )
    op.create_index(op.f("ix_home_about_sections_id"), "home_about_sections", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_home_about_sections_id"), table_name="home_about_sections")
    op.drop_table("home_about_sections")
