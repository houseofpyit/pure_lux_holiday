"""Storage provider factory for creating the appropriate storage backend."""

from __future__ import annotations

from loguru import logger

from app.core.config import settings
from app.storage.base import StorageProvider
from app.storage.local import LocalStorageProvider

_storage_provider: StorageProvider | None = None


def get_storage_provider() -> StorageProvider:
    """Get or create the configured storage provider instance.

    Returns local filesystem storage by default, or Cloudflare R2
    when ``STORAGE_BACKEND=r2``.
    """
    global _storage_provider

    if _storage_provider is None:
        if settings.uses_r2_storage:
            from app.storage.r2 import R2StorageProvider

            _storage_provider = R2StorageProvider()
            logger.info("Using Cloudflare R2 storage backend")
        else:
            _storage_provider = LocalStorageProvider()
            logger.info("Using local filesystem storage backend")

    return _storage_provider
