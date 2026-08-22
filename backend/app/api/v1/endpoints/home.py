"""Homepage CMS routers for all homepage modules + public endpoint."""

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
from app.schemas.home import (
    FeaturedDestinationCreate,
    FeaturedDestinationResponse,
    FeaturedDestinationUpdate,
    HeroSectionResponse,
    HeroSectionUpdate,
    HomeAboutSectionResponse,
    HomeAboutSectionUpdate,
    HomepageResponse,
    LuxuryCollectionCreate,
    LuxuryCollectionResponse,
    LuxuryCollectionUpdate,
    LuxuryExperienceCreate,
    LuxuryExperienceResponse,
    LuxuryExperienceUpdate,
    ReorderRequest,
    StatisticCreate,
    StatisticResponse,
    StatisticUpdate,
    WhyChooseUsCreate,
    WhyChooseUsResponse,
    WhyChooseUsUpdate,
)
from app.schemas.cms import CTASettingsResponse, CTASettingsUpdate
from app.services.cms_service import CTAService
from app.services.home_service import (
    CollectionService,
    DestinationService,
    ExperienceService,
    HeroService,
    HomeAboutSectionService,
    HomepageService,
    StatisticService,
    WhyChooseService,
)

# ─── Hero ──────────────────────────────────────────────────────
hero_router = APIRouter(prefix="/home/hero", tags=["Homepage - Hero"])

