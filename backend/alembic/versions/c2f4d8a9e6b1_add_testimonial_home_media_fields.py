"""Add testimonial home media fields

Revision ID: c2f4d8a9e6b1
Revises: 9b7a2c4e6d10
Create Date: 2026-08-04 23:00:00.000000
"""

from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "c2f4d8a9e6b1"
down_revision: Union[str, None] = "9b7a2c4e6d10"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("testimonials", sa.Column("customer_photo_id", sa.UUID(), nullable=True))
    op.add_column("testimonials", sa.Column("background_image_id", sa.UUID(), nullable=True))
    op.add_column("testimonials", sa.Column("video_thumbnail_id", sa.UUID(), nullable=True))

    op.create_foreign_key(
        op.f("fk_testimonials_customer_photo_id_media"),
        "testimonials",
        "media",
        ["customer_photo_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        op.f("fk_testimonials_background_image_id_media"),
        "testimonials",
        "media",
        ["background_image_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        op.f("fk_testimonials_video_thumbnail_id_media"),
        "testimonials",
        "media",
        ["video_thumbnail_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint(
        op.f("fk_testimonials_video_thumbnail_id_media"),
        "testimonials",
        type_="foreignkey",
    )
    op.drop_constraint(
        op.f("fk_testimonials_background_image_id_media"),
        "testimonials",
        type_="foreignkey",
    )
    op.drop_constraint(
        op.f("fk_testimonials_customer_photo_id_media"),
        "testimonials",
        type_="foreignkey",
    )
    op.drop_column("testimonials", "video_thumbnail_id")
    op.drop_column("testimonials", "background_image_id")
    op.drop_column("testimonials", "customer_photo_id")
