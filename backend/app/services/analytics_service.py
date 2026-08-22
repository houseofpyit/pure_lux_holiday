"""Website analytics service — page views and live visitor tracking."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analytics import AnalyticsSession, PageView
from app.repositories.analytics_repositories import AnalyticsSessionRepository, PageViewRepository
from app.repositories.cms_repositories import SiteSettingsRepository
from app.schemas.analytics import (
    AnalyticsHeartbeatRequest,
    AnalyticsStatsResponse,
    AnalyticsTrackRequest,
    AnalyticsTrackResponse,
    TopPagePoint,
    TrafficChartPoint,
)

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


class AnalyticsService:
    LIVE_WINDOW_MINUTES = 5

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.session_repo = AnalyticsSessionRepository(session)
        self.page_view_repo = PageViewRepository(session)
        self.settings_repo = SiteSettingsRepository(session)

    async def _is_enabled(self) -> bool:
        settings = await self.settings_repo.get_singleton()
        return bool(settings and settings.analytics_enabled)

    async def _get_or_create_session(
        self,
        visitor_id: str,
        *,
        user_agent: str | None = None,
        referrer: str | None = None,
    ):
        row = await self.session_repo.get_by_visitor_id(visitor_id)
        now = datetime.now(timezone.utc)
        if row is None:
            row = AnalyticsSession(
                visitor_id=visitor_id,
                first_seen_at=now,
                last_seen_at=now,
                user_agent=user_agent,
                referrer=referrer,
            )
            self.session.add(row)
            await self.session.flush()
            await self.session.refresh(row)
            return row

        row.last_seen_at = now
        if user_agent and not row.user_agent:
            row.user_agent = user_agent
        if referrer and not row.referrer:
            row.referrer = referrer
        await self.session.flush()
        return row

    async def track(self, data: AnalyticsTrackRequest, user_agent: str | None = None) -> AnalyticsTrackResponse:
        if not await self._is_enabled():
            return AnalyticsTrackResponse(ok=True)

        session_row = await self._get_or_create_session(
            data.visitor_id,
            user_agent=user_agent,
            referrer=data.referrer,
        )
        self.session.add(
            PageView(
                session_id=session_row.id,
                path=data.path[:512],
                page_title=data.page_title,
                referrer=data.referrer,
            )
        )
        await self.session.flush()
        return AnalyticsTrackResponse(ok=True)

    async def heartbeat(self, data: AnalyticsHeartbeatRequest) -> AnalyticsTrackResponse:
        if not await self._is_enabled():
            return AnalyticsTrackResponse(ok=True)

        await self._get_or_create_session(data.visitor_id)
        return AnalyticsTrackResponse(ok=True)

    async def get_stats(self, months: int = 7) -> AnalyticsStatsResponse:
        now = datetime.now(timezone.utc)
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_starts = []
        for i in range(months - 1, -1, -1):
            year = start.year
            month = start.month - i
            while month <= 0:
                month += 12
                year -= 1
            month_starts.append(datetime(year, month, 1, tzinfo=timezone.utc))

        chart_since = month_starts[0] if month_starts else now - timedelta(days=210)
        views = await self.page_view_repo.list_since(chart_since)

        buckets: dict[str, dict[str, set[str] | int]] = {}
        for point in month_starts:
            key = f"{point.year}-{point.month}"
            buckets[key] = {"month": MONTHS[point.month - 1], "sessions": set(), "pageviews": 0}

        for view in views:
            created = view.created_at
            if created.tzinfo is None:
                created = created.replace(tzinfo=timezone.utc)
            key = f"{created.year}-{created.month}"
            if key not in buckets:
                continue
            buckets[key]["pageviews"] = int(buckets[key]["pageviews"]) + 1
            sessions = buckets[key]["sessions"]
            assert isinstance(sessions, set)
            sessions.add(str(view.session_id))

        traffic_chart = [
            TrafficChartPoint(
                month=bucket["month"],
                visitors=len(bucket["sessions"]),
                pageviews=int(bucket["pageviews"]),
            )
            for bucket in buckets.values()
        ]

        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        top_pages_raw = await self.page_view_repo.top_paths(limit=5, since=chart_since)

        return AnalyticsStatsResponse(
            live_visitors=await self.session_repo.count_live(self.LIVE_WINDOW_MINUTES),
            total_pageviews=await self.page_view_repo.count_total(),
            pageviews_today=await self.page_view_repo.count_since(today_start),
            total_visitors=await self.session_repo.count_total(),
            traffic_chart=traffic_chart,
            top_pages=[TopPagePoint(path=path, views=views) for path, views in top_pages_raw],
        )
