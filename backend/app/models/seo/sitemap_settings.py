"""SitemapSettings model for sitemap configuration."""

from __future__ import annotations

from sqlalchemy import Boolean, String
from sqlalchemy.dialects.postgresql import NUMERIC
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class SitemapSettings(UUIDMixin, TimestampMixin, Base):
    """Sitemap configuration singleton.

    Controls which content types are included in the XML sitemap
    and their default priority and change frequency.
    """

    __tablename__ = "sitemap_settings"

    enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    include_pages: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    include_blog: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    include_destinations: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    include_experiences: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    include_packages: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    include_gallery: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    default_priority: Mapped[float] = mapped_column(
        NUMERIC(2, 1),
        default=0.5,
        nullable=False,
    )

    default_change_frequency: Mapped[str] = mapped_column(
        String(50),
        default="weekly",
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<SitemapSettings id={self.id} enabled={self.enabled}>"