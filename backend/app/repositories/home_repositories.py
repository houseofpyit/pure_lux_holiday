"""Homepage repositories for all homepage CMS modules."""

from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.repositories.base_repository import BaseRepository
from app.models.home import (
    FeaturedDestination,
    HeroSection,
    HomeAboutSection,
    LuxuryCollection,
    LuxuryExperience,
    Statistic,
    WhyChooseUs,
)


class HeroRepository(BaseRepository[HeroSection]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, HeroSection)

    async def get_active(self) -> Optional[HeroSection]:
        stmt = select(HeroSection).where(HeroSection.is_active.is_(True)).limit(1)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_singleton(self) -> Optional[HeroSection]:
        stmt = select(HeroSection).limit(1)
        result = await self.session.execute(stmt)
        hero = result.scalar_one_or_none()
        if hero is None:
            hero = HeroSection(title="Welcome to Pure Luxe Holidays")
            self.session.add(hero)
            await self.session.flush()
            await self.session.refresh(hero)
        return hero


class HomeAboutSectionRepository(BaseRepository[HomeAboutSection]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, HomeAboutSection)

    async def get_active(self) -> Optional[HomeAboutSection]:
        stmt = select(HomeAboutSection).where(HomeAboutSection.is_active.is_(True)).limit(1)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_singleton(self) -> Optional[HomeAboutSection]:
        stmt = select(HomeAboutSection).limit(1)
        result = await self.session.execute(stmt)
        section = result.scalar_one_or_none()
        if section is None:
            section = HomeAboutSection(
                heading="Crafting Journeys That Stay With You",
                description=(
                    "For over fifteen years, Pure Luxe Holidays has been the trusted name in bespoke luxury travel. "
                    "We believe that true luxury is not about where you go, but how the journey transforms you. "
                    "Every itinerary is a collaboration, every experience a memory in the making."
                ),
            )
            self.session.add(section)
            await self.session.flush()
            await self.session.refresh(section)
        return section


class CollectionRepository(BaseRepository[LuxuryCollection]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, LuxuryCollection)

    async def get_all_ordered(self) -> list[LuxuryCollection]:
        stmt = (
            select(LuxuryCollection)
            .options(selectinload(LuxuryCollection.image))
            .order_by(LuxuryCollection.display_order)
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def get_active(self) -> list[LuxuryCollection]:
        stmt = (
            select(LuxuryCollection)
            .options(selectinload(LuxuryCollection.image))
            .where(LuxuryCollection.is_active.is_(True))
            .order_by(LuxuryCollection.display_order)
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def slug_exists(
        self,
        slug: str,
        exclude_id: Optional[object] = None,
    ) -> bool:
        stmt = select(LuxuryCollection).where(
            LuxuryCollection.slug == slug
        )

        if exclude_id is not None:
            stmt = stmt.where(LuxuryCollection.id != exclude_id)

        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None


class DestinationRepository(BaseRepository[FeaturedDestination]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, FeaturedDestination)

    async def get_all_ordered(self) -> list[FeaturedDestination]:
        stmt = select(FeaturedDestination).order_by(FeaturedDestination.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def get_active(self) -> list[FeaturedDestination]:
        stmt = select(FeaturedDestination).where(FeaturedDestination.is_active.is_(True)).order_by(FeaturedDestination.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def slug_exists(self, slug: str, exclude_id: Optional[object] = None) -> bool:
        stmt = select(FeaturedDestination).where(FeaturedDestination.slug == slug)
        if exclude_id is not None:
            stmt = stmt.where(FeaturedDestination.id != exclude_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None


class ExperienceRepository(BaseRepository[LuxuryExperience]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, LuxuryExperience)

    async def get_all_ordered(self) -> list[LuxuryExperience]:
        stmt = select(LuxuryExperience).order_by(LuxuryExperience.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def get_active(self) -> list[LuxuryExperience]:
        stmt = select(LuxuryExperience).where(LuxuryExperience.is_active.is_(True)).order_by(LuxuryExperience.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def slug_exists(self, slug: str, exclude_id: Optional[object] = None) -> bool:
        stmt = select(LuxuryExperience).where(LuxuryExperience.slug == slug)
        if exclude_id is not None:
            stmt = stmt.where(LuxuryExperience.id != exclude_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None


class StatisticRepository(BaseRepository[Statistic]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Statistic)

    async def get_all_ordered(self) -> list[Statistic]:
        stmt = select(Statistic).order_by(Statistic.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def get_active(self) -> list[Statistic]:
        stmt = select(Statistic).where(Statistic.is_active.is_(True)).order_by(Statistic.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())


class WhyChooseRepository(BaseRepository[WhyChooseUs]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, WhyChooseUs)

    async def get_all_ordered(self) -> list[WhyChooseUs]:
        stmt = select(WhyChooseUs).order_by(WhyChooseUs.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def get_active(self) -> list[WhyChooseUs]:
        stmt = select(WhyChooseUs).where(WhyChooseUs.is_active.is_(True)).order_by(WhyChooseUs.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())
