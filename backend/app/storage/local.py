"""Local filesystem storage provider implementation."""

from __future__ import annotations

import shutil
from pathlib import Path
from typing import BinaryIO

from loguru import logger

from app.core.config import settings
from app.storage.base import StorageProvider


class LocalStorageProvider(StorageProvider):
    """Storage provider that stores files on the local filesystem.

    Files are stored under the configured ``UPLOAD_DIR`` directory.
    This provider is suitable for development and single-server
    deployments. For production, use S3 or Cloudinary providers.
    """

    def __init__(self) -> None:
        """Initialize the local storage provider."""
        self.base_path: Path = Path(settings.UPLOAD_DIR)
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def save_file(
        self,
        file: BinaryIO,
        file_path: str,
        content_type: str | None = None,
    ) -> str:
        """Save a file to the local filesystem.

        Args:
            file: The file binary stream.
            file_path: The relative path within the upload directory.
            content_type: The MIME type (not used for local storage).

        Returns:
            The relative file path as the URL.
        """
        full_path = self.base_path / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)

        with open(full_path, "wb") as f:
            shutil.copyfileobj(file, f)

        logger.info("File saved: {}", file_path)
        return file_path

    async def delete_file(self, file_path: str) -> bool:
        """Delete a file from the local filesystem.

        Args:
            file_path: The relative path within the upload directory.

        Returns:
            True if deleted, False if the file does not exist.
        """
        full_path = self.base_path / file_path
        if not full_path.exists():
            return False

        full_path.unlink()
        logger.info("File deleted: {}", file_path)

        # Remove empty parent directories
        parent = full_path.parent
        while parent != self.base_path and not any(parent.iterdir()):
            parent.rmdir()
            parent = parent.parent

        return True

    async def move_file(self, source_path: str, dest_path: str) -> bool:
        """Move or rename a file within the local filesystem.

        Args:
            source_path: The current relative path.
            dest_path: The new relative path.

        Returns:
            True if moved successfully, False otherwise.
        """
        source_full = self.base_path / source_path
        dest_full = self.base_path / dest_path

        if not source_full.exists():
            return False

        dest_full.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(source_full), str(dest_full))

        logger.info("File moved: {} -> {}", source_path, dest_path)
        return True

    async def file_exists(self, file_path: str) -> bool:
        """Check if a file exists on the local filesystem.

        Args:
            file_path: The relative path to check.

        Returns:
            True if the file exists, False otherwise.
        """
        return (self.base_path / file_path).exists()

    async def generate_url(self, file_path: str) -> str:
        """Generate a URL for a locally stored file.

        For local storage, this returns the relative path.
        In production with a reverse proxy, this would return
        the full static URL.

        Args:
            file_path: The relative path to the file.

        Returns:
            The relative file path.
        """
        return f"/uploads/{file_path}"

    async def generate_thumbnail(self, file_path: str) -> str | None:
        """Generate a thumbnail for an image file (placeholder).

        Args:
            file_path: The path to the source image.

        Returns:
            None until thumbnail generation is implemented.
        """
        return None