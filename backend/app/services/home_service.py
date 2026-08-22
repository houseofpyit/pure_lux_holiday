"""Homepage services for all homepage CMS modules."""

from __future__ import annotations

import uuid
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.home_repositories import (
    CollectionRepository,
    DestinationRepository,
    ExperienceRepository,
    HeroRepository,
    HomeAboutSectionRepository,
    StatisticRepository,
    WhyChooseRepository,
)
from app.services.cms_service import CTAService
from app.utils.media.media_validation import media_fields_from_payload, validate_media_ids
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


class HeroService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = HeroRepository(session)

    async def get(self) -> HeroSectionResponse:
        hero = await self.repo.get_singleton()
        return HeroSectionResponse.model_validate(hero)

    async def update(self, data: HeroSectionUpdate) -> HeroSectionResponse:
        hero = await self.repo.get_singleton()
        update_data = data.model_dump(exclude_unset=True)
        await validate_media_ids(self.repo.session, media_fields_from_payload(update_data))
        if update_data:
            for key, value in update_data.items():
                setattr(hero, key, value)
            await self.repo.session.flush()
            await self.repo.session.refresh(hero)
        return HeroSectionResponse.model_validate(hero)


class HomeAboutSectionService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = HomeAboutSectionRepository(session)

    async def get(self) -> HomeAboutSectionResponse:
        section = await self.repo.get_singleton()
        return self._to_response(section)

    async def get_active(self) -> HomeAboutSectionResponse | None:
        section = await self.repo.get_active()
        if section is None:
            return None
        return self._to_response(section)

    async def update(self, data: HomeAboutSectionUpdate) -> HomeAboutSectionResponse:
        section = await self.repo.get_singleton()
        update_data = data.model_dump(exclude_unset=True)
        await validate_media_ids(self.repo.session, media_fields_from_payload(update_data))
        if update_data:
            for key, value in update_data.items():
                setattr(section, key, value)
            await self.repo.session.flush()
            await self.repo.session.refresh(section)
        return self._to_response(section)

    def _to_response(self, section) -> HomeAboutSectionResponse:
        from app.core.config import settings as app_settings
        response = HomeAboutSectionResponse.model_validate(section)
        # Build a browser-accessible image URL from the relative file_url
        image_url = None
        if section.image:
            file_url = section.image.file_url or ""
            if file_url.startswith("http"):
                image_url = file_url
            else:
                # Relative path — served under /uploads by the static files mount
                image_url = file_url  # frontend prepends VITE_API_BASE_URL
        return response.model_copy(update={"image_url": image_url})


class CollectionService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = CollectionRepository(session)

    async def get_all(self) -> list[LuxuryCollectionResponse]:
        items = await self.repo.get_all_ordered()
        return [LuxuryCollectionResponse.model_validate(i) for i in items]

    async def get_active(self) -> list[LuxuryCollectionResponse]:
        items = await self.repo.get_active()
        return [LuxuryCollectionResponse.model_validate(i) for i in items]

    async def create(self, data: LuxuryCollectionCreate) -> LuxuryCollectionResponse:
        if await self.repo.slug_exists(data.slug):
            raise HTTPException(status_code=409, detail=f"Slug '{data.slug}' already exists")
        payload = data.model_dump()
        await validate_media_ids(self.repo.session, media_fields_from_payload(payload))
        item = await self.repo.create(**payload)
        return LuxuryCollectionResponse.model_validate(item)

    async def update(self, item_id: uuid.UUID, data: LuxuryCollectionUpdate) -> LuxuryCollectionResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Collection not found")
        if data.slug and data.slug != item.slug and await self.repo.slug_exists(data.slug, exclude_id=item_id):
            raise HTTPException(status_code=409, detail=f"Slug '{data.slug}' already exists")
        update_data = data.model_dump(exclude_unset=True)
        await validate_media_ids(self.repo.session, media_fields_from_payload(update_data))
        if update_data:
            item = await self.repo.update(item, **update_data)
        return LuxuryCollectionResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Collection not found")
        await self.repo.delete(item)

    async def reorder(self, data: ReorderRequest) -> list[LuxuryCollectionResponse]:
        for ri in data.items:
            item = await self.repo.get_by_id(uuid.UUID(ri.id))
            if item:
                item.display_order = ri.display_order
        await self.repo.session.flush()
        return await self.get_all()


