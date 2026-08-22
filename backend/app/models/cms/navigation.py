"""Navigation model for menu management."""

from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class Navigation(UUIDMixin, TimestampMixin, Base):
    """Navigation menu item.

    Supports hierarchical menus via parent_id and ordering.
    Each item can have an icon, custom URL, and target attribute.
    """

    __tablename__ = "navigations"

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    url: Mapped[Optional[str]] = mapped_column(
        String(1024),
        default=None,
        nullable=True,
    )

    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("navigations.id", ondelete="SET NULL"),
        nullable=True,
    )

    icon: Mapped[Optional[str]] = mapped_column(
        String(255),
        default=None,
        nullable=True,
    )

    order: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
        index=True,
    )

    target: Mapped[str] = mapped_column(
        String(20),
        default="_self",
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
    )

    # Self-referential relationship for hierarchy
    children = relationship(
        "Navigation",
        backref="parent",
        remote_side="Navigation.id",
        lazy="selectin",
        order_by="Navigation.order",
    )

    def __repr__(self) -> str:
        return f"<Navigation id={self.id} title={self.title} slug={self.slug}>"