from __future__ import annotations
import uuid
from typing import Optional
from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin

class LuxuryPackage(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "luxury_packages"
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("package_categories.id", ondelete="SET NULL"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    short_description: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(255), default=None, nullable=True, index=True)
    city: Mapped[Optional[str]] = mapped_column(String(255), default=None, nullable=True, index=True)
    duration_days: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    duration_nights: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    starting_price: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), default=None, nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)
    featured_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    banner_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    video_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False, index=True)
    is_popular: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true", nullable=False)
    seo_title: Mapped[Optional[str]] = mapped_column(String(255), default=None, nullable=True)
    seo_description: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=True)
    category = relationship("PackageCategory", foreign_keys=[category_id], lazy="selectin")
    featured_image = relationship("Media", foreign_keys=[featured_image_id], lazy="selectin")
    banner_image = relationship("Media", foreign_keys=[banner_image_id], lazy="selectin")
    video = relationship("Media", foreign_keys=[video_id], lazy="selectin")