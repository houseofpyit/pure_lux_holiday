from __future__ import annotations
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin

class Article(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "articles"
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("blog_categories.id", ondelete="SET NULL"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    excerpt: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=True)
    content: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=True)
    featured_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    banner_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    author_name: Mapped[Optional[str]] = mapped_column(String(255), default=None, nullable=True)
    reading_time: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), default=None, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft", nullable=False, index=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False, index=True)
    homepage_featured: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False, index=True)
    allow_comments: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true", nullable=False)
    views_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    seo_title: Mapped[Optional[str]] = mapped_column(String(255), default=None, nullable=True)
    seo_description: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=True)
    category = relationship("BlogCategory", foreign_keys=[category_id], lazy="selectin")
    featured_image = relationship("Media", foreign_keys=[featured_image_id], lazy="selectin")
    banner_image = relationship("Media", foreign_keys=[banner_image_id], lazy="selectin")