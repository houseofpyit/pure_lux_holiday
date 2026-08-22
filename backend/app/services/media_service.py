"""Media service containing all media management business logic."""

from __future__ import annotations

import re
import uuid
from pathlib import Path
from typing import Optional

from fastapi import UploadFile
from loguru import logger
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.utils.filters import FilterCondition
from app.exceptions.media_exceptions import (
    MediaNotFoundException,
    MediaValidationException,
)
from app.models.media import Media
from app.repositories.media_repository import MediaRepository
from app.schemas.media import (
    BulkActionResponse,
    MediaDetailResponse,
    MediaListResponse,
    MediaUploadResponse,
)
from app.storage.factory import get_storage_provider
from app.storage.base import StorageProvider
from app.utils.media.file_validator import FileValidationError, FileValidator
from app.utils.media.image_processor import ImageProcessor
from app.utils.media.storage_path import media_storage_path
from app.db.utils.pagination import PaginationParams
from app.db.utils.sorting import SortParams

# ─── Folder path validation ───────────────────────────────────────────────────
# Accepts: 'general', 'home/hero', 'blog/covers', 'products/gallery/2024'
# Rejects: absolute paths, traversal (..), consecutive slashes, uppercase
_FOLDER_PATH_RE = re.compile(r'^[a-z0-9][a-z0-9\-/]*[a-z0-9]$|^[a-z0-9]$')


def _validate_folder_path(folder: str) -> None:
    """Validate a hierarchical folder path.

    Raises:
        MediaValidationException: If the path is invalid.
    """
    if not folder:
        raise MediaValidationException("Folder path cannot be empty.")
    if '..' in folder:
        raise MediaValidationException("Folder path must not contain '..'.")
    if folder.startswith('/') or folder.endswith('/'):
        raise MediaValidationException("Folder path must not start or end with '/'.")
    if '//' in folder:
        raise MediaValidationException("Folder path must not contain consecutive slashes.")
    if not _FOLDER_PATH_RE.match(folder):
        raise MediaValidationException(
            f"Invalid folder path '{folder}'. "
            "Use only lowercase letters, digits, hyphens, and forward slashes "
            "(e.g. 'general', 'home/hero', 'blog/covers')."
        )


# ─── Service ──────────────────────────────────────────────────────────────────

