"""Pydantic schemas for Luxury Packages CMS."""

from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.base import UUIDAsStrMixin
from app.schemas.media import MediaEmbed

# ─── Package Category ──────────────────────────────────────────
class PackageCategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None)
    icon: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)

class PackageCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None)
    slug: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    icon: Optional[str] = Field(None)
    display_order: Optional[int] = Field(None)
    is_active: Optional[bool] = Field(None)

class PackageCategoryResponse(UUIDAsStrMixin):
    id: str = Field(...)
    name: str = Field(...)
    slug: str = Field(...)
    description: Optional[str] = Field(None)
    icon: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)
    created_at: datetime = Field(...)
    updated_at: datetime = Field(...)
    model_config = {"from_attributes": True}

# ─── Luxury Package ────────────────────────────────────────────
class LuxuryPackageCreate(BaseModel):
    category_id: Optional[str] = Field(None)
    title: str = Field(..., min_length=1)
    slug: str = Field(..., min_length=1)
    short_description: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    country: Optional[str] = Field(None)
    city: Optional[str] = Field(None)
    duration_days: int = Field(1, ge=1)
    duration_nights: int = Field(0, ge=0)
    starting_price: Optional[float] = Field(None, ge=0)
    currency: str = Field("USD")
    featured_image_id: Optional[str] = Field(None)
    banner_image_id: Optional[str] = Field(None)
    video_id: Optional[str] = Field(None)
    is_featured: bool = Field(False)
    is_popular: bool = Field(False)
    is_active: bool = Field(True)
    seo_title: Optional[str] = Field(None)
    seo_description: Optional[str] = Field(None)

class LuxuryPackageUpdate(BaseModel):
    category_id: Optional[str] = Field(None)
    title: Optional[str] = Field(None)
    slug: Optional[str] = Field(None)
    short_description: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    country: Optional[str] = Field(None)
    city: Optional[str] = Field(None)
    duration_days: Optional[int] = Field(None, ge=1)
    duration_nights: Optional[int] = Field(None, ge=0)
    starting_price: Optional[float] = Field(None, ge=0)
    currency: Optional[str] = Field(None)
    featured_image_id: Optional[str] = Field(None)
    banner_image_id: Optional[str] = Field(None)
    video_id: Optional[str] = Field(None)
    is_featured: Optional[bool] = Field(None)
    is_popular: Optional[bool] = Field(None)
    is_active: Optional[bool] = Field(None)
    seo_title: Optional[str] = Field(None)
    seo_description: Optional[str] = Field(None)

class LuxuryPackageListResponse(UUIDAsStrMixin):
    id: str = Field(...)
    title: str = Field(...)
    slug: str = Field(...)
    short_description: Optional[str] = Field(None)
    country: Optional[str] = Field(None)
    city: Optional[str] = Field(None)
    duration_days: int = Field(...)
    duration_nights: int = Field(...)
    starting_price: Optional[float] = Field(None)
    currency: str = Field("USD")
    featured_image_id: Optional[str] = Field(None)
    featured_image: Optional[MediaEmbed] = Field(None)
    is_featured: bool = Field(False)
    is_popular: bool = Field(False)
    is_active: bool = Field(True)
    category: Optional[PackageCategoryResponse] = Field(None)
    created_at: datetime = Field(...)
    model_config = {"from_attributes": True}

class PackageGalleryResponse(UUIDAsStrMixin):
    id: str = Field(...)
    package_id: str = Field(...)
    media_id: Optional[str] = Field(None)
    display_order: int = Field(0)
    media: Optional[MediaEmbed] = Field(None)
    model_config = {"from_attributes": True}

class PackageItineraryResponse(UUIDAsStrMixin):
    id: str = Field(...)
    day_number: int = Field(...)
    title: str = Field(...)
    description: Optional[str] = Field(None)
    hotel: Optional[str] = Field(None)
    meal_plan: Optional[str] = Field(None)
    media_id: Optional[str] = Field(None)
    display_order: int = Field(0)
    model_config = {"from_attributes": True}

class PackageHighlightResponse(UUIDAsStrMixin):
    id: str = Field(...)
    title: str = Field(...)
    icon: Optional[str] = Field(None)
    display_order: int = Field(0)
    model_config = {"from_attributes": True}

