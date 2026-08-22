"""Media repository extending BaseRepository with media-specific queries."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.repositories.base_repository import BaseRepository
from app.db.utils.filters import FilterCondition
from app.db.utils.pagination import PaginatedResult, PaginationParams
from app.db.utils.sorting import SortParams
from app.models.media import Media


class MediaRepository(BaseRepository[Media]):
    """Repository for Media data access operations.

    Extends the generic BaseRepository with media-specific queries
    for searching, filtering, and managing uploaded files.
    """

    def __init__(self, session: AsyncSession) -> None:
        """Initialize the repository with the Media model.

        Args:
            session: The async database session.
        """
        super().__init__(session, Media)

    async def search(
        self,
        query: str,
        page_params: PaginationParams,
        extra_filters: list[FilterCondition] | None = None,
    ) -> PaginatedResult[Media]:
        """Search media by filename, original name, or alt text.

        Args:
            query: The search string.
            page_params: Pagination parameters.
            extra_filters: Additional filter conditions (e.g. is_deleted=False).

        Returns:
            A PaginatedResult of matching media items.
        """
        from app.db.utils.query_builder import QueryBuilder

        search_pattern = f"%{query}%"
        # Build a base query with the search OR condition
        stmt: Select = select(Media).where(
            Media.filename.ilike(search_pattern)
            | Media.original_name.ilike(search_pattern)
            | Media.alt_text.ilike(search_pattern),
        )

        # Apply extra filters (is_deleted, folder, etc.) on top
        if extra_filters:
            from app.db.utils.filters import build_filters
            filter_expr = build_filters(Media, extra_filters)
            if filter_expr is not None:
                stmt = stmt.where(filter_expr)

        from app.db.utils.pagination import paginate
        return await paginate(self.session, stmt, page_params)

    async def find_by_folder(self, folder: str) -> list[Media]:
        """Find all media items in a specific folder.

        Args:
            folder: The folder path to search in.

        Returns:
            A list of media items in the folder.
        """
        stmt: Select = select(Media).where(Media.folder == folder)
        stmt = stmt.order_by(Media.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def get_by_media_type(self, media_type: str) -> list[Media]:
        """Find all media items of a specific type.

        Args:
            media_type: The media type to filter by.

        Returns:
            A list of media items of the specified type.
        """
        stmt: Select = select(Media).where(Media.media_type == media_type)
        stmt = stmt.order_by(Media.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())

    async def soft_delete_by_id(self, media_id: object) -> Optional[Media]:
        """Soft delete a media item by setting is_deleted flag.

        Args:
            media_id: The UUID of the media to soft delete.

        Returns:
            The updated media instance, or None if not found.
        """
        media = await self.get_by_id(media_id)
        if media is None:
            return None
        media.soft_delete()
        await self.session.flush()
        return media

    async def restore_by_id(self, media_id: object) -> Optional[Media]:
        """Restore a soft-deleted media item.

        Args:
            media_id: The UUID of the media to restore.

        Returns:
            The restored media instance, or None if not found.
        """
        media = await self.get_by_id(media_id)
        if media is None:
            return None
        media.is_deleted = False
        media.deleted_at = None
        await self.session.flush()
        return media