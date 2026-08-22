"""ContactSettings model for global contact information."""

from __future__ import annotations

from typing import Optional

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class ContactSettings(UUIDMixin, TimestampMixin, Base):
    """Global contact information singleton.

    Stores business contact details including phone, email,
    address, working hours, and emergency contact information.
    Only one record should exist.
    """

    __tablename__ = "contact_settings"

    email: Mapped[Optional[str]] = mapped_column(
        String(255),
        default=None,
        nullable=True,
    )

    phone: Mapped[Optional[str]] = mapped_column(
        String(50),
        default=None,
        nullable=True,
    )

    whatsapp: Mapped[Optional[str]] = mapped_column(
        String(50),
        default=None,
        nullable=True,
    )

    address: Mapped[Optional[str]] = mapped_column(
        Text,
        default=None,
        nullable=True,
    )

    working_hours: Mapped[Optional[str]] = mapped_column(
        String(500),
        default=None,
        nullable=True,
    )

    google_map_url: Mapped[Optional[str]] = mapped_column(
        String(1024),
        default=None,
        nullable=True,
    )

    emergency_number: Mapped[Optional[str]] = mapped_column(
        String(50),
        default=None,
        nullable=True,
    )

    def __repr__(self) -> str:
        return f"<ContactSettings id={self.id}>"