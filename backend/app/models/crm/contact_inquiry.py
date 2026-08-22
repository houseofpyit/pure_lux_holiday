"""ContactInquiry model — website contact form submissions."""

from __future__ import annotations

from typing import Optional

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class ContactInquiry(UUIDMixin, TimestampMixin, Base):
    """A contact form submission from the website.

    Captures every inquiry submitted via the contact page form.
    """

    __tablename__ = "contact_inquiries"

    # ─── Sender details ───────────────────────────────────────────────────────

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    subject: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ─── CRM workflow ─────────────────────────────────────────────────────────

    # new | assigned | contacted | qualified | closed | spam
    status: Mapped[str] = mapped_column(
        String(50), default="new", server_default="new", nullable=False, index=True
    )
    assigned_to: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ─── Source tracking ──────────────────────────────────────────────────────

    source: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # e.g. "contact_page"

    def __repr__(self) -> str:
        return f"<ContactInquiry id={self.id} email={self.email!r} status={self.status!r}>"