class PackageFAQResponse(UUIDAsStrMixin):
    id: str = Field(...)
    question: str = Field(...)
    answer: Optional[str] = Field(None)
    display_order: int = Field(0)
    model_config = {"from_attributes": True}

class PackageInclusionResponse(UUIDAsStrMixin):
    id: str = Field(...)
    title: str = Field(...)
    display_order: int = Field(0)
    model_config = {"from_attributes": True}

class PackageExclusionResponse(UUIDAsStrMixin):
    id: str = Field(...)
    title: str = Field(...)
    display_order: int = Field(0)
    model_config = {"from_attributes": True}

class LuxuryPackageDetailResponse(UUIDAsStrMixin):
    id: str = Field(...)
    category_id: Optional[str] = Field(None)
    title: str = Field(...)
    slug: str = Field(...)
    short_description: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    country: Optional[str] = Field(None)
    city: Optional[str] = Field(None)
    duration_days: int = Field(...)
    duration_nights: int = Field(...)
    starting_price: Optional[float] = Field(None)
    currency: str = Field("USD")
    featured_image_id: Optional[str] = Field(None)
    featured_image: Optional[MediaEmbed] = Field(None)
    banner_image_id: Optional[str] = Field(None)
    video_id: Optional[str] = Field(None)
    is_featured: bool = Field(False)
    is_popular: bool = Field(False)
    is_active: bool = Field(True)
    seo_title: Optional[str] = Field(None)
    seo_description: Optional[str] = Field(None)
    category: Optional[PackageCategoryResponse] = Field(None)
    gallery: list[PackageGalleryResponse] = Field(default_factory=list)
    itinerary: list[PackageItineraryResponse] = Field(default_factory=list)
    highlights: list[PackageHighlightResponse] = Field(default_factory=list)
    faqs: list[PackageFAQResponse] = Field(default_factory=list)
    inclusions: list[PackageInclusionResponse] = Field(default_factory=list)
    exclusions: list[PackageExclusionResponse] = Field(default_factory=list)
    created_at: datetime = Field(...)
    updated_at: datetime = Field(...)
    model_config = {"from_attributes": True}

# ─── Public Endpoints ──────────────────────────────────────────
class PublicPackageListResponse(UUIDAsStrMixin):
    featured: list[LuxuryPackageListResponse] = Field(default_factory=list)
    popular: list[LuxuryPackageListResponse] = Field(default_factory=list)
    latest: list[LuxuryPackageListResponse] = Field(default_factory=list)

class PackageFilterParams(BaseModel):
    country: Optional[str] = Field(None)
    city: Optional[str] = Field(None)
    category_id: Optional[str] = Field(None)
    is_featured: Optional[bool] = Field(None)
    is_popular: Optional[bool] = Field(None)
    min_price: Optional[float] = Field(None, ge=0)
    max_price: Optional[float] = Field(None, ge=0)
    min_duration: Optional[int] = Field(None, ge=1)
    max_duration: Optional[int] = Field(None, ge=1)
    search: Optional[str] = Field(None)

# ─── Child Entity Schemas ──────────────────────────────────────
class ChildEntityCreate(BaseModel):
    title: str = Field(..., min_length=1)
    icon: Optional[str] = Field(None)
    display_order: int = Field(0)

class ChildEntityUpdate(BaseModel):
    title: Optional[str] = Field(None)
    icon: Optional[str] = Field(None)
    display_order: Optional[int] = Field(None)

class GalleryCreate(BaseModel):
    media_id: str = Field(..., description="Media UUID")
    display_order: int = Field(0)

class ItineraryCreate(BaseModel):
    day_number: int = Field(..., ge=1)
    title: str = Field(...)
    description: Optional[str] = Field(None)
    hotel: Optional[str] = Field(None)
    meal_plan: Optional[str] = Field(None)
    media_id: Optional[str] = Field(None)
    display_order: int = Field(0)

class FAQCreate(BaseModel):
    question: str = Field(...)
    answer: Optional[str] = Field(None)
    display_order: int = Field(0)

class ReorderRequest(BaseModel):
    items: list[ReorderItem] = Field(...)

class ReorderItem(BaseModel):
    id: str = Field(...)
    display_order: int = Field(..., ge=0)