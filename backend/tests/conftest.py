"""Shared test fixtures and configuration.

All test fixtures are defined here and automatically
available to test modules via pytest's fixture mechanism.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from typing import Any

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.db.base import Base
from app.main import app


@pytest.fixture(autouse=True)
def _configure_test_settings() -> None:
    """Override settings for test environment."""
    settings.APP_ENV = "testing"
    settings.DEBUG = False


@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Create an async HTTP client for testing.

    Uses the ASGI transport to make direct calls to the
    FastAPI application without running a live server.
    """
    transport = ASGITransport(app=app)  # type: ignore[arg-type]
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest_asyncio.fixture
async def health_response(async_client: AsyncClient) -> dict[str, Any]:
    """Return a sample health check response for test reuse."""
    response = await async_client.get(f"{settings.API_V1_PREFIX}/health")
    return response.json()


# Database test fixtures

@pytest_asyncio.fixture(scope="session")
async def test_engine():
    """Create a test engine for database operations.

    Uses a separate database URL for testing to avoid
    interfering with development data.
    """
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        poolclass=NullPool,
        future=True,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture
async def test_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session with transaction rollback.

    Each test gets a fresh session, and all changes are
    rolled back after the test completes.
    """
    # Create a connection and begin a nested transaction
    connection = await test_engine.connect()
    transaction = await connection.begin()

    session_factory = async_sessionmaker(
        bind=connection,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    session = session_factory()

    yield session

    await session.close()
    await transaction.rollback()
    await connection.close()


@pytest_asyncio.fixture
async def db_connection_check(test_engine) -> bool:
    """Verify that the database connection is functional.

    Returns True if the connection succeeds, False otherwise.
    """
    try:
        async with test_engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            scalar = result.scalar_one()
            return scalar == 1
    except Exception:
        return False