"""CMS configuration routers for global website settings."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.dependencies.auth_dependencies import (
    get_current_active_user,
    require_admin,
    require_editor,
)
from app.schemas.auth import CurrentUserResponse
from app.schemas.cms import (
    CTASettingsResponse,
    CTASettingsUpdate,
    ContactPageCMSResponse,
    ContactPageCMSUpdate,
    ContactSettingsResponse,
    ContactSettingsUpdate,
    FooterSectionCreate,
    FooterSectionResponse,
    FooterSectionUpdate,
    NavigationCreate,
    NavigationResponse,
    NavigationReorder,
    NavigationUpdate,
    PublicContactResponse,
    SiteSettingsResponse,
    SiteSettingsUpdate,
)
from app.services.cms_service import (
    CTAService,
    ContactPageCMSService,
    ContactService,
    FooterService,
    NavigationService,
    PublicContactService,
    SiteSettingsService,
)

# ─── Site Settings ──────────────────────────────────────────────
settings_router = APIRouter(prefix="/settings", tags=["CMS - Settings"])


@settings_router.get(
    "",
    response_model=SiteSettingsResponse,
    summary="Get site settings",
    description="Retrieve the global website settings. Creates default settings if none exist.",
)
async def get_site_settings(
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> SiteSettingsResponse:
    service = SiteSettingsService(session)
    return await service.get()


@settings_router.put(
    "",
    response_model=SiteSettingsResponse,
    summary="Update site settings",
    description="Update global website settings. Requires admin privileges.",
)
async def update_site_settings(
    data: SiteSettingsUpdate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> SiteSettingsResponse:
    service = SiteSettingsService(session)
    return await service.update(data)


# ─── Navigation ─────────────────────────────────────────────────
nav_router = APIRouter(prefix="/navigation", tags=["CMS - Navigation"])


@nav_router.get(
    "",
    response_model=list[NavigationResponse],
    summary="List navigation items",
    description="Retrieve all navigation menu items in hierarchical order.",
)
async def list_navigation(
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> list[NavigationResponse]:
    service = NavigationService(session)
    return await service.get_all()


@nav_router.get(
    "/active",
    response_model=list[NavigationResponse],
    summary="List active navigation",
    description="Retrieve only active navigation items for public display.",
)
async def get_active_navigation(
    session: AsyncSession = Depends(get_db_session),
) -> list[NavigationResponse]:
    """Public endpoint - no authentication required."""
    service = NavigationService(session)
    return await service.get_active()


@nav_router.get(
    "/{nav_id}",
    response_model=NavigationResponse,
    summary="Get navigation item",
    description="Retrieve a single navigation item by UUID.",
)
async def get_navigation_item(
    nav_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> NavigationResponse:
    service = NavigationService(session)
    return await service.get_by_id(nav_id)


@nav_router.post(
    "",
    response_model=NavigationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create navigation item",
    description="Create a new navigation menu item. Slug must be unique.",
)
async def create_navigation(
    data: NavigationCreate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_editor),
) -> NavigationResponse:
    service = NavigationService(session)
    return await service.create(data)


@nav_router.patch(
    "/{nav_id}",
    response_model=NavigationResponse,
    summary="Update navigation item",
    description="Update a navigation menu item's fields.",
)
async def update_navigation(
    nav_id: uuid.UUID,
    data: NavigationUpdate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_editor),
) -> NavigationResponse:
    service = NavigationService(session)
    return await service.update(nav_id, data)


@nav_router.delete(
    "/{nav_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete navigation item",
    description="Delete a navigation menu item. Admin only.",
)
async def delete_navigation(
    nav_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> dict[str, str]:
    service = NavigationService(session)
    await service.delete(nav_id)
    return {"message": "Navigation item deleted successfully"}


@nav_router.put(
    "/reorder",
    response_model=list[NavigationResponse],
    summary="Reorder navigation",
    description="Reorder navigation items by providing new order positions.",
)
async def reorder_navigation(
    data: NavigationReorder,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> list[NavigationResponse]:
    service = NavigationService(session)
    return await service.reorder(data)


# ─── Footer ─────────────────────────────────────────────────────
footer_router = APIRouter(prefix="/footer", tags=["CMS - Footer"])


@footer_router.get(
    "",
    response_model=list[FooterSectionResponse],
    summary="List footer sections",
    description="Retrieve all footer sections with their links.",
)
async def list_footer_sections(
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> list[FooterSectionResponse]:
    service = FooterService(session)
    return await service.get_all()


@footer_router.get(
    "/{section_id}",
    response_model=FooterSectionResponse,
    summary="Get footer section",
    description="Retrieve a single footer section with its links.",
)
async def get_footer_section(
    section_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> FooterSectionResponse:
    service = FooterService(session)
    return await service.get_by_id(section_id)


@footer_router.post(
    "",
    response_model=FooterSectionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create footer section",
    description="Create a new footer section with optional links.",
)
async def create_footer_section(
    data: FooterSectionCreate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_editor),
) -> FooterSectionResponse:
    service = FooterService(session)
    return await service.create(data)


@footer_router.patch(
    "/{section_id}",
    response_model=FooterSectionResponse,
    summary="Update footer section",
    description="Update a footer section's title, order, or active status.",
)
async def update_footer_section(
    section_id: uuid.UUID,
    data: FooterSectionUpdate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_editor),
) -> FooterSectionResponse:
    service = FooterService(session)
    return await service.update(section_id, data)


@footer_router.delete(
    "/{section_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete footer section",
    description="Delete a footer section and all its links. Admin only.",
)
async def delete_footer_section(
    section_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> dict[str, str]:
    service = FooterService(session)
    await service.delete(section_id)
    return {"message": "Footer section deleted successfully"}


# ─── Contact Settings ───────────────────────────────────────────
contact_router = APIRouter(prefix="/contact", tags=["CMS - Contact"])


@contact_router.get(
    "",
    response_model=ContactSettingsResponse,
    summary="Get contact settings",
    description="Retrieve global contact information. Creates default settings if none exist.",
)
async def get_contact_settings(
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> ContactSettingsResponse:
    service = ContactService(session)
    return await service.get()


@contact_router.put(
    "",
    response_model=ContactSettingsResponse,
    summary="Update contact settings",
    description="Update global contact information and working hours.",
)
async def update_contact_settings(
    data: ContactSettingsUpdate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> ContactSettingsResponse:
    service = ContactService(session)
    return await service.update(data)


# ─── Contact Page CMS ───────────────────────────────────────────
contact_page_router = APIRouter(prefix="/contact-page", tags=["CMS - Contact Page"])


@contact_page_router.get(
    "",
    response_model=ContactPageCMSResponse,
    summary="Get contact page CMS settings",
    description="Retrieve contact page presentation settings. Creates defaults if none exist.",
)
async def get_contact_page_cms(
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> ContactPageCMSResponse:
    service = ContactPageCMSService(session)
    return await service.get()


@contact_page_router.put(
    "",
    response_model=ContactPageCMSResponse,
    summary="Update contact page CMS settings",
    description="Update contact page presentation settings including hero, visibility toggles, and feature flags.",
)
async def update_contact_page_cms(
    data: ContactPageCMSUpdate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> ContactPageCMSResponse:
    service = ContactPageCMSService(session)
    return await service.update(data)


# ─── CTA Settings ───────────────────────────────────────────────
cta_router = APIRouter(prefix="/cta", tags=["CMS - CTA"])


@cta_router.get(
    "",
    response_model=CTASettingsResponse,
    summary="Get CTA settings",
    description="Retrieve global call-to-action settings. Creates defaults if none exist.",
)
async def get_cta_settings(
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> CTASettingsResponse:
    service = CTAService(session)
    return await service.get()


@cta_router.put(
    "",
    response_model=CTASettingsResponse,
    summary="Update CTA settings",
    description="Update the global call-to-action banner configuration.",
)
async def update_cta_settings(
    data: CTASettingsUpdate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> CTASettingsResponse:
    service = CTAService(session)
    return await service.update(data)


# ─── Public Endpoints ───────────────────────────────────────────
public_router = APIRouter(prefix="/public", tags=["Public"])


@public_router.get(
    "/contact",
    response_model=PublicContactResponse,
    summary="Get public contact page",
)
async def get_public_contact(
    session: AsyncSession = Depends(get_db_session),
) -> PublicContactResponse:
    return await PublicContactService(session).get_public()


@public_router.get(
    "/footer",
    response_model=list[FooterSectionResponse],
    summary="Get public footer sections",
)
async def get_public_footer(
    session: AsyncSession = Depends(get_db_session),
) -> list[FooterSectionResponse]:
    """Return active footer sections and links for the public site."""
    service = FooterService(session)
    sections = await service.get_all()
    return [section for section in sections if section.is_active]