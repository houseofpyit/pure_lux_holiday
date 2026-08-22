"""Pydantic schemas for Gallery Management module."""

from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.base import UUIDAsStrMixin
from app.schemas.media import MediaEmbed

class GalleryCategoryCreate(BaseModel):
    name: str = Field(..., min_length=1)
    slug: str = Field(..., min_length=1)
    description: Optional[str] = Field(None)
    icon: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)

class GalleryCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None)
    slug: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    icon: Optional[str] = Field(None)
    display_order: Optional[int] = Field(None)
    is_active: Optional[bool] = Field(None)

class GalleryCategoryResponse(UUIDAsStrMixin):
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

class GalleryAlbumCreate(BaseModel):
    category_id: Optional[str] = Field(None)
    title: str = Field(..., min_length=1)
    slug: str = Field(..., min_length=1)
    description: Optional[str] = Field(None)
    cover_media_id: Optional[str] = Field(None)
    country: Optional[str] = Field(None)
    city: Optional[str] = Field(None)
    featured: bool = Field(False)
    homepage_featured: bool = Field(False)
    display_order: int = Field(0)
    is_active: bool = Field(True)

class GalleryAlbumUpdate(BaseModel):
    category_id: Optional[str] = Field(None)
    title: Optional[str] = Field(None)
    slug: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    cover_media_id: Optional[str] = Field(None)
    country: Optional[str] = Field(None)
    city: Optional[str] = Field(None)
    featured: Optional[bool] = Field(None)
    homepage_featured: Optional[bool] = Field(None)
    display_order: Optional[int] = Field(None)
    is_active: Optional[bool] = Field(None)

class GalleryAlbumResponse(UUIDAsStrMixin):
    id: str = Field(...)
    category_id: Optional[str] = Field(None)
    title: str = Field(...)
    slug: str = Field(...)
    description: Optional[str] = Field(None)
    cover_media_id: Optional[str] = Field(None)
    cover: Optional[MediaEmbed] = Field(None)
    country: Optional[str] = Field(None)
    city: Optional[str] = Field(None)
    featured: bool = Field(False)
    homepage_featured: bool = Field(False)
    display_order: int = Field(0)
    is_active: bool = Field(True)
    category: Optional[GalleryCategoryResponse] = Field(None)
    created_at: datetime = Field(...)
    updated_at: datetime = Field(...)
    model_config = {"from_attributes": True}

class GalleryItemCreate(BaseModel):
    media_id: str = Field(..., description="Media UUID")
    title: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    media_type: str = Field("image")
    display_order: int = Field(0)
    is_featured: bool = Field(False)

class GalleryItemUpdate(BaseModel):
    media_id: Optional[str] = Field(None)
    title: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    media_type: Optional[str] = Field(None)
    display_order: Optional[int] = Field(None)
    is_featured: Optional[bool] = Field(None)

class GalleryItemResponse(UUIDAsStrMixin):
    id: str = Field(...)
    album_id: str = Field(...)
    media_id: Optional[str] = Field(None)
    media: Optional[MediaEmbed] = Field(None)
    title: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    media_type: str = Field("image")
    display_order: int = Field(0)
    is_featured: bool = Field(False)
    model_config = {"from_attributes": True}

class GalleryAlbumDetailResponse(UUIDAsStrMixin):
    id: str = Field(...)
    category_id: Optional[str] = Field(None)
    title: str = Field(...)
    slug: str = Field(...)
    description: Optional[str] = Field(None)
    cover_media_id: Optional[str] = Field(None)
    cover: Optional[MediaEmbed] = Field(None)
    country: Optional[str] = Field(None)
    city: Optional[str] = Field(None)
    featured: bool = Field(False)
    homepage_featured: bool = Field(False)
    display_order: int = Field(0)
    is_active: bool = Field(True)
    category: Optional[GalleryCategoryResponse] = Field(None)
    items: list[GalleryItemResponse] = Field(default_factory=list)
    created_at: datetime = Field(...)
    updated_at: datetime = Field(...)
    model_config = {"from_attributes": True}

class PublicGalleryItemResponse(UUIDAsStrMixin):
    id: str = Field(...)
    album_id: str = Field(...)
    title: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    media: Optional[MediaEmbed] = Field(None)
    media_type: str = Field("image")
    is_featured: bool = Field(False)
    display_order: int = Field(0)
    album_slug: str = Field(...)
    album_title: str = Field(...)
    category_slug: Optional[str] = Field(None)
    category_name: Optional[str] = Field(None)
    model_config = {"from_attributes": True}

class PublicGalleryResponse(UUIDAsStrMixin):
    featured_albums: list[GalleryAlbumResponse] = Field(default_factory=list)
    homepage_albums: list[GalleryAlbumResponse] = Field(default_factory=list)
    latest_albums: list[GalleryAlbumResponse] = Field(default_factory=list)
    albums: list[GalleryAlbumResponse] = Field(default_factory=list)
    categories: list[GalleryCategoryResponse] = Field(default_factory=list)
    items: list[PublicGalleryItemResponse] = Field(default_factory=list)

class ReorderItem(BaseModel):
    id: str = Field(...)
    display_order: int = Field(..., ge=0)

class ReorderRequest(BaseModel):
    items: list[ReorderItem] = Field(...)