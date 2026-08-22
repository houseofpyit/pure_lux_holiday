"""CRM endpoints — Contact Inquiries, Journey Requests, Newsletter Subscribers."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.dependencies.auth_dependencies import get_current_active_user, require_admin, require_editor
from app.schemas.crm import (
    ContactInquiryCreate, ContactInquiryResponse, ContactInquiryUpdate,
    JourneyRequestCreate, JourneyRequestResponse, JourneyRequestUpdate,
    NewsletterSubscriberCreate, NewsletterSubscriberResponse, NewsletterSubscriberUpdate,
)
from app.services.crm_service import (
    ContactInquiryService, JourneyRequestService, NewsletterSubscriberService,
)

# ─── Contact Inquiries ───────────────────────────────────────────────────────

inquiry_router = APIRouter(prefix="/crm/inquiries", tags=["CRM - Contact Inquiries"])


@inquiry_router.get("", response_model=list[ContactInquiryResponse])
async def list_inquiries(
    session: AsyncSession = Depends(get_db_session),
    _user=Depends(get_current_active_user),
) -> list[ContactInquiryResponse]:
    return await ContactInquiryService(session).get_all()


@inquiry_router.get("/{item_id}", response_model=ContactInquiryResponse)
async def get_inquiry(
    item_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    _user=Depends(get_current_active_user),
) -> ContactInquiryResponse:
    return await ContactInquiryService(session).get_by_id(item_id)


@inquiry_router.post("", response_model=ContactInquiryResponse, status_code=status.HTTP_201_CREATED)
async def create_inquiry(
    data: ContactInquiryCreate,
    session: AsyncSession = Depends(get_db_session),
) -> ContactInquiryResponse:
    """Public — called by the website contact form."""
    return await ContactInquiryService(session).create(data)


@inquiry_router.patch("/{item_id}", response_model=ContactInquiryResponse)
async def update_inquiry(
    item_id: uuid.UUID,
    data: ContactInquiryUpdate,
    session: AsyncSession = Depends(get_db_session),
    _user=Depends(require_editor),
) -> ContactInquiryResponse:
    return await ContactInquiryService(session).update(item_id, data)


@inquiry_router.delete("/{item_id}", status_code=status.HTTP_200_OK)
async def delete_inquiry(
    item_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    _user=Depends(require_admin),
) -> dict:
    await ContactInquiryService(session).delete(item_id)
    return {"message": "Inquiry deleted"}


# ─── Journey Requests ────────────────────────────────────────────────────────

journey_router = APIRouter(prefix="/crm/journey-requests", tags=["CRM - Journey Requests"])


@journey_router.get("", response_model=list[JourneyRequestResponse])
async def list_journey_requests(
    session: AsyncSession = Depends(get_db_session),
    _user=Depends(get_current_active_user),
) -> list[JourneyRequestResponse]:
    return await JourneyRequestService(session).get_all()


@journey_router.get("/{item_id}", response_model=JourneyRequestResponse)
async def get_journey_request(
    item_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    _user=Depends(get_current_active_user),
) -> JourneyRequestResponse:
    return await JourneyRequestService(session).get_by_id(item_id)


@journey_router.post("", response_model=JourneyRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_journey_request(
    data: JourneyRequestCreate,
    session: AsyncSession = Depends(get_db_session),
) -> JourneyRequestResponse:
    """Public — called by the Plan My Journey form on the website."""
    return await JourneyRequestService(session).create(data)


@journey_router.patch("/{item_id}", response_model=JourneyRequestResponse)
async def update_journey_request(
    item_id: uuid.UUID,
    data: JourneyRequestUpdate,
    session: AsyncSession = Depends(get_db_session),
    _user=Depends(require_editor),
) -> JourneyRequestResponse:
    return await JourneyRequestService(session).update(item_id, data)


@journey_router.delete("/{item_id}", status_code=status.HTTP_200_OK)
async def delete_journey_request(
    item_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    _user=Depends(require_admin),
) -> dict:
    await JourneyRequestService(session).delete(item_id)
    return {"message": "Journey request deleted"}


# ─── Newsletter Subscribers ──────────────────────────────────────────────────

newsletter_router = APIRouter(prefix="/crm/newsletter", tags=["CRM - Newsletter"])


@newsletter_router.get("", response_model=list[NewsletterSubscriberResponse])
async def list_subscribers(
    session: AsyncSession = Depends(get_db_session),
    _user=Depends(get_current_active_user),
) -> list[NewsletterSubscriberResponse]:
    return await NewsletterSubscriberService(session).get_all()


@newsletter_router.get("/{item_id}", response_model=NewsletterSubscriberResponse)
async def get_subscriber(
    item_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    _user=Depends(get_current_active_user),
) -> NewsletterSubscriberResponse:
    return await NewsletterSubscriberService(session).get_by_id(item_id)


@newsletter_router.post("", response_model=NewsletterSubscriberResponse, status_code=status.HTTP_201_CREATED)
async def subscribe(
    data: NewsletterSubscriberCreate,
    session: AsyncSession = Depends(get_db_session),
) -> NewsletterSubscriberResponse:
    """Public — called by the website newsletter signup form."""
    return await NewsletterSubscriberService(session).create(data)


@newsletter_router.patch("/{item_id}", response_model=NewsletterSubscriberResponse)
async def update_subscriber(
    item_id: uuid.UUID,
    data: NewsletterSubscriberUpdate,
    session: AsyncSession = Depends(get_db_session),
    _user=Depends(require_editor),
) -> NewsletterSubscriberResponse:
    return await NewsletterSubscriberService(session).update(item_id, data)


@newsletter_router.delete("/{item_id}", status_code=status.HTTP_200_OK)
async def delete_subscriber(
    item_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    _user=Depends(require_admin),
) -> dict:
    await NewsletterSubscriberService(session).delete(item_id)
    return {"message": "Subscriber deleted"}
