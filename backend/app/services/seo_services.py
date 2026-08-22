"""SEO services for SEO configuration management."""

from __future__ import annotations

import uuid
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.seo import (
    PageSEO,
    Redirect,
    RobotsSettings,
    SEOSettings,
    SitemapSettings,
)
from app.repositories.media_repository import MediaRepository
from app.utils.media.media_validation import media_fields_from_payload, validate_media_ids
from app.repositories.seo_repositories import (
    PageSEORepository,
    RedirectRepository,
    RobotsRepository,
    SEOSettingsRepository,
    SitemapRepository,
)
from app.schemas.media import MediaDetailResponse
from app.schemas.seo import (
    PageSEOCreate,
    PageSEOUpdate,
    PageSEOResponse,
    RedirectCreate,
    RedirectResponse,
    RedirectUpdate,
    RobotsSettingsResponse,
    RobotsSettingsUpdate,
    SEOSettingsResponse,
    SEOSettingsUpdate,
    SitemapSettingsResponse,
    SitemapSettingsUpdate,
)


class SEOSettingsService:
    """Service for SEOSettings singleton management."""

    def __init__(self, session: AsyncSession) -> None:
        self.repo = SEOSettingsRepository(session)
        self.media_repo = MediaRepository(session)

    async def get(self) -> SEOSettingsResponse:
        settings = await self.repo.get_singleton()
        return await self._enrich_media(settings)

    async def update(self, data: SEOSettingsUpdate) -> SEOSettingsResponse:
        settings = await self.repo.get_singleton()
        update_data = data.model_dump(exclude_unset=True)
        
        await validate_media_ids(self.repo.session, {
            "organization_logo_id": update_data.get("organization_logo_id"),
            "default_og_image_id": update_data.get("default_og_image_id"),
            "default_twitter_image_id": update_data.get("default_twitter_image_id"),
        })
        
        if not update_data:
            return await self._enrich_media(settings)
        
        for key, value in update_data.items():
            setattr(settings, key, value)
        
        await self.repo.session.flush()
        await self.repo.session.refresh(settings)
        return await self._enrich_media(settings)

    async def _enrich_media(self, settings: SEOSettings) -> SEOSettingsResponse:
        """Enrich response with media details from ORM IDs."""
        response = SEOSettingsResponse.model_validate(settings)

        if settings.organization_logo_id:
            media = await self.media_repo.get_by_id(settings.organization_logo_id)
            if media:
                response.organization_logo = MediaDetailResponse.model_validate(media)
        
        if settings.default_og_image_id:
            media = await self.media_repo.get_by_id(settings.default_og_image_id)
            if media:
                response.default_og_image = MediaDetailResponse.model_validate(media)
        
        if settings.default_twitter_image_id:
            media = await self.media_repo.get_by_id(settings.default_twitter_image_id)
            if media:
                response.default_twitter_image = MediaDetailResponse.model_validate(media)
        
        return response


class PageSEOService:
    """Service for PageSEO CRUD operations."""

    def __init__(self, session: AsyncSession) -> None:
        self.repo = PageSEORepository(session)
        self.media_repo = MediaRepository(session)

    async def get_all(self) -> list[PageSEOResponse]:
        items = await self.repo.get_all(order_by="page_key")
        return [await self._enrich_media(item) for item in items]

    async def get_by_page_key(self, page_key: str) -> PageSEOResponse:
        item = await self.repo.get_by_page_key(page_key)
        if item is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page SEO not found")
        return await self._enrich_media(item)

    async def create(self, data: PageSEOCreate) -> PageSEOResponse:
        if await self.repo.page_key_exists(data.page_key):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Page SEO with page_key '{data.page_key}' already exists",
            )

        payload = data.model_dump()
        await validate_media_ids(self.repo.session, media_fields_from_payload(payload))

        item = await self.repo.create(**payload)
        return await self._enrich_media(item)

    async def update(self, page_key: str, data: PageSEOUpdate) -> PageSEOResponse:
        item = await self.repo.get_by_page_key(page_key)
        if item is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page SEO not found")
        
        update_data = data.model_dump(exclude_unset=True)
        await validate_media_ids(self.repo.session, media_fields_from_payload(update_data))

        if not update_data:
            return await self._enrich_media(item)
        
        item = await self.repo.update(item, **update_data)
        return await self._enrich_media(item)

    async def _enrich_media(self, item: PageSEO) -> PageSEOResponse:
        """Enrich response with media details from ORM IDs."""
        response = PageSEOResponse.model_validate(item)

        if item.og_image_id:
            media = await self.media_repo.get_by_id(item.og_image_id)
            if media:
                response.og_image = MediaDetailResponse.model_validate(media)
        
        if item.twitter_image_id:
            media = await self.media_repo.get_by_id(item.twitter_image_id)
            if media:
                response.twitter_image = MediaDetailResponse.model_validate(media)
        
        return response


