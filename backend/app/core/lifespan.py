from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from loguru import logger

from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Manage the application lifecycle.

    Handles startup and shutdown procedures including
    database connections, cache initialization, and
    resource cleanup.

    Args:
        app: The FastAPI application instance.
    """
    logger.info("Starting {} in {} mode", settings.APP_NAME, settings.APP_ENV)

    # Startup
    # Database connection pool is lazily created by SQLAlchemy
    # Additional startup tasks (cache warmup, connection checks)
    # should be added here in future phases

    yield

    # Shutdown
    logger.info("Shutting down {} application", settings.APP_NAME)
    # Database engine disposal and connection cleanup
    # should be added here in future phases