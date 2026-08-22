"""Shared API dependencies for dependency injection.

This module provides reusable dependencies that can be
injected into route handlers across all API versions.
"""

from __future__ import annotations

from typing import Any

from fastapi import Header, HTTPException, status


async def get_accept_language(
    accept_language: str | None = Header(default=None),
) -> str:
    """Extract the Accept-Language header from the request.

    Args:
        accept_language: The value of the Accept-Language header.

    Returns:
        The language code string, defaulting to "en" if not provided.
    """
    return accept_language or "en"


async def pagination_params(
    page: int = 1,
    page_size: int = 20,
) -> dict[str, int]:
    """Validate and return pagination query parameters.

    Args:
        page: The current page number (1-indexed).
        page_size: Number of items per page.

    Returns:
        A dictionary with validated "page" and "page_size" keys.

    Raises:
        HTTPException: If parameters are out of valid range.
    """
    if page < 1:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Page must be greater than or equal to 1",
        )
    if page_size < 1 or page_size > 100:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Page size must be between 1 and 100",
        )
    return {"page": page, "page_size": page_size}


async def get_api_key(
    x_api_key: str | None = Header(default=None),
) -> str | None:
    """Extract an optional API key from the request header.

    Args:
        x_api_key: The value of the X-API-Key header.

    Returns:
        The API key string, or None if not provided.
    """
    _ = x_api_key  # Placeholder for future authentication logic
    return x_api_key