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

_backend_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_backend_root))

from app.bootstrap.seed_runner import run_all_seeds


if __name__ == "__main__":
    asyncio.run(run_all_seeds())
