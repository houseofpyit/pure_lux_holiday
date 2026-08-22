"""Pure Luxe Holidays Backend - FastAPI Application.

This is the main entry point for the Pure Luxe Holidays
backend service. It initializes the FastAPI application
with appropriate middleware, routes, and lifecycle management.
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import router as api_v1_router
from app.core.config import settings
from app.core.lifespan import lifespan
from app.core.logger import setup_logging
from app.middleware.redirect_middleware import RedirectMiddleware

# Initialize logging on module import
setup_logging()

app: FastAPI = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    description="Enterprise-grade backend API for Pure Luxe Holidays",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan,
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.TRUSTED_HOSTS if not settings.DEBUG else ["*"],
)

app.add_middleware(RedirectMiddleware)

# API Routers
app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)

# Public robots.txt endpoint
from app.api.v1.endpoints.seo import public_router as seo_public_router
app.include_router(seo_public_router, prefix="", tags=["SEO - Public"])

# Local uploads are served by FastAPI. Cloudflare R2 objects are public URLs.
if not settings.uses_r2_storage:
    import os as _os

    _upload_dir = _os.path.abspath(settings.UPLOAD_DIR)
    _os.makedirs(_upload_dir, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=_upload_dir), name="uploads")