"""SEOSettings model for global SEO configuration."""

from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class SEOSettings(UUIDMixin, TimestampMixin, Base):
    """Global SEO settings singleton.

    Stores default meta tags, Open Graph configuration,
    organization info, verification codes, and Twitter card settings.
    Only one record should exist.
    """

    __tablename__ = "seo_settings"

    site_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        default=None,
        nullable=True,
    )

    website_url: Mapped[Optional[str]] = mapped_column(
        String(1024),
        default=None,
        nullable=True,
    )

    default_meta_title: Mapped[Optional[str]] = mapped_column(
        String(255),
        default=None,
        nullable=True,
    )

    default_meta_description: Mapped[Optional[str]] = mapped_column(
        Text,
        default=None,
        nullable=True,
    )

    default_keywords: Mapped[Optional[str]] = mapped_column(
        Text,
        default=None,
        nullable=True,
    )

    canonical_url: Mapped[Optional[str]] = mapped_column(
        String(1024),
        default=None,
        nullable=True,
    )

    default_robots: Mapped[str] = mapped_column(
        String(255),
        default="index, follow",
        nullable=False,
    )

    organization_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        default=None,
        nullable=True,
    )

    organization_logo_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
    )

    default_og_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
    )

    default_twitter_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
    )

    twitter_card: Mapped[str] = mapped_column(
        String(50),
        default="summary_large_image",
        nullable=False,
    )

    facebook_app_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        default=None,
        nullable=True,
    )

    google_site_verification: Mapped[Optional[str]] = mapped_column(
        String(255),
        default=None,
        nullable=True,
    )

    bing_site_verification: Mapped[Optional[str]] = mapped_column(
        String(255),
        default=None,
        nullable=True,
    )

    pinterest_verification: Mapped[Optional[str]] = mapped_column(
        String(255),
        default=None,
        nullable=True,
    )

    theme_color: Mapped[Optional[str]] = mapped_column(
        String(7),
        default=None,
        nullable=True,
    )

    schema_json: Mapped[Optional[str]] = mapped_column(
        Text,
        default=None,
        nullable=True,
    )

    # Relationships
    organization_logo = relationship("Media", foreign_keys=[organization_logo_id], lazy="selectin")
    default_og_image = relationship("Media", foreign_keys=[default_og_image_id], lazy="selectin")
    default_twitter_image = relationship("Media", foreign_keys=[default_twitter_image_id], lazy="selectin")

    def __repr__(self) -> str:
        return f"<SEOSettings id={self.id} site_name={self.site_name}>"