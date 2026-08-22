"""SiteSettings model for global website configuration."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class SiteSettings(UUIDMixin, TimestampMixin, Base):
    """Global website settings singleton.

    Stores site-wide configuration such as branding,
    contact information, and operational settings.
    Only one record should exist.
    """

    __tablename__ = "site_settings"

    site_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        default="Pure Luxe Holidays",
    )

    tagline: Mapped[Optional[str]] = mapped_column(
        String(500),
        default=None,
        nullable=True,
    )

    logo_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
    )

    favicon_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
    )

    email: Mapped[Optional[str]] = mapped_column(
        String(255),
        default=None,
        nullable=True,
    )

    phone: Mapped[Optional[str]] = mapped_column(
        String(50),
        default=None,
        nullable=True,
    )

    whatsapp: Mapped[Optional[str]] = mapped_column(
        String(50),
        default=None,
        nullable=True,
    )

    address: Mapped[Optional[str]] = mapped_column(
        Text,
        default=None,
        nullable=True,
    )

    google_map_url: Mapped[Optional[str]] = mapped_column(
        String(1024),
        default=None,
        nullable=True,
    )

    timezone: Mapped[str] = mapped_column(
        String(50),
        default="UTC",
        nullable=False,
    )

    default_language: Mapped[str] = mapped_column(
        String(10),
        default="en",
        nullable=False,
    )

    maintenance_mode: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default="false",
        nullable=False,
    )

    analytics_enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
    )

    # Relationships
    logo = relationship("Media", foreign_keys=[logo_id], lazy="selectin")
    favicon = relationship("Media", foreign_keys=[favicon_id], lazy="selectin")

    def __repr__(self) -> str:
        return f"<SiteSettings id={self.id} name={self.site_name}>"