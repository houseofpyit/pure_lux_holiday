from __future__ import annotations
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, DateTime, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin

class Testimonial(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "testimonials"
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("testimonial_categories.id", ondelete="SET NULL"), nullable=True, index=True)
    package_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("luxury_packages.id", ondelete="SET NULL"), nullable=True, index=True)
    destination_slug: Mapped[Optional[str]] = mapped_column(String(255), default=None, nullable=True, index=True)
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_location: Mapped[Optional[str]] = mapped_column(String(255), default=None, nullable=True)
    customer_designation: Mapped[Optional[str]] = mapped_column(String(255), default=None, nullable=True)
    rating: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(255), default=None, nullable=True)
    review: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=True)
    profile_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    customer_photo_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    background_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    video_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    video_thumbnail_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    travel_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), default=None, nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False, index=True)
    homepage_featured: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False, index=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true", nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true", nullable=False)
    category = relationship("TestimonialCategory", foreign_keys=[category_id], lazy="selectin")
    package = relationship("LuxuryPackage", foreign_keys=[package_id], lazy="selectin")
    profile_image = relationship("Media", foreign_keys=[profile_image_id], lazy="selectin")
    customer_photo = relationship("Media", foreign_keys=[customer_photo_id], lazy="selectin")
    background_image = relationship("Media", foreign_keys=[background_image_id], lazy="selectin")
    video = relationship("Media", foreign_keys=[video_id], lazy="selectin")
    video_thumbnail = relationship("Media", foreign_keys=[video_thumbnail_id], lazy="selectin")
