"""Pydantic schemas for Homepage CMS modules."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.base import UUIDAsStrMixin
from app.schemas.cms import CTASettingsResponse
from app.schemas.media import MediaEmbed


# ─── Hero Section ──────────────────────────────────────────────

class HeroSectionResponse(UUIDAsStrMixin):
    id: str = Field(..., description="Hero UUID")
    title: str = Field(..., description="Hero title")
    subtitle: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    button_text: Optional[str] = Field(None)
    button_url: Optional[str] = Field(None)
    secondary_button_text: Optional[str] = Field(None)
    secondary_button_url: Optional[str] = Field(None)
    background_image_id: Optional[str] = Field(None)
    background_image: Optional[MediaEmbed] = Field(None)
    mobile_background_image_id: Optional[str] = Field(None)
    mobile_background_image: Optional[MediaEmbed] = Field(None)
    video_id: Optional[str] = Field(None)
    overlay_opacity: float = Field(0.5)
    display_order: int = Field(0)
    is_active: bool = Field(True)
    created_at: datetime = Field(...)
    updated_at: datetime = Field(...)
    model_config = {"from_attributes": True}

class HeroSectionUpdate(BaseModel):
    title: Optional[str] = Field(None)
    subtitle: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    button_text: Optional[str] = Field(None)
    button_url: Optional[str] = Field(None)
    secondary_button_text: Optional[str] = Field(None)
    secondary_button_url: Optional[str] = Field(None)
    background_image_id: Optional[str] = Field(None)
    mobile_background_image_id: Optional[str] = Field(None)
    video_id: Optional[str] = Field(None)
    overlay_opacity: Optional[float] = Field(None)
    display_order: Optional[int] = Field(None)
    is_active: Optional[bool] = Field(None)


# ─── Home About Section ────────────────────────────────────────

class HomeAboutSectionResponse(UUIDAsStrMixin):
    id: str = Field(...)
    eyebrow: Optional[str] = Field(None)
    heading: str = Field(...)
    description: Optional[str] = Field(None)
    button_text: Optional[str] = Field(None)
    button_url: Optional[str] = Field(None)
    image_id: Optional[str] = Field(None)
    image: Optional[MediaEmbed] = Field(None)
    image_url: Optional[str] = Field(None)
    image_alt: Optional[str] = Field(None)
    is_active: bool = Field(True)
    created_at: datetime = Field(...)
    updated_at: datetime = Field(...)
    model_config = {"from_attributes": True}

class HomeAboutSectionUpdate(BaseModel):
    eyebrow: Optional[str] = Field(None)
    heading: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    button_text: Optional[str] = Field(None)
    button_url: Optional[str] = Field(None)
    image_id: Optional[str] = Field(None)
    image_alt: Optional[str] = Field(None)
    is_active: Optional[bool] = Field(None)


# ─── Luxury Collection ─────────────────────────────────────────

class LuxuryCollectionCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    short_description: Optional[str] = Field(None)
    image_id: Optional[str] = Field(None)
    button_text: Optional[str] = Field(None)
    button_url: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)

class LuxuryCollectionUpdate(BaseModel):
    title: Optional[str] = Field(None)
    slug: Optional[str] = Field(None)
    short_description: Optional[str] = Field(None)
    image_id: Optional[str] = Field(None)
    button_text: Optional[str] = Field(None)
    button_url: Optional[str] = Field(None)
    display_order: Optional[int] = Field(None)
    is_active: Optional[bool] = Field(None)

class LuxuryCollectionResponse(UUIDAsStrMixin):
    id: str = Field(...)
    title: str = Field(...)
    slug: str = Field(...)
    short_description: Optional[str] = Field(None)
    image_id: Optional[str] = Field(None)
    image: Optional[MediaEmbed] = Field(None)
    button_text: Optional[str] = Field(None)
    button_url: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)
    created_at: datetime = Field(...)
    updated_at: datetime = Field(...)
    model_config = {"from_attributes": True}


# ─── Featured Destination ──────────────────────────────────────

class FeaturedDestinationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    country: Optional[str] = Field(None)
    short_description: Optional[str] = Field(None)
    image_id: Optional[str] = Field(None)
    button_text: Optional[str] = Field(None)
    button_url: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_featured: bool = Field(False)
    is_active: bool = Field(True)

class FeaturedDestinationUpdate(BaseModel):
    name: Optional[str] = Field(None)
    slug: Optional[str] = Field(None)
    country: Optional[str] = Field(None)
    short_description: Optional[str] = Field(None)
    image_id: Optional[str] = Field(None)
    button_text: Optional[str] = Field(None)
    button_url: Optional[str] = Field(None)
    display_order: Optional[int] = Field(None)
    is_featured: Optional[bool] = Field(None)
    is_active: Optional[bool] = Field(None)

class FeaturedDestinationResponse(UUIDAsStrMixin):
    id: str = Field(...)
    name: str = Field(...)
    slug: str = Field(...)
    country: Optional[str] = Field(None)
    short_description: Optional[str] = Field(None)
    image_id: Optional[str] = Field(None)
    image: Optional[MediaEmbed] = Field(None)
    button_text: Optional[str] = Field(None)
    button_url: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_featured: bool = Field(False)
    is_active: bool = Field(True)
    created_at: datetime = Field(...)
    updated_at: datetime = Field(...)
    model_config = {"from_attributes": True}


# ─── Luxury Experience ─────────────────────────────────────────

class LuxuryExperienceCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    short_description: Optional[str] = Field(None)
    icon: Optional[str] = Field(None)
    image_id: Optional[str] = Field(None)
    button_text: Optional[str] = Field(None)
    button_url: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)

class LuxuryExperienceUpdate(BaseModel):
    title: Optional[str] = Field(None)
    slug: Optional[str] = Field(None)
    short_description: Optional[str] = Field(None)
    icon: Optional[str] = Field(None)
    image_id: Optional[str] = Field(None)
    button_text: Optional[str] = Field(None)
    button_url: Optional[str] = Field(None)
    display_order: Optional[int] = Field(None)
    is_active: Optional[bool] = Field(None)

class LuxuryExperienceResponse(UUIDAsStrMixin):
    id: str = Field(...)
    title: str = Field(...)
    slug: str = Field(...)
    short_description: Optional[str] = Field(None)
    icon: Optional[str] = Field(None)
    image_id: Optional[str] = Field(None)
    image: Optional[MediaEmbed] = Field(None)
    button_text: Optional[str] = Field(None)
    button_url: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)
    created_at: datetime = Field(...)
    updated_at: datetime = Field(...)
    model_config = {"from_attributes": True}


# ─── Statistic ─────────────────────────────────────────────────

class StatisticCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    value: str = Field(..., min_length=1, max_length=255)
    suffix: Optional[str] = Field(None)
    icon: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)

class StatisticUpdate(BaseModel):
    title: Optional[str] = Field(None)
    value: Optional[str] = Field(None)
    suffix: Optional[str] = Field(None)
    icon: Optional[str] = Field(None)
    display_order: Optional[int] = Field(None)
    is_active: Optional[bool] = Field(None)

class StatisticResponse(UUIDAsStrMixin):
    id: str = Field(...)
    title: str = Field(...)
    value: str = Field(...)
    suffix: Optional[str] = Field(None)
    icon: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)
    created_at: datetime = Field(...)
    updated_at: datetime = Field(...)
    model_config = {"from_attributes": True}


# ─── Why Choose Us ─────────────────────────────────────────────

class WhyChooseUsCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None)
    icon: Optional[str] = Field(None)
    image_id: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)

class WhyChooseUsUpdate(BaseModel):
    title: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    icon: Optional[str] = Field(None)
    image_id: Optional[str] = Field(None)
    display_order: Optional[int] = Field(None)
    is_active: Optional[bool] = Field(None)

class WhyChooseUsResponse(UUIDAsStrMixin):
    id: str = Field(...)
    title: str = Field(...)
    description: Optional[str] = Field(None)
    icon: Optional[str] = Field(None)
    image_id: Optional[str] = Field(None)
    image: Optional[MediaEmbed] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)
    created_at: datetime = Field(...)
    updated_at: datetime = Field(...)
    model_config = {"from_attributes": True}


# ─── Public Homepage ───────────────────────────────────────────

class HomepageResponse(BaseModel):
    hero: Optional[HeroSectionResponse] = Field(None)
    about_section: Optional[HomeAboutSectionResponse] = Field(None)
    collections: list[LuxuryCollectionResponse] = Field(default_factory=list)
    destinations: list[FeaturedDestinationResponse] = Field(default_factory=list)
    experiences: list[LuxuryExperienceResponse] = Field(default_factory=list)
    statistics: list[StatisticResponse] = Field(default_factory=list)
    why_choose_us: list[WhyChooseUsResponse] = Field(default_factory=list)
    cta: Optional[CTASettingsResponse] = Field(None)


# ─── Reorder ───────────────────────────────────────────────────

class ReorderItem(BaseModel):
    id: str = Field(..., description="Item UUID")
    display_order: int = Field(..., ge=0, description="New display order")

class ReorderRequest(BaseModel):
    items: list[ReorderItem] = Field(..., description="List of items with new order")
