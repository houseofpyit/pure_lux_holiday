"""SEO repositories for SEO configuration data access."""

from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.repositories.base_repository import BaseRepository
from app.models.seo import (
    PageSEO,
    Redirect,
    RobotsSettings,
    SEOSettings,
    SitemapSettings,
)


class SEOSettingsRepository(BaseRepository[SEOSettings]):
    """Repository for SEOSettings singleton operations."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, SEOSettings)

    async def get_singleton(self) -> Optional[SEOSettings]:
        """Get the single SEOSettings record, creating one if none exists."""
        stmt = select(SEOSettings).limit(1)
        result = await self.session.execute(stmt)
        settings = result.scalar_one_or_none()
        if settings is None:
            settings = SEOSettings()
            self.session.add(settings)
            await self.session.flush()
            await self.session.refresh(settings)
        return settings


class PageSEORepository(BaseRepository[PageSEO]):
    """Repository for PageSEO CRUD operations."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, PageSEO)

    async def get_by_page_key(self, page_key: str) -> Optional[PageSEO]:
        """Find a PageSEO record by its page_key."""
        stmt = select(PageSEO).where(PageSEO.page_key == page_key)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def page_key_exists(self, page_key: str, exclude_id: Optional[uuid.UUID] = None) -> bool:
        """Check if a page_key exists, optionally excluding a specific ID."""
        stmt = select(PageSEO).where(PageSEO.page_key == page_key)
        if exclude_id is not None:
            stmt = stmt.where(PageSEO.id != exclude_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def get_active_pages(self) -> list[PageSEO]:
        """Get all active PageSEO records."""
        stmt = select(PageSEO).where(PageSEO.is_active.is_(True)).order_by(PageSEO.page_key)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())


class SitemapRepository(BaseRepository[SitemapSettings]):
    """Repository for SitemapSettings singleton operations."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, SitemapSettings)

    async def get_singleton(self) -> Optional[SitemapSettings]:
        """Get the single SitemapSettings record, creating one if none exists."""
        stmt = select(SitemapSettings).limit(1)
        result = await self.session.execute(stmt)
        settings = result.scalar_one_or_none()
        if settings is None:
            settings = SitemapSettings()
            self.session.add(settings)
            await self.session.flush()
            await self.session.refresh(settings)
        return settings


class RobotsRepository(BaseRepository[RobotsSettings]):
    """Repository for RobotsSettings singleton operations."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, RobotsSettings)

    async def get_singleton(self) -> Optional[RobotsSettings]:
        """Get the single RobotsSettings record, creating one if none exists."""
        stmt = select(RobotsSettings).limit(1)
        result = await self.session.execute(stmt)
        settings = result.scalar_one_or_none()
        if settings is None:
            settings = RobotsSettings()
            self.session.add(settings)
            await self.session.flush()
            await self.session.refresh(settings)
        return settings


class RedirectRepository(BaseRepository[Redirect]):
    """Repository for Redirect CRUD operations."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Redirect)

    async def get_by_source_path(self, source_path: str) -> Optional[Redirect]:
        """Find a redirect by its source path."""
        stmt = select(Redirect).where(Redirect.source_path == source_path)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def source_path_exists(self, source_path: str, exclude_id: Optional[uuid.UUID] = None) -> bool:
        """Check if a source_path exists, optionally excluding a specific ID."""
        stmt = select(Redirect).where(Redirect.source_path == source_path)
        if exclude_id is not None:
            stmt = stmt.where(Redirect.id != exclude_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def get_active_redirects(self) -> list[Redirect]:
        """Get all active redirects."""
        stmt = select(Redirect).where(Redirect.is_active.is_(True)).order_by(Redirect.source_path)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def get_active_by_source(self, source_path: str) -> Optional[Redirect]:
        """Find an active redirect by source path."""
        stmt = select(Redirect).where(
            Redirect.source_path == source_path,
            Redirect.is_active.is_(True),
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def increment_hit_count(self, redirect_id: uuid.UUID) -> None:
        """Increment the hit count for a redirect."""
        redirect = await self.get_by_id(redirect_id)
        if redirect:
            redirect.hit_count += 1
            await self.session.flush()