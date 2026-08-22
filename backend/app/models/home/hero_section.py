"""HeroSection model for the homepage hero banner."""

from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class HeroSection(UUIDMixin, TimestampMixin, Base):
    """Homepage hero banner singleton.

    Only one active hero section should exist at a time.
    Supports background image, mobile image, and video backgrounds.
    """

    __tablename__ = "hero_sections"

    title: Mapped[str] = mapped_column(String(255), nullable=False, default="Welcome")
    subtitle: Mapped[Optional[str]] = mapped_column(String(500), default=None, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=True)

    button_text: Mapped[Optional[str]] = mapped_column(String(255), default=None, nullable=True)
    button_url: Mapped[Optional[str]] = mapped_column(String(1024), default=None, nullable=True)

    secondary_button_text: Mapped[Optional[str]] = mapped_column(String(255), default=None, nullable=True)
    secondary_button_url: Mapped[Optional[str]] = mapped_column(String(1024), default=None, nullable=True)

    background_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True,
    )
    mobile_background_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True,
    )
    video_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True,
    )

    overlay_opacity: Mapped[float] = mapped_column(Float, default=0.5, nullable=False)

    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true", nullable=False)

    background_image = relationship("Media", foreign_keys=[background_image_id], lazy="selectin")
    mobile_background_image = relationship("Media", foreign_keys=[mobile_background_image_id], lazy="selectin")
    video = relationship("Media", foreign_keys=[video_id], lazy="selectin")