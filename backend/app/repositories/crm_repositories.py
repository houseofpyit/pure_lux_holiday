"""CRM repositories — ContactInquiry, JourneyRequest, NewsletterSubscriber."""

from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.repositories.base_repository import BaseRepository
from app.models.crm.contact_inquiry import ContactInquiry
from app.models.crm.journey_request import JourneyRequest
from app.models.crm.newsletter_subscriber import NewsletterSubscriber


class ContactInquiryRepository(BaseRepository[ContactInquiry]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, ContactInquiry)

    async def get_all_ordered(self) -> list[ContactInquiry]:
        stmt = select(ContactInquiry).order_by(ContactInquiry.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())


class JourneyRequestRepository(BaseRepository[JourneyRequest]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, JourneyRequest)

    async def get_all_ordered(self) -> list[JourneyRequest]:
        stmt = select(JourneyRequest).order_by(JourneyRequest.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())


class NewsletterSubscriberRepository(BaseRepository[NewsletterSubscriber]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, NewsletterSubscriber)

    async def email_exists(self, email: str) -> bool:
        stmt = select(NewsletterSubscriber).where(NewsletterSubscriber.email == email)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def get_all_ordered(self) -> list[NewsletterSubscriber]:
        stmt = select(NewsletterSubscriber).order_by(NewsletterSubscriber.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())
