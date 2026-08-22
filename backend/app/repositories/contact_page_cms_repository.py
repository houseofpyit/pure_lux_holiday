"""ContactPageCMS repository for contact page presentation settings."""

from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.repositories.base_repository import BaseRepository
from app.models.cms.contact_page_cms import ContactPageCMS


class ContactPageCMSRepository(BaseRepository[ContactPageCMS]):
    """Repository for ContactPageCMS singleton operations."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, ContactPageCMS)

    async def get_singleton(self) -> Optional[ContactPageCMS]:
        """Get the single ContactPageCMS record, creating one if none exists."""
        stmt = select(ContactPageCMS).limit(1)
        result = await self.session.execute(stmt)
        settings = result.scalar_one_or_none()
        if settings is None:
            settings = ContactPageCMS()
            self.session.add(settings)
            await self.session.flush()
            await self.session.refresh(settings)
        return settings