"""Pydantic schemas for Travel Journal / Blog CMS."""

from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.base import UUIDAsStrMixin
from app.schemas.media import MediaEmbed

class BlogCategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)

class BlogCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None)
    slug: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    display_order: Optional[int] = Field(None)
    is_active: Optional[bool] = Field(None)

class BlogCategoryResponse(UUIDAsStrMixin):
    id: str = Field(...)
    name: str = Field(...)
    slug: str = Field(...)
    description: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)
    created_at: datetime = Field(...)
    updated_at: datetime = Field(...)
    model_config = {"from_attributes": True}

class BlogTagCreate(BaseModel):
    name: str = Field(..., min_length=1)
    slug: str = Field(..., min_length=1)

class BlogTagUpdate(BaseModel):
    name: Optional[str] = Field(None)
    slug: Optional[str] = Field(None)

class BlogTagResponse(UUIDAsStrMixin):
    id: str = Field(...)
    name: str = Field(...)
    slug: str = Field(...)
    model_config = {"from_attributes": True}

class ArticleCreate(BaseModel):
    category_id: Optional[str] = Field(None)
    title: str = Field(..., min_length=1)
    slug: str = Field(..., min_length=1)
    excerpt: Optional[str] = Field(None)
    content: Optional[str] = Field(None)
    featured_image_id: Optional[str] = Field(None)
    banner_image_id: Optional[str] = Field(None)
    author_name: Optional[str] = Field(None)
    reading_time: int = Field(5, ge=1)
    status: str = Field("draft")
    is_featured: bool = Field(False)
    homepage_featured: bool = Field(False)
    allow_comments: bool = Field(True)
    seo_title: Optional[str] = Field(None)
    seo_description: Optional[str] = Field(None)
    tag_ids: list[str] = Field(default_factory=list)

class ArticleUpdate(BaseModel):
    category_id: Optional[str] = Field(None)
    title: Optional[str] = Field(None)
    slug: Optional[str] = Field(None)
    excerpt: Optional[str] = Field(None)
    content: Optional[str] = Field(None)
    featured_image_id: Optional[str] = Field(None)
    banner_image_id: Optional[str] = Field(None)
    author_name: Optional[str] = Field(None)
    reading_time: Optional[int] = Field(None, ge=1)
    status: Optional[str] = Field(None)
    is_featured: Optional[bool] = Field(None)
    homepage_featured: Optional[bool] = Field(None)
    allow_comments: Optional[bool] = Field(None)
    seo_title: Optional[str] = Field(None)
    seo_description: Optional[str] = Field(None)
    tag_ids: Optional[list[str]] = Field(None)

class ArticleResponse(UUIDAsStrMixin):
    id: str = Field(...)
    category_id: Optional[str] = Field(None)
    title: str = Field(...)
    slug: str = Field(...)
    excerpt: Optional[str] = Field(None)
    content: Optional[str] = Field(None)
    featured_image_id: Optional[str] = Field(None)
    featured_image: Optional[MediaEmbed] = Field(None)
    banner_image_id: Optional[str] = Field(None)
    author_name: Optional[str] = Field(None)
    reading_time: int = Field(...)
    published_at: Optional[datetime] = Field(None)
    status: str = Field(...)
    is_featured: bool = Field(False)
    homepage_featured: bool = Field(False)
    allow_comments: bool = Field(True)
    views_count: int = Field(0)
    seo_title: Optional[str] = Field(None)
    seo_description: Optional[str] = Field(None)
    category: Optional[BlogCategoryResponse] = Field(None)
    tags: list[BlogTagResponse] = Field(default_factory=list)
    created_at: datetime = Field(...)
    updated_at: datetime = Field(...)
    model_config = {"from_attributes": True}

class ArticleDetailResponse(ArticleResponse):
    related_articles: list[ArticleResponse] = Field(default_factory=list)
    gallery: list[ArticleGalleryResponse] = Field(default_factory=list)

class ArticleGalleryResponse(UUIDAsStrMixin):
    id: str = Field(...)
    article_id: str = Field(...)
    media_id: Optional[str] = Field(None)
    display_order: int = Field(0)
    model_config = {"from_attributes": True}

class ArticleGalleryCreate(BaseModel):
    media_id: str = Field(..., description="Media UUID")
    display_order: int = Field(0)

class RelatedArticleCreate(BaseModel):
    related_article_id: str = Field(..., description="Related article UUID")
    display_order: int = Field(0)

class PublicBlogResponse(UUIDAsStrMixin):
    homepage_featured: list[ArticleResponse] = Field(default_factory=list)
    featured: list[ArticleResponse] = Field(default_factory=list)
    latest: list[ArticleResponse] = Field(default_factory=list)
    popular: list[ArticleResponse] = Field(default_factory=list)

class ReorderItem(BaseModel):
    id: str = Field(...)
    display_order: int = Field(..., ge=0)

class ReorderRequest(BaseModel):
    items: list[ReorderItem] = Field(...)