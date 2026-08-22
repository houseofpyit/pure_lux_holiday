"""Generic filter utilities for building dynamic SQLAlchemy queries."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from pydantic import BaseModel
from sqlalchemy import ColumnExpressionArgument, and_, or_
from sqlalchemy.orm import DeclarativeBase


class FilterParams(BaseModel):
    """Base filter parameters that concrete filter schemas should extend.

    Subclasses should define specific filter fields with their
    types and validation rules.
    """

    pass


@dataclass
class FilterCondition:
    """A single filter condition for query building."""

    field: str
    operator: str
    value: Any


def build_filters(
    model: type[DeclarativeBase],
    conditions: list[FilterCondition],
    combine_with: str = "and",
) -> ColumnExpressionArgument[bool] | None:
    """Build SQLAlchemy filter expressions from filter conditions.

    Args:
        model: The SQLAlchemy model class to filter against.
        conditions: A list of filter conditions (field, operator, value).
        combine_with: How to combine multiple conditions ("and" or "or").

    Returns:
        A SQLAlchemy filter expression, or None if no conditions provided.
    """
    if not conditions:
        return None

    expressions: list[ColumnExpressionArgument[bool]] = []

    for condition in conditions:
        column = getattr(model, condition.field, None)
        if column is None:
            continue

        expression = _build_expression(column, condition)
        if expression is not None:
            expressions.append(expression)

    if not expressions:
        return None

    if combine_with == "or":
        return or_(*expressions)

    return and_(*expressions)


def _build_expression(
    column: Any,
    condition: FilterCondition,
) -> ColumnExpressionArgument[bool] | None:
    """Build a single filter expression for a column and condition.

    Supported operators: eq, ne, gt, gte, lt, lte, like, ilike, in_, not_in, is_null, is_not_null
    """
    operator_map: dict[str, Any] = {
        "eq": column.__eq__,
        "ne": column.__ne__,
        "gt": column.__gt__,
        "gte": column.__ge__,
        "lt": column.__lt__,
        "lte": column.__le__,
        "like": column.like,
        "ilike": column.ilike,
        "in_": column.in_,
        "not_in": column.notin_,
        "is_null": lambda: column.is_(None),
        "is_not_null": lambda: column.isnot(None),
    }

    operator_func = operator_map.get(condition.operator)
    if operator_func is None:
        return None

    if condition.operator in ("is_null", "is_not_null"):
        return operator_func()  # type: ignore[no-any-return]

    return operator_func(condition.value)  # type: ignore[no-any-return]