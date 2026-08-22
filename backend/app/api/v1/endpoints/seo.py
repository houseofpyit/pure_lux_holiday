"""SEO configuration routers for SEO management."""

from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.dependencies.auth_dependencies import (
    get_current_active_user,
    require_admin,
    require_editor,
)
from app.schemas.auth import CurrentUserResponse
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
from app.services.seo_services import (
    PageSEOService,
    RedirectService,
    RobotsService,
    SEOSettingsService,
    SitemapService,
)

# ─── Global SEO ───────────────────────────────────────────────────
seo_router = APIRouter(prefix="/seo", tags=["SEO - Global"])


@seo_router.get(
    "",
    response_model=SEOSettingsResponse,
    summary="Get global SEO settings",
    description="Retrieve global SEO settings. Creates default settings if none exist.",
)
async def get_seo_settings(
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> SEOSettingsResponse:
    service = SEOSettingsService(session)
    return await service.get()


@seo_router.put(
    "",
    response_model=SEOSettingsResponse,
    summary="Update global SEO settings",
    description="Update global SEO settings including meta tags, OG, and Twitter cards.",
)
async def update_seo_settings(
    data: SEOSettingsUpdate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> SEOSettingsResponse:
    service = SEOSettingsService(session)
    return await service.update(data)


# ─── Page SEO ──────────────────────────────────────────────────────
page_seo_router = APIRouter(prefix="/seo/pages", tags=["SEO - Pages"])


@page_seo_router.get(
    "",
    response_model=list[PageSEOResponse],
    summary="List all page SEO settings",
    description="Retrieve all page-specific SEO configurations.",
)
async def list_page_seo(
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> list[PageSEOResponse]:
    service = PageSEOService(session)
    return await service.get_all()


@page_seo_router.get(
    "/{page_key}",
    response_model=PageSEOResponse,
    summary="Get page SEO settings",
    description="Retrieve SEO settings for a specific page by page_key.",
)
async def get_page_seo(
    page_key: str,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> PageSEOResponse:
    service = PageSEOService(session)
    return await service.get_by_page_key(page_key)


@page_seo_router.put(
    "/{page_key}",
    response_model=PageSEOResponse,
    summary="Update page SEO settings",
    description="Update SEO settings for a specific page. Creates the page if it doesn't exist.",
)
async def update_page_seo(
    page_key: str,
    data: PageSEOUpdate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_editor),
) -> PageSEOResponse:
    service = PageSEOService(session)
    
    # Check if page exists
    existing = await service.get_by_page_key(page_key)
    
    if existing:
        # Update existing
        return await service.update(page_key, data)
    else:
        # Create new
        create_data = PageSEOCreate(page_key=page_key, **data.model_dump(exclude_unset=True))
        return await service.create(create_data)


# ─── Sitemap ───────────────────────────────────────────────────────
sitemap_router = APIRouter(prefix="/seo/sitemap", tags=["SEO - Sitemap"])


@sitemap_router.get(
    "",
    response_model=SitemapSettingsResponse,
    summary="Get sitemap settings",
    description="Retrieve sitemap configuration. Creates default settings if none exist.",
)
async def get_sitemap_settings(
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> SitemapSettingsResponse:
    service = SitemapService(session)
    return await service.get()


@sitemap_router.put(
    "",
    response_model=SitemapSettingsResponse,
    summary="Update sitemap settings",
    description="Update sitemap configuration including which content types to include.",
)
async def update_sitemap_settings(
    data: SitemapSettingsUpdate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> SitemapSettingsResponse:
    service = SitemapService(session)
    return await service.update(data)


# ─── Robots ────────────────────────────────────────────────────────
robots_router = APIRouter(prefix="/seo/robots", tags=["SEO - Robots"])


@robots_router.get(
    "",
    response_model=RobotsSettingsResponse,
    summary="Get robots.txt settings",
    description="Retrieve robots.txt configuration. Creates default settings if none exist.",
)
async def get_robots_settings(
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> RobotsSettingsResponse:
    service = RobotsService(session)
    return await service.get()


@robots_router.put(
    "",
    response_model=RobotsSettingsResponse,
    summary="Update robots.txt settings",
    description="Update robots.txt content.",
)
async def update_robots_settings(
    data: RobotsSettingsUpdate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> RobotsSettingsResponse:
    service = RobotsService(session)
    return await service.update(data)


# ─── Redirects ─────────────────────────────────────────────────────
redirect_router = APIRouter(prefix="/seo/redirects", tags=["SEO - Redirects"])


@redirect_router.get(
    "",
    response_model=list[RedirectResponse],
    summary="List all redirects",
    description="Retrieve all URL redirects.",
)
async def list_redirects(
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> list[RedirectResponse]:
    service = RedirectService(session)
    return await service.get_all()


@redirect_router.post(
    "",
    response_model=RedirectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create redirect",
    description="Create a new URL redirect.",
)
async def create_redirect(
    data: RedirectCreate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_editor),
) -> RedirectResponse:
    service = RedirectService(session)
    return await service.create(data)


@redirect_router.patch(
    "/{redirect_id}",
    response_model=RedirectResponse,
    summary="Update redirect",
    description="Update an existing URL redirect.",
)
async def update_redirect(
    redirect_id: uuid.UUID,
    data: RedirectUpdate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_editor),
) -> RedirectResponse:
    service = RedirectService(session)
    return await service.update(redirect_id, data)


@redirect_router.delete(
    "/{redirect_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete redirect",
    description="Delete a URL redirect. Admin only.",
)
async def delete_redirect(
    redirect_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> dict[str, str]:
    service = RedirectService(session)
    await service.delete(redirect_id)
    return {"message": "Redirect deleted successfully"}


# ─── Public robots.txt ─────────────────────────────────────────────
# This will be mounted separately in main.py
# We'll create a separate router for public endpoints
public_router = APIRouter(tags=["SEO - Public"])


@public_router.get(
    "/public/seo",
    response_model=SEOSettingsResponse,
    summary="Get public global SEO settings",
)
async def get_public_global_seo(
    session: AsyncSession = Depends(get_db_session),
) -> SEOSettingsResponse:
    return await SEOSettingsService(session).get()


@public_router.get(
    "/public/seo/pages/{page_key}",
    response_model=PageSEOResponse,
    summary="Get public page SEO settings",
)
async def get_public_page_seo(
    page_key: str,
    session: AsyncSession = Depends(get_db_session),
) -> PageSEOResponse:
    return await PageSEOService(session).get_by_page_key(page_key)


@public_router.get(
    "/sitemap.xml",
    summary="Get sitemap.xml",
    description="Generate XML sitemap from CMS content.",
    response_class=Response,
)
async def get_sitemap_xml(
    session: AsyncSession = Depends(get_db_session),
) -> Response:
    from app.services.sitemap_generator import SitemapGeneratorService

    xml = await SitemapGeneratorService(session).generate_xml()
    return Response(content=xml, media_type="application/xml")


@public_router.get(
    "/robots.txt",
    summary="Get robots.txt",
    description="Retrieve the robots.txt file content.",
    response_class=Response,
)
async def get_robots_txt(
    session: AsyncSession = Depends(get_db_session),
) -> Response:
    service = RobotsService(session)
    settings = await service.get()
    return Response(content=settings.robots_content, media_type="text/plain")