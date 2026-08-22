"""Redirect model for URL redirects."""

from __future__ import annotations

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class Redirect(UUIDMixin, TimestampMixin, Base):
    """URL redirect configuration.

    Maps source paths to destination paths with HTTP status codes.
    """

    __tablename__ = "redirects"

    source_path: Mapped[str] = mapped_column(
        String(1024),
        nullable=False,
        index=True,
    )

    destination_path: Mapped[str] = mapped_column(
        String(1024),
        nullable=False,
    )

    redirect_type: Mapped[int] = mapped_column(
        Integer,
        default=301,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
    )

    hit_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Redirect id={self.id} source={self.source_path} -> {self.destination_path}>"