@hero_router.get("", response_model=HeroSectionResponse, summary="Get hero section")
async def get_hero(
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> HeroSectionResponse:
    return await HeroService(session).get()

@hero_router.put("", response_model=HeroSectionResponse, summary="Update hero section")
async def update_hero(
    data: HeroSectionUpdate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> HeroSectionResponse:
    return await HeroService(session).update(data)

# ─── Home About Section ────────────────────────────────────────
about_section_router = APIRouter(prefix="/home/about-section", tags=["Homepage - About Section"])

@about_section_router.get("", response_model=HomeAboutSectionResponse, summary="Get homepage about section")
async def get_about_section(
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> HomeAboutSectionResponse:
    return await HomeAboutSectionService(session).get()

@about_section_router.put("", response_model=HomeAboutSectionResponse, summary="Update homepage about section")
async def update_about_section(
    data: HomeAboutSectionUpdate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> HomeAboutSectionResponse:
    return await HomeAboutSectionService(session).update(data)

# ─── CTA ───────────────────────────────────────────────────────
cta_router = APIRouter(prefix="/home/cta", tags=["Homepage - CTA"])

@cta_router.get("", response_model=CTASettingsResponse, summary="Get homepage CTA")
async def get_home_cta(
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> CTASettingsResponse:
    return await CTAService(session).get()

@cta_router.put("", response_model=CTASettingsResponse, summary="Update homepage CTA")
async def update_home_cta(
    data: CTASettingsUpdate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> CTASettingsResponse:
    return await CTAService(session).update(data)

# ─── Collections ───────────────────────────────────────────────
collections_router = APIRouter(prefix="/home/collections", tags=["Homepage - Collections"])

@collections_router.get("", response_model=list[LuxuryCollectionResponse])
async def list_collections(
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> list[LuxuryCollectionResponse]:
    return await CollectionService(session).get_all()

@collections_router.post("", response_model=LuxuryCollectionResponse, status_code=201)
async def create_collection(
    data: LuxuryCollectionCreate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_editor),
) -> LuxuryCollectionResponse:
    return await CollectionService(session).create(data)

@collections_router.patch("/{item_id}", response_model=LuxuryCollectionResponse)
async def update_collection(
    item_id: uuid.UUID, data: LuxuryCollectionUpdate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_editor),
) -> LuxuryCollectionResponse:
    return await CollectionService(session).update(item_id, data)

@collections_router.delete("/{item_id}", status_code=200)
async def delete_collection(
    item_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> dict[str, str]:
    await CollectionService(session).delete(item_id)
    return {"message": "Collection deleted"}

@collections_router.put("/reorder", response_model=list[LuxuryCollectionResponse])
async def reorder_collections(
    data: ReorderRequest,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> list[LuxuryCollectionResponse]:
    return await CollectionService(session).reorder(data)

# ─── Destinations ──────────────────────────────────────────────
destinations_router = APIRouter(prefix="/home/destinations", tags=["Homepage - Destinations"])

@destinations_router.get("", response_model=list[FeaturedDestinationResponse])
async def list_destinations(
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> list[FeaturedDestinationResponse]:
    return await DestinationService(session).get_all()

@destinations_router.post("", response_model=FeaturedDestinationResponse, status_code=201)
async def create_destination(
    data: FeaturedDestinationCreate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_editor),
) -> FeaturedDestinationResponse:
    return await DestinationService(session).create(data)

@destinations_router.patch("/{item_id}", response_model=FeaturedDestinationResponse)
async def update_destination(
    item_id: uuid.UUID, data: FeaturedDestinationUpdate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_editor),
) -> FeaturedDestinationResponse:
    return await DestinationService(session).update(item_id, data)

@destinations_router.delete("/{item_id}", status_code=200)
async def delete_destination(
    item_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> dict[str, str]:
    await DestinationService(session).delete(item_id)
    return {"message": "Destination deleted"}

@destinations_router.put("/reorder", response_model=list[FeaturedDestinationResponse])
async def reorder_destinations(
    data: ReorderRequest,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> list[FeaturedDestinationResponse]:
    return await DestinationService(session).reorder(data)

# ─── Experiences ───────────────────────────────────────────────
experiences_router = APIRouter(prefix="/home/experiences", tags=["Homepage - Experiences"])

@experiences_router.get("", response_model=list[LuxuryExperienceResponse])
async def list_experiences(
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> list[LuxuryExperienceResponse]:
    return await ExperienceService(session).get_all()

@experiences_router.post("", response_model=LuxuryExperienceResponse, status_code=201)
async def create_experience(
    data: LuxuryExperienceCreate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_editor),
) -> LuxuryExperienceResponse:
    return await ExperienceService(session).create(data)

@experiences_router.patch("/{item_id}", response_model=LuxuryExperienceResponse)
async def update_experience(
    item_id: uuid.UUID, data: LuxuryExperienceUpdate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_editor),
) -> LuxuryExperienceResponse:
    return await ExperienceService(session).update(item_id, data)

@experiences_router.delete("/{item_id}", status_code=200)
async def delete_experience(
    item_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> dict[str, str]:
    await ExperienceService(session).delete(item_id)
    return {"message": "Experience deleted"}

@experiences_router.put("/reorder", response_model=list[LuxuryExperienceResponse])
async def reorder_experiences(
    data: ReorderRequest,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> list[LuxuryExperienceResponse]:
    return await ExperienceService(session).reorder(data)

# ─── Statistics ────────────────────────────────────────────────
statistics_router = APIRouter(prefix="/home/statistics", tags=["Homepage - Statistics"])

@statistics_router.get("", response_model=list[StatisticResponse])
async def list_statistics(
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> list[StatisticResponse]:
    return await StatisticService(session).get_all()

@statistics_router.post("", response_model=StatisticResponse, status_code=201)
async def create_statistic(
    data: StatisticCreate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_editor),
) -> StatisticResponse:
    return await StatisticService(session).create(data)

@statistics_router.patch("/{item_id}", response_model=StatisticResponse)
async def update_statistic(
    item_id: uuid.UUID, data: StatisticUpdate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_editor),
) -> StatisticResponse:
    return await StatisticService(session).update(item_id, data)

@statistics_router.delete("/{item_id}", status_code=200)
async def delete_statistic(
    item_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> dict[str, str]:
    await StatisticService(session).delete(item_id)
    return {"message": "Statistic deleted"}

@statistics_router.put("/reorder", response_model=list[StatisticResponse])
async def reorder_statistics(
    data: ReorderRequest,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> list[StatisticResponse]:
    return await StatisticService(session).reorder(data)

# ─── Why Choose Us ─────────────────────────────────────────────
why_choose_router = APIRouter(prefix="/home/why-choose", tags=["Homepage - Why Choose Us"])

@why_choose_router.get("", response_model=list[WhyChooseUsResponse])
async def list_why_choose(
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> list[WhyChooseUsResponse]:
    return await WhyChooseService(session).get_all()

@why_choose_router.post("", response_model=WhyChooseUsResponse, status_code=201)
async def create_why_choose(
    data: WhyChooseUsCreate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_editor),
) -> WhyChooseUsResponse:
    return await WhyChooseService(session).create(data)

@why_choose_router.patch("/{item_id}", response_model=WhyChooseUsResponse)
async def update_why_choose(
    item_id: uuid.UUID, data: WhyChooseUsUpdate,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_editor),
) -> WhyChooseUsResponse:
    return await WhyChooseService(session).update(item_id, data)

@why_choose_router.delete("/{item_id}", status_code=200)
async def delete_why_choose(
    item_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> dict[str, str]:
    await WhyChooseService(session).delete(item_id)
    return {"message": "Item deleted"}

@why_choose_router.put("/reorder", response_model=list[WhyChooseUsResponse])
async def reorder_why_choose(
    data: ReorderRequest,
    session: AsyncSession = Depends(get_db_session),
    _current_user: CurrentUserResponse = Depends(require_admin),
) -> list[WhyChooseUsResponse]:
    return await WhyChooseService(session).reorder(data)


# ─── Public Homepage ───────────────────────────────────────────
public_router = APIRouter(prefix="/public", tags=["Public"])

@public_router.get(
    "/home",
    response_model=HomepageResponse,
    summary="Get complete homepage",
    description="Public endpoint returning all active homepage sections in a single payload. No authentication required.",
)
async def get_homepage(
    session: AsyncSession = Depends(get_db_session),
) -> HomepageResponse:
    """Public endpoint - returns complete homepage data."""
    return await HomepageService(session).get_homepage()


@public_router.get(
    "/destinations",
    response_model=list[FeaturedDestinationResponse],
    summary="Get active destinations",
    description="Public endpoint returning all active featured destinations for the destinations page.",
)
async def get_public_destinations(
    session: AsyncSession = Depends(get_db_session),
) -> list[FeaturedDestinationResponse]:
    return await DestinationService(session).get_active()


@public_router.get(
    "/experiences",
    response_model=list[LuxuryExperienceResponse],
    summary="Get active experiences",
    description="Public endpoint returning all active luxury experiences for the experiences page.",
)
async def get_public_experiences(
    session: AsyncSession = Depends(get_db_session),
) -> list[LuxuryExperienceResponse]:
    return await ExperienceService(session).get_active()
