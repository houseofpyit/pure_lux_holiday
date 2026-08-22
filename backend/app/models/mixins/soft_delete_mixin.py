"""Soft delete mixin for safe record removal."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column


class SoftDeleteMixin:
    """Add soft delete capability to the model.

    Instead of permanently removing records, they are marked
    as deleted with a timestamp. Queries should filter
    ``is_deleted=False`` unless explicitly including deleted records.
    """

    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default="false",
        nullable=False,
        index=True,
    )

    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        default=None,
        server_default=None,
        nullable=True,
    )

    def soft_delete(self) -> None:
        """Mark the record as deleted with the current timestamp."""
        self.is_deleted = True
        self.deleted_at = datetime.now(timezone.utc)