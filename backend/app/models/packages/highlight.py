from __future__ import annotations
import uuid
from typing import Optional
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
from app.models.mixins import UUIDMixin

class PackageHighlight(UUIDMixin, Base):
    __tablename__ = "package_highlights"
    package_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("luxury_packages.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    icon: Mapped[Optional[str]] = mapped_column(String(255), default=None, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)