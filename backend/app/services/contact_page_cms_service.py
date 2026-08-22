"""ContactPageCMS service for contact page presentation settings."""

from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cms.contact_page_cms import ContactPageCMS
from app.repositories.contact_page_cms_repository import ContactPageCMSRepository
from app.schemas.contact_page_cms import ContactPageCMSResponse, ContactPageCMSUpdate
from app.utils.media.media_validation import media_fields_from_payload, validate_media_ids


class ContactPageCMSService:
    """Service for ContactPageCMS singleton management."""

    def __init__(self, session: AsyncSession) -> None:
        self.repo = ContactPageCMSRepository(session)

    async def get(self) -> ContactPageCMSResponse:
        """Get contact page CMS settings, creating defaults if none exist."""
        settings = await self.repo.get_singleton()
        return ContactPageCMSResponse.model_validate(settings)

    async def update(self, data: ContactPageCMSUpdate) -> ContactPageCMSResponse:
        """Update contact page CMS settings."""
        settings = await self.repo.get_singleton()
        update_data = data.model_dump(exclude_unset=True)
        
        if not update_data:
            return ContactPageCMSResponse.model_validate(settings)

        await validate_media_ids(self.repo.session, media_fields_from_payload(update_data))

        for key, value in update_data.items():
            setattr(settings, key, value)

        await self.repo.session.flush()
        await self.repo.session.refresh(settings)
        return ContactPageCMSResponse.model_validate(settings)