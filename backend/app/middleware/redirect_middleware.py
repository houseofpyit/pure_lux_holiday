"""Apply stored URL redirects before route handlers run."""

from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import RedirectResponse, Response

from app.core.database import async_session_factory
from app.repositories.seo_repositories import RedirectRepository


class RedirectMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path

        if path.startswith("/api") or path.startswith("/uploads") or path.startswith("/docs"):
            return await call_next(request)

        async with async_session_factory() as session:
            repo = RedirectRepository(session)
            redirect = await repo.get_active_by_source(path)

        if redirect:
            status = redirect.redirect_type if redirect.redirect_type in (301, 302, 307, 308) else 301
            destination = redirect.destination_path
            if destination.startswith("/"):
                destination = str(request.base_url).rstrip("/") + destination
            return RedirectResponse(url=destination, status_code=status)

        return await call_next(request)
