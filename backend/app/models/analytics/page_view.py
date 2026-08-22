"""Page view event — one row per tracked page load."""

from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class PageView(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "page_views"

    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("analytics_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    path: Mapped[str] = mapped_column(String(512), nullable=False, index=True)
    page_title: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    referrer: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)

    session = relationship("AnalyticsSession", back_populates="page_views", lazy="selectin")

    def __repr__(self) -> str:
        return f"<PageView id={self.id} path={self.path!r}>"
