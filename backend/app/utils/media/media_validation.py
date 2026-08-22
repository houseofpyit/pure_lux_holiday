"""Shared helpers for validating media references in CMS services."""

from __future__ import annotations

import uuid
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.media_repository import MediaRepository


async def validate_media_exists(
    session: AsyncSession,
    media_id: object | None,
    *,
    field_name: str = "media",
) -> None:
    """Ensure a media record exists and is not soft-deleted."""
    if media_id is None:
        return

    parsed_id = uuid.UUID(str(media_id))
    repo = MediaRepository(session)
    media = await repo.get_by_id(parsed_id)
    if media is None or media.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{field_name} not found",
        )


async def validate_media_ids(
    session: AsyncSession,
    fields: dict[str, object | None],
) -> None:
    """Validate multiple optional media foreign keys."""
    for field_name, media_id in fields.items():
        if media_id is not None:
            await validate_media_exists(session, media_id, field_name=field_name)


def media_fields_from_payload(payload: dict) -> dict[str, object | None]:
    """Extract *_image_id and *_media_id keys from a create/update payload."""
    return {
        key: value
        for key, value in payload.items()
        if (key.endswith("_image_id") or key.endswith("_media_id")) and value is not None
    }
