"""Application-wide enumerations for domain constants."""

from __future__ import annotations

from enum import Enum


class UserRole(str, Enum):
    """User role hierarchy for access control."""

    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    EDITOR = "editor"


class MediaType(str, Enum):
    """Supported media file types."""

    IMAGE = "image"
    VIDEO = "video"
    DOCUMENT = "document"


class PageStatus(str, Enum):
    """Content publication status values."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    DRAFT = "draft"
    PUBLISHED = "published"