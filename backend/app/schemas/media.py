"""Pydantic schemas for media upload and management."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, model_validator

from app.constants.enums import MediaType
from app.schemas.base import UUIDAsStrMixin


class MediaEmbed(UUIDAsStrMixin):
    """Minimal media object nested on public CMS responses."""

    id: str = Field(..., description="Media UUID")
    file_url: str = Field(..., description="URL to access the file")
    original_name: Optional[str] = Field(None, description="Original uploaded filename")
    alt_text: Optional[str] = Field(None, description="Alternative text")
    width: Optional[int] = Field(None, description="Image width in pixels")
    height: Optional[int] = Field(None, description="Image height in pixels")
    size: Optional[int] = Field(None, description="File size in bytes")

    model_config = {"from_attributes": True}

    @model_validator(mode="wrap")
    @classmethod
    def exclude_deleted_media(cls, value: object, handler):
        """Drop missing or soft-deleted media instead of failing nested validation."""
        if value is None:
            return None
        if hasattr(value, "is_deleted") and getattr(value, "is_deleted", False):
            return None
        return handler(value)

    @classmethod
    def from_media(cls, media: object | None) -> Optional["MediaEmbed"]:
        if media is None or getattr(media, "is_deleted", False):
            return None
        return cls.model_validate(media)


class MediaUploadResponse(UUIDAsStrMixin):
    """Response after a successful file upload."""

    id: str = Field(..., description="Media UUID")
    filename: str = Field(..., description="Unique filename in storage")
    original_name: str = Field(..., description="Original uploaded filename")
    file_url: str = Field(..., description="URL to access the file")
    mime_type: str = Field(..., description="MIME type of the file")
    extension: str = Field(..., description="File extension")
    size: int = Field(..., description="File size in bytes")
    folder: Optional[str] = Field(None, description="Storage folder path")
    alt_text: Optional[str] = Field(None, description="Alternative text")
    media_type: MediaType = Field(..., description="Media type classification")
    width: Optional[int] = Field(None, description="Image width in pixels")
    height: Optional[int] = Field(None, description="Image height in pixels")
    duration: Optional[float] = Field(None, description="Video duration in seconds")
    created_at: datetime = Field(..., description="Upload timestamp")

    model_config = {"from_attributes": True}


class MediaDetailResponse(MediaUploadResponse):
    """Detailed media response with all metadata."""

    updated_at: datetime = Field(..., description="Last update timestamp")


class MediaListResponse(BaseModel):
    """Paginated list of media items."""

    items: list[MediaDetailResponse] = Field(..., description="List of media items")
    total: int = Field(..., description="Total number of items")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Items per page")
    total_pages: int = Field(..., description="Total number of pages")


class UpdateAltTextRequest(BaseModel):
    """Request to update media alt text."""

    alt_text: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="New alternative text for the media",
    )


class MoveMediaRequest(BaseModel):
    """Request to move media to a different folder."""

    folder: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Target folder path",
        examples=["hero", "gallery", "packages/2024"],
    )


class RenameMediaRequest(BaseModel):
    """Request to rename a media file."""

    filename: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="New filename without extension",
        examples=["sunset-beach"],
    )


class BulkActionRequest(BaseModel):
    """Request for bulk operations on media items."""

    ids: list[str] = Field(
        ...,
        min_length=1,
        max_length=100,
        description="List of media UUIDs to perform the action on",
    )


class BulkActionResponse(BaseModel):
    """Response for bulk operations."""

    success_count: int = Field(..., description="Number of successfully processed items")
    failed_ids: list[str] = Field(
        default_factory=list,
        description="IDs that failed to process",
    )