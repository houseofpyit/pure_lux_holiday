"""Repositories for website analytics."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.repositories.base_repository import BaseRepository
from app.models.analytics import AnalyticsSession, PageView


class AnalyticsSessionRepository(BaseRepository[AnalyticsSession]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, AnalyticsSession)

    async def get_by_visitor_id(self, visitor_id: str) -> AnalyticsSession | None:
        stmt = select(AnalyticsSession).where(AnalyticsSession.visitor_id == visitor_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def count_live(self, minutes: int = 5) -> int:
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=minutes)
        stmt = select(func.count()).select_from(AnalyticsSession).where(
            AnalyticsSession.last_seen_at >= cutoff
        )
        result = await self.session.execute(stmt)
        return int(result.scalar_one() or 0)

    async def count_total(self) -> int:
        stmt = select(func.count()).select_from(AnalyticsSession)
        result = await self.session.execute(stmt)
        return int(result.scalar_one() or 0)


class PageViewRepository(BaseRepository[PageView]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, PageView)

    async def count_total(self) -> int:
        stmt = select(func.count()).select_from(PageView)
        result = await self.session.execute(stmt)
        return int(result.scalar_one() or 0)

    async def count_since(self, since: datetime) -> int:
        stmt = select(func.count()).select_from(PageView).where(PageView.created_at >= since)
        result = await self.session.execute(stmt)
        return int(result.scalar_one() or 0)

    async def list_since(self, since: datetime) -> list[PageView]:
        stmt = (
            select(PageView)
            .where(PageView.created_at >= since)
            .order_by(PageView.created_at.asc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def top_paths(self, limit: int = 5, since: datetime | None = None) -> list[tuple[str, int]]:
        stmt = select(PageView.path, func.count(PageView.id).label("views")).group_by(PageView.path)
        if since is not None:
            stmt = stmt.where(PageView.created_at >= since)
        stmt = stmt.order_by(func.count(PageView.id).desc()).limit(limit)
        result = await self.session.execute(stmt)
        return [(row.path, int(row.views)) for row in result.all()]
