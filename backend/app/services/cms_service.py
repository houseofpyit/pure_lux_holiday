"""CMS services for global configuration management."""

from __future__ import annotations

import uuid
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions.cms_exceptions import (
    SlugAlreadyExistsException,
)
from app.models.cms import (
    CTASettings,
    ContactPageCMS,
    ContactSettings,
    FooterLink,
    FooterSection,
    Navigation,
    SiteSettings,
)
from app.repositories.cms_repositories import (
    CTARepository,
    ContactPageCMSRepository,
    ContactRepository,
    FooterRepository,
    NavigationRepository,
    SiteSettingsRepository,
)
from app.utils.media.media_validation import media_fields_from_payload, validate_media_ids
from app.schemas.cms import (
    CTASettingsResponse,
    CTASettingsUpdate,
    ContactPageCMSResponse,
    ContactPageCMSUpdate,
    ContactSettingsResponse,
    ContactSettingsUpdate,
    PublicContactResponse,
    FooterSectionCreate,
    FooterSectionResponse,
    FooterSectionUpdate,
    NavigationCreate,
    NavigationResponse,
    NavigationReorder,
    NavigationUpdate,
    ReorderItem,
    SiteSettingsResponse,
    SiteSettingsUpdate,
)


class SiteSettingsService:
    """Service for SiteSettings singleton management."""

    def __init__(self, session: AsyncSession) -> None:
        self.repo = SiteSettingsRepository(session)

    async def get(self) -> SiteSettingsResponse:
        settings = await self.repo.get_singleton()
        return SiteSettingsResponse.model_validate(settings)

    async def update(self, data: SiteSettingsUpdate) -> SiteSettingsResponse:
        settings = await self.repo.get_singleton()
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return SiteSettingsResponse.model_validate(settings)
        await validate_media_ids(self.repo.session, media_fields_from_payload(update_data))
        for key, value in update_data.items():
            setattr(settings, key, value)
        await self.repo.session.flush()
        await self.repo.session.refresh(settings)
        return SiteSettingsResponse.model_validate(settings)


