"""repair contact_page_cms table

Revision ID: a8c7f4d2b901
Revises: 4be36d511d93
Create Date: 2026-08-06 23:10:00.000000
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a8c7f4d2b901"
down_revision: Union[str, None] = "4be36d511d93"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "contact_page_cms" in inspector.get_table_names():
        return

    op.create_table(
        "contact_page_cms",
        sa.Column("hero_label", sa.String(length=100), nullable=True, comment="Small label above the hero heading (e.g. 'Get in Touch')"),
        sa.Column("hero_heading", sa.String(length=255), nullable=True, comment="Main hero heading text"),
        sa.Column("hero_description", sa.Text(), nullable=True, comment="Hero section description/subtitle"),
        sa.Column("hero_background_image_id", sa.UUID(), nullable=True),
        sa.Column("hero_overlay_opacity", sa.Float(), nullable=False, server_default="0.5", comment="Overlay opacity (0.0-1.0)"),
        sa.Column("hero_is_published", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("show_office_locations", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("show_business_hours", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("show_google_map", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("show_contact_form", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("show_social_links", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("default_map_zoom", sa.String(length=10), nullable=False, server_default="15", comment="Default Google Maps zoom level (1-20)"),
        sa.Column("enable_whatsapp_button", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("enable_call_button", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("enable_email_button", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("cta_settings_id", sa.UUID(), nullable=True),
        sa.Column("seo_settings_id", sa.UUID(), nullable=True),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["cta_settings_id"], ["cta_settings.id"], name=op.f("fk_contact_page_cms_cta_settings_id_cta_settings"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["hero_background_image_id"], ["media.id"], name=op.f("fk_contact_page_cms_hero_background_image_id_media"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["seo_settings_id"], ["seo_settings.id"], name=op.f("fk_contact_page_cms_seo_settings_id_seo_settings"), ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_contact_page_cms")),
    )
    op.create_index(op.f("ix_contact_page_cms_id"), "contact_page_cms", ["id"], unique=False)


def downgrade() -> None:
    # This revision repairs databases that had already applied the previous
    # empty migration. The original migration owns the table on fresh installs.
    pass
