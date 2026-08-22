from __future__ import annotations
import uuid
from typing import Optional
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.mixins import UUIDMixin

class PackageItinerary(UUIDMixin, Base):
    __tablename__ = "package_itineraries"
    package_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("luxury_packages.id", ondelete="CASCADE"), nullable=False, index=True)
    day_number: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=True)
    hotel: Mapped[Optional[str]] = mapped_column(String(255), default=None, nullable=True)
    meal_plan: Mapped[Optional[str]] = mapped_column(String(255), default=None, nullable=True)
    media_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    media = relationship("Media", foreign_keys=[media_id], lazy="selectin")