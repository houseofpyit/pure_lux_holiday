"""Package services for Luxury Packages CMS."""

from __future__ import annotations
import uuid
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.package_repositories import (
    PackageCategoryRepository, LuxuryPackageRepository, PackageGalleryRepository,
    PackageItineraryRepository, PackageHighlightRepository, PackageFAQRepository,
    PackageInclusionRepository, PackageExclusionRepository,
)
from app.schemas.packages import (
    PackageCategoryCreate, PackageCategoryResponse, PackageCategoryUpdate,
    LuxuryPackageCreate, LuxuryPackageListResponse, LuxuryPackageUpdate,
    LuxuryPackageDetailResponse, PublicPackageListResponse,
    PackageGalleryResponse, PackageItineraryResponse, PackageHighlightResponse,
    PackageFAQResponse, PackageInclusionResponse, PackageExclusionResponse,
    GalleryCreate, ItineraryCreate, FAQCreate, ChildEntityCreate, ChildEntityUpdate,
    ReorderRequest,
)


class CategoryService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = PackageCategoryRepository(session)

    async def get_all(self) -> list[PackageCategoryResponse]:
        items = await self.repo.get_all(order_by="display_order")
        return [PackageCategoryResponse.model_validate(i) for i in items]

    async def create(self, data: PackageCategoryCreate) -> PackageCategoryResponse:
        if await self.repo.slug_exists(data.slug):
            raise HTTPException(409, f"Slug '{data.slug}' already exists")
        item = await self.repo.create(**data.model_dump())
        return PackageCategoryResponse.model_validate(item)

    async def update(self, item_id: uuid.UUID, data: PackageCategoryUpdate) -> PackageCategoryResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Category not found")
        if data.slug and data.slug != item.slug and await self.repo.slug_exists(data.slug, exclude_id=item_id):
            raise HTTPException(409, f"Slug '{data.slug}' already exists")
        update_data = data.model_dump(exclude_unset=True)
        if update_data:
            item = await self.repo.update(item, **update_data)
        return PackageCategoryResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Category not found")
        await self.repo.delete(item)


