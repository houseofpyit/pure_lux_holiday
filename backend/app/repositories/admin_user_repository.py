"""AdminUser repository extending BaseRepository with auth-specific queries."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.repositories.base_repository import BaseRepository
from app.models.admin_user import AdminUser


class AdminUserRepository(BaseRepository[AdminUser]):
    """Repository for AdminUser data access operations.

    Extends the generic BaseRepository with authentication-specific
    query methods such as email lookup and login tracking.
    """

    def __init__(self, session: AsyncSession) -> None:
        """Initialize the repository with the AdminUser model.

        Args:
            session: The async database session.
        """
        super().__init__(session, AdminUser)

    async def get_by_email(self, email: str) -> Optional[AdminUser]:
        """Retrieve an admin user by their email address.

        Args:
            email: The email address to search for.

        Returns:
            The AdminUser instance if found, None otherwise.
        """
        stmt = select(AdminUser).where(AdminUser.email == email)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update_last_login(self, user_id: object) -> None:
        """Update the last_login timestamp for a user.

        Args:
            user_id: The UUID of the user to update.
        """
        user = await self.get_by_id(user_id)
        if user is not None:
            user.last_login = datetime.now(timezone.utc)
            await self.session.flush()

    async def email_exists(self, email: str) -> bool:
        """Check if an email address is already registered.

        Args:
            email: The email address to check.

        Returns:
            True if the email exists, False otherwise.
        """
        return await self.exists(email=email)