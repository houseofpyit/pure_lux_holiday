from __future__ import annotations
import uuid
from typing import Optional
from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
from app.models.mixins import UUIDMixin

class PackageFAQ(UUIDMixin, Base):
    __tablename__ = "package_faqs"
    package_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("luxury_packages.id", ondelete="CASCADE"), nullable=False, index=True)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)