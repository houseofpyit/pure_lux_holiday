from __future__ import annotations
import uuid
from typing import Optional
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.mixins import UUIDMixin

class CompanyTimeline(UUIDMixin, Base):
    __tablename__ = "company_timelines"
    year: Mapped[str] = mapped_column(String(20), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=True)
    image_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    image = relationship("Media", foreign_keys=[image_id], lazy="selectin")