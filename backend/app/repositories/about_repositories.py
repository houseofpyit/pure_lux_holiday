"""About repositories for About & Company CMS."""

from __future__ import annotations
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.repositories.base_repository import BaseRepository
from app.models.about import AboutPage, Award, CompanyFAQ, CompanyStatistic, CompanyTimeline, CoreValue, LeadershipMember, Partner


class AboutRepository(BaseRepository[AboutPage]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, AboutPage)
    async def get_singleton(self) -> Optional[AboutPage]:
        stmt = select(AboutPage).limit(1)
        result = await self.session.execute(stmt)
        page = result.scalar_one_or_none()
        if page is None:
            page = AboutPage()
            self.session.add(page)
            await self.session.flush()
            await self.session.refresh(page)
        return page

class CoreValueRepository(BaseRepository[CoreValue]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, CoreValue)
    async def get_active(self) -> list[CoreValue]:
        stmt = select(CoreValue).where(CoreValue.is_active.is_(True)).order_by(CoreValue.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

class LeadershipRepository(BaseRepository[LeadershipMember]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, LeadershipMember)
    async def get_active(self) -> list[LeadershipMember]:
        stmt = select(LeadershipMember).where(LeadershipMember.is_active.is_(True)).order_by(LeadershipMember.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

class TimelineRepository(BaseRepository[CompanyTimeline]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, CompanyTimeline)

class AwardRepository(BaseRepository[Award]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Award)
    async def get_active(self) -> list[Award]:
        stmt = select(Award).where(Award.is_active.is_(True)).order_by(Award.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

class PartnerRepository(BaseRepository[Partner]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Partner)
    async def get_active(self) -> list[Partner]:
        stmt = select(Partner).where(Partner.is_active.is_(True)).order_by(Partner.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

class StatisticRepository(BaseRepository[CompanyStatistic]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, CompanyStatistic)
    async def get_active(self) -> list[CompanyStatistic]:
        stmt = select(CompanyStatistic).where(CompanyStatistic.is_active.is_(True)).order_by(CompanyStatistic.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

class FAQRepository(BaseRepository[CompanyFAQ]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, CompanyFAQ)
    async def get_active(self) -> list[CompanyFAQ]:
        stmt = select(CompanyFAQ).where(CompanyFAQ.is_active.is_(True)).order_by(CompanyFAQ.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())