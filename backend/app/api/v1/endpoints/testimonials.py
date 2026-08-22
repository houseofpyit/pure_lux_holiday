"""Testimonials & Reviews routers for all testimonial modules + public endpoints."""

from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.dependencies.auth_dependencies import get_current_active_user, require_admin, require_editor
from app.schemas.auth import CurrentUserResponse
from app.schemas.testimonials import (
    TestimonialCategoryCreate, TestimonialCategoryResponse, TestimonialCategoryUpdate,
    TestimonialCreate, TestimonialResponse, TestimonialUpdate,
    PublicTestimonialResponse, ReorderRequest,
)
from app.services.testimonial_services import TestimonialCategoryService, TestimonialService

# ─── Categories ────────────────────────────────────────────────
cat_router = APIRouter(prefix="/testimonials/categories", tags=["Testimonials - Categories"])

@cat_router.get("", response_model=list[TestimonialCategoryResponse])
async def list_categories(session: AsyncSession = Depends(get_db_session)) -> list[TestimonialCategoryResponse]:
    return await TestimonialCategoryService(session).get_all()

@cat_router.post("", response_model=TestimonialCategoryResponse, status_code=201)
async def create_category(data: TestimonialCategoryCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> TestimonialCategoryResponse:
    return await TestimonialCategoryService(session).create(data)

@cat_router.patch("/{item_id}", response_model=TestimonialCategoryResponse)
async def update_category(item_id: uuid.UUID, data: TestimonialCategoryUpdate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> TestimonialCategoryResponse:
    return await TestimonialCategoryService(session).update(item_id, data)

@cat_router.delete("/{item_id}", status_code=200)
async def delete_category(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await TestimonialCategoryService(session).delete(item_id)
    return {"message": "Category deleted"}

# ─── Testimonials ──────────────────────────────────────────────
test_router = APIRouter(prefix="/testimonials", tags=["Testimonials"])

@test_router.get("", response_model=list[TestimonialResponse])
async def list_testimonials(session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> list[TestimonialResponse]:
    return await TestimonialService(session).get_all()

@test_router.get("/{item_id}", response_model=TestimonialResponse)
async def get_testimonial(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> TestimonialResponse:
    return await TestimonialService(session).get_by_id(item_id)

@test_router.post("", response_model=TestimonialResponse, status_code=201)
async def create_testimonial(data: TestimonialCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> TestimonialResponse:
    return await TestimonialService(session).create(data)

@test_router.patch("/{item_id}", response_model=TestimonialResponse)
async def update_testimonial(item_id: uuid.UUID, data: TestimonialUpdate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> TestimonialResponse:
    return await TestimonialService(session).update(item_id, data)

@test_router.delete("/{item_id}", status_code=200)
async def delete_testimonial(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await TestimonialService(session).delete(item_id)
    return {"message": "Testimonial deleted"}

@test_router.put("/reorder", response_model=list[TestimonialResponse])
async def reorder_testimonials(data: ReorderRequest, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> list[TestimonialResponse]:
    return await TestimonialService(session).reorder(data)

# ─── Public Endpoints ──────────────────────────────────────────
pub_router = APIRouter(prefix="/public", tags=["Public"])

@pub_router.get("/testimonials", response_model=PublicTestimonialResponse, summary="Get testimonials for homepage")
async def get_public_testimonials(session: AsyncSession = Depends(get_db_session)) -> PublicTestimonialResponse:
    return await TestimonialService(session).get_public_list()

@pub_router.get("/testimonials/{item_id}", response_model=TestimonialResponse, summary="Get single testimonial")
async def get_public_testimonial(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session)) -> TestimonialResponse:
    return await TestimonialService(session).get_by_id(item_id)

@pub_router.get("/packages/{slug}/testimonials", response_model=list[TestimonialResponse], summary="Get package testimonials")
async def get_package_testimonials(slug: str, session: AsyncSession = Depends(get_db_session)) -> list[TestimonialResponse]:
    from app.repositories.package_repositories import LuxuryPackageRepository
    pkg_repo = LuxuryPackageRepository(session)
    pkg = await pkg_repo.get_by_slug(slug)
    if pkg is None:
        from fastapi import HTTPException
        raise HTTPException(404, "Package not found")
    return await TestimonialService(session).get_by_package(pkg.id)

@pub_router.get("/destinations/{slug}/testimonials", response_model=list[TestimonialResponse], summary="Get destination testimonials")
async def get_destination_testimonials(slug: str, session: AsyncSession = Depends(get_db_session)) -> list[TestimonialResponse]:
    return await TestimonialService(session).get_by_destination(slug)