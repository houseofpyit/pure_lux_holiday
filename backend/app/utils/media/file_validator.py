"""File validation utilities for upload security and type checking."""

from __future__ import annotations

from pathlib import Path

from fastapi import UploadFile

from app.constants.enums import MediaType


class FileValidationError(Exception):
    """Raised when a file fails validation checks."""

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class FileValidator:
    """Validates uploaded files for type, size, and extension safety."""

    ALLOWED_EXTENSIONS: dict[str, MediaType] = {
        ".jpg": MediaType.IMAGE,
        ".jpeg": MediaType.IMAGE,
        ".png": MediaType.IMAGE,
        ".webp": MediaType.IMAGE,
        ".svg": MediaType.IMAGE,
        ".gif": MediaType.IMAGE,
        ".pdf": MediaType.DOCUMENT,
        ".mp4": MediaType.VIDEO,
        ".mov": MediaType.VIDEO,
        ".webm": MediaType.VIDEO,
    }

    ALLOWED_MIME_TYPES: dict[str, MediaType] = {
        "image/jpeg": MediaType.IMAGE,
        "image/png": MediaType.IMAGE,
        "image/webp": MediaType.IMAGE,
        "image/svg+xml": MediaType.IMAGE,
        "image/gif": MediaType.IMAGE,
        "application/pdf": MediaType.DOCUMENT,
        "video/mp4": MediaType.VIDEO,
        "video/quicktime": MediaType.VIDEO,
        "video/webm": MediaType.VIDEO,
    }

    MAX_FILE_SIZES: dict[MediaType, int] = {
        MediaType.IMAGE: 10 * 1024 * 1024,      # 10 MB
        MediaType.VIDEO: 200 * 1024 * 1024,     # 200 MB
        MediaType.DOCUMENT: 25 * 1024 * 1024,   # 25 MB
    }

    @classmethod
    def validate(cls, file: UploadFile) -> tuple[str, MediaType]:
        """Validate an uploaded file's extension, MIME type, and size.

        Args:
            file: The uploaded file to validate.

        Returns:
            A tuple of (lowercase extension, MediaType).

        Raises:
            FileValidationError: If any validation check fails.
        """
        extension = cls._validate_extension(file)
        media_type = cls._validate_mime_type(file, extension)
        cls._validate_file_size(file, media_type)
        return extension, media_type

    @classmethod
    def _validate_extension(cls, file: UploadFile) -> str:
        """Validate the file extension against the allowed list.

        Args:
            file: The uploaded file.

        Returns:
            The lowercase extension string.

        Raises:
            FileValidationError: If the extension is not allowed.
        """
        if file.filename is None:
            raise FileValidationError("File has no filename")

        extension = Path(file.filename).suffix.lower()
        if extension not in cls.ALLOWED_EXTENSIONS:
            raise FileValidationError(
                f"File extension '{extension}' is not supported. "
                f"Allowed: {', '.join(cls.ALLOWED_EXTENSIONS.keys())}"
            )
        return extension

    @classmethod
    def _validate_mime_type(cls, file: UploadFile, extension: str) -> MediaType:
        """Validate the file's MIME type against the allowed list.

        Args:
            file: The uploaded file.
            extension: The file extension for fallback.

        Returns:
            The detected MediaType.

        Raises:
            FileValidationError: If the MIME type is not allowed.
        """
        content_type = file.content_type or ""

        if content_type in cls.ALLOWED_MIME_TYPES:
            return cls.ALLOWED_MIME_TYPES[content_type]

        # Fallback: use extension to determine media type
        if extension in cls.ALLOWED_EXTENSIONS:
            return cls.ALLOWED_EXTENSIONS[extension]

        raise FileValidationError(
            f"MIME type '{content_type}' is not supported"
        )

    @classmethod
    def _validate_file_size(cls, file: UploadFile, media_type: MediaType) -> None:
        """Validate the file size against the maximum for its type.

        Args:
            file: The uploaded file.
            media_type: The detected media type.

        Raises:
            FileValidationError: If the file exceeds the maximum size.
        """
        max_size = cls.MAX_FILE_SIZES.get(media_type, 10 * 1024 * 1024)

        # Read file to check size
        file.file.seek(0, 2)  # Seek to end
        size = file.file.tell()
        file.file.seek(0)  # Reset to beginning

        if size > max_size:
            size_mb = size / (1024 * 1024)
            max_mb = max_size / (1024 * 1024)
            raise FileValidationError(
                f"File size ({size_mb:.1f} MB) exceeds the maximum "
                f"allowed size of {max_mb:.0f} MB for {media_type.value} files"
            )
