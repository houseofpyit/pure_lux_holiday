"""NewsletterSubscriber model — email newsletter subscriptions."""

from __future__ import annotations

from typing import Optional

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class NewsletterSubscriber(UUIDMixin, TimestampMixin, Base):
    """An email address subscribed to the newsletter.

    Captures every newsletter subscription with source tracking
    and unsubscribe support.
    """

    __tablename__ = "newsletter_subscribers"

    # ─── Subscriber details ───────────────────────────────────────────────────

    email: Mapped[str] = mapped_column(
        String(255), nullable=False, unique=True, index=True
    )
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true", nullable=False, index=True
    )

    # ─── Source tracking ──────────────────────────────────────────────────────

    source: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True
    )  # e.g. "homepage_footer", "blog_page", "contact_page"

    def __repr__(self) -> str:
        return f"<NewsletterSubscriber id={self.id} email={self.email!r} active={self.is_active}>"