class PackageService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = LuxuryPackageRepository(session)
        self.gallery_repo = PackageGalleryRepository(session)
        self.itinerary_repo = PackageItineraryRepository(session)
        self.highlight_repo = PackageHighlightRepository(session)
        self.faq_repo = PackageFAQRepository(session)
        self.inclusion_repo = PackageInclusionRepository(session)
        self.exclusion_repo = PackageExclusionRepository(session)

    async def get_all(self) -> list[LuxuryPackageListResponse]:
        items = await self.repo.get_all(order_by="created_at")
        return [LuxuryPackageListResponse.model_validate(i) for i in items]

    async def get_by_id(self, item_id: uuid.UUID) -> LuxuryPackageDetailResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Package not found")
        return await self._build_detail(item)

    async def create(self, data: LuxuryPackageCreate) -> LuxuryPackageDetailResponse:
        if await self.repo.slug_exists(data.slug):
            raise HTTPException(409, f"Slug '{data.slug}' already exists")
        item = await self.repo.create(**data.model_dump())
        return await self._build_detail(item)

    async def update(self, item_id: uuid.UUID, data: LuxuryPackageUpdate) -> LuxuryPackageDetailResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Package not found")
        if data.slug and data.slug != item.slug and await self.repo.slug_exists(data.slug, exclude_id=item_id):
            raise HTTPException(409, f"Slug '{data.slug}' already exists")
        update_data = data.model_dump(exclude_unset=True)
        if update_data:
            item = await self.repo.update(item, **update_data)
        return await self._build_detail(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Package not found")
        await self.repo.delete(item)

    async def get_public_list(self) -> PublicPackageListResponse:
        featured = await self.repo.get_featured()
        popular = await self.repo.get_popular()
        latest = await self.repo.get_latest()
        return PublicPackageListResponse(
            featured=[LuxuryPackageListResponse.model_validate(i) for i in featured],
            popular=[LuxuryPackageListResponse.model_validate(i) for i in popular],
            latest=[LuxuryPackageListResponse.model_validate(i) for i in latest],
        )

    async def get_by_slug(self, slug: str) -> LuxuryPackageDetailResponse:
        item = await self.repo.get_by_slug(slug)
        if item is None:
            raise HTTPException(404, "Package not found")
        return await self._build_detail(item)

    async def _build_detail(self, item) -> LuxuryPackageDetailResponse:
        gallery = await self.gallery_repo.get_by_package(item.id)
        itinerary = await self.itinerary_repo.get_by_package(item.id)
        highlights = await self.highlight_repo.get_by_package(item.id)
        faqs = await self.faq_repo.get_by_package(item.id)
        inclusions = await self.inclusion_repo.get_by_package(item.id)
        exclusions = await self.exclusion_repo.get_by_package(item.id)
        resp = LuxuryPackageDetailResponse.model_validate(item)
        resp.gallery = [PackageGalleryResponse.model_validate(g) for g in gallery]
        resp.itinerary = [PackageItineraryResponse.model_validate(i) for i in itinerary]
        resp.highlights = [PackageHighlightResponse.model_validate(h) for h in highlights]
        resp.faqs = [PackageFAQResponse.model_validate(f) for f in faqs]
        resp.inclusions = [PackageInclusionResponse.model_validate(i) for i in inclusions]
        resp.exclusions = [PackageExclusionResponse.model_validate(e) for e in exclusions]
        return resp


class PackageGalleryService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = PackageGalleryRepository(session)

    async def get_by_package(self, package_id: uuid.UUID) -> list[PackageGalleryResponse]:
        items = await self.repo.get_by_package(package_id)
        return [PackageGalleryResponse.model_validate(i) for i in items]

    async def create(self, package_id: uuid.UUID, data: GalleryCreate) -> PackageGalleryResponse:
        item = await self.repo.create(package_id=package_id, media_id=uuid.UUID(data.media_id), display_order=data.display_order)
        return PackageGalleryResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Gallery item not found")
        await self.repo.delete(item)

    async def reorder(self, data: ReorderRequest) -> list[PackageGalleryResponse]:
        for ri in data.items:
            item = await self.repo.get_by_id(uuid.UUID(ri.id))
            if item:
                item.display_order = ri.display_order
                # track the package_id for the final fetch
                package_id = item.package_id
        await self.repo.session.flush()
        items = await self.repo.get_by_package(package_id)
        return [PackageGalleryResponse.model_validate(i) for i in items]


class PackageItineraryService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = PackageItineraryRepository(session)

    async def get_by_package(self, package_id: uuid.UUID) -> list[PackageItineraryResponse]:
        items = await self.repo.get_by_package(package_id)
        return [PackageItineraryResponse.model_validate(i) for i in items]

    async def create(self, package_id: uuid.UUID, data: ItineraryCreate) -> PackageItineraryResponse:
        kwargs = data.model_dump()
        if kwargs.get("media_id"):
            kwargs["media_id"] = uuid.UUID(kwargs["media_id"])
        item = await self.repo.create(package_id=package_id, **kwargs)
        return PackageItineraryResponse.model_validate(item)

    async def update(self, item_id: uuid.UUID, data: ItineraryCreate) -> PackageItineraryResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Itinerary item not found")
        kwargs = data.model_dump(exclude_unset=True)
        if kwargs.get("media_id"):
            kwargs["media_id"] = uuid.UUID(kwargs["media_id"])
        if kwargs:
            item = await self.repo.update(item, **kwargs)
        return PackageItineraryResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Itinerary item not found")
        await self.repo.delete(item)

    async def reorder(self, data: ReorderRequest) -> list[PackageItineraryResponse]:
        package_id = None
        for ri in data.items:
            item = await self.repo.get_by_id(uuid.UUID(ri.id))
            if item:
                item.display_order = ri.display_order
                package_id = item.package_id
        await self.repo.session.flush()
        if package_id is None:
            return []
        return await self.get_by_package(package_id)


class PackageHighlightService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = PackageHighlightRepository(session)

    async def get_by_package(self, package_id: uuid.UUID) -> list[PackageHighlightResponse]:
        items = await self.repo.get_by_package(package_id)
        return [PackageHighlightResponse.model_validate(i) for i in items]

    async def create(self, package_id: uuid.UUID, data: ChildEntityCreate) -> PackageHighlightResponse:
        item = await self.repo.create(package_id=package_id, **data.model_dump())
        return PackageHighlightResponse.model_validate(item)

    async def update(self, item_id: uuid.UUID, data: ChildEntityUpdate) -> PackageHighlightResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Highlight not found")
        kwargs = data.model_dump(exclude_unset=True)
        if kwargs:
            item = await self.repo.update(item, **kwargs)
        return PackageHighlightResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Highlight not found")
        await self.repo.delete(item)


class PackageFAQService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = PackageFAQRepository(session)

    async def get_by_package(self, package_id: uuid.UUID) -> list[PackageFAQResponse]:
        items = await self.repo.get_by_package(package_id)
        return [PackageFAQResponse.model_validate(i) for i in items]

    async def create(self, package_id: uuid.UUID, data: FAQCreate) -> PackageFAQResponse:
        item = await self.repo.create(package_id=package_id, **data.model_dump())
        return PackageFAQResponse.model_validate(item)

    async def update(self, item_id: uuid.UUID, data: FAQCreate) -> PackageFAQResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "FAQ not found")
        kwargs = data.model_dump(exclude_unset=True)
        if kwargs:
            item = await self.repo.update(item, **kwargs)
        return PackageFAQResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "FAQ not found")
        await self.repo.delete(item)


class PackageInclusionService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = PackageInclusionRepository(session)

    async def get_by_package(self, package_id: uuid.UUID) -> list[PackageInclusionResponse]:
        items = await self.repo.get_by_package(package_id)
        return [PackageInclusionResponse.model_validate(i) for i in items]

    async def create(self, package_id: uuid.UUID, data: ChildEntityCreate) -> PackageInclusionResponse:
        # PackageInclusion has no 'icon' column — exclude it before passing to the repo
        kwargs = {k: v for k, v in data.model_dump().items() if k != "icon"}
        item = await self.repo.create(package_id=package_id, **kwargs)
        return PackageInclusionResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Inclusion not found")
        await self.repo.delete(item)


class PackageExclusionService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = PackageExclusionRepository(session)

    async def get_by_package(self, package_id: uuid.UUID) -> list[PackageExclusionResponse]:
        items = await self.repo.get_by_package(package_id)
        return [PackageExclusionResponse.model_validate(i) for i in items]

    async def create(self, package_id: uuid.UUID, data: ChildEntityCreate) -> PackageExclusionResponse:
        # PackageExclusion has no 'icon' column — exclude it before passing to the repo
        kwargs = {k: v for k, v in data.model_dump().items() if k != "icon"}
        item = await self.repo.create(package_id=package_id, **kwargs)
        return PackageExclusionResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Exclusion not found")
        await self.repo.delete(item)