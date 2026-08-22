"""CMS-specific exception definitions."""

from __future__ import annotations

from fastapi import HTTPException, status


class SlugAlreadyExistsException(HTTPException):
    """Raised when a navigation slug already exists."""

    def __init__(self, slug: str) -> None:
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A navigation item with slug '{slug}' already exists",
        )