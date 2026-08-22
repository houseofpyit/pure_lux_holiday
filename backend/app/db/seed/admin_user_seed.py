"""Idempotent seed for the initial super-admin user.

Running this seed multiple times is safe — it checks for an existing
record by email before inserting. No duplicates will be created.
"""

from __future__ import annotations

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants.enums import UserRole
from app.core.config import settings
from app.core.security import hash_password
from app.repositories.admin_user_repository import AdminUserRepository


async def seed_super_admin(session: AsyncSession) -> None:
    """Create the default super-admin account if it does not already exist."""
    if settings.is_production and not settings.SEED_ADMIN_PASSWORD:
        logger.info("Super-admin seed skipped in production — SEED_ADMIN_PASSWORD is not set")
        return

    email = settings.SEED_ADMIN_EMAIL
    password = settings.SEED_ADMIN_PASSWORD or "Admin@123"

    repo = AdminUserRepository(session)
    existing = await repo.get_by_email(email)
    if existing is not None:
        logger.info(
            "Super-admin seed skipped — user '{}' already exists (id={})",
            email,
            existing.id,
        )
        return

    user = await repo.create(
        name=settings.SEED_ADMIN_NAME,
        email=email,
        password_hash=hash_password(password),
        role=UserRole.SUPER_ADMIN,
        is_active=True,
    )

    logger.info(
        "Super-admin seed complete — created user '{}' with id={}",
        user.email,
        user.id,
    )
