"""Package repositories for all package CMS modules."""

from __future__ import annotations
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.repositories.base_repository import BaseRepository
from app.models.packages import (
    LuxuryPackage, PackageCategory, PackageExclusion, PackageFAQ,
    PackageGallery, PackageHighlight, PackageInclusion, PackageItinerary,
)

class PackageCategoryRepository(BaseRepository[PackageCategory]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, PackageCategory)
    async def slug_exists(self, slug: str, exclude_id: Optional[object] = None) -> bool:
        stmt = select(PackageCategory).where(PackageCategory.slug == slug)
        if exclude_id is not None:
            stmt = stmt.where(PackageCategory.id != exclude_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None

class LuxuryPackageRepository(BaseRepository[LuxuryPackage]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, LuxuryPackage)
    async def slug_exists(self, slug: str, exclude_id: Optional[object] = None) -> bool:
        stmt = select(LuxuryPackage).where(LuxuryPackage.slug == slug)
        if exclude_id is not None:
            stmt = stmt.where(LuxuryPackage.id != exclude_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None
    async def get_featured(self) -> list[LuxuryPackage]:
        stmt = select(LuxuryPackage).where(LuxuryPackage.is_featured.is_(True), LuxuryPackage.is_active.is_(True)).order_by(LuxuryPackage.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())
    async def get_popular(self) -> list[LuxuryPackage]:
        stmt = select(LuxuryPackage).where(LuxuryPackage.is_popular.is_(True), LuxuryPackage.is_active.is_(True)).order_by(LuxuryPackage.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())
    async def get_latest(self, limit: int = 6) -> list[LuxuryPackage]:
        stmt = select(LuxuryPackage).where(LuxuryPackage.is_active.is_(True)).order_by(LuxuryPackage.created_at.desc()).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())
    async def get_by_slug(self, slug: str) -> Optional[LuxuryPackage]:
        stmt = select(LuxuryPackage).where(LuxuryPackage.slug == slug)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

class PackageGalleryRepository(BaseRepository[PackageGallery]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, PackageGallery)
    async def get_by_package(self, package_id: object) -> list[PackageGallery]:
        stmt = select(PackageGallery).where(PackageGallery.package_id == package_id).order_by(PackageGallery.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

class PackageItineraryRepository(BaseRepository[PackageItinerary]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, PackageItinerary)
    async def get_by_package(self, package_id: object) -> list[PackageItinerary]:
        stmt = select(PackageItinerary).where(PackageItinerary.package_id == package_id).order_by(PackageItinerary.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

class PackageHighlightRepository(BaseRepository[PackageHighlight]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, PackageHighlight)
    async def get_by_package(self, package_id: object) -> list[PackageHighlight]:
        stmt = select(PackageHighlight).where(PackageHighlight.package_id == package_id).order_by(PackageHighlight.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

class PackageFAQRepository(BaseRepository[PackageFAQ]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, PackageFAQ)
    async def get_by_package(self, package_id: object) -> list[PackageFAQ]:
        stmt = select(PackageFAQ).where(PackageFAQ.package_id == package_id).order_by(PackageFAQ.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

class PackageInclusionRepository(BaseRepository[PackageInclusion]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, PackageInclusion)
    async def get_by_package(self, package_id: object) -> list[PackageInclusion]:
        stmt = select(PackageInclusion).where(PackageInclusion.package_id == package_id).order_by(PackageInclusion.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

class PackageExclusionRepository(BaseRepository[PackageExclusion]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, PackageExclusion)
    async def get_by_package(self, package_id: object) -> list[PackageExclusion]:
        stmt = select(PackageExclusion).where(PackageExclusion.package_id == package_id).order_by(PackageExclusion.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())