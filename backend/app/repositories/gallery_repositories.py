"""Gallery repositories for Gallery Management module."""

from __future__ import annotations
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.repositories.base_repository import BaseRepository
from app.models.gallery import GalleryAlbum, GalleryCategory, GalleryItem


class GalleryCategoryRepository(BaseRepository[GalleryCategory]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, GalleryCategory)

    async def slug_exists(self, slug: str, exclude_id: Optional[object] = None) -> bool:
        stmt = select(GalleryCategory).where(GalleryCategory.slug == slug)
        if exclude_id is not None:
            stmt = stmt.where(GalleryCategory.id != exclude_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def get_active(self) -> list[GalleryCategory]:
        stmt = (
            select(GalleryCategory)
            .where(GalleryCategory.is_active.is_(True))
            .order_by(GalleryCategory.display_order)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())


class GalleryAlbumRepository(BaseRepository[GalleryAlbum]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, GalleryAlbum)

    async def slug_exists(self, slug: str, exclude_id: Optional[object] = None) -> bool:
        stmt = select(GalleryAlbum).where(GalleryAlbum.slug == slug)
        if exclude_id is not None:
            stmt = stmt.where(GalleryAlbum.id != exclude_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def get_featured(self) -> list[GalleryAlbum]:
        stmt = select(GalleryAlbum).where(GalleryAlbum.featured.is_(True), GalleryAlbum.is_active.is_(True)).order_by(GalleryAlbum.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def get_homepage_featured(self) -> list[GalleryAlbum]:
        stmt = select(GalleryAlbum).where(GalleryAlbum.homepage_featured.is_(True), GalleryAlbum.is_active.is_(True)).order_by(GalleryAlbum.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def get_latest(self, limit: int = 6) -> list[GalleryAlbum]:
        stmt = select(GalleryAlbum).where(GalleryAlbum.is_active.is_(True)).order_by(GalleryAlbum.created_at.desc()).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def get_by_slug(self, slug: str) -> Optional[GalleryAlbum]:
        stmt = select(GalleryAlbum).where(GalleryAlbum.slug == slug)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_active(self) -> list[GalleryAlbum]:
        stmt = (
            select(GalleryAlbum)
            .where(GalleryAlbum.is_active.is_(True))
            .order_by(GalleryAlbum.display_order)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())


class GalleryItemRepository(BaseRepository[GalleryItem]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, GalleryItem)

    async def get_by_album(self, album_id: object) -> list[GalleryItem]:
        stmt = select(GalleryItem).where(GalleryItem.album_id == album_id).order_by(GalleryItem.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def get_active(self) -> list[GalleryItem]:
        stmt = (
            select(GalleryItem)
            .join(GalleryAlbum, GalleryItem.album_id == GalleryAlbum.id)
            .where(GalleryAlbum.is_active.is_(True))
            .order_by(GalleryItem.display_order, GalleryItem.id)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())