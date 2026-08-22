from __future__ import annotations
import uuid
from typing import Optional
from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin

class AboutPage(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "about_page"
    hero_title: Mapped[str] = mapped_column(String(255), nullable=False, default="About Us")
    hero_subtitle: Mapped[Optional[str]] = mapped_column(String(500), default=None, nullable=True)
    hero_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    company_description: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=True)
    our_story: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=True)
    mission: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=True)
    vision: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=True)
    seo_title: Mapped[Optional[str]] = mapped_column(String(255), default=None, nullable=True)
    seo_description: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true", nullable=False)
    hero_image = relationship("Media", foreign_keys=[hero_image_id], lazy="selectin")