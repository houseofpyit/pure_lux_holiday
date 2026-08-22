"""AdminUser model for internal staff authentication and authorization."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.constants.enums import UserRole
from app.db.base import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class AdminUser(UUIDMixin, TimestampMixin, Base):
    """Internal staff user for admin panel access.

    Stores authentication credentials, role assignments,
    and account status for administrative users.
    """

    __tablename__ = "admin_users"

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role: Mapped[UserRole] = mapped_column(
        String(50),
        default=UserRole.EDITOR,
        nullable=False,
        index=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
    )

    last_login: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        default=None,
        server_default=None,
        nullable=True,
    )

    def __repr__(self) -> str:
        return f"<AdminUser id={self.id} email={self.email} role={self.role}>"