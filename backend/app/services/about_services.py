"""About services for About & Company CMS."""

from __future__ import annotations
import uuid
from typing import Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.about_repositories import (
    AboutRepository, AwardRepository, CoreValueRepository, FAQRepository,
    LeadershipRepository, PartnerRepository, StatisticRepository, TimelineRepository,
)
from app.utils.media.media_validation import validate_media_ids
from app.schemas.about import (
    AboutPageResponse, AboutPageUpdate, AwardCreate, AwardResponse, AwardUpdate,
    CompanyFAQCreate, CompanyFAQResponse, CompanyFAQUpdate,
    CompanyStatisticCreate, CompanyStatisticResponse, CompanyStatisticUpdate,
    CoreValueCreate, CoreValueResponse, CoreValueUpdate,
    LeadershipCreate, LeadershipResponse, LeadershipUpdate,
    PartnerCreate, PartnerResponse, PartnerUpdate,
    PublicAboutResponse, ReorderRequest,
    TimelineCreate, TimelineResponse, TimelineUpdate,
)


class AboutService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = AboutRepository(session)
    async def get(self) -> AboutPageResponse:
        page = await self.repo.get_singleton()
        return AboutPageResponse.model_validate(page)
    async def update(self, data: AboutPageUpdate) -> AboutPageResponse:
        page = await self.repo.get_singleton()
        kwargs = data.model_dump(exclude_unset=True)
        await validate_media_ids(self.repo.session, {
            "hero_image_id": kwargs.get("hero_image_id"),
        })
        if kwargs.get("hero_image_id"):
            kwargs["hero_image_id"] = uuid.UUID(kwargs["hero_image_id"])
        if kwargs:
            for k, v in kwargs.items():
                setattr(page, k, v)
            await self.repo.session.flush()
            await self.repo.session.refresh(page)
        return AboutPageResponse.model_validate(page)


class BaseListService:
    """Mixin-like base for list-based CRUD services."""
    repo_cls = None
    response_cls = None
    create_cls = None
    update_cls = None

    def __init__(self, session: AsyncSession) -> None:
        self.repo = self.repo_cls(session)

    async def get_all(self) -> list:
        items = await self.repo.get_all(order_by="display_order")
        return [self.response_cls.model_validate(i) for i in items]

    async def get_active(self) -> list:
        items = await self.repo.get_active()
        return [self.response_cls.model_validate(i) for i in items]

    async def create(self, data) -> any:
        kwargs = data.model_dump()
        await validate_media_ids(self.repo.session, {
            field: kwargs.get(field)
            for field in ["image_id", "logo_id", "profile_image_id"]
            if field in kwargs
        })
        for fk in ["image_id", "logo_id", "profile_image_id"]:
            if kwargs.get(fk):
                kwargs[fk] = uuid.UUID(kwargs[fk])
        item = await self.repo.create(**kwargs)
        return self.response_cls.model_validate(item)

    async def update(self, item_id: uuid.UUID, data) -> any:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Item not found")
        kwargs = data.model_dump(exclude_unset=True)
        await validate_media_ids(self.repo.session, {
            field: kwargs.get(field)
            for field in ["image_id", "logo_id", "profile_image_id"]
            if field in kwargs
        })
        for fk in ["image_id", "logo_id", "profile_image_id"]:
            if kwargs.get(fk):
                kwargs[fk] = uuid.UUID(kwargs[fk])
        if kwargs:
            item = await self.repo.update(item, **kwargs)
        return self.response_cls.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Item not found")
        await self.repo.delete(item)

    async def reorder(self, data: ReorderRequest) -> list:
        for ri in data.items:
            item = await self.repo.get_by_id(uuid.UUID(ri.id))
            if item:
                item.display_order = ri.display_order
        await self.repo.session.flush()
        return await self.get_all()


class CoreValueService(BaseListService):
    repo_cls = CoreValueRepository
    response_cls = CoreValueResponse
    create_cls = CoreValueCreate
    update_cls = CoreValueUpdate

class LeadershipService(BaseListService):
    repo_cls = LeadershipRepository
    response_cls = LeadershipResponse
    create_cls = LeadershipCreate
    update_cls = LeadershipUpdate

class TimelineService(BaseListService):
    repo_cls = TimelineRepository
    response_cls = TimelineResponse
    create_cls = TimelineCreate
    update_cls = TimelineUpdate

class AwardService(BaseListService):
    repo_cls = AwardRepository
    response_cls = AwardResponse
    create_cls = AwardCreate
    update_cls = AwardUpdate

class PartnerService(BaseListService):
    repo_cls = PartnerRepository
    response_cls = PartnerResponse
    create_cls = PartnerCreate
    update_cls = PartnerUpdate

class StatisticService(BaseListService):
    repo_cls = StatisticRepository
    response_cls = CompanyStatisticResponse
    create_cls = CompanyStatisticCreate
    update_cls = CompanyStatisticUpdate

class FAQService(BaseListService):
    repo_cls = FAQRepository
    response_cls = CompanyFAQResponse
    create_cls = CompanyFAQCreate
    update_cls = CompanyFAQUpdate


class PublicAboutService:
    def __init__(self, session: AsyncSession) -> None:
        self.about = AboutService(session)
        self.core_values = CoreValueService(session)
        self.leadership = LeadershipService(session)
        self.timeline = TimelineService(session)
        self.awards = AwardService(session)
        self.partners = PartnerService(session)
        self.statistics = StatisticService(session)
        self.faqs = FAQService(session)

    async def get_public(self) -> PublicAboutResponse:
        return PublicAboutResponse(
            about=await self.about.get(),
            core_values=await self.core_values.get_active(),
            leadership=await self.leadership.get_active(),
            timeline=await self.timeline.get_all(),
            awards=await self.awards.get_active(),
            partners=await self.partners.get_active(),
            statistics=await self.statistics.get_active(),
            faqs=await self.faqs.get_active(),
        )
