"""Abstract storage provider interface for file operations.

Defines the contract that all storage backends must implement.
Supports local filesystem, S3, MinIO, and Cloudinary providers.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path
from typing import BinaryIO


class StorageProvider(ABC):
    """Abstract base class for storage backends."""

    @abstractmethod
    async def save_file(
        self,
        file: BinaryIO,
        file_path: str,
        content_type: str | None = None,
    ) -> str:
        """Save a file to storage and return its URL.

        Args:
            file: The file binary stream.
            file_path: The destination path within storage.
            content_type: The MIME type of the file.

        Returns:
            The public URL or path to the saved file.
        """
        ...

    @abstractmethod
    async def delete_file(self, file_path: str) -> bool:
        """Delete a file from storage.

        Args:
            file_path: The path to the file to delete.

        Returns:
            True if deleted successfully, False otherwise.
        """
        ...

    @abstractmethod
    async def move_file(self, source_path: str, dest_path: str) -> bool:
        """Move or rename a file within storage.

        Args:
            source_path: The current file path.
            dest_path: The new file path.

        Returns:
            True if moved successfully, False otherwise.
        """
        ...

    @abstractmethod
    async def file_exists(self, file_path: str) -> bool:
        """Check if a file exists in storage.

        Args:
            file_path: The path to check.

        Returns:
            True if the file exists, False otherwise.
        """
        ...

    @abstractmethod
    async def generate_url(self, file_path: str) -> str:
        """Generate a public URL for a stored file.

        Args:
            file_path: The path to the file.

        Returns:
            The public URL string.
        """
        ...

    @abstractmethod
    async def generate_thumbnail(self, file_path: str) -> str | None:
        """Generate a thumbnail for an image file.

        This is a placeholder for future implementation.

        Args:
            file_path: The path to the source image.

        Returns:
            The thumbnail URL if generated, None otherwise.
        """
        ...