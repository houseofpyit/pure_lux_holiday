"""Generic pagination utilities for database queries."""

from __future__ import annotations

from dataclasses import dataclass
from math import ceil
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field
from sqlalchemy import Select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase

T = TypeVar("T", bound=DeclarativeBase)


class PaginationParams(BaseModel):
    """Request pagination parameters."""

    page: int = Field(default=1, ge=1, description="Current page number")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page")


@dataclass
class PaginatedResult(Generic[T]):
    """Paginated query result with metadata."""

    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int

    @property
    def has_next(self) -> bool:
        """Check if there is a next page."""
        return self.page < self.total_pages

    @property
    def has_previous(self) -> bool:
        """Check if there is a previous page."""
        return self.page > 1

    @property
    def next_page(self) -> int | None:
        """Return the next page number, or None if on last page."""
        return self.page + 1 if self.has_next else None

    @property
    def previous_page(self) -> int | None:
        """Return the previous page number, or None if on first page."""
        return self.page - 1 if self.has_previous else None


async def paginate(
    session: AsyncSession,
    query: Select,
    params: PaginationParams,
) -> PaginatedResult[Any]:
    """Execute a paginated query and return results with metadata.

    Args:
        session: The async database session.
        query: The SQLAlchemy select statement to paginate.
        params: Pagination parameters (page, page_size).

    Returns:
        A PaginatedResult containing the items and pagination metadata.
    """
    # Get total count
    count_query = query.order_by(None).with_only_columns(
        func.count(),  # type: ignore[arg-type]
        maintain_column_froms=False,
    )
    total_result = await session.execute(count_query)
    total: int = total_result.scalar_one()

    # Calculate pagination
    total_pages: int = max(1, ceil(total / params.page_size))
    offset: int = (params.page - 1) * params.page_size

    # Fetch items
    paginated_query = query.offset(offset).limit(params.page_size)
    result = await session.execute(paginated_query)
    items: list[Any] = list(result.scalars().unique().all())

    return PaginatedResult(
        items=items,
        total=total,
        page=params.page,
        page_size=params.page_size,
        total_pages=total_pages,
    )