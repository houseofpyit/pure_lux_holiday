"""CRM services — ContactInquiry, JourneyRequest, NewsletterSubscriber."""

from __future__ import annotations

import uuid

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.crm_repositories import (
    ContactInquiryRepository,
    JourneyRequestRepository,
    NewsletterSubscriberRepository,
)
from app.schemas.crm import (
    ContactInquiryCreate,
    ContactInquiryResponse,
    ContactInquiryUpdate,
    JourneyRequestCreate,
    JourneyRequestResponse,
    JourneyRequestUpdate,
    NewsletterSubscriberCreate,
    NewsletterSubscriberResponse,
    NewsletterSubscriberUpdate,
)


# ─── Contact Inquiry Service ─────────────────────────────────────────────────

class ContactInquiryService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = ContactInquiryRepository(session)

    async def get_all(self) -> list[ContactInquiryResponse]:
        items = await self.repo.get_all_ordered()
        return [ContactInquiryResponse.model_validate(i) for i in items]

    async def get_by_id(self, item_id: uuid.UUID) -> ContactInquiryResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Inquiry not found")
        return ContactInquiryResponse.model_validate(item)

    async def create(self, data: ContactInquiryCreate) -> ContactInquiryResponse:
        item = await self.repo.create(**data.model_dump())
        return ContactInquiryResponse.model_validate(item)

    async def update(self, item_id: uuid.UUID, data: ContactInquiryUpdate) -> ContactInquiryResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Inquiry not found")
        update_data = data.model_dump(exclude_unset=True)
        if update_data:
            item = await self.repo.update(item, **update_data)
        return ContactInquiryResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Inquiry not found")
        await self.repo.delete(item)


# ─── Journey Request Service ─────────────────────────────────────────────────

class JourneyRequestService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = JourneyRequestRepository(session)

    async def get_all(self) -> list[JourneyRequestResponse]:
        items = await self.repo.get_all_ordered()
        return [JourneyRequestResponse.model_validate(i) for i in items]

    async def get_by_id(self, item_id: uuid.UUID) -> JourneyRequestResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Journey request not found")
        return JourneyRequestResponse.model_validate(item)

    async def create(self, data: JourneyRequestCreate) -> JourneyRequestResponse:
        item = await self.repo.create(**data.model_dump())
        return JourneyRequestResponse.model_validate(item)

    async def update(self, item_id: uuid.UUID, data: JourneyRequestUpdate) -> JourneyRequestResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Journey request not found")
        update_data = data.model_dump(exclude_unset=True)
        if update_data:
            item = await self.repo.update(item, **update_data)
        return JourneyRequestResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Journey request not found")
        await self.repo.delete(item)


# ─── Newsletter Subscriber Service ───────────────────────────────────────────

class NewsletterSubscriberService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = NewsletterSubscriberRepository(session)

    async def get_all(self) -> list[NewsletterSubscriberResponse]:
        items = await self.repo.get_all_ordered()
        return [NewsletterSubscriberResponse.model_validate(i) for i in items]

    async def get_by_id(self, item_id: uuid.UUID) -> NewsletterSubscriberResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Subscriber not found")
        return NewsletterSubscriberResponse.model_validate(item)

    async def create(self, data: NewsletterSubscriberCreate) -> NewsletterSubscriberResponse:
        if await self.repo.email_exists(data.email):
            raise HTTPException(409, f"Email '{data.email}' is already subscribed")
        item = await self.repo.create(**data.model_dump())
        return NewsletterSubscriberResponse.model_validate(item)

    async def update(self, item_id: uuid.UUID, data: NewsletterSubscriberUpdate) -> NewsletterSubscriberResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Subscriber not found")
        update_data = data.model_dump(exclude_unset=True)
        if update_data:
            item = await self.repo.update(item, **update_data)
        return NewsletterSubscriberResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Subscriber not found")
        await self.repo.delete(item)
