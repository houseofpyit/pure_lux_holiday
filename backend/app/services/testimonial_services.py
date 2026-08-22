"""Testimonial services for Testimonials & Reviews module."""

from __future__ import annotations
import uuid
from typing import Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.testimonial_repositories import TestimonialCategoryRepository, TestimonialRepository
from app.utils.media.media_validation import validate_media_ids
from app.schemas.testimonials import (
    TestimonialCategoryCreate, TestimonialCategoryResponse, TestimonialCategoryUpdate,
    TestimonialCreate, TestimonialResponse, TestimonialUpdate,
    PublicTestimonialResponse, ReorderRequest,
)


class TestimonialCategoryService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = TestimonialCategoryRepository(session)

    async def get_all(self) -> list[TestimonialCategoryResponse]:
        items = await self.repo.get_all(order_by="display_order")
        return [TestimonialCategoryResponse.model_validate(i) for i in items]

    async def create(self, data: TestimonialCategoryCreate) -> TestimonialCategoryResponse:
        if await self.repo.slug_exists(data.slug):
            raise HTTPException(409, f"Slug '{data.slug}' already exists")
        item = await self.repo.create(**data.model_dump())
        return TestimonialCategoryResponse.model_validate(item)

    async def update(self, item_id: uuid.UUID, data: TestimonialCategoryUpdate) -> TestimonialCategoryResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Category not found")
        if data.slug and data.slug != item.slug and await self.repo.slug_exists(data.slug, exclude_id=item_id):
            raise HTTPException(409, f"Slug '{data.slug}' already exists")
        update_data = data.model_dump(exclude_unset=True)
        if update_data:
            item = await self.repo.update(item, **update_data)
        return TestimonialCategoryResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Category not found")
        await self.repo.delete(item)


class TestimonialService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = TestimonialRepository(session)

    async def get_all(self) -> list[TestimonialResponse]:
        items = await self.repo.get_all(order_by="display_order")
        return [TestimonialResponse.model_validate(i) for i in items]

    async def get_by_id(self, item_id: uuid.UUID) -> TestimonialResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Testimonial not found")
        return TestimonialResponse.model_validate(item)

    async def create(self, data: TestimonialCreate) -> TestimonialResponse:
        kwargs = data.model_dump()
        await validate_media_ids(self.repo.session, {
            "profile_image_id": kwargs.get("profile_image_id"),
            "customer_photo_id": kwargs.get("customer_photo_id"),
            "background_image_id": kwargs.get("background_image_id"),
            "video_id": kwargs.get("video_id"),
            "video_thumbnail_id": kwargs.get("video_thumbnail_id"),
        })
        self._coerce_media_ids(kwargs)
        if kwargs.get("package_id"):
            kwargs["package_id"] = uuid.UUID(kwargs["package_id"])
        if kwargs.get("category_id"):
            kwargs["category_id"] = uuid.UUID(kwargs["category_id"])
        item = await self.repo.create(**kwargs)
        return TestimonialResponse.model_validate(item)

    async def update(self, item_id: uuid.UUID, data: TestimonialUpdate) -> TestimonialResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Testimonial not found")
        kwargs = data.model_dump(exclude_unset=True)
        await validate_media_ids(self.repo.session, {
            "profile_image_id": kwargs.get("profile_image_id"),
            "customer_photo_id": kwargs.get("customer_photo_id"),
            "background_image_id": kwargs.get("background_image_id"),
            "video_id": kwargs.get("video_id"),
            "video_thumbnail_id": kwargs.get("video_thumbnail_id"),
        })
        self._coerce_media_ids(kwargs)
        if kwargs.get("package_id"):
            kwargs["package_id"] = uuid.UUID(kwargs["package_id"])
        if kwargs.get("category_id"):
            kwargs["category_id"] = uuid.UUID(kwargs["category_id"])
        if kwargs:
            item = await self.repo.update(item, **kwargs)
        return TestimonialResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Testimonial not found")
        await self.repo.delete(item)

    async def reorder(self, data: ReorderRequest) -> list[TestimonialResponse]:
        for ri in data.items:
            item = await self.repo.get_by_id(uuid.UUID(ri.id))
            if item:
                item.display_order = ri.display_order
        await self.repo.session.flush()
        return await self.get_all()

    async def get_public_list(self) -> PublicTestimonialResponse:
        featured = await self.repo.get_featured()
        homepage = await self.repo.get_homepage_featured()
        latest = await self.repo.get_latest()
        return PublicTestimonialResponse(
            featured=[TestimonialResponse.model_validate(i) for i in featured],
            homepage_featured=[TestimonialResponse.model_validate(i) for i in homepage],
            latest=[TestimonialResponse.model_validate(i) for i in latest],
        )

    async def get_by_package(self, package_id: uuid.UUID) -> list[TestimonialResponse]:
        items = await self.repo.get_by_package(package_id)
        return [TestimonialResponse.model_validate(i) for i in items]

    async def get_by_destination(self, destination_slug: str) -> list[TestimonialResponse]:
        items = await self.repo.get_by_destination(destination_slug)
        return [TestimonialResponse.model_validate(i) for i in items]

    def _coerce_media_ids(self, kwargs: dict) -> None:
        for fk in [
            "profile_image_id",
            "customer_photo_id",
            "background_image_id",
            "video_id",
            "video_thumbnail_id",
        ]:
            if kwargs.get(fk):
                kwargs[fk] = uuid.UUID(kwargs[fk])