class NavigationService:
    """Service for Navigation CRUD and reordering."""

    def __init__(self, session: AsyncSession) -> None:
        self.repo = NavigationRepository(session)

    async def get_all(self) -> list[NavigationResponse]:
        items = await self.repo.get_all(order_by="order")
        return [NavigationResponse.model_validate(item) for item in items]

    async def get_active(self) -> list[NavigationResponse]:
        items = await self.repo.get_active_menu()
        return [NavigationResponse.model_validate(item) for item in items]

    async def get_by_id(self, nav_id: uuid.UUID) -> NavigationResponse:
        item = await self.repo.get_by_id(nav_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Navigation item not found")
        return NavigationResponse.model_validate(item)

    async def create(self, data: NavigationCreate) -> NavigationResponse:
        if await self.repo.slug_exists(data.slug):
            raise SlugAlreadyExistsException(data.slug)

        if data.parent_id:
            parent = await self.repo.get_by_id(uuid.UUID(data.parent_id))
            if parent is None:
                raise HTTPException(status_code=404, detail="Parent navigation item not found")

        item = await self.repo.create(**data.model_dump())
        return NavigationResponse.model_validate(item)

    async def update(self, nav_id: uuid.UUID, data: NavigationUpdate) -> NavigationResponse:
        item = await self.repo.get_by_id(nav_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Navigation item not found")

        if data.slug and data.slug != item.slug:
            if await self.repo.slug_exists(data.slug, exclude_id=nav_id):
                raise SlugAlreadyExistsException(data.slug)

        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return NavigationResponse.model_validate(item)

        item = await self.repo.update(item, **update_data)
        return NavigationResponse.model_validate(item)

    async def delete(self, nav_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(nav_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Navigation item not found")
        await self.repo.delete(item)

    async def reorder(self, data: NavigationReorder) -> list[NavigationResponse]:
        for reorder_item in data.items:
            item = await self.repo.get_by_id(uuid.UUID(reorder_item.id))
            if item:
                item.order = reorder_item.order
                if reorder_item.parent_id:
                    item.parent_id = uuid.UUID(reorder_item.parent_id)
                else:
                    item.parent_id = None
        await self.repo.session.flush()
        return await self.get_all()


class FooterService:
    """Service for FooterSection and FooterLink management."""

    def __init__(self, session: AsyncSession) -> None:
        self.repo = FooterRepository(session)

    async def get_all(self) -> list[FooterSectionResponse]:
        stmt = select(FooterSection).order_by(FooterSection.order)
        result = await self.repo.session.execute(stmt)
        sections = list(result.scalars().unique().all())
        return [FooterSectionResponse.model_validate(s) for s in sections]

    async def get_by_id(self, section_id: uuid.UUID) -> FooterSectionResponse:
        section = await self.repo.get_section_with_links(section_id)
        if section is None:
            raise HTTPException(status_code=404, detail="Footer section not found")
        return FooterSectionResponse.model_validate(section)

    async def create(self, data: FooterSectionCreate) -> FooterSectionResponse:
        links_data = data.links
        section = FooterSection(
            title=data.title,
            order=data.order,
            is_active=data.is_active,
        )
        self.repo.session.add(section)
        await self.repo.session.flush()

        for link_data in links_data:
            link = FooterLink(
                footer_section_id=section.id,
                title=link_data.title,
                url=link_data.url,
                target=link_data.target,
                order=link_data.order,
            )
            self.repo.session.add(link)

        await self.repo.session.flush()
        await self.repo.session.refresh(section)
        return FooterSectionResponse.model_validate(section)

    async def update(self, section_id: uuid.UUID, data: FooterSectionUpdate) -> FooterSectionResponse:
        section = await self.repo.get_section_with_links(section_id)
        if section is None:
            raise HTTPException(status_code=404, detail="Footer section not found")

        update_data = data.model_dump(exclude_unset=True)
        if update_data:
            section = await self.repo.update(section, **update_data)
        return FooterSectionResponse.model_validate(section)

    async def delete(self, section_id: uuid.UUID) -> None:
        section = await self.repo.get_section_with_links(section_id)
        if section is None:
            raise HTTPException(status_code=404, detail="Footer section not found")
        await self.repo.delete(section)


class ContactService:
    """Service for ContactSettings singleton management."""

    def __init__(self, session: AsyncSession) -> None:
        self.repo = ContactRepository(session)

    async def get(self) -> ContactSettingsResponse:
        settings = await self.repo.get_singleton()
        return ContactSettingsResponse.model_validate(settings)

    async def update(self, data: ContactSettingsUpdate) -> ContactSettingsResponse:
        settings = await self.repo.get_singleton()
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return ContactSettingsResponse.model_validate(settings)
        for key, value in update_data.items():
            setattr(settings, key, value)
        await self.repo.session.flush()
        await self.repo.session.refresh(settings)
        return ContactSettingsResponse.model_validate(settings)


class ContactPageCMSService:
    """Service for ContactPageCMS singleton management."""

    def __init__(self, session: AsyncSession) -> None:
        self.repo = ContactPageCMSRepository(session)

    async def get(self) -> ContactPageCMSResponse:
        settings = await self.repo.get_singleton()
        return ContactPageCMSResponse.model_validate(settings)

    async def update(self, data: ContactPageCMSUpdate) -> ContactPageCMSResponse:
        settings = await self.repo.get_singleton()
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return ContactPageCMSResponse.model_validate(settings)
        await validate_media_ids(self.repo.session, media_fields_from_payload(update_data))
        for key, value in update_data.items():
            setattr(settings, key, value)
        await self.repo.session.flush()
        await self.repo.session.refresh(settings)
        return ContactPageCMSResponse.model_validate(settings)


class PublicContactService:
    """Service for public contact page aggregate."""

    def __init__(self, session: AsyncSession) -> None:
        self.page_repo = ContactPageCMSRepository(session)
        self.contact_repo = ContactRepository(session)

    async def get_public(self) -> PublicContactResponse:
        page_model = await self.page_repo.get_singleton()
        settings_model = await self.contact_repo.get_singleton()
        page = ContactPageCMSResponse.model_validate(page_model)
        settings = ContactSettingsResponse.model_validate(settings_model)
        cta = None
        if page_model.cta_settings is not None:
            cta = CTASettingsResponse.model_validate(page_model.cta_settings)
        return PublicContactResponse(page=page, settings=settings, cta=cta)


class CTAService:
    """Service for CTASettings singleton management."""

    def __init__(self, session: AsyncSession) -> None:
        self.repo = CTARepository(session)

    async def get(self) -> CTASettingsResponse:
        settings = await self.repo.get_singleton()
        return CTASettingsResponse.model_validate(settings)

    async def update(self, data: CTASettingsUpdate) -> CTASettingsResponse:
        settings = await self.repo.get_singleton()
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return CTASettingsResponse.model_validate(settings)
        await validate_media_ids(self.repo.session, media_fields_from_payload(update_data))
        for key, value in update_data.items():
            setattr(settings, key, value)
        await self.repo.session.flush()
        await self.repo.session.refresh(settings)
        return CTASettingsResponse.model_validate(settings)
