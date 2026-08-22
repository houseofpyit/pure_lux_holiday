"""repair_seo_settings_schema

Revision ID: b1c2d3e4f5a6
Revises: 9a8b7c6d5e4f
Create Date: 2026-08-12 22:30:00.000000
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision: str = "b1c2d3e4f5a6"
down_revision: Union[str, None] = "9a8b7c6d5e4f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(conn, table: str, column: str) -> bool:
    result = conn.execute(
        sa.text(
            "SELECT 1 FROM information_schema.columns "
            "WHERE table_name = :table AND column_name = :column"
        ),
        {"table": table, "column": column},
    )
    return result.scalar() is not None


def upgrade() -> None:
    conn = op.get_bind()
    if not conn.dialect.has_table(conn, "seo_settings"):
        return

    # New schema columns
    new_columns = {
        "site_name": sa.String(length=255),
        "website_url": sa.String(length=1024),
        "default_meta_title": sa.String(length=255),
        "default_meta_description": sa.Text(),
        "default_keywords": sa.Text(),
        "default_robots": sa.String(length=255),
        "organization_name": sa.String(length=255),
        "organization_logo_id": UUID(as_uuid=True),
        "default_og_image_id": UUID(as_uuid=True),
        "default_twitter_image_id": UUID(as_uuid=True),
        "facebook_app_id": sa.String(length=255),
        "google_site_verification": sa.String(length=255),
        "bing_site_verification": sa.String(length=255),
        "pinterest_verification": sa.String(length=255),
        "theme_color": sa.String(length=7),
    }

    for name, col_type in new_columns.items():
        if not _has_column(conn, "seo_settings", name):
            op.add_column("seo_settings", sa.Column(name, col_type, nullable=True))

    # Migrate legacy column data into the new schema when present.
    if _has_column(conn, "seo_settings", "meta_title"):
        conn.execute(
            sa.text(
                """
                UPDATE seo_settings
                SET
                    default_meta_title = COALESCE(default_meta_title, meta_title),
                    default_meta_description = COALESCE(default_meta_description, meta_description),
                    default_keywords = COALESCE(default_keywords, meta_keywords),
                    default_robots = COALESCE(default_robots, robots),
                    default_og_image_id = COALESCE(default_og_image_id, og_image_id),
                    default_twitter_image_id = COALESCE(default_twitter_image_id, twitter_image_id)
                """
            )
        )

    # Drop legacy columns after data migration.
    legacy_columns = [
        "meta_title",
        "meta_description",
        "meta_keywords",
        "robots",
        "og_title",
        "og_description",
        "og_image_id",
        "twitter_title",
        "twitter_description",
        "twitter_image_id",
    ]
    for column in legacy_columns:
        if _has_column(conn, "seo_settings", column):
            op.drop_column("seo_settings", column)

    if _has_column(conn, "seo_settings", "default_robots"):
        op.alter_column(
            "seo_settings",
            "default_robots",
            server_default="index, follow",
            existing_type=sa.String(length=255),
            nullable=False,
        )


def downgrade() -> None:
    conn = op.get_bind()
    if not conn.dialect.has_table(conn, "seo_settings"):
        return

    legacy_columns = {
        "meta_title": sa.String(length=255),
        "meta_description": sa.Text(),
        "meta_keywords": sa.Text(),
        "robots": sa.String(length=255),
        "og_title": sa.String(length=255),
        "og_description": sa.Text(),
        "og_image_id": UUID(as_uuid=True),
        "twitter_title": sa.String(length=255),
        "twitter_description": sa.Text(),
        "twitter_image_id": UUID(as_uuid=True),
    }
    for name, col_type in legacy_columns.items():
        if not _has_column(conn, "seo_settings", name):
            op.add_column("seo_settings", sa.Column(name, col_type, nullable=True))

    if _has_column(conn, "seo_settings", "default_meta_title"):
        conn.execute(
            sa.text(
                """
                UPDATE seo_settings
                SET
                    meta_title = default_meta_title,
                    meta_description = default_meta_description,
                    meta_keywords = default_keywords,
                    robots = default_robots,
                    og_image_id = default_og_image_id,
                    twitter_image_id = default_twitter_image_id
                """
            )
        )

    new_columns = [
        "site_name",
        "website_url",
        "default_meta_title",
        "default_meta_description",
        "default_keywords",
        "default_robots",
        "organization_name",
        "organization_logo_id",
        "default_og_image_id",
        "default_twitter_image_id",
        "facebook_app_id",
        "google_site_verification",
        "bing_site_verification",
        "pinterest_verification",
        "theme_color",
    ]
    for column in new_columns:
        if _has_column(conn, "seo_settings", column):
            op.drop_column("seo_settings", column)
