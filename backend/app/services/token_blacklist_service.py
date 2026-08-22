"""Token blacklist service for managing revoked JWT tokens.

Uses Redis when available, with an in-memory fallback for local development.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from loguru import logger

from app.core.config import settings


class TokenBlacklistService:
    """Service for blacklisting and validating JWT tokens."""

    _blacklisted_tokens: dict[str, float] = {}
    _redis_client: Any | None = None
    _redis_checked: bool = False

    async def _get_redis(self):
        if self._redis_checked:
            return self._redis_client

        self._redis_checked = True
        try:
            import redis.asyncio as redis

            client = redis.from_url(settings.REDIS_URL, decode_responses=True)
            await client.ping()
            self._redis_client = client
            logger.info("Token blacklist using Redis backend")
        except Exception as exc:
            logger.warning(
                "Redis unavailable for token blacklist; falling back to in-memory store: {}",
                exc,
            )
            self._redis_client = None
        return self._redis_client

    async def blacklist_token(self, token: str, exp: float) -> None:
        redis_client = await self._get_redis()
        ttl = int(exp - datetime.now(timezone.utc).timestamp())
        if redis_client is not None and ttl > 0:
            await redis_client.setex(f"token_blacklist:{token}", ttl, "1")
            return

        self._blacklisted_tokens[token] = exp

    async def is_blacklisted(self, token: str) -> bool:
        redis_client = await self._get_redis()
        if redis_client is not None:
            return bool(await redis_client.exists(f"token_blacklist:{token}"))

        self._cleanup_expired_tokens()
        return token in self._blacklisted_tokens

    def _cleanup_expired_tokens(self) -> None:
        now = datetime.now(timezone.utc).timestamp()
        expired_keys = [
            key
            for key, exp in self._blacklisted_tokens.items()
            if exp < now
        ]
        for key in expired_keys:
            del self._blacklisted_tokens[key]
