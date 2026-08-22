"""Luxury Packages CMS routers for all package modules + public endpoints."""

from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.dependencies.auth_dependencies import get_current_active_user, require_admin, require_editor
from app.schemas.auth import CurrentUserResponse
from app.schemas.packages import (
    PackageCategoryCreate, PackageCategoryResponse, PackageCategoryUpdate,
    LuxuryPackageCreate, LuxuryPackageListResponse, LuxuryPackageUpdate,
    LuxuryPackageDetailResponse, PublicPackageListResponse,
    PackageGalleryResponse, PackageItineraryResponse, PackageHighlightResponse,
    PackageFAQResponse, PackageInclusionResponse, PackageExclusionResponse,
    GalleryCreate, ItineraryCreate, FAQCreate, ChildEntityCreate, ChildEntityUpdate, ReorderRequest,
)
from app.services.package_services import (
    CategoryService, PackageService, PackageGalleryService, PackageItineraryService,
    PackageHighlightService, PackageFAQService, PackageInclusionService, PackageExclusionService,
)

# ─── Categories ────────────────────────────────────────────────
cat_router = APIRouter(prefix="/packages/categories", tags=["Packages - Categories"])

@cat_router.get("", response_model=list[PackageCategoryResponse])
async def list_categories(session: AsyncSession = Depends(get_db_session)) -> list[PackageCategoryResponse]:
    return await CategoryService(session).get_all()

