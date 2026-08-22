"""UUID primary key mixin for all database models."""

from __future__ import annotations

import uuid

from sqlalchemy import Column, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column


class UUIDMixin:
    """Add a UUID primary key to the model.

    Uses PostgreSQL native UUID type for performance
    and storage efficiency. IDs are generated server-side
    using ``uuid_generate_v4()``.
    """

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        nullable=False,
    )