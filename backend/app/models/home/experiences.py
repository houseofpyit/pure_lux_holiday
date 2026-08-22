"""LuxuryExperience model for homepage experiences section."""

from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class LuxuryExperience(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "luxury_experiences"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    short_description: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=True)
    icon: Mapped[Optional[str]] = mapped_column(String(255), default=None, nullable=True)
    image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True,
    )
    button_text: Mapped[Optional[str]] = mapped_column(String(255), default=None, nullable=True)
    button_url: Mapped[Optional[str]] = mapped_column(String(1024), default=None, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true", nullable=False)

    image = relationship("Media", foreign_keys=[image_id], lazy="selectin")