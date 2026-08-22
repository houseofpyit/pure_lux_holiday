"""Footer models for footer section and link management."""

from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class FooterSection(UUIDMixin, TimestampMixin, Base):
    """Footer section/column for organizing footer links."""

    __tablename__ = "footer_sections"

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    order: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
    )

    # Relationships
    links = relationship(
        "FooterLink",
        back_populates="section",
        lazy="selectin",
        order_by="FooterLink.order",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<FooterSection id={self.id} title={self.title}>"


class FooterLink(UUIDMixin, TimestampMixin, Base):
    """Individual link within a footer section."""

    __tablename__ = "footer_links"

    footer_section_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("footer_sections.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    url: Mapped[str] = mapped_column(
        String(1024),
        nullable=False,
    )

    target: Mapped[str] = mapped_column(
        String(20),
        default="_self",
        nullable=False,
    )

    order: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    # Relationships
    section = relationship("FooterSection", back_populates="links")

    def __repr__(self) -> str:
        return f"<FooterLink id={self.id} title={self.title}>"