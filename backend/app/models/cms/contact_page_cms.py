"""ContactPageCMS model for contact page presentation settings."""

from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import Boolean, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class ContactPageCMS(UUIDMixin, TimestampMixin, Base):
    """Contact page presentation settings singleton.

    Controls how the contact page is displayed without duplicating
    the actual contact data (offices, phones, emails, etc.) which
    is managed by the ContactSettings model.

    Only one record should exist.
    """

    __tablename__ = "contact_page_cms"

    # ─── Hero Section ──────────────────────────────────────────────────────────

    hero_label: Mapped[Optional[str]] = mapped_column(
        String(100),
        default=None,
        nullable=True,
        comment="Small label above the hero heading (e.g. 'Get in Touch')",
    )

    hero_heading: Mapped[Optional[str]] = mapped_column(
        String(255),
        default=None,
        nullable=True,
        comment="Main hero heading text",
    )

    hero_description: Mapped[Optional[str]] = mapped_column(
        Text,
        default=None,
        nullable=True,
        comment="Hero section description/subtitle",
    )

    hero_background_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
    )

    hero_overlay_opacity: Mapped[float] = mapped_column(
        Float,
        default=0.5,
        nullable=False,
        comment="Overlay opacity (0.0-1.0)",
    )

    hero_is_published: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
    )

    # ─── Contact Page Settings ─────────────────────────────────────────────────

    show_office_locations: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
    )

    show_business_hours: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
    )

    show_google_map: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
    )

    show_contact_form: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
    )

    show_social_links: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
    )

    default_map_zoom: Mapped[int] = mapped_column(
        String(10),
        default="15",
        nullable=False,
        comment="Default Google Maps zoom level (1-20)",
    )

    enable_whatsapp_button: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
    )

    enable_call_button: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
    )

    enable_email_button: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
    )

    # ─── Reusable Sections ─────────────────────────────────────────────────────

    # Reuse existing CTA settings (no duplicate CTA data)
    cta_settings_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("cta_settings.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Reuse existing SEO settings (no duplicate SEO data)
    seo_settings_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("seo_settings.id", ondelete="SET NULL"),
        nullable=True,
    )

    # ─── Relationships ─────────────────────────────────────────────────────────

    hero_background_image = relationship(
        "Media",
        foreign_keys=[hero_background_image_id],
        lazy="selectin",
    )

    cta_settings = relationship("CTASettings", lazy="selectin")
    seo_settings = relationship("SEOSettings", lazy="selectin")

    def __repr__(self) -> str:
        return f"<ContactPageCMS id={self.id} hero_heading={self.hero_heading}>"