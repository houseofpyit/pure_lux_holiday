"""Gallery services for Gallery Management module."""

from __future__ import annotations
import uuid
from typing import Optional
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.gallery_repositories import GalleryCategoryRepository, GalleryAlbumRepository, GalleryItemRepository
from app.utils.media.media_validation import validate_media_ids
from app.schemas.gallery import (
    GalleryCategoryCreate, GalleryCategoryResponse, GalleryCategoryUpdate,
    GalleryAlbumCreate, GalleryAlbumResponse, GalleryAlbumUpdate,
    GalleryAlbumDetailResponse,
    GalleryItemCreate, GalleryItemResponse, GalleryItemUpdate,
    PublicGalleryResponse, PublicGalleryItemResponse, ReorderRequest,
)


class GalleryCategoryService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = GalleryCategoryRepository(session)

    async def get_all(self) -> list[GalleryCategoryResponse]:
        items = await self.repo.get_all(order_by="display_order")
        return [GalleryCategoryResponse.model_validate(i) for i in items]

    async def create(self, data: GalleryCategoryCreate) -> GalleryCategoryResponse:
        if await self.repo.slug_exists(data.slug):
            raise HTTPException(409, f"Slug '{data.slug}' already exists")
        item = await self.repo.create(**data.model_dump())
        return GalleryCategoryResponse.model_validate(item)

    async def update(self, item_id: uuid.UUID, data: GalleryCategoryUpdate) -> GalleryCategoryResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Category not found")
        if data.slug and data.slug != item.slug and await self.repo.slug_exists(data.slug, exclude_id=item_id):
            raise HTTPException(409, f"Slug '{data.slug}' already exists")
        update_data = data.model_dump(exclude_unset=True)
        if update_data:
            item = await self.repo.update(item, **update_data)
        return GalleryCategoryResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Category not found")
        await self.repo.delete(item)


class GalleryAlbumService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = GalleryAlbumRepository(session)
        self.item_repo = GalleryItemRepository(session)
        self.category_repo = GalleryCategoryRepository(session)

    async def get_all(self) -> list[GalleryAlbumResponse]:
        items = await self.repo.get_all(order_by="display_order")
        return [GalleryAlbumResponse.model_validate(i) for i in items]

    async def get_by_id(self, item_id: uuid.UUID) -> GalleryAlbumDetailResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Album not found")
        return await self._build_detail(item)

    async def create(self, data: GalleryAlbumCreate) -> GalleryAlbumResponse:
        if await self.repo.slug_exists(data.slug):
            raise HTTPException(409, f"Slug '{data.slug}' already exists")
        payload = data.model_dump()
        await validate_media_ids(self.repo.session, {
            "cover_media_id": payload.get("cover_media_id"),
        })
        item = await self.repo.create(**payload)
        return GalleryAlbumResponse.model_validate(item)

    async def update(self, item_id: uuid.UUID, data: GalleryAlbumUpdate) -> GalleryAlbumResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Album not found")
        if data.slug and data.slug != item.slug and await self.repo.slug_exists(data.slug, exclude_id=item_id):
            raise HTTPException(409, f"Slug '{data.slug}' already exists")
        update_data = data.model_dump(exclude_unset=True)
        await validate_media_ids(self.repo.session, {
            "cover_media_id": update_data.get("cover_media_id"),
        })
        if update_data:
            item = await self.repo.update(item, **update_data)
        return GalleryAlbumResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Album not found")
        await self.repo.delete(item)

    async def reorder(self, data: ReorderRequest) -> list[GalleryAlbumResponse]:
        for ri in data.items:
            item = await self.repo.get_by_id(uuid.UUID(ri.id))
            if item:
                item.display_order = ri.display_order
        await self.repo.session.flush()
        return await self.get_all()

    async def get_public_list(self) -> PublicGalleryResponse:
        featured = await self.repo.get_featured()
        homepage = await self.repo.get_homepage_featured()
        latest = await self.repo.get_latest()
        albums = await self.repo.get_active()
        categories = await self.category_repo.get_active()
        items = await self.item_repo.get_active()
        album_by_id = {album.id: album for album in albums}

        return PublicGalleryResponse(
            featured_albums=[GalleryAlbumResponse.model_validate(i) for i in featured],
            homepage_albums=[GalleryAlbumResponse.model_validate(i) for i in homepage],
            latest_albums=[GalleryAlbumResponse.model_validate(i) for i in latest],
            albums=[GalleryAlbumResponse.model_validate(i) for i in albums],
            categories=[GalleryCategoryResponse.model_validate(i) for i in categories],
            items=[
                self._build_public_item(item, album_by_id[item.album_id])
                for item in items
                if item.album_id in album_by_id
            ],
        )

    async def get_by_slug(self, slug: str) -> GalleryAlbumDetailResponse:
        item = await self.repo.get_by_slug(slug)
        if item is None:
            raise HTTPException(404, "Album not found")
        return await self._build_detail(item)

    async def _build_detail(self, item) -> GalleryAlbumDetailResponse:
        items = await self.item_repo.get_by_album(item.id)
        resp = GalleryAlbumDetailResponse.model_validate(item)
        resp.items = [GalleryItemResponse.model_validate(i) for i in items]
        return resp

    def _build_public_item(self, item, album) -> PublicGalleryItemResponse:
        category = album.category
        return PublicGalleryItemResponse(
            id=str(item.id),
            album_id=str(item.album_id),
            title=item.title,
            description=item.description,
            media=item.media,
            media_type=item.media_type,
            is_featured=item.is_featured,
            display_order=item.display_order,
            album_slug=album.slug,
            album_title=album.title,
            category_slug=category.slug if category else None,
            category_name=category.name if category else None,
        )


class GalleryItemService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = GalleryItemRepository(session)

    async def get_by_album(self, album_id: uuid.UUID) -> list[GalleryItemResponse]:
        items = await self.repo.get_by_album(album_id)
        return [GalleryItemResponse.model_validate(i) for i in items]

    async def create(self, album_id: uuid.UUID, data: GalleryItemCreate) -> GalleryItemResponse:
        kwargs = data.model_dump()
        await validate_media_ids(self.repo.session, {
            "media_id": kwargs.get("media_id"),
        })
        if kwargs.get("media_id"):
            kwargs["media_id"] = uuid.UUID(kwargs["media_id"])
        item = await self.repo.create(album_id=album_id, **kwargs)
        return GalleryItemResponse.model_validate(item)

    async def update(self, item_id: uuid.UUID, data: GalleryItemUpdate) -> GalleryItemResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Gallery item not found")
        kwargs = data.model_dump(exclude_unset=True)
        await validate_media_ids(self.repo.session, {
            "media_id": kwargs.get("media_id"),
        })
        if kwargs.get("media_id"):
            kwargs["media_id"] = uuid.UUID(kwargs["media_id"])
        if kwargs:
            item = await self.repo.update(item, **kwargs)
        return GalleryItemResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Gallery item not found")
        await self.repo.delete(item)

    async def reorder(self, data: ReorderRequest) -> list[GalleryItemResponse]:
        first_album_id = None
        for ri in data.items:
            item = await self.repo.get_by_id(uuid.UUID(ri.id))
            if item:
                item.display_order = ri.display_order
                if first_album_id is None:
                    first_album_id = item.album_id
        await self.repo.session.flush()
        if first_album_id:
            return await self.get_by_album(first_album_id)
        return []