class DestinationService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = DestinationRepository(session)

    async def get_all(self) -> list[FeaturedDestinationResponse]:
        items = await self.repo.get_all_ordered()
        return [FeaturedDestinationResponse.model_validate(i) for i in items]

    async def get_active(self) -> list[FeaturedDestinationResponse]:
        items = await self.repo.get_active()
        return [FeaturedDestinationResponse.model_validate(i) for i in items]

    async def create(self, data: FeaturedDestinationCreate) -> FeaturedDestinationResponse:
        if await self.repo.slug_exists(data.slug):
            raise HTTPException(status_code=409, detail=f"Slug '{data.slug}' already exists")
        payload = data.model_dump()
        await validate_media_ids(self.repo.session, media_fields_from_payload(payload))
        item = await self.repo.create(**payload)
        return FeaturedDestinationResponse.model_validate(item)

    async def update(self, item_id: uuid.UUID, data: FeaturedDestinationUpdate) -> FeaturedDestinationResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Destination not found")
        if data.slug and data.slug != item.slug and await self.repo.slug_exists(data.slug, exclude_id=item_id):
            raise HTTPException(status_code=409, detail=f"Slug '{data.slug}' already exists")
        update_data = data.model_dump(exclude_unset=True)
        await validate_media_ids(self.repo.session, media_fields_from_payload(update_data))
        if update_data:
            item = await self.repo.update(item, **update_data)
        return FeaturedDestinationResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Destination not found")
        await self.repo.delete(item)

    async def reorder(self, data: ReorderRequest) -> list[FeaturedDestinationResponse]:
        for ri in data.items:
            item = await self.repo.get_by_id(uuid.UUID(ri.id))
            if item:
                item.display_order = ri.display_order
        await self.repo.session.flush()
        return await self.get_all()


class ExperienceService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = ExperienceRepository(session)

    async def get_all(self) -> list[LuxuryExperienceResponse]:
        items = await self.repo.get_all_ordered()
        return [LuxuryExperienceResponse.model_validate(i) for i in items]

    async def get_active(self) -> list[LuxuryExperienceResponse]:
        items = await self.repo.get_active()
        return [LuxuryExperienceResponse.model_validate(i) for i in items]

    async def create(self, data: LuxuryExperienceCreate) -> LuxuryExperienceResponse:
        if await self.repo.slug_exists(data.slug):
            raise HTTPException(status_code=409, detail=f"Slug '{data.slug}' already exists")
        payload = data.model_dump()
        await validate_media_ids(self.repo.session, media_fields_from_payload(payload))
        item = await self.repo.create(**payload)
        return LuxuryExperienceResponse.model_validate(item)

    async def update(self, item_id: uuid.UUID, data: LuxuryExperienceUpdate) -> LuxuryExperienceResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Experience not found")
        if data.slug and data.slug != item.slug and await self.repo.slug_exists(data.slug, exclude_id=item_id):
            raise HTTPException(status_code=409, detail=f"Slug '{data.slug}' already exists")
        update_data = data.model_dump(exclude_unset=True)
        await validate_media_ids(self.repo.session, media_fields_from_payload(update_data))
        if update_data:
            item = await self.repo.update(item, **update_data)
        return LuxuryExperienceResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Experience not found")
        await self.repo.delete(item)

    async def reorder(self, data: ReorderRequest) -> list[LuxuryExperienceResponse]:
        for ri in data.items:
            item = await self.repo.get_by_id(uuid.UUID(ri.id))
            if item:
                item.display_order = ri.display_order
        await self.repo.session.flush()
        return await self.get_all()


