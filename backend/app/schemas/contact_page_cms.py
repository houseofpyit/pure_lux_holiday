"""Pydantic schemas for Contact Page CMS."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field
from app.schemas.base import UUIDAsStrMixin


# ─── Contact Page CMS ────────────────────────────────────────────────────────

class ContactPageCMSResponse(UUIDAsStrMixin):
    """Contact page CMS response."""

    id: str = Field(..., description="Contact page CMS UUID")
    
    # Hero Section
    hero_label: Optional[str] = Field(None, description="Small label above hero heading")
    hero_heading: Optional[str] = Field(None, description="Hero heading text")
    hero_description: Optional[str] = Field(None, description="Hero description")
    hero_background_image_id: Optional[str] = Field(None, description="Hero background image media UUID")
    hero_overlay_opacity: float = Field(0.5, description="Hero overlay opacity (0.0-1.0)")
    hero_is_published: bool = Field(True, description="Hero section published status")
    
    # Contact Page Settings
    show_office_locations: bool = Field(True, description="Show office locations section")
    show_business_hours: bool = Field(True, description="Show business hours section")
    show_google_map: bool = Field(True, description="Show Google Map")
    show_contact_form: bool = Field(True, description="Show contact form")
    show_social_links: bool = Field(True, description="Show social links")
    default_map_zoom: str = Field("15", description="Default map zoom level (1-20)")
    enable_whatsapp_button: bool = Field(True, description="Enable WhatsApp button")
    enable_call_button: bool = Field(True, description="Enable call button")
    enable_email_button: bool = Field(True, description="Enable email button")
    
    # Reusable Sections
    cta_settings_id: Optional[str] = Field(None, description="CTA settings UUID")
    seo_settings_id: Optional[str] = Field(None, description="SEO settings UUID")
    
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {"from_attributes": True}


class ContactPageCMSUpdate(BaseModel):
    """Contact page CMS update payload."""

    # Hero Section
    hero_label: Optional[str] = Field(None, description="Small label above hero heading", max_length=100)
    hero_heading: Optional[str] = Field(None, description="Hero heading text", max_length=255)
    hero_description: Optional[str] = Field(None, description="Hero description")
    hero_background_image_id: Optional[str] = Field(None, description="Hero background image media UUID")
    hero_overlay_opacity: Optional[float] = Field(None, description="Hero overlay opacity (0.0-1.0)", ge=0.0, le=1.0)
    hero_is_published: Optional[bool] = Field(None, description="Hero section published status")
    
    # Contact Page Settings
    show_office_locations: Optional[bool] = Field(None, description="Show office locations section")
    show_business_hours: Optional[bool] = Field(None, description="Show business hours section")
    show_google_map: Optional[bool] = Field(None, description="Show Google Map")
    show_contact_form: Optional[bool] = Field(None, description="Show contact form")
    show_social_links: Optional[bool] = Field(None, description="Show social links")
    default_map_zoom: Optional[str] = Field(None, description="Default map zoom level (1-20)")
    enable_whatsapp_button: Optional[bool] = Field(None, description="Enable WhatsApp button")
    enable_call_button: Optional[bool] = Field(None, description="Enable call button")
    enable_email_button: Optional[bool] = Field(None, description="Enable email button")
    
    # Reusable Sections
    cta_settings_id: Optional[str] = Field(None, description="CTA settings UUID")
    seo_settings_id: Optional[str] = Field(None, description="SEO settings UUID")