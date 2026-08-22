"""JourneyRequest model — custom trip planning submissions."""

from __future__ import annotations

from typing import Optional

from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class JourneyRequest(UUIDMixin, TimestampMixin, Base):
    """A custom journey planning request from the website.

    Captures every Plan My Journey / bespoke trip request form submission.
    """

    __tablename__ = "journey_requests"

    # ─── Sender details ───────────────────────────────────────────────────────

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # ─── Trip details ─────────────────────────────────────────────────────────

    destination: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    travel_date: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    duration: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    travelers: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    budget: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    travel_style: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    special_requirements: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ─── CRM workflow ─────────────────────────────────────────────────────────

    # new | assigned | contacted | qualified | quoted | won | lost | closed
    status: Mapped[str] = mapped_column(
        String(50), default="new", server_default="new", nullable=False, index=True
    )
    assigned_to: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ─── Source tracking ──────────────────────────────────────────────────────

    source: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # e.g. "plan_journey_page"

    def __repr__(self) -> str:
        return f"<JourneyRequest id={self.id} email={self.email!r} destination={self.destination!r}>"
