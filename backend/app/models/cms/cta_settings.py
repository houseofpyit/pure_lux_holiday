"""CTASettings model for global call-to-action configuration."""

from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class CTASettings(UUIDMixin, TimestampMixin, Base):
    """Global CTA (Call to Action) singleton.

    Stores the primary call-to-action banner configuration
    used across the website. Only one record should exist.
    """

    __tablename__ = "cta_settings"

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        default="Book Your Dream Holiday",
    )

    subtitle: Mapped[Optional[str]] = mapped_column(
        Text,
        default=None,
        nullable=True,
    )

    button_text: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        default="Contact Us",
    )

    button_url: Mapped[str] = mapped_column(
        String(1024),
        nullable=False,
        default="/contact",
    )

    background_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
    )

    # Relationships
    background_image = relationship("Media", foreign_keys=[background_image_id], lazy="selectin")

    def __repr__(self) -> str:
        return f"<CTASettings id={self.id} title={self.title}>"