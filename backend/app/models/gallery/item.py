from __future__ import annotations
import uuid
from typing import Optional
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.mixins import UUIDMixin

class GalleryItem(UUIDMixin, Base):
    __tablename__ = "gallery_items"
    album_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("gallery_albums.id", ondelete="CASCADE"), nullable=False, index=True)
    media_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[Optional[str]] = mapped_column(String(255), default=None, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=True)
    media_type: Mapped[str] = mapped_column(String(20), default="image", nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    media = relationship("Media", foreign_keys=[media_id], lazy="selectin")