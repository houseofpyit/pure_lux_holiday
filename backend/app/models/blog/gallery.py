from __future__ import annotations
import uuid
from typing import Optional
from sqlalchemy import ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.mixins import UUIDMixin

class ArticleGallery(UUIDMixin, Base):
    __tablename__ = "article_gallery"
    article_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("articles.id", ondelete="CASCADE"), nullable=False, index=True)
    media_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    media = relationship("Media", foreign_keys=[media_id], lazy="selectin")