@cat_router.post("", response_model=PackageCategoryResponse, status_code=201)
async def create_category(data: PackageCategoryCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> PackageCategoryResponse:
    return await CategoryService(session).create(data)

@cat_router.patch("/{item_id}", response_model=PackageCategoryResponse)
async def update_category(item_id: uuid.UUID, data: PackageCategoryUpdate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> PackageCategoryResponse:
    return await CategoryService(session).update(item_id, data)

@cat_router.delete("/{item_id}", status_code=200)
async def delete_category(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await CategoryService(session).delete(item_id)
    return {"message": "Category deleted"}

# ─── Packages ──────────────────────────────────────────────────
pkg_router = APIRouter(prefix="/packages", tags=["Packages"])

@pkg_router.get("", response_model=list[LuxuryPackageListResponse])
async def list_packages(session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> list[LuxuryPackageListResponse]:
    return await PackageService(session).get_all()

@pkg_router.get("/{item_id}", response_model=LuxuryPackageDetailResponse)
async def get_package(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> LuxuryPackageDetailResponse:
    return await PackageService(session).get_by_id(item_id)

@pkg_router.post("", response_model=LuxuryPackageDetailResponse, status_code=201)
async def create_package(data: LuxuryPackageCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> LuxuryPackageDetailResponse:
    return await PackageService(session).create(data)

@pkg_router.patch("/{item_id}", response_model=LuxuryPackageDetailResponse)
async def update_package(item_id: uuid.UUID, data: LuxuryPackageUpdate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> LuxuryPackageDetailResponse:
    return await PackageService(session).update(item_id, data)

@pkg_router.delete("/{item_id}", status_code=200)
async def delete_package(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await PackageService(session).delete(item_id)
    return {"message": "Package deleted"}

# ─── Gallery ───────────────────────────────────────────────────
gal_router = APIRouter(prefix="/packages/gallery", tags=["Packages - Gallery"])

@gal_router.get("/{package_id}", response_model=list[PackageGalleryResponse])
async def list_gallery(package_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> list[PackageGalleryResponse]:
    return await PackageGalleryService(session).get_by_package(package_id)

@gal_router.post("/{package_id}", response_model=PackageGalleryResponse, status_code=201)
async def add_gallery(package_id: uuid.UUID, data: GalleryCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> PackageGalleryResponse:
    return await PackageGalleryService(session).create(package_id, data)

@gal_router.delete("/{item_id}", status_code=200)
async def delete_gallery(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await PackageGalleryService(session).delete(item_id)
    return {"message": "Gallery item deleted"}

@gal_router.put("/reorder", response_model=list[PackageGalleryResponse])
async def reorder_gallery(data: ReorderRequest, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> list[PackageGalleryResponse]:
    return await PackageGalleryService(session).reorder(data)

# ─── Itinerary ─────────────────────────────────────────────────
it_router = APIRouter(prefix="/packages/itinerary", tags=["Packages - Itinerary"])

@it_router.get("/{package_id}", response_model=list[PackageItineraryResponse])
async def list_itinerary(package_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> list[PackageItineraryResponse]:
    return await PackageItineraryService(session).get_by_package(package_id)

@it_router.post("/{package_id}", response_model=PackageItineraryResponse, status_code=201)
async def add_itinerary(package_id: uuid.UUID, data: ItineraryCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> PackageItineraryResponse:
    return await PackageItineraryService(session).create(package_id, data)

@it_router.patch("/{item_id}", response_model=PackageItineraryResponse)
async def update_itinerary(item_id: uuid.UUID, data: ItineraryCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> PackageItineraryResponse:
    return await PackageItineraryService(session).update(item_id, data)

@it_router.delete("/{item_id}", status_code=200)
async def delete_itinerary(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await PackageItineraryService(session).delete(item_id)
    return {"message": "Itinerary item deleted"}

@it_router.put("/reorder", response_model=list[PackageItineraryResponse])
async def reorder_itinerary(data: ReorderRequest, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> list[PackageItineraryResponse]:
    return await PackageItineraryService(session).reorder(data)

# ─── Highlights ────────────────────────────────────────────────
hl_router = APIRouter(prefix="/packages/highlights", tags=["Packages - Highlights"])

@hl_router.get("/{package_id}", response_model=list[PackageHighlightResponse])
async def list_highlights(package_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> list[PackageHighlightResponse]:
    return await PackageHighlightService(session).get_by_package(package_id)

@hl_router.post("/{package_id}", response_model=PackageHighlightResponse, status_code=201)
async def add_highlight(package_id: uuid.UUID, data: ChildEntityCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> PackageHighlightResponse:
    return await PackageHighlightService(session).create(package_id, data)

@hl_router.patch("/{item_id}", response_model=PackageHighlightResponse)
async def update_highlight(item_id: uuid.UUID, data: ChildEntityUpdate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> PackageHighlightResponse:
    return await PackageHighlightService(session).update(item_id, data)

@hl_router.delete("/{item_id}", status_code=200)
async def delete_highlight(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await PackageHighlightService(session).delete(item_id)
    return {"message": "Highlight deleted"}

# ─── FAQs ──────────────────────────────────────────────────────
faq_router = APIRouter(prefix="/packages/faqs", tags=["Packages - FAQs"])

@faq_router.get("/{package_id}", response_model=list[PackageFAQResponse])
async def list_faqs(package_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> list[PackageFAQResponse]:
    return await PackageFAQService(session).get_by_package(package_id)

@faq_router.post("/{package_id}", response_model=PackageFAQResponse, status_code=201)
async def add_faq(package_id: uuid.UUID, data: FAQCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> PackageFAQResponse:
    return await PackageFAQService(session).create(package_id, data)

@faq_router.patch("/{item_id}", response_model=PackageFAQResponse)
async def update_faq(item_id: uuid.UUID, data: FAQCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> PackageFAQResponse:
    return await PackageFAQService(session).update(item_id, data)

@faq_router.delete("/{item_id}", status_code=200)
async def delete_faq(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await PackageFAQService(session).delete(item_id)
    return {"message": "FAQ deleted"}

# ─── Inclusions ────────────────────────────────────────────────
inc_router = APIRouter(prefix="/packages/inclusions", tags=["Packages - Inclusions"])

@inc_router.get("/{package_id}", response_model=list[PackageInclusionResponse])
async def list_inclusions(package_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> list[PackageInclusionResponse]:
    return await PackageInclusionService(session).get_by_package(package_id)

@inc_router.post("/{package_id}", response_model=PackageInclusionResponse, status_code=201)
async def add_inclusion(package_id: uuid.UUID, data: ChildEntityCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> PackageInclusionResponse:
    return await PackageInclusionService(session).create(package_id, data)

@inc_router.delete("/{item_id}", status_code=200)
async def delete_inclusion(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await PackageInclusionService(session).delete(item_id)
    return {"message": "Inclusion deleted"}

# ─── Exclusions ────────────────────────────────────────────────
exc_router = APIRouter(prefix="/packages/exclusions", tags=["Packages - Exclusions"])

@exc_router.get("/{package_id}", response_model=list[PackageExclusionResponse])
async def list_exclusions(package_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> list[PackageExclusionResponse]:
    return await PackageExclusionService(session).get_by_package(package_id)

@exc_router.post("/{package_id}", response_model=PackageExclusionResponse, status_code=201)
async def add_exclusion(package_id: uuid.UUID, data: ChildEntityCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> PackageExclusionResponse:
    return await PackageExclusionService(session).create(package_id, data)

@exc_router.delete("/{item_id}", status_code=200)
async def delete_exclusion(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await PackageExclusionService(session).delete(item_id)
    return {"message": "Exclusion deleted"}

# ─── Public Endpoints ──────────────────────────────────────────
pub_router = APIRouter(prefix="/public", tags=["Public"])

@pub_router.get("/packages", response_model=PublicPackageListResponse, summary="Get packages for homepage")
async def get_public_packages(session: AsyncSession = Depends(get_db_session)) -> PublicPackageListResponse:
    return await PackageService(session).get_public_list()

@pub_router.get("/packages/{slug}", response_model=LuxuryPackageDetailResponse, summary="Get package detail by slug")
async def get_public_package_detail(slug: str, session: AsyncSession = Depends(get_db_session)) -> LuxuryPackageDetailResponse:
    return await PackageService(session).get_by_slug(slug)