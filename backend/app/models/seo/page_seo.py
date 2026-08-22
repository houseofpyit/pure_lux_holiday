"""PageSEO model for per-page SEO configuration."""

from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID, NUMERIC
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class PageSEO(UUIDMixin, TimestampMixin, Base):
    """Per-page SEO configuration.

    One row per page with custom meta tags, Open Graph, and Twitter settings.
    """

    __tablename__ = "page_seo"

    page_key: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    meta_title: Mapped[Optional[str]] = mapped_column(
        String(255),
        default=None,
        nullable=True,
    )

    meta_description: Mapped[Optional[str]] = mapped_column(
        Text,
        default=None,
        nullable=True,
    )

    keywords: Mapped[Optional[str]] = mapped_column(
        Text,
        default=None,
        nullable=True,
    )

    canonical_url: Mapped[Optional[str]] = mapped_column(
        String(1024),
        default=None,
        nullable=True,
    )

    slug: Mapped[Optional[str]] = mapped_column(
        String(1024),
        default=None,
        nullable=True,
    )

    og_title: Mapped[Optional[str]] = mapped_column(
        String(255),
        default=None,
        nullable=True,
    )

    og_description: Mapped[Optional[str]] = mapped_column(
        Text,
        default=None,
        nullable=True,
    )

    og_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
    )

    twitter_title: Mapped[Optional[str]] = mapped_column(
        String(255),
        default=None,
        nullable=True,
    )

    twitter_description: Mapped[Optional[str]] = mapped_column(
        Text,
        default=None,
        nullable=True,
    )

    twitter_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
    )

    robots: Mapped[Optional[str]] = mapped_column(
        String(255),
        default=None,
        nullable=True,
    )

    schema_json: Mapped[Optional[str]] = mapped_column(
        Text,
        default=None,
        nullable=True,
    )

    priority: Mapped[Optional[float]] = mapped_column(
        NUMERIC(2, 1),
        default=None,
        nullable=True,
    )

    change_frequency: Mapped[Optional[str]] = mapped_column(
        String(50),
        default=None,
        nullable=True,
    )

    include_in_sitemap: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
    )

    # Relationships
    og_image = relationship("Media", foreign_keys=[og_image_id], lazy="selectin")
    twitter_image = relationship("Media", foreign_keys=[twitter_image_id], lazy="selectin")

    def __repr__(self) -> str:
        return f"<PageSEO id={self.id} page_key={self.page_key}>"