from __future__ import annotations
import uuid
from typing import Optional
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin

class GalleryAlbum(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "gallery_albums"
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("gallery_categories.id", ondelete="SET NULL"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=True)
    cover_media_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(255), default=None, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(255), default=None, nullable=True)
    featured: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False, index=True)
    homepage_featured: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False, index=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true", nullable=False)
    category = relationship("GalleryCategory", foreign_keys=[category_id], lazy="selectin")
    cover = relationship("Media", foreign_keys=[cover_media_id], lazy="selectin")