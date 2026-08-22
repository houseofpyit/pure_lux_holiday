#!/usr/bin/env python
"""Standalone seed runner.

Run from the backend directory with the virtualenv activated::

    python scripts/seed.py

All seeders are idempotent — running the script multiple times is safe.
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

# Ensure the backend root and scripts dir are on the Python path.
_backend_root = Path(__file__).resolve().parent.parent
_scripts_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(_backend_root))
sys.path.insert(0, str(_scripts_dir))

from loguru import logger

from app.core.database import async_session_factory
from app.db.seed import seed_super_admin
from seed_packages import seed_dataset as seed_packages_dataset
from seed_website import seed_dataset as seed_website_dataset


async def run_all_seeds() -> None:
    """Execute every registered seeder."""
    logger.info("Starting full database seed...")

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


if __name__ == "__main__":
    asyncio.run(run_all_seeds())
