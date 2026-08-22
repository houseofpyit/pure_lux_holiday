"""Generic sorting utilities for database queries."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field
from sqlalchemy import Select, asc, desc
from sqlalchemy.orm import DeclarativeBase


class SortParams(BaseModel):
    """Sort parameters for query ordering."""

    sort_by: str = Field(
        default="created_at",
        description="Field name to sort by",
    )
    sort_order: str = Field(
        default="desc",
        pattern="^(asc|desc)$",
        description="Sort direction: 'asc' or 'desc'",
    )


def apply_sorting(
    query: Select,
    model: type[DeclarativeBase],
    params: SortParams,
    allowed_fields: set[str] | None = None,
) -> Select:
    """Apply sorting to a SQLAlchemy select statement.

    Args:
        query: The SQLAlchemy select statement to modify.
        model: The SQLAlchemy model class for resolving column names.
        params: Sort parameters (sort_by field, sort_order direction).
        allowed_fields: Optional set of allowed field names for security.
            If provided, invalid fields will silently fall back to
            the default sort.

    Returns:
        The modified select statement with ORDER BY applied.
    """
    sort_field = params.sort_by

    # Validate sort field if allowed_fields is specified
    if allowed_fields is not None and sort_field not in allowed_fields:
        sort_field = "created_at"

    column = getattr(model, sort_field, None)
    if column is None:
        column = model.created_at  # type: ignore[attr-defined]
        sort_order = "desc"
    else:
        sort_order = params.sort_order

    order_func = desc if sort_order == "desc" else asc
    return query.order_by(order_func(column))