"""CMS repositories for global configuration data access."""

from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.repositories.base_repository import BaseRepository
from app.models.cms import (
    CTASettings,
    ContactPageCMS,
    ContactSettings,
    FooterLink,
    FooterSection,
    Navigation,
    SiteSettings,
)
from app.models.seo import SEOSettings


class SiteSettingsRepository(BaseRepository[SiteSettings]):
    """Repository for SiteSettings singleton operations."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, SiteSettings)

    async def get_singleton(self) -> Optional[SiteSettings]:
        """Get the single SiteSettings record, creating one if none exists."""
        stmt = select(SiteSettings).limit(1)
        result = await self.session.execute(stmt)
        settings = result.scalar_one_or_none()
        if settings is None:
            settings = SiteSettings()
            self.session.add(settings)
            await self.session.flush()
            await self.session.refresh(settings)
        return settings




class NavigationRepository(BaseRepository[Navigation]):
    """Repository for Navigation CRUD operations."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Navigation)

    async def get_by_slug(self, slug: str) -> Optional[Navigation]:
        """Find a navigation item by its slug."""
        stmt = select(Navigation).where(Navigation.slug == slug)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_active_menu(self) -> list[Navigation]:
        """Get all active navigation items ordered by their position."""
        stmt = (
            select(Navigation)
            .where(Navigation.is_active.is_(True))
            .order_by(Navigation.order)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def slug_exists(self, slug: str, exclude_id: Optional[object] = None) -> bool:
        """Check if a slug exists, optionally excluding a specific ID."""
        stmt = select(Navigation).where(Navigation.slug == slug)
        if exclude_id is not None:
            stmt = stmt.where(Navigation.id != exclude_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None


class FooterRepository(BaseRepository[FooterSection]):
    """Repository for FooterSection CRUD with cascade link management."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, FooterSection)

    async def get_section_with_links(self, section_id: uuid.UUID) -> Optional[FooterSection]:
        """Get a footer section with its links eagerly loaded."""
        stmt = select(FooterSection).where(FooterSection.id == section_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_active_sections(self) -> list[FooterSection]:
        """Get all active footer sections ordered by their position."""
        stmt = (
            select(FooterSection)
            .where(FooterSection.is_active.is_(True))
            .order_by(FooterSection.order)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def add_link_to_section(
        self,
        section_id: uuid.UUID,
        title: str,
        url: str,
        target: str = "_self",
        order: int = 0,
    ) -> FooterLink:
        """Add a new link to a footer section."""
        link = FooterLink(
            footer_section_id=section_id,
            title=title,
            url=url,
            target=target,
            order=order,
        )
        self.session.add(link)
        await self.session.flush()
        await self.session.refresh(link)
        return link


class ContactRepository(BaseRepository[ContactSettings]):
    """Repository for ContactSettings singleton operations."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, ContactSettings)

    async def get_singleton(self) -> Optional[ContactSettings]:
        """Get the single ContactSettings record, creating one if none exists."""
        stmt = select(ContactSettings).limit(1)
        result = await self.session.execute(stmt)
        settings = result.scalar_one_or_none()
        if settings is None:
            settings = ContactSettings()
            self.session.add(settings)
            await self.session.flush()
            await self.session.refresh(settings)
        return settings


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


class CTARepository(BaseRepository[CTASettings]):
    """Repository for CTASettings singleton operations."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, CTASettings)

    async def get_singleton(self) -> Optional[CTASettings]:
        """Get the single CTASettings record, creating one if none exists."""
        stmt = select(CTASettings).limit(1)
        result = await self.session.execute(stmt)
        settings = result.scalar_one_or_none()
        if settings is None:
            settings = CTASettings()
            self.session.add(settings)
            await self.session.flush()
            await self.session.refresh(settings)
        return settings
