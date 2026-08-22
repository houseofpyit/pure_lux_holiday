"""Resolve storage object paths from media records."""

from __future__ import annotations

from app.core.config import settings
from app.models.media import Media


def media_storage_path(media: Media) -> str | None:
    """Return the storage key/path for a media row, if managed locally or on R2."""
    if media.folder and media.filename:
        return f"{media.folder}/{media.filename}"

    file_url = (media.file_url or "").strip()
    if not file_url:
        return None

    public_base = settings.R2_PUBLIC_BASE_URL.rstrip("/")
    if public_base and file_url.startswith(public_base):
        return file_url[len(public_base) :].lstrip("/")

    if file_url.startswith("/uploads/"):
        return file_url[len("/uploads/") :].lstrip("/")

    return None
