"""Image processing utilities for metadata extraction and thumbnail generation."""

from __future__ import annotations

import io
from pathlib import Path
from typing import Optional

from fastapi import UploadFile
from loguru import logger

from app.constants.enums import MediaType


class ImageProcessor:
    """Process image files for metadata extraction and future thumbnail generation."""

    SUPPORTED_IMAGE_FORMATS: tuple[str, ...] = (
        "JPEG", "PNG", "WEBP", "GIF",
    )

    @classmethod
    def extract_metadata(
        cls,
        file: UploadFile,
        file_bytes: bytes,
        media_type: MediaType,
    ) -> tuple[Optional[int], Optional[int]]:
        """Extract image dimensions from an image file.

        For non-image files or unreadable images, returns
        (None, None) gracefully.

        Args:
            file: The uploaded file (used for filename reference).
            media_type: The detected media type.
            file_bytes: The raw file bytes for processing.

        Returns:
            A tuple of (width, height) or (None, None) if
            the file is not an image or processing fails.
        """
        if media_type != MediaType.IMAGE:
            return None, None

        try:
            from PIL import Image

            image = Image.open(io.BytesIO(file_bytes))
            width, height = image.size
            return width, height

        except ImportError:
            logger.warning("Pillow not installed. Image dimensions not extracted.")
            return None, None
        except Exception as exc:
            logger.warning("Failed to extract image metadata: {}", exc)
            return None, None

    @classmethod
    async def generate_blurhash_placeholder(cls, file_path: str) -> Optional[str]:
        """Generate a blurhash placeholder for an image (placeholder).

        This is a structural interface for future implementation.
        In production, this would generate a compact blurhash
        string for lazy-loading image placeholders.

        Args:
            file_path: The path to the image file.

        Returns:
            None until blurhash generation is implemented.
        """
        return None

    @classmethod
    async def generate_thumbnail(
        cls,
        file_path: str,
        size: tuple[int, int] = (150, 150),
    ) -> Optional[str]:
        """Generate a thumbnail for an image (placeholder).

        This is a structural interface for future implementation.

        Args:
            file_path: The path to the source image.
            size: The desired thumbnail dimensions (width, height).

        Returns:
            None until thumbnail generation is implemented.
        """
        return None