"""Database session management.

Provides session factory configuration and the standard
dependency for acquiring database sessions throughout
the application.
"""

from __future__ import annotations

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
)

from app.core.database import async_session_factory


async def get_session() -> AsyncSession:  # type: ignore[misc]
    """Create a new database session for transactional use.

    Returns:
        A new AsyncSession instance from the factory.

    Note:
        This is a low-level factory function. For request-scoped
        sessions, use ``get_db_session`` from ``app.core.database``
        which provides automatic commit/rollback handling.
    """
    async with async_session_factory() as session:
        return session