class MediaService:
    """Service for media upload, management, and organization."""

    def __init__(self, session: AsyncSession) -> None:
        self.repository = MediaRepository(session)
        self.storage: StorageProvider = get_storage_provider()

    # ── Folders ───────────────────────────────────────────────────────────────

    async def get_folders(self) -> list[dict]:
        """Return all distinct folder paths with their non-deleted item counts."""
        stmt = (
            select(Media.folder, func.count(Media.id).label("count"))
            .where(Media.folder.isnot(None))
            .where(Media.is_deleted.is_(False))
            .group_by(Media.folder)
            .order_by(Media.folder)
        )
        result = await self.repository.session.execute(stmt)
        return [{"name": row.folder, "count": row.count} for row in result]

    # ── Upload ────────────────────────────────────────────────────────────────

    async def upload(
        self,
        file: UploadFile,
        folder: str = "general",
        alt_text: str | None = None,
    ) -> MediaUploadResponse:
        """Upload a file to a hierarchical folder path.

        Accepts any valid folder path like 'general', 'home/hero',
        'blog/covers'. Directories are created automatically — no
        pre-defined whitelist needed.
        """
        _validate_folder_path(folder)

        try:
            extension, media_type = FileValidator.validate(file)
        except FileValidationError as exc:
            raise MediaValidationException(exc.message) from exc

        file_bytes = await file.read()

        unique_id = uuid.uuid4().hex
        original_stem = Path(file.filename or "file").stem or "file"
        safe_stem = "".join(c for c in original_stem if c.isalnum() or c in "._- ").strip()
        safe_stem = safe_stem[:50] or "file"
        unique_filename = f"{safe_stem}_{unique_id}{extension}"

        # Hierarchical storage path: uploads/<folder>/<filename>
        storage_path = f"{folder}/{unique_filename}"

        import io as _io
        await self.storage.save_file(
            file=_io.BytesIO(file_bytes),
            file_path=storage_path,
            content_type=file.content_type,
        )

        file_url = await self.storage.generate_url(storage_path)
        width, height = ImageProcessor.extract_metadata(file, file_bytes, media_type)

        media = await self.repository.create(
            filename=unique_filename,
            original_name=file.filename or unique_filename,
            file_url=file_url,
            mime_type=file.content_type or "application/octet-stream",
            extension=extension,
            size=len(file_bytes),
            folder=folder,
            alt_text=alt_text,
            media_type=media_type,
            width=width,
            height=height,
        )

        logger.info(
            "Media uploaded: {} ({}, {} bytes) → '{}'",
            unique_filename, media_type.value, len(file_bytes), storage_path,
        )
        return MediaUploadResponse.model_validate(media)

    # ── Read ──────────────────────────────────────────────────────────────────

    async def get_by_id(self, media_id: uuid.UUID) -> MediaDetailResponse:
        """Retrieve a non-deleted media item by UUID."""
        stmt = select(Media).where(
            Media.id == media_id,
            Media.is_deleted.is_(False),
        )
        result = await self.repository.session.execute(stmt)
        media = result.scalar_one_or_none()
        if media is None:
            raise MediaNotFoundException()
        return MediaDetailResponse.model_validate(media)

    async def list_media(
        self,
        page_params: PaginationParams,
        folder: str | None = None,
        media_type: str | None = None,
        extension: str | None = None,
        mime_type: str | None = None,
        search_query: str | None = None,
        sort_params: SortParams | None = None,
    ) -> MediaListResponse:
        """List non-deleted media items with filtering and pagination."""
        # Always exclude soft-deleted records
        filters: list[FilterCondition] = [
            FilterCondition(field="is_deleted", operator="eq", value=False),
        ]
        if folder is not None:
            filters.append(FilterCondition(field="folder", operator="eq", value=folder))
        if media_type is not None:
            filters.append(FilterCondition(field="media_type", operator="eq", value=media_type))
        if extension is not None:
            filters.append(FilterCondition(field="extension", operator="eq", value=extension))
        if mime_type is not None:
            filters.append(FilterCondition(field="mime_type", operator="eq", value=mime_type))

        if search_query is not None:
            result = await self.repository.search(search_query, page_params, extra_filters=filters)
        else:
            result = await self.repository.paginate(
                page_params=page_params,
                filters=filters,
                sort_params=sort_params,
            )

        items = [MediaDetailResponse.model_validate(item) for item in result.items]
        return MediaListResponse(
            items=items,
            total=result.total,
            page=result.page,
            page_size=result.page_size,
            total_pages=result.total_pages,
        )

    # ── Update ────────────────────────────────────────────────────────────────

    async def update_alt_text(self, media_id: uuid.UUID, alt_text: str) -> MediaDetailResponse:
        """Update the alt text for a non-deleted media item."""
        media = await self._get_active(media_id)
        media = await self.repository.update(media, alt_text=alt_text)
        return MediaDetailResponse.model_validate(media)

    async def move_media(self, media_id: uuid.UUID, target_folder: str) -> MediaDetailResponse:
        """Move a media item to a different (hierarchical) folder."""
        _validate_folder_path(target_folder)
        media = await self._get_active(media_id)

        old_path = f"{media.folder}/{media.filename}"
        new_path = f"{target_folder}/{media.filename}"

        moved = await self.storage.move_file(old_path, new_path)
        if not moved:
            raise MediaValidationException("Failed to move file in storage.")

        media = await self.repository.update(
            media,
            folder=target_folder,
            file_url=await self.storage.generate_url(new_path),
        )
        return MediaDetailResponse.model_validate(media)

    async def rename_media(self, media_id: uuid.UUID, new_filename: str) -> MediaDetailResponse:
        """Rename a media file while preserving its extension."""
        media = await self._get_active(media_id)
        new_full_filename = f"{new_filename}{media.extension}"
        old_path = f"{media.folder}/{media.filename}"
        new_path = f"{media.folder}/{new_full_filename}"

        moved = await self.storage.move_file(old_path, new_path)
        if not moved:
            raise MediaValidationException("Failed to rename file in storage.")

        media = await self.repository.update(
            media,
            filename=new_full_filename,
            file_url=await self.storage.generate_url(new_path),
        )
        return MediaDetailResponse.model_validate(media)

    # ── Delete / Restore ──────────────────────────────────────────────────────

    async def soft_delete(self, media_id: uuid.UUID) -> None:
        """Soft-delete a media item and remove its file from storage."""
        media = await self.repository.get_by_id(media_id)
        if media is None or media.is_deleted:
            raise MediaNotFoundException()

        storage_path = media_storage_path(media)
        if storage_path:
            await self.storage.delete_file(storage_path)
        else:
            logger.warning(
                "Media {} has no managed storage path — skipping file delete",
                media_id,
            )

        media.soft_delete()
        await self.repository.session.flush()
        logger.info("Media soft deleted (storage removed): {}", media_id)

    async def restore(self, media_id: uuid.UUID) -> MediaDetailResponse:
        """Restore a soft-deleted media item."""
        media = await self.repository.get_by_id(media_id)
        if media is None:
            raise MediaNotFoundException()
        media.is_deleted = False
        media.deleted_at = None
        await self.repository.session.flush()
        logger.info("Media restored: {}", media_id)
        return MediaDetailResponse.model_validate(media)

    async def bulk_delete(self, ids: list[str]) -> BulkActionResponse:
        """Soft-delete multiple media items in bulk."""
        success_count = 0
        failed_ids: list[str] = []
        for media_id in ids:
            try:
                await self.soft_delete(uuid.UUID(media_id))
                success_count += 1
            except Exception:
                failed_ids.append(media_id)
        return BulkActionResponse(success_count=success_count, failed_ids=failed_ids)

    async def bulk_restore(self, ids: list[str]) -> BulkActionResponse:
        """Restore multiple soft-deleted media items in bulk."""
        success_count = 0
        failed_ids: list[str] = []
        for media_id in ids:
            try:
                await self.restore(uuid.UUID(media_id))
                success_count += 1
            except Exception:
                failed_ids.append(media_id)
        return BulkActionResponse(success_count=success_count, failed_ids=failed_ids)

    # ── Private helpers ───────────────────────────────────────────────────────

    async def _get_active(self, media_id: uuid.UUID) -> Media:
        """Fetch a non-deleted media record or raise MediaNotFoundException."""
        media = await self.repository.get_by_id(media_id)
        if media is None or media.is_deleted:
            raise MediaNotFoundException()
        return media
