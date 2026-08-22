"""Gallery Management routers for all gallery modules + public endpoints."""

from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.dependencies.auth_dependencies import get_current_active_user, require_admin, require_editor
from app.schemas.auth import CurrentUserResponse
from app.schemas.gallery import (
    GalleryCategoryCreate, GalleryCategoryResponse, GalleryCategoryUpdate,
    GalleryAlbumCreate, GalleryAlbumResponse, GalleryAlbumUpdate,
    GalleryAlbumDetailResponse,
    GalleryItemCreate, GalleryItemResponse, GalleryItemUpdate,
    PublicGalleryResponse, ReorderRequest,
)
from app.services.gallery_services import GalleryCategoryService, GalleryAlbumService, GalleryItemService

# ─── Categories ────────────────────────────────────────────────
cat_router = APIRouter(prefix="/gallery/categories", tags=["Gallery - Categories"])

@cat_router.get("", response_model=list[GalleryCategoryResponse])
async def list_categories(session: AsyncSession = Depends(get_db_session)) -> list[GalleryCategoryResponse]:
    return await GalleryCategoryService(session).get_all()

@cat_router.post("", response_model=GalleryCategoryResponse, status_code=201)
async def create_category(data: GalleryCategoryCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> GalleryCategoryResponse:
    return await GalleryCategoryService(session).create(data)

@cat_router.patch("/{item_id}", response_model=GalleryCategoryResponse)
async def update_category(item_id: uuid.UUID, data: GalleryCategoryUpdate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> GalleryCategoryResponse:
    return await GalleryCategoryService(session).update(item_id, data)

@cat_router.delete("/{item_id}", status_code=200)
async def delete_category(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await GalleryCategoryService(session).delete(item_id)
    return {"message": "Category deleted"}

# ─── Albums ────────────────────────────────────────────────────
alb_router = APIRouter(prefix="/gallery/albums", tags=["Gallery - Albums"])

@alb_router.get("", response_model=list[GalleryAlbumResponse])
async def list_albums(session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> list[GalleryAlbumResponse]:
    return await GalleryAlbumService(session).get_all()

@alb_router.get("/{item_id}", response_model=GalleryAlbumDetailResponse)
async def get_album(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> GalleryAlbumDetailResponse:
    return await GalleryAlbumService(session).get_by_id(item_id)

@alb_router.post("", response_model=GalleryAlbumResponse, status_code=201)
async def create_album(data: GalleryAlbumCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> GalleryAlbumResponse:
    return await GalleryAlbumService(session).create(data)

@alb_router.patch("/{item_id}", response_model=GalleryAlbumResponse)
async def update_album(item_id: uuid.UUID, data: GalleryAlbumUpdate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> GalleryAlbumResponse:
    return await GalleryAlbumService(session).update(item_id, data)

@alb_router.delete("/{item_id}", status_code=200)
async def delete_album(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await GalleryAlbumService(session).delete(item_id)
    return {"message": "Album deleted"}

@alb_router.put("/reorder", response_model=list[GalleryAlbumResponse])
async def reorder_albums(data: ReorderRequest, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> list[GalleryAlbumResponse]:
    return await GalleryAlbumService(session).reorder(data)

# ─── Items ─────────────────────────────────────────────────────
item_router = APIRouter(prefix="/gallery/items", tags=["Gallery - Items"])

@item_router.get("/{album_id}", response_model=list[GalleryItemResponse])
async def list_items(album_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> list[GalleryItemResponse]:
    return await GalleryItemService(session).get_by_album(album_id)

@item_router.post("/{album_id}", response_model=GalleryItemResponse, status_code=201)
async def add_item(album_id: uuid.UUID, data: GalleryItemCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> GalleryItemResponse:
    return await GalleryItemService(session).create(album_id, data)

@item_router.patch("/{item_id}", response_model=GalleryItemResponse)
async def update_item(item_id: uuid.UUID, data: GalleryItemUpdate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> GalleryItemResponse:
    return await GalleryItemService(session).update(item_id, data)

@item_router.delete("/{item_id}", status_code=200)
async def delete_item(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await GalleryItemService(session).delete(item_id)
    return {"message": "Item deleted"}

@item_router.put("/reorder", response_model=list[GalleryItemResponse])
async def reorder_items(data: ReorderRequest, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> list[GalleryItemResponse]:
    return await GalleryItemService(session).reorder(data)

# ─── Public Endpoints ──────────────────────────────────────────
pub_router = APIRouter(prefix="/public", tags=["Public"])

@pub_router.get("/gallery", response_model=PublicGalleryResponse, summary="Get gallery for homepage")
async def get_public_gallery(session: AsyncSession = Depends(get_db_session)) -> PublicGalleryResponse:
    return await GalleryAlbumService(session).get_public_list()

@pub_router.get("/gallery/albums", response_model=list[GalleryAlbumResponse], summary="List all active albums")
async def get_public_albums(session: AsyncSession = Depends(get_db_session)) -> list[GalleryAlbumResponse]:
    service = GalleryAlbumService(session)
    items = await service.get_all()
    return [i for i in items if i.is_active]

@pub_router.get("/gallery/albums/{slug}", response_model=GalleryAlbumDetailResponse, summary="Get album detail by slug")
async def get_public_album_detail(slug: str, session: AsyncSession = Depends(get_db_session)) -> GalleryAlbumDetailResponse:
    return await GalleryAlbumService(session).get_by_slug(slug)