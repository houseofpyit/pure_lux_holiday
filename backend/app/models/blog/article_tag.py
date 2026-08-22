from __future__ import annotations
import uuid
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
from app.models.mixins import UUIDMixin

class ArticleTag(UUIDMixin, Base):
    __tablename__ = "article_tags"
    article_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("articles.id", ondelete="CASCADE"), nullable=False, index=True)
    tag_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("blog_tags.id", ondelete="CASCADE"), nullable=False, index=True)