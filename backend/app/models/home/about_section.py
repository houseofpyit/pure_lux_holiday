"""HomeAboutSection model for the homepage About preview."""

from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class HomeAboutSection(UUIDMixin, TimestampMixin, Base):
    """Homepage About preview singleton.

    This is intentionally separate from the About page hero/story content.
    """

    __tablename__ = "home_about_sections"

    eyebrow: Mapped[Optional[str]] = mapped_column(String(255), default="Our Story", nullable=True)
    heading: Mapped[str] = mapped_column(String(255), nullable=False, default="Crafting Journeys That Stay With You")
    description: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=True)
    button_text: Mapped[Optional[str]] = mapped_column(String(255), default="Know Our Story", nullable=True)
    button_url: Mapped[Optional[str]] = mapped_column(String(1024), default="/about", nullable=True)
    image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True
    )
    image_alt: Mapped[Optional[str]] = mapped_column(String(500), default=None, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true", nullable=False)

    image = relationship("Media", foreign_keys=[image_id], lazy="selectin")
