"""Flexible query builder for constructing complex database queries."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from sqlalchemy import Select, select
from sqlalchemy.orm import DeclarativeBase

from app.db.utils.filters import FilterCondition, build_filters
from app.db.utils.pagination import PaginatedResult, PaginationParams, paginate
from app.db.utils.sorting import SortParams, apply_sorting


@dataclass
class QueryBuilder:
    """Build and execute complex queries with filtering, sorting, and pagination.

    Provides a fluent interface for constructing queries dynamically
    from request parameters. Designed for reuse across repositories.

    Example usage::

        result = await (
            QueryBuilder(AdminUser)
            .with_filters(conditions)
            .with_sorting(sort_params)
            .with_pagination(page_params)
            .execute(session)
        )
    """

    model: type[DeclarativeBase]
    _query: Select = field(init=False)
    _conditions: list[FilterCondition] = field(default_factory=list)
    _sort_params: SortParams | None = None
    _page_params: PaginationParams | None = None
    _allowed_sort_fields: set[str] | None = None

    def __post_init__(self) -> None:
        """Initialize the base select query for the model."""
        self._query = select(self.model)

    def with_filters(self, conditions: list[FilterCondition]) -> QueryBuilder:
        """Add filter conditions to the query.

        Args:
            conditions: A list of filter conditions to apply.

        Returns:
            The QueryBuilder instance for chaining.
        """
        self._conditions = conditions
        return self

    def with_sorting(
        self,
        params: SortParams,
        allowed_fields: set[str] | None = None,
    ) -> QueryBuilder:
        """Add sorting parameters to the query.

        Args:
            params: Sort parameters (field and direction).
            allowed_fields: Optional set of allowed sort fields.

        Returns:
            The QueryBuilder instance for chaining.
        """
        self._sort_params = params
        self._allowed_sort_fields = allowed_fields
        return self

    def with_pagination(self, params: PaginationParams) -> QueryBuilder:
        """Add pagination parameters to the query.

        Args:
            params: Pagination parameters (page and page_size).

        Returns:
            The QueryBuilder instance for chaining.
        """
        self._page_params = params
        return self

    def _build(self) -> Select:
        """Apply all configured filters and sorting to the query.

        Returns:
            The fully constructed SQLAlchemy Select statement.
        """
        query = self._query

        # Apply filters
        if self._conditions:
            filter_expr = build_filters(self.model, self._conditions)
            if filter_expr is not None:
                query = query.where(filter_expr)

        # Apply sorting
        if self._sort_params is not None:
            query = apply_sorting(query, self.model, self._sort_params, self._allowed_sort_fields)

        return query

    async def execute(
        self,
        session: Any,
    ) -> Any | PaginatedResult:
        """Execute the query and return results.

        If pagination parameters were provided, returns a
        PaginatedResult. Otherwise, executes the query directly.

        Args:
            session: The async database session.

        Returns:
            Query results, either as a PaginatedResult or raw scalars.
        """
        query = self._build()

        if self._page_params is not None:
            return await paginate(session, query, self._page_params)

        result = await session.execute(query)
        return list(result.scalars().unique().all())

    async def count(self, session: Any) -> int:
        """Execute the query with filters and return the count.

        Args:
            session: The async database session.

        Returns:
            The total number of matching records.
        """
        from sqlalchemy import func as sa_func

        query = self._build()

        count_query = query.order_by(None).with_only_columns(
            sa_func.count(),  # type: ignore[arg-type]
            maintain_column_froms=False,
        )
        result = await session.execute(count_query)
        return result.scalar_one()