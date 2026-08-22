from __future__ import annotations
from typing import Optional
from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin

class CompanyStatistic(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "company_statistics"
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[str] = mapped_column(String(255), nullable=False)
    suffix: Mapped[Optional[str]] = mapped_column(String(50), default=None, nullable=True)
    icon: Mapped[Optional[str]] = mapped_column(String(255), default=None, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true", nullable=False)