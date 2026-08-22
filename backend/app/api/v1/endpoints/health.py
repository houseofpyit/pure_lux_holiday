from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.seed_runner import get_seed_status
from app.core.config import settings
from app.core.database import get_db_session

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
async def health_check(
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, str]:
    """Return application and database health for monitoring probes."""
    db_status = "healthy"
    try:
        await session.execute(text("SELECT 1"))
    except Exception:
        db_status = "unhealthy"

    status = "healthy" if db_status == "healthy" else "degraded"
    payload: dict[str, str] = {
        "status": status,
        "database": db_status,
        "version": "0.1.0",
    }
    if settings.RUN_SEED:
        payload["seed"] = await get_seed_status()
    return payload
