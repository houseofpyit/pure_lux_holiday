"""Media model for managing file uploads and asset metadata."""

from __future__ import annotations

from typing import Optional

from sqlalchemy import BigInteger, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.constants.enums import MediaType
from app.db.base import Base
from app.models.mixins import SoftDeleteMixin, UUIDMixin, TimestampMixin


class Media(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    """Uploaded media asset metadata.

    Stores references to files stored in the upload directory
    or cloud storage, along with metadata such as dimensions,
    file type, and categorization.
    """

    __tablename__ = "media"

    filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )

    original_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    file_url: Mapped[str] = mapped_column(
        String(1024),
        nullable=False,
    )

    mime_type: Mapped[str] = mapped_column(
        String(127),
        nullable=False,
        index=True,
    )

    extension: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    size: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
    )

    folder: Mapped[Optional[str]] = mapped_column(
        String(255),
        default=None,
        nullable=True,
        index=True,
    )

    alt_text: Mapped[Optional[str]] = mapped_column(
        Text,
        default=None,
        nullable=True,
    )

    media_type: Mapped[MediaType] = mapped_column(
        String(20),
        default=MediaType.IMAGE,
        nullable=False,
        index=True,
    )

    width: Mapped[Optional[int]] = mapped_column(
        Integer,
        default=None,
        nullable=True,
    )

    height: Mapped[Optional[int]] = mapped_column(
        Integer,
        default=None,
        nullable=True,
    )

    duration: Mapped[Optional[float]] = mapped_column(
        Float,
        default=None,
        nullable=True,
    )

    def __repr__(self) -> str:
        return (
            f"<Media id={self.id} filename={self.filename} "
            f"type={self.media_type}>"
        )