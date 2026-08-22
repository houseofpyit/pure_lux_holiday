from __future__ import annotations
from typing import Optional
from sqlalchemy import Boolean, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin

class CompanyFAQ(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "company_faqs"
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true", nullable=False)