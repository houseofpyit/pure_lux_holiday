"""Shared helpers for seed scripts — mirror external image URLs into storage."""

from __future__ import annotations

import io
import re
import uuid
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

import httpx
from loguru import logger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants.enums import MediaType
from app.core.config import settings
from app.models.media import Media
from app.storage.factory import get_storage_provider

_MIME_BY_EXT = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
}


def _normalize_filename(name: str) -> str:
    """Ensure the seed asset name has a safe filename with an extension."""
    stem = Path(name).stem or "asset"
    ext = Path(name).suffix.lower()
    if ext not in _MIME_BY_EXT:
        ext = ".jpg"
    safe_stem = re.sub(r"[^a-zA-Z0-9._-]+", "_", stem).strip("._-") or "asset"
    return f"{safe_stem[:80]}{ext}"


def _extension_from_content_type(content_type: str | None) -> str:
    if not content_type:
        return ".jpg"
    mapping = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "image/svg+xml": ".svg",
    }
    base = content_type.split(";", 1)[0].strip().lower()
    return mapping.get(base, ".jpg")


def _is_managed_storage_url(url: str) -> bool:
    if url.startswith("/uploads/"):
        return True
    if settings.uses_r2_storage and settings.R2_PUBLIC_BASE_URL:
        return url.startswith(settings.R2_PUBLIC_BASE_URL.rstrip("/"))
    return False


def _extract_dimensions(data: bytes) -> tuple[Optional[int], Optional[int]]:
    try:
        from PIL import Image

        with Image.open(io.BytesIO(data)) as img:
            return img.size
    except Exception:
        return None, None


async def _download_image(url: str) -> tuple[bytes, str, str]:
    """Download remote image bytes and infer extension + MIME type."""
    async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
        response = await client.get(url)
        response.raise_for_status()
        data = response.content

    content_type = response.headers.get("content-type")
    parsed = urlparse(url)
    ext = Path(parsed.path).suffix.lower()
    if ext not in _MIME_BY_EXT:
        ext = _extension_from_content_type(content_type)
    mime_type = _MIME_BY_EXT.get(ext, "image/jpeg")
    return data, ext, mime_type


async def _upload_seed_bytes(
    data: bytes,
    filename: str,
    folder: str,
    mime_type: str,
) -> str:
    storage = get_storage_provider()
    storage_path = f"{folder}/{filename}"
    file_url = await storage.save_file(
        file=io.BytesIO(data),
        file_path=storage_path,
        content_type=mime_type,
    )
    if file_url.startswith("http") or file_url.startswith("/uploads/"):
        return file_url
    return await storage.generate_url(storage_path)


async def _find_existing_media(
    session: AsyncSession,
    filename: str,
) -> Media | None:
    """Find the best existing seed media row for a filename.

    Older seeds could create duplicate rows with the same filename (website +
    packages seeders, or legacy URL-based lookups). Prefer the newest row.
    """
    result = await session.execute(
        select(Media)
        .where(
            Media.filename == filename,
            Media.is_deleted.is_(False),
        )
        .order_by(Media.updated_at.desc())
    )
    rows = list(result.scalars().all())
    if not rows:
        return None
    if len(rows) > 1:
        logger.warning(
            "Duplicate media filename '{}' found ({} rows) — reusing newest",
            filename,
            len(rows),
        )
    return rows[0]


async def _download_and_upload(
    url: str,
    filename: str,
    folder: str,
) -> tuple[str, str, str, int, Optional[int], Optional[int], str]:
    """Download a remote image and upload it to storage."""
    data, ext, mime_type = await _download_image(url)
    filename = f"{Path(filename).stem}{ext}"
    file_url = await _upload_seed_bytes(data, filename, folder, mime_type)
    width, height = _extract_dimensions(data)
    return file_url, ext, mime_type, len(data), width, height, filename


async def get_or_create_media(
    session: AsyncSession,
    url: Optional[str],
    name: str,
    folder: str = "seed",
    fallback_url: Optional[str] = None,
) -> Optional[uuid.UUID]:
    """Create or reuse a media row, uploading remote seed URLs into storage."""
    if not url:
        return None

    filename = _normalize_filename(name)
    existing = await _find_existing_media(session, filename)

    if existing and _is_managed_storage_url(existing.file_url):
        return existing.id

    if _is_managed_storage_url(url):
        file_url = url
        ext = Path(filename).suffix.lower() or ".jpg"
        mime_type = _MIME_BY_EXT.get(ext, "image/jpeg")
        size = existing.size if existing else 1024
        width = existing.width if existing else None
        height = existing.height if existing else None
    else:
        download_urls = [url]
        if fallback_url and fallback_url != url:
            download_urls.append(fallback_url)

        file_url = ext = mime_type = None
        size = 1024
        width = height = None
        last_exc: Exception | None = None

        for candidate_url in download_urls:
            try:
                file_url, ext, mime_type, size, width, height, filename = (
                    await _download_and_upload(candidate_url, filename, folder)
                )
                logger.info(
                    "Seed image uploaded to storage: {} -> {}",
                    candidate_url,
                    file_url,
                )
                break
            except Exception as exc:
                last_exc = exc
                logger.warning(
                    "Seed image download failed for {}: {}",
                    candidate_url,
                    exc,
                )

        if file_url is None:
            if existing and _is_managed_storage_url(existing.file_url):
                return existing.id
            if existing:
                logger.warning(
                    "Keeping existing media row for {} despite download failure",
                    filename,
                )
                return existing.id
            logger.error(
                "No seed image available for {} (last error: {})",
                filename,
                last_exc,
            )
            return None

    if existing:
        existing.file_url = file_url
        existing.mime_type = mime_type
        existing.extension = ext
        existing.size = size
        existing.width = width
        existing.height = height
        existing.original_name = filename
        await session.flush()
        return existing.id

    media = Media(
        filename=filename,
        original_name=filename,
        file_url=file_url,
        mime_type=mime_type,
        extension=ext,
        size=size,
        folder=folder,
        alt_text=Path(filename).stem.replace("_", " "),
        media_type=MediaType.IMAGE,
        width=width,
        height=height,
    )
    session.add(media)
    await session.flush()
    return media.id


async def clear_storage_before_seed() -> None:
    """Remove stored seed assets before re-seeding (testing / dev)."""
    if settings.SEED_CLEAR_ALL_STORAGE:
        if not settings.is_development:
            logger.warning(
                "SEED_CLEAR_ALL_STORAGE is set but APP_ENV is not development — skipping"
            )
            return
        storage = get_storage_provider()
        deleted = await storage.delete_prefix("")
        logger.info("Cleared all storage objects before seed ({} files)", deleted)
        return

    if not settings.SEED_CLEAR_STORAGE:
        return

    storage = get_storage_provider()
    deleted = await storage.delete_prefix("seed")
    logger.info("Cleared seed/ storage before seed ({} files)", deleted)