class SitemapService:
    """Service for SitemapSettings singleton management."""

    def __init__(self, session: AsyncSession) -> None:
        self.repo = SitemapRepository(session)

    async def get(self) -> SitemapSettingsResponse:
        settings = await self.repo.get_singleton()
        return SitemapSettingsResponse.model_validate(settings)

    async def update(self, data: SitemapSettingsUpdate) -> SitemapSettingsResponse:
        settings = await self.repo.get_singleton()
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return SitemapSettingsResponse.model_validate(settings)
        for key, value in update_data.items():
            setattr(settings, key, value)
        await self.repo.session.flush()
        await self.repo.session.refresh(settings)
        return SitemapSettingsResponse.model_validate(settings)


class RobotsService:
    """Service for RobotsSettings singleton management."""

    def __init__(self, session: AsyncSession) -> None:
        self.repo = RobotsRepository(session)

    async def get(self) -> RobotsSettingsResponse:
        settings = await self.repo.get_singleton()
        return RobotsSettingsResponse.model_validate(settings)

    async def update(self, data: RobotsSettingsUpdate) -> RobotsSettingsResponse:
        settings = await self.repo.get_singleton()
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return RobotsSettingsResponse.model_validate(settings)
        for key, value in update_data.items():
            setattr(settings, key, value)
        await self.repo.session.flush()
        await self.repo.session.refresh(settings)
        return RobotsSettingsResponse.model_validate(settings)


class RedirectService:
    """Service for Redirect CRUD operations."""

    def __init__(self, session: AsyncSession) -> None:
        self.repo = RedirectRepository(session)

    async def get_all(self) -> list[RedirectResponse]:
        items = await self.repo.get_all(order_by="source_path")
        return [RedirectResponse.model_validate(item) for item in items]

    async def get_by_id(self, redirect_id: uuid.UUID) -> RedirectResponse:
        item = await self.repo.get_by_id(redirect_id)
        if item is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Redirect not found")
        return RedirectResponse.model_validate(item)

    async def create(self, data: RedirectCreate) -> RedirectResponse:
        if await self.repo.source_path_exists(data.source_path):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Redirect with source_path '{data.source_path}' already exists",
            )
        item = await self.repo.create(**data.model_dump())
        return RedirectResponse.model_validate(item)

    async def update(self, redirect_id: uuid.UUID, data: RedirectUpdate) -> RedirectResponse:
        item = await self.repo.get_by_id(redirect_id)
        if item is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Redirect not found")
        
        update_data = data.model_dump(exclude_unset=True)
        
        # Check if source_path is being updated and if it already exists
        if "source_path" in update_data and update_data["source_path"] != item.source_path:
            if await self.repo.source_path_exists(update_data["source_path"], exclude_id=redirect_id):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Redirect with source_path '{update_data['source_path']}' already exists",
                )
        
        if not update_data:
            return RedirectResponse.model_validate(item)
        
        item = await self.repo.update(item, **update_data)
        return RedirectResponse.model_validate(item)

    async def delete(self, redirect_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(redirect_id)
        if item is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Redirect not found")
        await self.repo.delete(item)