"""RobotsSettings model for robots.txt configuration."""

from __future__ import annotations

from sqlalchemy import Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class RobotsSettings(UUIDMixin, TimestampMixin, Base):
    """Robots.txt configuration singleton.

    Stores the content for the robots.txt file.
    """

    __tablename__ = "robots_settings"

    robots_content: Mapped[str] = mapped_column(
        Text,
        default="User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://example.com/sitemap.xml",
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<RobotsSettings id={self.id}>"