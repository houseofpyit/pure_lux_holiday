"""Database seed modules.

Each seeder is an async function that accepts an ``AsyncSession`` and is
idempotent — safe to call multiple times without creating duplicates.

Usage (from the CLI runner ``scripts/seed.py``)::

    python scripts/seed.py
"""

from __future__ import annotations

from app.db.seed.admin_user_seed import seed_super_admin

__all__ = ["seed_super_admin"]
