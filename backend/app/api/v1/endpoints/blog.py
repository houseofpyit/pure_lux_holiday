"""Travel Journal / Blog CMS routers."""

from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.dependencies.auth_dependencies import get_current_active_user, require_admin, require_editor
from app.schemas.auth import CurrentUserResponse
from app.schemas.blog import (
    ArticleCreate, ArticleDetailResponse, ArticleGalleryCreate, ArticleGalleryResponse,
    ArticleResponse, ArticleUpdate, BlogCategoryCreate, BlogCategoryResponse,
    BlogCategoryUpdate, BlogTagCreate, BlogTagResponse, BlogTagUpdate,
    PublicBlogResponse, RelatedArticleCreate,
)
from app.services.blog_services import (
    ArticleGalleryService, ArticleService, BlogCategoryService, BlogTagService, RelatedArticleService,
)

# ─── Categories ────────────────────────────────────────────────
cat_router = APIRouter(prefix="/blog/categories", tags=["Blog - Categories"])

@cat_router.get("", response_model=list[BlogCategoryResponse])
async def list_categories(session: AsyncSession = Depends(get_db_session)) -> list[BlogCategoryResponse]:
    return await BlogCategoryService(session).get_all()

@cat_router.post("", response_model=BlogCategoryResponse, status_code=201)
async def create_category(data: BlogCategoryCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> BlogCategoryResponse:
    return await BlogCategoryService(session).create(data)

@cat_router.patch("/{item_id}", response_model=BlogCategoryResponse)
async def update_category(item_id: uuid.UUID, data: BlogCategoryUpdate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> BlogCategoryResponse:
    return await BlogCategoryService(session).update(item_id, data)

@cat_router.delete("/{item_id}", status_code=200)
async def delete_category(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await BlogCategoryService(session).delete(item_id)
    return {"message": "Category deleted"}

# ─── Tags ──────────────────────────────────────────────────────
tag_router = APIRouter(prefix="/blog/tags", tags=["Blog - Tags"])

@tag_router.get("", response_model=list[BlogTagResponse])
async def list_tags(session: AsyncSession = Depends(get_db_session)) -> list[BlogTagResponse]:
    return await BlogTagService(session).get_all()

@tag_router.post("", response_model=BlogTagResponse, status_code=201)
async def create_tag(data: BlogTagCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> BlogTagResponse:
    return await BlogTagService(session).create(data)

@tag_router.patch("/{item_id}", response_model=BlogTagResponse)
async def update_tag(item_id: uuid.UUID, data: BlogTagUpdate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> BlogTagResponse:
    return await BlogTagService(session).update(item_id, data)

@tag_router.delete("/{item_id}", status_code=200)
async def delete_tag(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await BlogTagService(session).delete(item_id)
    return {"message": "Tag deleted"}

# ─── Articles ──────────────────────────────────────────────────
art_router = APIRouter(prefix="/blog/articles", tags=["Blog - Articles"])

@art_router.get("", response_model=list[ArticleResponse])
async def list_articles(session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> list[ArticleResponse]:
    return await ArticleService(session).get_all()

@art_router.get("/{item_id}", response_model=ArticleDetailResponse)
async def get_article(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> ArticleDetailResponse:
    return await ArticleService(session).get_by_id(item_id)

@art_router.post("", response_model=ArticleDetailResponse, status_code=201)
async def create_article(data: ArticleCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> ArticleDetailResponse:
    return await ArticleService(session).create(data)

@art_router.patch("/{item_id}", response_model=ArticleDetailResponse)
async def update_article(item_id: uuid.UUID, data: ArticleUpdate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> ArticleDetailResponse:
    return await ArticleService(session).update(item_id, data)

@art_router.delete("/{item_id}", status_code=200)
async def delete_article(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await ArticleService(session).delete(item_id)
    return {"message": "Article deleted"}

@art_router.put("/{item_id}/publish", response_model=ArticleDetailResponse)
async def publish_article(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> ArticleDetailResponse:
    return await ArticleService(session).publish(item_id)

@art_router.put("/{item_id}/unpublish", response_model=ArticleDetailResponse)
async def unpublish_article(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> ArticleDetailResponse:
    return await ArticleService(session).unpublish(item_id)

# ─── Gallery ───────────────────────────────────────────────────
gal_router = APIRouter(prefix="/blog/gallery", tags=["Blog - Gallery"])

@gal_router.get("/{article_id}", response_model=list[ArticleGalleryResponse])
async def list_gallery(article_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> list[ArticleGalleryResponse]:
    return await ArticleGalleryService(session).get_by_article(article_id)

@gal_router.post("/{article_id}", response_model=ArticleGalleryResponse, status_code=201)
async def add_gallery(article_id: uuid.UUID, data: ArticleGalleryCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> ArticleGalleryResponse:
    return await ArticleGalleryService(session).create(article_id, data)

@gal_router.delete("/{item_id}", status_code=200)
async def delete_gallery(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await ArticleGalleryService(session).delete(item_id)
    return {"message": "Gallery item deleted"}

# ─── Related Articles ──────────────────────────────────────────
@art_router.post("/{article_id}/related", status_code=201)
async def add_related(article_id: uuid.UUID, data: RelatedArticleCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)):
    await RelatedArticleService(session).create(article_id, data)
    return {"message": "Related article added"}

# ─── Public Endpoints ──────────────────────────────────────────
pub_router = APIRouter(prefix="/public", tags=["Public"])

@pub_router.get("/blog", response_model=PublicBlogResponse, summary="Get blog for homepage")
async def get_public_blog(session: AsyncSession = Depends(get_db_session)) -> PublicBlogResponse:
    return await ArticleService(session).get_public()

@pub_router.get("/blog/{slug}", response_model=ArticleDetailResponse, summary="Get article by slug")
async def get_public_article(slug: str, session: AsyncSession = Depends(get_db_session)) -> ArticleDetailResponse:
    return await ArticleService(session).get_by_slug(slug)

@pub_router.get("/blog/categories/{slug}", response_model=list[ArticleResponse], summary="Get articles by category")
async def get_articles_by_category(slug: str, session: AsyncSession = Depends(get_db_session)) -> list[ArticleResponse]:
    return await ArticleService(session).get_by_category_slug(slug)

@pub_router.get("/blog/tags/{slug}", response_model=list[ArticleResponse], summary="Get articles by tag")
async def get_articles_by_tag(slug: str, session: AsyncSession = Depends(get_db_session)) -> list[ArticleResponse]:
    return await ArticleService(session).get_by_tag_slug(slug)