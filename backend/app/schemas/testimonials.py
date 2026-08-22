"""Pydantic schemas for Testimonials & Reviews module."""

from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.base import UUIDAsStrMixin
from app.schemas.media import MediaEmbed

class TestimonialCategoryCreate(BaseModel):
    name: str = Field(..., min_length=1)
    slug: str = Field(..., min_length=1)
    description: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)

class TestimonialCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None)
    slug: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    display_order: Optional[int] = Field(None)
    is_active: Optional[bool] = Field(None)

class TestimonialCategoryResponse(UUIDAsStrMixin):
    id: str = Field(...)
    name: str = Field(...)
    slug: str = Field(...)
    description: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)
    created_at: datetime = Field(...)
    updated_at: datetime = Field(...)
    model_config = {"from_attributes": True}

class TestimonialCreate(BaseModel):
    category_id: Optional[str] = Field(None)
    package_id: Optional[str] = Field(None)
    destination_slug: Optional[str] = Field(None)
    customer_name: str = Field(..., min_length=1)
    customer_location: Optional[str] = Field(None)
    customer_designation: Optional[str] = Field(None)
    rating: int = Field(5, ge=1, le=5)
    title: Optional[str] = Field(None)
    review: Optional[str] = Field(None)
    profile_image_id: Optional[str] = Field(None)
    customer_photo_id: Optional[str] = Field(None)
    background_image_id: Optional[str] = Field(None)
    video_id: Optional[str] = Field(None)
    video_thumbnail_id: Optional[str] = Field(None)
    travel_date: Optional[str] = Field(None)
    is_featured: bool = Field(False)
    homepage_featured: bool = Field(False)
    is_verified: bool = Field(True)
    display_order: int = Field(0)
    is_active: bool = Field(True)

class TestimonialUpdate(BaseModel):
    category_id: Optional[str] = Field(None)
    package_id: Optional[str] = Field(None)
    destination_slug: Optional[str] = Field(None)
    customer_name: Optional[str] = Field(None)
    customer_location: Optional[str] = Field(None)
    customer_designation: Optional[str] = Field(None)
    rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = Field(None)
    review: Optional[str] = Field(None)
    profile_image_id: Optional[str] = Field(None)
    customer_photo_id: Optional[str] = Field(None)
    background_image_id: Optional[str] = Field(None)
    video_id: Optional[str] = Field(None)
    video_thumbnail_id: Optional[str] = Field(None)
    travel_date: Optional[str] = Field(None)
    is_featured: Optional[bool] = Field(None)
    homepage_featured: Optional[bool] = Field(None)
    is_verified: Optional[bool] = Field(None)
    display_order: Optional[int] = Field(None)
    is_active: Optional[bool] = Field(None)

class TestimonialResponse(UUIDAsStrMixin):
    id: str = Field(...)
    category_id: Optional[str] = Field(None)
    package_id: Optional[str] = Field(None)
    destination_slug: Optional[str] = Field(None)
    customer_name: str = Field(...)
    customer_location: Optional[str] = Field(None)
    customer_designation: Optional[str] = Field(None)
    rating: int = Field(...)
    title: Optional[str] = Field(None)
    review: Optional[str] = Field(None)
    profile_image_id: Optional[str] = Field(None)
    profile_image: Optional[MediaEmbed] = Field(None)
    customer_photo_id: Optional[str] = Field(None)
    customer_photo: Optional[MediaEmbed] = Field(None)
    background_image_id: Optional[str] = Field(None)
    background_image: Optional[MediaEmbed] = Field(None)
    video_id: Optional[str] = Field(None)
    video: Optional[MediaEmbed] = Field(None)
    video_thumbnail_id: Optional[str] = Field(None)
    video_thumbnail: Optional[MediaEmbed] = Field(None)
    travel_date: Optional[datetime] = Field(None)
    is_featured: bool = Field(False)
    homepage_featured: bool = Field(False)
    is_verified: bool = Field(True)
    display_order: int = Field(0)
    is_active: bool = Field(True)
    category: Optional[TestimonialCategoryResponse] = Field(None)
    created_at: datetime = Field(...)
    updated_at: datetime = Field(...)
    model_config = {"from_attributes": True}

class PublicTestimonialResponse(BaseModel):
    featured: list[TestimonialResponse] = Field(default_factory=list)
    homepage_featured: list[TestimonialResponse] = Field(default_factory=list)
    latest: list[TestimonialResponse] = Field(default_factory=list)

class ReorderItem(BaseModel):
    id: str = Field(...)
    display_order: int = Field(..., ge=0)

class ReorderRequest(BaseModel):
    items: list[ReorderItem] = Field(...)
