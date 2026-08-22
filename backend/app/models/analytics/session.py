"""Analytics session — one row per website visitor."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class AnalyticsSession(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "analytics_sessions"

    visitor_id: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    first_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )
    user_agent: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    referrer: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)

    page_views = relationship("PageView", back_populates="session", lazy="selectin")

    def __repr__(self) -> str:
        return f"<AnalyticsSession id={self.id} visitor_id={self.visitor_id!r}>"
