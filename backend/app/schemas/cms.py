"""Pydantic schemas for CMS configuration modules."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field
from app.schemas.base import UUIDAsStrMixin
from app.schemas.media import MediaEmbed


# ─── Site Settings ───────────────────────────────────────────────

class SiteSettingsResponse(UUIDAsStrMixin):
    """Site settings response."""

    id: str = Field(..., description="Settings UUID")
    site_name: str = Field(..., description="Website name")
    tagline: Optional[str] = Field(None, description="Site tagline")
    logo_id: Optional[str] = Field(None, description="Logo media UUID")
    favicon_id: Optional[str] = Field(None, description="Favicon media UUID")
    email: Optional[str] = Field(None, description="Contact email")
    phone: Optional[str] = Field(None, description="Contact phone")
    whatsapp: Optional[str] = Field(None, description="WhatsApp number")
    address: Optional[str] = Field(None, description="Business address")
    google_map_url: Optional[str] = Field(None, description="Google Maps URL")
    timezone: str = Field("UTC", description="Site timezone")
    default_language: str = Field("en", description="Default language")
    maintenance_mode: bool = Field(False, description="Maintenance mode flag")
    analytics_enabled: bool = Field(True, description="Analytics flag")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {"from_attributes": True}


class SiteSettingsUpdate(BaseModel):
    """Site settings update payload."""

    site_name: Optional[str] = Field(None, description="Website name")
    tagline: Optional[str] = Field(None, description="Site tagline")
    logo_id: Optional[str] = Field(None, description="Logo media UUID")
    favicon_id: Optional[str] = Field(None, description="Favicon media UUID")
    email: Optional[str] = Field(None, description="Contact email")
    phone: Optional[str] = Field(None, description="Contact phone")
    whatsapp: Optional[str] = Field(None, description="WhatsApp number")
    address: Optional[str] = Field(None, description="Business address")
    google_map_url: Optional[str] = Field(None, description="Google Maps URL")
    timezone: Optional[str] = Field(None, description="Site timezone")
    default_language: Optional[str] = Field(None, description="Default language")
    maintenance_mode: Optional[bool] = Field(None, description="Maintenance mode flag")
    analytics_enabled: Optional[bool] = Field(None, description="Analytics flag")


# ─── Navigation ──────────────────────────────────────────────────

class NavigationCreate(BaseModel):
    """Navigation item creation payload."""

    title: str = Field(..., min_length=1, max_length=255, description="Menu item title")
    slug: str = Field(..., min_length=1, max_length=255, description="Unique slug")
    url: Optional[str] = Field(None, max_length=1024, description="Custom URL")
    parent_id: Optional[str] = Field(None, description="Parent navigation UUID")
    icon: Optional[str] = Field(None, max_length=255, description="Icon class or path")
    order: int = Field(0, ge=0, description="Display order")
    target: str = Field("_self", description="Link target (_self, _blank)")
    is_active: bool = Field(True, description="Active status")


class NavigationUpdate(BaseModel):
    """Navigation item update payload."""

    title: Optional[str] = Field(None, min_length=1, max_length=255, description="Menu item title")
    slug: Optional[str] = Field(None, min_length=1, max_length=255, description="Unique slug")
    url: Optional[str] = Field(None, max_length=1024, description="Custom URL")
    parent_id: Optional[str] = Field(None, description="Parent navigation UUID")
    icon: Optional[str] = Field(None, max_length=255, description="Icon class or path")
    order: Optional[int] = Field(None, ge=0, description="Display order")
    target: Optional[str] = Field(None, description="Link target (_self, _blank)")
    is_active: Optional[bool] = Field(None, description="Active status")


class NavigationResponse(UUIDAsStrMixin):
    """Navigation item response."""

    id: str = Field(..., description="Navigation UUID")
    title: str = Field(..., description="Menu item title")
    slug: str = Field(..., description="Unique slug")
    url: Optional[str] = Field(None, description="Custom URL")
    parent_id: Optional[str] = Field(None, description="Parent navigation UUID")
    icon: Optional[str] = Field(None, description="Icon class or path")
    order: int = Field(0, description="Display order")
    target: str = Field("_self", description="Link target")
    is_active: bool = Field(True, description="Active status")
    children: list["NavigationResponse"] = Field(default_factory=list, description="Child items")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {"from_attributes": True}


class NavigationReorder(BaseModel):
    """Navigation reorder payload."""

    items: list["ReorderItem"] = Field(..., description="List of items with new order")


class ReorderItem(BaseModel):
    """Single reorder item."""

    id: str = Field(..., description="Navigation UUID")
    order: int = Field(..., ge=0, description="New order position")
    parent_id: Optional[str] = Field(None, description="New parent UUID")


# ─── Footer ──────────────────────────────────────────────────────

class FooterLinkCreate(BaseModel):
    """Footer link creation payload."""

    title: str = Field(..., min_length=1, max_length=255, description="Link title")
    url: str = Field(..., max_length=1024, description="Link URL")
    target: str = Field("_self", description="Link target")
    order: int = Field(0, ge=0, description="Display order")


class FooterLinkResponse(UUIDAsStrMixin):
    """Footer link response."""

    id: str = Field(..., description="Link UUID")
    footer_section_id: str = Field(..., description="Parent section UUID")
    title: str = Field(..., description="Link title")
    url: str = Field(..., description="Link URL")
    target: str = Field("_self", description="Link target")
    order: int = Field(0, description="Display order")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {"from_attributes": True}


class FooterSectionCreate(BaseModel):
    """Footer section creation payload."""

    title: str = Field(..., min_length=1, max_length=255, description="Section title")
    order: int = Field(0, ge=0, description="Display order")
    is_active: bool = Field(True, description="Active status")
    links: list[FooterLinkCreate] = Field(default_factory=list, description="Links in this section")


class FooterSectionUpdate(BaseModel):
    """Footer section update payload."""

    title: Optional[str] = Field(None, min_length=1, max_length=255, description="Section title")
    order: Optional[int] = Field(None, ge=0, description="Display order")
    is_active: Optional[bool] = Field(None, description="Active status")


class FooterSectionResponse(UUIDAsStrMixin):
    """Footer section response with links."""

    id: str = Field(..., description="Section UUID")
    title: str = Field(..., description="Section title")
    order: int = Field(0, description="Display order")
    is_active: bool = Field(True, description="Active status")
    links: list[FooterLinkResponse] = Field(default_factory=list, description="Links in this section")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {"from_attributes": True}


# ─── Contact Settings ────────────────────────────────────────────

class ContactSettingsResponse(UUIDAsStrMixin):
    """Contact settings response."""

    id: str = Field(..., description="Contact settings UUID")
    email: Optional[str] = Field(None, description="Contact email")
    phone: Optional[str] = Field(None, description="Contact phone")
    whatsapp: Optional[str] = Field(None, description="WhatsApp number")
    address: Optional[str] = Field(None, description="Business address")
    working_hours: Optional[str] = Field(None, description="Working hours")
    google_map_url: Optional[str] = Field(None, description="Google Maps URL")
    emergency_number: Optional[str] = Field(None, description="Emergency contact")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {"from_attributes": True}


class ContactSettingsUpdate(BaseModel):
    """Contact settings update payload."""

    email: Optional[str] = Field(None, description="Contact email")
    phone: Optional[str] = Field(None, description="Contact phone")
    whatsapp: Optional[str] = Field(None, description="WhatsApp number")
    address: Optional[str] = Field(None, description="Business address")
    working_hours: Optional[str] = Field(None, description="Working hours")
    google_map_url: Optional[str] = Field(None, description="Google Maps URL")
    emergency_number: Optional[str] = Field(None, description="Emergency contact")


# ─── CTA Settings ────────────────────────────────────────────────

class CTASettingsResponse(UUIDAsStrMixin):
    """CTA settings response."""

    id: str = Field(..., description="CTA settings UUID")
    title: str = Field(..., description="CTA title")
    subtitle: Optional[str] = Field(None, description="CTA subtitle")
    button_text: str = Field(..., description="Button label")
    button_url: str = Field(..., description="Button URL")
    background_image_id: Optional[str] = Field(None, description="Background image media UUID")
    background_image: Optional[MediaEmbed] = Field(None, description="Background image media")
    is_active: bool = Field(True, description="Active status")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {"from_attributes": True}


class CTASettingsUpdate(BaseModel):
    """CTA settings update payload."""

    title: Optional[str] = Field(None, description="CTA title")
    subtitle: Optional[str] = Field(None, description="CTA subtitle")
    button_text: Optional[str] = Field(None, description="Button label")
    button_url: Optional[str] = Field(None, description="Button URL")
    background_image_id: Optional[str] = Field(None, description="Background image media UUID")
    is_active: Optional[bool] = Field(None, description="Active status")


# ─── Contact Page CMS ────────────────────────────────────────────

class ContactPageCMSResponse(UUIDAsStrMixin):
    """Contact page CMS settings response."""

    id: str = Field(..., description="ContactPageCMS UUID")

    # Hero section
    hero_label: Optional[str] = Field(None, description="Small eyebrow label")
    hero_heading: Optional[str] = Field(None, description="Main hero heading")
    hero_description: Optional[str] = Field(None, description="Hero subtitle / description")
    hero_background_image_id: Optional[str] = Field(None, description="Hero background image UUID")
    hero_background_image: Optional[MediaEmbed] = Field(None, description="Hero background image media")
    hero_overlay_opacity: float = Field(0.5, description="Overlay opacity (0.0–1.0)")
    hero_is_published: bool = Field(True, description="Whether the hero section is published")

    # Display toggles
    show_office_locations: bool = Field(True)
    show_business_hours: bool = Field(True)
    show_google_map: bool = Field(True)
    show_contact_form: bool = Field(True)
    show_social_links: bool = Field(True)
    default_map_zoom: str = Field("15", description="Default Google Maps zoom level")
    enable_whatsapp_button: bool = Field(True)
    enable_call_button: bool = Field(True)
    enable_email_button: bool = Field(True)

    # Linked settings
    cta_settings_id: Optional[str] = Field(None, description="Linked CTA settings UUID")
    seo_settings_id: Optional[str] = Field(None, description="Linked SEO settings UUID")

    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {"from_attributes": True}


class PublicContactResponse(UUIDAsStrMixin):
    """Aggregated public contact page payload."""

    page: ContactPageCMSResponse = Field(...)
    settings: ContactSettingsResponse = Field(...)
    cta: Optional[CTASettingsResponse] = Field(None)


class ContactPageCMSUpdate(BaseModel):
    """Contact page CMS settings update payload."""

    # Hero section
    hero_label: Optional[str] = Field(None, description="Small eyebrow label")
    hero_heading: Optional[str] = Field(None, description="Main hero heading")
    hero_description: Optional[str] = Field(None, description="Hero subtitle / description")
    hero_background_image_id: Optional[str] = Field(None, description="Hero background image UUID")
    hero_overlay_opacity: Optional[float] = Field(None, ge=0.0, le=1.0, description="Overlay opacity (0.0–1.0)")
    hero_is_published: Optional[bool] = Field(None, description="Whether the hero section is published")

    # Display toggles
    show_office_locations: Optional[bool] = Field(None)
    show_business_hours: Optional[bool] = Field(None)
    show_google_map: Optional[bool] = Field(None)
    show_contact_form: Optional[bool] = Field(None)
    show_social_links: Optional[bool] = Field(None)
    default_map_zoom: Optional[str] = Field(None, description="Default Google Maps zoom level")
    enable_whatsapp_button: Optional[bool] = Field(None)
    enable_call_button: Optional[bool] = Field(None)
    enable_email_button: Optional[bool] = Field(None)

    # Linked settings
    cta_settings_id: Optional[str] = Field(None, description="Linked CTA settings UUID")
    seo_settings_id: Optional[str] = Field(None, description="Linked SEO settings UUID")