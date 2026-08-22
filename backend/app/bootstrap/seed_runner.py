"""Background-safe database seeding for first-time bootstrap."""

from __future__ import annotations

import asyncio
import sys
from enum import StrEnum
from pathlib import Path

from loguru import logger

from app.core.config import settings
from app.core.database import async_session_factory
from app.db.seed import seed_super_admin

_SCRIPTS_DIR = Path(__file__).resolve().parent.parent.parent / "scripts"
if str(_SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS_DIR))

from seed_media import clear_storage_before_seed  # noqa: E402
from seed_packages import seed_dataset as seed_packages_dataset  # noqa: E402
from seed_website import seed_dataset as seed_website_dataset  # noqa: E402

SEED_LOCK_KEY = "bootstrap:seed:lock"
SEED_STATUS_KEY = "bootstrap:seed:status"
SEED_LOCK_TTL_SECONDS = 3600


class SeedStatus(StrEnum):
    IDLE = "idle"
    RUNNING = "running"
    COMPLETE = "complete"
    FAILED = "failed"
    SKIPPED = "skipped"


async def _get_redis():
    try:
        import redis.asyncio as redis

        client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        await client.ping()
        return client
    except Exception as exc:
        logger.warning("Redis unavailable for seed coordination: {}", exc)
        return None


async def get_seed_status() -> str:
    """Return current bootstrap seed status from Redis (or idle)."""
    client = await _get_redis()
    if client is None:
        return SeedStatus.IDLE
    try:
        value = await client.get(SEED_STATUS_KEY)
        return value or SeedStatus.IDLE
    finally:
        await client.aclose()


async def _set_seed_status(client, status: SeedStatus) -> None:
    await client.set(SEED_STATUS_KEY, status, ex=SEED_LOCK_TTL_SECONDS)


async def run_all_seeds() -> None:
    """Execute every registered seeder (idempotent)."""
    logger.info("Starting full database seed...")

    await clear_storage_before_seed()

    async with async_session_factory() as session:
        try:
            await seed_super_admin(session)
            await session.commit()
            logger.info("Admin user seed complete.")
        except Exception as exc:
            await session.rollback()
            logger.error("Admin seed failed, transaction rolled back: {}", exc)
            raise

    async with async_session_factory() as session:
        try:
            await seed_website_dataset(session)
            await session.commit()
            logger.info("Website CMS seed complete.")
        except Exception as exc:
            await session.rollback()
            logger.error("Website seed failed, transaction rolled back: {}", exc)
            raise

    async with async_session_factory() as session:
        try:
            await seed_packages_dataset(session)
            await session.commit()
            logger.info("Packages dataset seed complete.")
        except Exception as exc:
            await session.rollback()
            logger.error("Packages seed failed, transaction rolled back: {}", exc)
            raise

    logger.info("All database seeds completed successfully.")


async def _execute_seed_with_status() -> None:
    client = await _get_redis()
    if client is not None:
        await _set_seed_status(client, SeedStatus.RUNNING)
    try:
        await run_all_seeds()
        if client is not None:
            await _set_seed_status(client, SeedStatus.COMPLETE)
    except Exception as exc:
        if client is not None:
            await _set_seed_status(client, SeedStatus.FAILED)
        logger.exception("Background seed failed: {}", exc)
    finally:
        if client is not None:
            await client.aclose()


async def start_background_seed() -> None:
    """Acquire a Redis lock and run seed in the background (once per deploy)."""
    if not settings.RUN_SEED:
        logger.info("RUN_SEED=false — skipping bootstrap seed")
        return

    client = await _get_redis()
    if client is None:
        logger.warning("Redis unavailable — starting seed in background without lock")
        asyncio.create_task(_execute_seed_with_status())
        return

    try:
        acquired = await client.set(
            SEED_LOCK_KEY,
            "1",
            nx=True,
            ex=SEED_LOCK_TTL_SECONDS,
        )
        if not acquired:
            status = await client.get(SEED_STATUS_KEY)
            logger.info(
                "Bootstrap seed already handled by another worker (status={})",
                status or "unknown",
            )
            return

        asyncio.create_task(_execute_seed_with_status())
        logger.info("Bootstrap seed started in background")
    finally:
        await client.aclose()


def schedule_background_seed() -> None:
    """Fire-and-forget wrapper for lifespan startup."""
    asyncio.create_task(start_background_seed())
