"""Media-specific exception definitions."""

from __future__ import annotations

from fastapi import HTTPException, status


class MediaNotFoundException(HTTPException):
    """Raised when a media item is not found."""

    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media item not found",
        )


class MediaValidationException(HTTPException):
    """Raised when media validation fails (file type, size, folder)."""

    def __init__(self, detail: str) -> None:
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
        )


class MediaStorageException(HTTPException):
    """Raised when a storage operation fails."""

    def __init__(self, detail: str = "Storage operation failed") -> None:
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
        )