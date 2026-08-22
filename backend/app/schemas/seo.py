"""Pydantic schemas for SEO management."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from app.schemas.base import UUIDAsStrMixin
from app.schemas.media import MediaDetailResponse


# ─── SEO Settings ─────────────────────────────────────────────────

class SEOSettingsCreate(BaseModel):
    """SEO settings creation payload."""

    site_name: Optional[str] = Field(None, max_length=255, description="Website name")
    website_url: Optional[str] = Field(None, max_length=1024, description="Website URL")
    default_meta_title: Optional[str] = Field(None, max_length=255, description="Default meta title")
    default_meta_description: Optional[str] = Field(None, description="Default meta description")
    default_keywords: Optional[str] = Field(None, description="Default keywords")
    canonical_url: Optional[str] = Field(None, max_length=1024, description="Canonical URL")
    default_robots: Optional[str] = Field(None, max_length=255, description="Default robots directive")
    organization_name: Optional[str] = Field(None, max_length=255, description="Organization name")
    organization_logo_id: Optional[str] = Field(None, description="Organization logo media UUID")
    default_og_image_id: Optional[str] = Field(None, description="Default OG image media UUID")
    default_twitter_image_id: Optional[str] = Field(None, description="Default Twitter image media UUID")
    twitter_card: Optional[str] = Field(None, max_length=50, description="Twitter card type")
    facebook_app_id: Optional[str] = Field(None, max_length=255, description="Facebook app ID")
    google_site_verification: Optional[str] = Field(None, max_length=255, description="Google site verification code")
    bing_site_verification: Optional[str] = Field(None, max_length=255, description="Bing site verification code")
    pinterest_verification: Optional[str] = Field(None, max_length=255, description="Pinterest verification code")
    theme_color: Optional[str] = Field(None, max_length=7, description="Theme color (hex)")
    schema_json: Optional[str] = Field(None, description="JSON-LD schema markup")


class SEOSettingsUpdate(BaseModel):
    """SEO settings update payload."""

    site_name: Optional[str] = Field(None, max_length=255, description="Website name")
    website_url: Optional[str] = Field(None, max_length=1024, description="Website URL")
    default_meta_title: Optional[str] = Field(None, max_length=255, description="Default meta title")
    default_meta_description: Optional[str] = Field(None, description="Default meta description")
    default_keywords: Optional[str] = Field(None, description="Default keywords")
    canonical_url: Optional[str] = Field(None, max_length=1024, description="Canonical URL")
    default_robots: Optional[str] = Field(None, max_length=255, description="Default robots directive")
    organization_name: Optional[str] = Field(None, max_length=255, description="Organization name")
    organization_logo_id: Optional[str] = Field(None, description="Organization logo media UUID")
    default_og_image_id: Optional[str] = Field(None, description="Default OG image media UUID")
    default_twitter_image_id: Optional[str] = Field(None, description="Default Twitter image media UUID")
    twitter_card: Optional[str] = Field(None, max_length=50, description="Twitter card type")
    facebook_app_id: Optional[str] = Field(None, max_length=255, description="Facebook app ID")
    google_site_verification: Optional[str] = Field(None, max_length=255, description="Google site verification code")
    bing_site_verification: Optional[str] = Field(None, max_length=255, description="Bing site verification code")
    pinterest_verification: Optional[str] = Field(None, max_length=255, description="Pinterest verification code")
    theme_color: Optional[str] = Field(None, max_length=7, description="Theme color (hex)")
    schema_json: Optional[str] = Field(None, description="JSON-LD schema markup")


class SEOSettingsResponse(UUIDAsStrMixin):
    """SEO settings response with embedded media."""

    id: str = Field(..., description="SEO settings UUID")
    site_name: Optional[str] = Field(None, description="Website name")
    website_url: Optional[str] = Field(None, description="Website URL")
    default_meta_title: Optional[str] = Field(None, description="Default meta title")
    default_meta_description: Optional[str] = Field(None, description="Default meta description")
    default_keywords: Optional[str] = Field(None, description="Default keywords")
    canonical_url: Optional[str] = Field(None, description="Canonical URL")
    default_robots: str = Field("index, follow", description="Default robots directive")
    organization_name: Optional[str] = Field(None, description="Organization name")
    organization_logo: Optional[MediaDetailResponse] = Field(None, description="Organization logo")
    default_og_image: Optional[MediaDetailResponse] = Field(None, description="Default OG image")
    default_twitter_image: Optional[MediaDetailResponse] = Field(None, description="Default Twitter image")
    twitter_card: str = Field("summary_large_image", description="Twitter card type")
    facebook_app_id: Optional[str] = Field(None, description="Facebook app ID")
    google_site_verification: Optional[str] = Field(None, description="Google site verification code")
    bing_site_verification: Optional[str] = Field(None, description="Bing site verification code")
    pinterest_verification: Optional[str] = Field(None, description="Pinterest verification code")
    theme_color: Optional[str] = Field(None, description="Theme color (hex)")
    schema_json: Optional[str] = Field(None, description="JSON-LD schema markup")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {"from_attributes": True}


# ─── Page SEO ──────────────────────────────────────────────────────

class PageSEOCreate(BaseModel):
    """Page SEO creation payload."""

    page_key: str = Field(..., max_length=255, description="Unique page identifier")
    meta_title: Optional[str] = Field(None, max_length=255, description="Meta title")
    meta_description: Optional[str] = Field(None, description="Meta description")
    keywords: Optional[str] = Field(None, description="Keywords")
    canonical_url: Optional[str] = Field(None, max_length=1024, description="Canonical URL")
    slug: Optional[str] = Field(None, max_length=1024, description="Page slug")
    og_title: Optional[str] = Field(None, max_length=255, description="Open Graph title")
    og_description: Optional[str] = Field(None, description="Open Graph description")
    og_image_id: Optional[str] = Field(None, description="OG image media UUID")
    twitter_title: Optional[str] = Field(None, max_length=255, description="Twitter title")
    twitter_description: Optional[str] = Field(None, description="Twitter description")
    twitter_image_id: Optional[str] = Field(None, description="Twitter image media UUID")
    robots: Optional[str] = Field(None, max_length=255, description="Robots directive")
    schema_json: Optional[str] = Field(None, description="JSON-LD schema markup")
    priority: Optional[float] = Field(None, ge=0.0, le=1.0, description="Sitemap priority (0.0-1.0)")
    change_frequency: Optional[str] = Field(None, max_length=50, description="Sitemap change frequency")
    include_in_sitemap: Optional[bool] = Field(True, description="Include in sitemap")
    is_active: Optional[bool] = Field(True, description="Active status")


class PageSEOUpdate(BaseModel):
    """Page SEO update payload."""

    meta_title: Optional[str] = Field(None, max_length=255, description="Meta title")
    meta_description: Optional[str] = Field(None, description="Meta description")
    keywords: Optional[str] = Field(None, description="Keywords")
    canonical_url: Optional[str] = Field(None, max_length=1024, description="Canonical URL")
    slug: Optional[str] = Field(None, max_length=1024, description="Page slug")
    og_title: Optional[str] = Field(None, max_length=255, description="Open Graph title")
    og_description: Optional[str] = Field(None, description="Open Graph description")
    og_image_id: Optional[str] = Field(None, description="OG image media UUID")
    twitter_title: Optional[str] = Field(None, max_length=255, description="Twitter title")
    twitter_description: Optional[str] = Field(None, description="Twitter description")
    twitter_image_id: Optional[str] = Field(None, description="Twitter image media UUID")
    robots: Optional[str] = Field(None, max_length=255, description="Robots directive")
    schema_json: Optional[str] = Field(None, description="JSON-LD schema markup")
    priority: Optional[float] = Field(None, ge=0.0, le=1.0, description="Sitemap priority (0.0-1.0)")
    change_frequency: Optional[str] = Field(None, max_length=50, description="Sitemap change frequency")
    include_in_sitemap: Optional[bool] = Field(None, description="Include in sitemap")
    is_active: Optional[bool] = Field(None, description="Active status")


class PageSEOResponse(UUIDAsStrMixin):
    """Page SEO response with embedded media."""

    id: str = Field(..., description="Page SEO UUID")
    page_key: str = Field(..., description="Unique page identifier")
    meta_title: Optional[str] = Field(None, description="Meta title")
    meta_description: Optional[str] = Field(None, description="Meta description")
    keywords: Optional[str] = Field(None, description="Keywords")
    canonical_url: Optional[str] = Field(None, description="Canonical URL")
    slug: Optional[str] = Field(None, description="Page slug")
    og_title: Optional[str] = Field(None, description="Open Graph title")
    og_description: Optional[str] = Field(None, description="Open Graph description")
    og_image: Optional[MediaDetailResponse] = Field(None, description="OG image")
    twitter_title: Optional[str] = Field(None, description="Twitter title")
    twitter_description: Optional[str] = Field(None, description="Twitter description")
    twitter_image: Optional[MediaDetailResponse] = Field(None, description="Twitter image")
    robots: Optional[str] = Field(None, description="Robots directive")
    schema_json: Optional[str] = Field(None, description="JSON-LD schema markup")
    priority: Optional[float] = Field(None, description="Sitemap priority")
    change_frequency: Optional[str] = Field(None, description="Sitemap change frequency")
    include_in_sitemap: bool = Field(True, description="Include in sitemap")
    is_active: bool = Field(True, description="Active status")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {"from_attributes": True}


# ─── Sitemap Settings ──────────────────────────────────────────────

class SitemapSettingsUpdate(BaseModel):
    """Sitemap settings update payload."""

    enabled: Optional[bool] = Field(None, description="Enable sitemap generation")
    include_pages: Optional[bool] = Field(None, description="Include pages in sitemap")
    include_blog: Optional[bool] = Field(None, description="Include blog posts in sitemap")
    include_destinations: Optional[bool] = Field(None, description="Include destinations in sitemap")
    include_experiences: Optional[bool] = Field(None, description="Include experiences in sitemap")
    include_packages: Optional[bool] = Field(None, description="Include packages in sitemap")
    include_gallery: Optional[bool] = Field(None, description="Include gallery in sitemap")
    default_priority: Optional[float] = Field(None, ge=0.0, le=1.0, description="Default priority (0.0-1.0)")
    default_change_frequency: Optional[str] = Field(None, max_length=50, description="Default change frequency")


class SitemapSettingsResponse(UUIDAsStrMixin):
    """Sitemap settings response."""

    id: str = Field(..., description="Sitemap settings UUID")
    enabled: bool = Field(True, description="Enable sitemap generation")
    include_pages: bool = Field(True, description="Include pages in sitemap")
    include_blog: bool = Field(True, description="Include blog posts in sitemap")
    include_destinations: bool = Field(True, description="Include destinations in sitemap")
    include_experiences: bool = Field(True, description="Include experiences in sitemap")
    include_packages: bool = Field(True, description="Include packages in sitemap")
    include_gallery: bool = Field(True, description="Include gallery in sitemap")
    default_priority: float = Field(0.5, description="Default priority")
    default_change_frequency: str = Field("weekly", description="Default change frequency")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {"from_attributes": True}


# ─── Robots Settings ───────────────────────────────────────────────

class RobotsSettingsUpdate(BaseModel):
    """Robots settings update payload."""

    robots_content: str = Field(..., description="Robots.txt content")


class RobotsSettingsResponse(UUIDAsStrMixin):
    """Robots settings response."""

    id: str = Field(..., description="Robots settings UUID")
    robots_content: str = Field(..., description="Robots.txt content")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {"from_attributes": True}


# ─── Redirects ─────────────────────────────────────────────────────

class RedirectCreate(BaseModel):
    """Redirect creation payload."""

    source_path: str = Field(..., max_length=1024, description="Source path")
    destination_path: str = Field(..., max_length=1024, description="Destination path")
    redirect_type: int = Field(301, description="HTTP redirect type (301 or 302)")
    is_active: Optional[bool] = Field(True, description="Active status")

    @field_validator("redirect_type")
    @classmethod
    def validate_redirect_type(cls, v: int) -> int:
        if v not in (301, 302):
            raise ValueError("Redirect type must be 301 or 302")
        return v


class RedirectUpdate(BaseModel):
    """Redirect update payload."""

    source_path: Optional[str] = Field(None, max_length=1024, description="Source path")
    destination_path: Optional[str] = Field(None, max_length=1024, description="Destination path")
    redirect_type: Optional[int] = Field(None, description="HTTP redirect type (301 or 302)")
    is_active: Optional[bool] = Field(None, description="Active status")

    @field_validator("redirect_type")
    @classmethod
    def validate_redirect_type(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v not in (301, 302):
            raise ValueError("Redirect type must be 301 or 302")
        return v


class RedirectResponse(UUIDAsStrMixin):
    """Redirect response."""

    id: str = Field(..., description="Redirect UUID")
    source_path: str = Field(..., description="Source path")
    destination_path: str = Field(..., description="Destination path")
    redirect_type: int = Field(..., description="HTTP redirect type")
    is_active: bool = Field(..., description="Active status")
    hit_count: int = Field(..., description="Number of hits")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {"from_attributes": True}