class StatisticService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = StatisticRepository(session)

    async def get_all(self) -> list[StatisticResponse]:
        items = await self.repo.get_all_ordered()
        return [StatisticResponse.model_validate(i) for i in items]

    async def get_active(self) -> list[StatisticResponse]:
        items = await self.repo.get_active()
        return [StatisticResponse.model_validate(i) for i in items]

    async def create(self, data: StatisticCreate) -> StatisticResponse:
        payload = data.model_dump()
        await validate_media_ids(self.repo.session, media_fields_from_payload(payload))
        item = await self.repo.create(**payload)
        return StatisticResponse.model_validate(item)

    async def update(self, item_id: uuid.UUID, data: StatisticUpdate) -> StatisticResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Statistic not found")
        update_data = data.model_dump(exclude_unset=True)
        await validate_media_ids(self.repo.session, media_fields_from_payload(update_data))
        if update_data:
            item = await self.repo.update(item, **update_data)
        return StatisticResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Statistic not found")
        await self.repo.delete(item)

    async def reorder(self, data: ReorderRequest) -> list[StatisticResponse]:
        for ri in data.items:
            item = await self.repo.get_by_id(uuid.UUID(ri.id))
            if item:
                item.display_order = ri.display_order
        await self.repo.session.flush()
        return await self.get_all()


class WhyChooseService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = WhyChooseRepository(session)

    async def get_all(self) -> list[WhyChooseUsResponse]:
        items = await self.repo.get_all_ordered()
        return [WhyChooseUsResponse.model_validate(i) for i in items]

    async def get_active(self) -> list[WhyChooseUsResponse]:
        items = await self.repo.get_active()
        return [WhyChooseUsResponse.model_validate(i) for i in items]

    async def create(self, data: WhyChooseUsCreate) -> WhyChooseUsResponse:
        payload = data.model_dump()
        await validate_media_ids(self.repo.session, media_fields_from_payload(payload))
        item = await self.repo.create(**payload)
        return WhyChooseUsResponse.model_validate(item)

    async def update(self, item_id: uuid.UUID, data: WhyChooseUsUpdate) -> WhyChooseUsResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Item not found")
        update_data = data.model_dump(exclude_unset=True)
        await validate_media_ids(self.repo.session, media_fields_from_payload(update_data))
        if update_data:
            item = await self.repo.update(item, **update_data)
        return WhyChooseUsResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Item not found")
        await self.repo.delete(item)

    async def reorder(self, data: ReorderRequest) -> list[WhyChooseUsResponse]:
        for ri in data.items:
            item = await self.repo.get_by_id(uuid.UUID(ri.id))
            if item:
                item.display_order = ri.display_order
        await self.repo.session.flush()
        return await self.get_all()


class HomepageService:
    """Aggregates all homepage sections for the public endpoint."""

    def __init__(self, session: AsyncSession) -> None:
        self.hero_service = HeroService(session)
        self.about_section_service = HomeAboutSectionService(session)
        self.collection_service = CollectionService(session)
        self.destination_service = DestinationService(session)
        self.experience_service = ExperienceService(session)
        self.statistic_service = StatisticService(session)
        self.why_choose_service = WhyChooseService(session)
        self.cta_service = CTAService(session)

    async def get_homepage(self) -> HomepageResponse:
        hero = await self.hero_service.get()
        about_section = await self.about_section_service.get_active()
        collections = await self.collection_service.get_active()
        destinations = await self.destination_service.get_active()
        experiences = await self.experience_service.get_active()
        statistics = await self.statistic_service.get_active()
        why_choose = await self.why_choose_service.get_active()
        cta = await self.cta_service.get()
        if cta and not cta.is_active:
            cta = None

        return HomepageResponse(
            hero=hero,
            about_section=about_section,
            collections=collections,
            destinations=destinations,
            experiences=experiences,
            statistics=statistics,
            why_choose_us=why_choose,
            cta=cta,
        )
