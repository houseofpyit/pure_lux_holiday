"""Media management endpoints."""

from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.dependencies.auth_dependencies import (
    get_current_active_user,
    require_admin,
    require_editor,
)
from app.schemas.auth import CurrentUserResponse
from app.schemas.media import (
    BulkActionRequest,
    BulkActionResponse,
    MediaDetailResponse,
    MediaListResponse,
    MediaUploadResponse,
    MoveMediaRequest,
    RenameMediaRequest,
    UpdateAltTextRequest,
)
from app.services.media_service import MediaService
from app.db.utils.pagination import PaginationParams
from app.db.utils.sorting import SortParams

router = APIRouter(prefix="/media", tags=["Media"])


# ── IMPORTANT: fixed-path routes MUST come before /{media_id} ─────────────────
# FastAPI matches routes in registration order. If /{media_id} is registered
# first, a GET /media/folders would match it with media_id="folders", causing
# a UUID validation error. Keep /folders, /upload, /bulk-delete, /bulk-restore
# all above the /{media_id} catch-all route.


@router.get(
    "/folders",
    status_code=status.HTTP_200_OK,
    summary="List media folders with counts",
)
async def list_folders(
    session: AsyncSession = Depends(get_db_session),
    current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> list[dict]:
    """Return all distinct folder paths with non-deleted file counts."""
    return await MediaService(session).get_folders()


@router.get(
    "",
    response_model=MediaListResponse,
    status_code=status.HTTP_200_OK,
    summary="List media items",
)
async def list_media(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    folder: Optional[str] = Query(default=None),
    media_type: Optional[str] = Query(default=None),
    extension: Optional[str] = Query(default=None),
    mime_type: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    sort_by: str = Query(default="created_at"),
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
    session: AsyncSession = Depends(get_db_session),
    current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> MediaListResponse:
    """List and filter non-deleted media items with pagination."""
    return await MediaService(session).list_media(
        page_params=PaginationParams(page=page, page_size=page_size),
        folder=folder,
        media_type=media_type,
        extension=extension,
        mime_type=mime_type,
        search_query=search,
        sort_params=SortParams(sort_by=sort_by, sort_order=sort_order),
    )


@router.post(
    "/upload",
    response_model=MediaUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a file",
    description=(
        "Upload a file to a hierarchical folder path (e.g. 'home/hero', "
        "'blog/covers', 'products/gallery'). Directories are created automatically. "
        "Supported: JPG, PNG, WebP, GIF (images); MP4, MOV (video); PDF (documents)."
    ),
)
async def upload_media(
    file: UploadFile = File(...),
    folder: str = Form(default="general", description="Folder path, e.g. 'home/hero' or 'blog/covers'"),
    alt_text: Optional[str] = Form(default=None),
    session: AsyncSession = Depends(get_db_session),
    current_user: CurrentUserResponse = Depends(require_editor),
) -> MediaUploadResponse:
    """Upload a file to the media library."""
    return await MediaService(session).upload(file=file, folder=folder, alt_text=alt_text)


@router.post(
    "/bulk-delete",
    response_model=BulkActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Bulk soft-delete media",
)
async def bulk_delete_media(
    request: BulkActionRequest,
    session: AsyncSession = Depends(get_db_session),
    current_user: CurrentUserResponse = Depends(require_admin),
) -> BulkActionResponse:
    """Bulk soft-delete media items (admin only)."""
    return await MediaService(session).bulk_delete(request.ids)


@router.post(
    "/bulk-restore",
    response_model=BulkActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Bulk restore media",
)
async def bulk_restore_media(
    request: BulkActionRequest,
    session: AsyncSession = Depends(get_db_session),
    current_user: CurrentUserResponse = Depends(require_admin),
) -> BulkActionResponse:
    """Bulk restore soft-deleted media items (admin only)."""
    return await MediaService(session).bulk_restore(request.ids)


# ── Item-level routes (/{media_id} catch-all — must come last) ────────────────

@router.get(
    "/{media_id}",
    response_model=MediaDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get media item",
)
async def get_media(
    media_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> MediaDetailResponse:
    """Get a single non-deleted media item by UUID."""
    return await MediaService(session).get_by_id(media_id)


@router.patch(
    "/{media_id}",
    response_model=MediaDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Update alt text",
)
async def update_alt_text(
    media_id: uuid.UUID,
    request: UpdateAltTextRequest,
    session: AsyncSession = Depends(get_db_session),
    current_user: CurrentUserResponse = Depends(require_editor),
) -> MediaDetailResponse:
    """Update the alt text for a media item."""
    return await MediaService(session).update_alt_text(media_id, request.alt_text)


@router.patch(
    "/{media_id}/move",
    response_model=MediaDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Move to folder",
)
async def move_media(
    media_id: uuid.UUID,
    request: MoveMediaRequest,
    session: AsyncSession = Depends(get_db_session),
    current_user: CurrentUserResponse = Depends(require_editor),
) -> MediaDetailResponse:
    """Move a media item to a different folder."""
    return await MediaService(session).move_media(media_id, request.folder)


@router.patch(
    "/{media_id}/rename",
    response_model=MediaDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Rename file",
)
async def rename_media(
    media_id: uuid.UUID,
    request: RenameMediaRequest,
    session: AsyncSession = Depends(get_db_session),
    current_user: CurrentUserResponse = Depends(require_editor),
) -> MediaDetailResponse:
    """Rename a media file (preserves extension)."""
    return await MediaService(session).rename_media(media_id, request.filename)


@router.delete(
    "/{media_id}",
    status_code=status.HTTP_200_OK,
    summary="Soft-delete media",
)
async def delete_media(
    media_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: CurrentUserResponse = Depends(require_admin),
) -> dict[str, str]:
    """Soft-delete a media item (admin only). Also removes the file from R2/local storage."""
    await MediaService(session).soft_delete(media_id)
    return {"message": "Media deleted successfully"}


@router.post(
    "/{media_id}/restore",
    response_model=MediaDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Restore soft-deleted media",
)
async def restore_media(
    media_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: CurrentUserResponse = Depends(require_admin),
) -> MediaDetailResponse:
    """Restore a previously soft-deleted media item (admin only)."""
    return await MediaService(session).restore(media_id)
