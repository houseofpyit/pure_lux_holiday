"""Analytics endpoints — public tracking and admin stats."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Header, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.dependencies.auth_dependencies import get_current_active_user
from app.schemas.analytics import (
    AnalyticsHeartbeatRequest,
    AnalyticsStatsResponse,
    AnalyticsTrackRequest,
    AnalyticsTrackResponse,
)
from app.services.analytics_service import AnalyticsService

pub_router = APIRouter(prefix="/public/analytics", tags=["Public - Analytics"])
admin_router = APIRouter(prefix="/analytics", tags=["Analytics"])


@pub_router.post("/track", response_model=AnalyticsTrackResponse, status_code=status.HTTP_201_CREATED)
async def track_page_view(
    data: AnalyticsTrackRequest,
    request: Request,
    session: AsyncSession = Depends(get_db_session),
) -> AnalyticsTrackResponse:
    user_agent = request.headers.get("user-agent")
    return await AnalyticsService(session).track(data, user_agent=user_agent)


@pub_router.post("/heartbeat", response_model=AnalyticsTrackResponse)
async def heartbeat(
    data: AnalyticsHeartbeatRequest,
    session: AsyncSession = Depends(get_db_session),
) -> AnalyticsTrackResponse:
    return await AnalyticsService(session).heartbeat(data)


@admin_router.get("/stats", response_model=AnalyticsStatsResponse)
async def get_analytics_stats(
    session: AsyncSession = Depends(get_db_session),
    _user=Depends(get_current_active_user),
) -> AnalyticsStatsResponse:
    return await AnalyticsService(session).get_stats()
