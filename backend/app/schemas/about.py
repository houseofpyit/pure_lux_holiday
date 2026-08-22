"""Pydantic schemas for About & Company CMS."""

from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.base import UUIDAsStrMixin
from app.schemas.media import MediaEmbed

class AboutPageResponse(UUIDAsStrMixin):
    id: str = Field(...)
    hero_title: str = Field(...)
    hero_subtitle: Optional[str] = Field(None)
    hero_image_id: Optional[str] = Field(None)
    hero_image: Optional[MediaEmbed] = Field(None)
    company_description: Optional[str] = Field(None)
    our_story: Optional[str] = Field(None)
    mission: Optional[str] = Field(None)
    vision: Optional[str] = Field(None)
    seo_title: Optional[str] = Field(None)
    seo_description: Optional[str] = Field(None)
    is_active: bool = Field(True)
    created_at: datetime = Field(...)
    updated_at: datetime = Field(...)
    model_config = {"from_attributes": True}

class AboutPageUpdate(BaseModel):
    hero_title: Optional[str] = Field(None)
    hero_subtitle: Optional[str] = Field(None)
    hero_image_id: Optional[str] = Field(None)
    company_description: Optional[str] = Field(None)
    our_story: Optional[str] = Field(None)
    mission: Optional[str] = Field(None)
    vision: Optional[str] = Field(None)
    seo_title: Optional[str] = Field(None)
    seo_description: Optional[str] = Field(None)
    is_active: Optional[bool] = Field(None)

class CoreValueCreate(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = Field(None)
    icon: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)

class CoreValueUpdate(BaseModel):
    title: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    icon: Optional[str] = Field(None)
    display_order: Optional[int] = Field(None)
    is_active: Optional[bool] = Field(None)

class CoreValueResponse(UUIDAsStrMixin):
    id: str = Field(...)
    title: str = Field(...)
    description: Optional[str] = Field(None)
    icon: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)
    model_config = {"from_attributes": True}

class LeadershipCreate(BaseModel):
    name: str = Field(..., min_length=1)
    designation: Optional[str] = Field(None)
    bio: Optional[str] = Field(None)
    profile_image_id: Optional[str] = Field(None)
    linkedin_url: Optional[str] = Field(None)
    twitter_url: Optional[str] = Field(None)
    email: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)

class LeadershipUpdate(BaseModel):
    name: Optional[str] = Field(None)
    designation: Optional[str] = Field(None)
    bio: Optional[str] = Field(None)
    profile_image_id: Optional[str] = Field(None)
    linkedin_url: Optional[str] = Field(None)
    twitter_url: Optional[str] = Field(None)
    email: Optional[str] = Field(None)
    display_order: Optional[int] = Field(None)
    is_active: Optional[bool] = Field(None)

class LeadershipResponse(UUIDAsStrMixin):
    id: str = Field(...)
    name: str = Field(...)
    designation: Optional[str] = Field(None)
    bio: Optional[str] = Field(None)
    profile_image_id: Optional[str] = Field(None)
    linkedin_url: Optional[str] = Field(None)
    twitter_url: Optional[str] = Field(None)
    email: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)
    model_config = {"from_attributes": True}

class TimelineCreate(BaseModel):
    year: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    description: Optional[str] = Field(None)
    image_id: Optional[str] = Field(None)
    display_order: int = Field(0)

class TimelineUpdate(BaseModel):
    year: Optional[str] = Field(None)
    title: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    image_id: Optional[str] = Field(None)
    display_order: Optional[int] = Field(None)

class TimelineResponse(UUIDAsStrMixin):
    id: str = Field(...)
    year: str = Field(...)
    title: str = Field(...)
    description: Optional[str] = Field(None)
    image_id: Optional[str] = Field(None)
    display_order: int = Field(0)
    model_config = {"from_attributes": True}

class AwardCreate(BaseModel):
    title: str = Field(..., min_length=1)
    organization: Optional[str] = Field(None)
    award_date: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    image_id: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)

class AwardUpdate(BaseModel):
    title: Optional[str] = Field(None)
    organization: Optional[str] = Field(None)
    award_date: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    image_id: Optional[str] = Field(None)
    display_order: Optional[int] = Field(None)
    is_active: Optional[bool] = Field(None)

class AwardResponse(UUIDAsStrMixin):
    id: str = Field(...)
    title: str = Field(...)
    organization: Optional[str] = Field(None)
    award_date: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    image_id: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)
    model_config = {"from_attributes": True}

class PartnerCreate(BaseModel):
    name: str = Field(..., min_length=1)
    website: Optional[str] = Field(None)
    logo_id: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)

class PartnerUpdate(BaseModel):
    name: Optional[str] = Field(None)
    website: Optional[str] = Field(None)
    logo_id: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    display_order: Optional[int] = Field(None)
    is_active: Optional[bool] = Field(None)

class PartnerResponse(UUIDAsStrMixin):
    id: str = Field(...)
    name: str = Field(...)
    website: Optional[str] = Field(None)
    logo_id: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)
    model_config = {"from_attributes": True}

class CompanyStatisticCreate(BaseModel):
    title: str = Field(..., min_length=1)
    value: str = Field(..., min_length=1)
    suffix: Optional[str] = Field(None)
    icon: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)

class CompanyStatisticUpdate(BaseModel):
    title: Optional[str] = Field(None)
    value: Optional[str] = Field(None)
    suffix: Optional[str] = Field(None)
    icon: Optional[str] = Field(None)
    display_order: Optional[int] = Field(None)
    is_active: Optional[bool] = Field(None)

class CompanyStatisticResponse(UUIDAsStrMixin):
    id: str = Field(...)
    title: str = Field(...)
    value: str = Field(...)
    suffix: Optional[str] = Field(None)
    icon: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)
    model_config = {"from_attributes": True}

class CompanyFAQCreate(BaseModel):
    question: str = Field(..., min_length=1)
    answer: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)

class CompanyFAQUpdate(BaseModel):
    question: Optional[str] = Field(None)
    answer: Optional[str] = Field(None)
    display_order: Optional[int] = Field(None)
    is_active: Optional[bool] = Field(None)

class CompanyFAQResponse(UUIDAsStrMixin):
    id: str = Field(...)
    question: str = Field(...)
    answer: Optional[str] = Field(None)
    display_order: int = Field(0)
    is_active: bool = Field(True)
    model_config = {"from_attributes": True}

class PublicAboutResponse(UUIDAsStrMixin):
    about: Optional[AboutPageResponse] = Field(None)
    core_values: list[CoreValueResponse] = Field(default_factory=list)
    leadership: list[LeadershipResponse] = Field(default_factory=list)
    timeline: list[TimelineResponse] = Field(default_factory=list)
    awards: list[AwardResponse] = Field(default_factory=list)
    partners: list[PartnerResponse] = Field(default_factory=list)
    statistics: list[CompanyStatisticResponse] = Field(default_factory=list)
    faqs: list[CompanyFAQResponse] = Field(default_factory=list)

class ReorderItem(BaseModel):
    id: str = Field(...)
    display_order: int = Field(..., ge=0)

class ReorderRequest(BaseModel):
    items: list[ReorderItem] = Field(...)