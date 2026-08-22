"""Pydantic schemas for the CRM module."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.schemas.base import UUIDAsStrMixin


# ─── Contact Inquiry ─────────────────────────────────────────────────────────

class ContactInquiryResponse(UUIDAsStrMixin):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: Optional[str] = None
    status: str
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    source: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class ContactInquiryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    subject: Optional[str] = Field(None, max_length=500)
    message: Optional[str] = Field(None)
    source: Optional[str] = Field(None, max_length=100)


class ContactInquiryUpdate(BaseModel):
    status: Optional[str] = Field(None, max_length=50)
    assigned_to: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = Field(None)


# ─── Journey Request ─────────────────────────────────────────────────────────

class JourneyRequestResponse(UUIDAsStrMixin):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    destination: Optional[str] = None
    travel_date: Optional[str] = None
    duration: Optional[str] = None
    travelers: Optional[int] = None
    budget: Optional[str] = None
    travel_style: Optional[str] = None
    special_requirements: Optional[str] = None
    message: Optional[str] = None
    status: str
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    source: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class JourneyRequestCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    destination: Optional[str] = Field(None, max_length=255)
    travel_date: Optional[str] = Field(None, max_length=100)
    duration: Optional[str] = Field(None, max_length=100)
    travelers: Optional[int] = Field(None, ge=1)
    budget: Optional[str] = Field(None, max_length=100)
    travel_style: Optional[str] = Field(None, max_length=255)
    special_requirements: Optional[str] = Field(None)
    message: Optional[str] = Field(None)
    source: Optional[str] = Field(None, max_length=100)


class JourneyRequestUpdate(BaseModel):
    status: Optional[str] = Field(None, max_length=50)
    assigned_to: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = Field(None)


# ─── Newsletter Subscriber ────────────────────────────────────────────────────

class NewsletterSubscriberResponse(UUIDAsStrMixin):
    id: str
    email: str
    name: Optional[str] = None
    is_active: bool
    source: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class NewsletterSubscriberCreate(BaseModel):
    email: str = Field(..., max_length=255)
    name: Optional[str] = Field(None, max_length=255)
    source: Optional[str] = Field(None, max_length=100)


class NewsletterSubscriberUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = Field(None)
