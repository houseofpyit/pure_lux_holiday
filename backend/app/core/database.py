from __future__ import annotations

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import AsyncAdaptedQueuePool, NullPool

from app.core.config import settings

pool_config = {
    "pool_size": 20,
    "max_overflow": 10,
    "pool_timeout": 30,
    "pool_pre_ping": True,
}

_engine_kwargs: dict[str, object] = {
    "echo": settings.DEBUG,
    "future": True,
}

if settings.is_testing:
    # No connection pooling for tests
    _engine_kwargs["poolclass"] = NullPool
else:
    _engine_kwargs["poolclass"] = AsyncAdaptedQueuePool
    _engine_kwargs.update(pool_config)

engine = create_async_engine(
    settings.DATABASE_URL,
    **_engine_kwargs,
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide a database session for dependency injection.

    Yields an async session and ensures it is properly closed
    after the request completes, even if an error occurs.
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()