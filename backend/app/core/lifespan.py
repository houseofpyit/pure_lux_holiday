from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from loguru import logger

from app.core.config import settings
from app.bootstrap.seed_runner import get_seed_status, schedule_background_seed


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

    schedule_background_seed()

    yield

    # Shutdown
    logger.info("Shutting down {} application", settings.APP_NAME)
    # Database engine disposal and connection cleanup
    # should be added here in future phases