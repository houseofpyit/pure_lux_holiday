"""Pydantic schemas for website analytics."""

from __future__ import annotations

from pydantic import BaseModel, Field


class AnalyticsTrackRequest(BaseModel):
    visitor_id: str = Field(..., min_length=8, max_length=64)
    path: str = Field(..., min_length=1, max_length=512)
    page_title: str | None = Field(None, max_length=512)
    referrer: str | None = Field(None, max_length=1024)


class AnalyticsHeartbeatRequest(BaseModel):
    visitor_id: str = Field(..., min_length=8, max_length=64)


class AnalyticsTrackResponse(BaseModel):
    ok: bool = True


class TrafficChartPoint(BaseModel):
    month: str
    visitors: int
    pageviews: int


class TopPagePoint(BaseModel):
    path: str
    views: int


class AnalyticsStatsResponse(BaseModel):
    live_visitors: int = 0
    total_pageviews: int = 0
    pageviews_today: int = 0
    total_visitors: int = 0
    traffic_chart: list[TrafficChartPoint] = Field(default_factory=list)
    top_pages: list[TopPagePoint] = Field(default_factory=list)
