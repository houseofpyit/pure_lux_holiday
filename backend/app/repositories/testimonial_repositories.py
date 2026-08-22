"""Testimonial repositories for Testimonials & Reviews module."""

from __future__ import annotations
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.repositories.base_repository import BaseRepository
from app.models.testimonials import Testimonial, TestimonialCategory


class TestimonialCategoryRepository(BaseRepository[TestimonialCategory]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, TestimonialCategory)

    async def slug_exists(self, slug: str, exclude_id: Optional[object] = None) -> bool:
        stmt = select(TestimonialCategory).where(TestimonialCategory.slug == slug)
        if exclude_id is not None:
            stmt = stmt.where(TestimonialCategory.id != exclude_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None


class TestimonialRepository(BaseRepository[Testimonial]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Testimonial)

    async def get_featured(self) -> list[Testimonial]:
        stmt = select(Testimonial).where(Testimonial.is_featured.is_(True), Testimonial.is_active.is_(True)).order_by(Testimonial.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def get_homepage_featured(self) -> list[Testimonial]:
        stmt = select(Testimonial).where(Testimonial.homepage_featured.is_(True), Testimonial.is_active.is_(True)).order_by(Testimonial.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def get_latest(self, limit: int = 6) -> list[Testimonial]:
        stmt = select(Testimonial).where(Testimonial.is_active.is_(True)).order_by(Testimonial.created_at.desc()).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def get_by_package(self, package_id: object) -> list[Testimonial]:
        stmt = select(Testimonial).where(Testimonial.package_id == package_id, Testimonial.is_active.is_(True)).order_by(Testimonial.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def get_by_destination(self, destination_slug: str) -> list[Testimonial]:
        stmt = select(Testimonial).where(Testimonial.destination_slug == destination_slug, Testimonial.is_active.is_(True)).order_by(Testimonial.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())