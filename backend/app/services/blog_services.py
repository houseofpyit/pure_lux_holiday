"""Blog services for Travel Journal / Blog CMS."""

from __future__ import annotations
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.blog import ArticleTag, Article
from app.repositories.blog_repositories import (
    ArticleGalleryRepository, ArticleRepository, BlogCategoryRepository,
    BlogTagRepository, RelatedArticleRepository,
)
from app.schemas.blog import (
    ArticleCreate, ArticleDetailResponse, ArticleGalleryCreate, ArticleGalleryResponse,
    ArticleResponse, ArticleUpdate, BlogCategoryCreate, BlogCategoryResponse,
    BlogCategoryUpdate, BlogTagCreate, BlogTagResponse, BlogTagUpdate,
    PublicBlogResponse, RelatedArticleCreate,
)
from app.utils.media.media_validation import validate_media_ids


class BlogCategoryService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = BlogCategoryRepository(session)

    async def get_all(self) -> list[BlogCategoryResponse]:
        items = await self.repo.get_all(order_by="display_order")
        return [BlogCategoryResponse.model_validate(i) for i in items]

    async def create(self, data: BlogCategoryCreate) -> BlogCategoryResponse:
        if await self.repo.slug_exists(data.slug):
            raise HTTPException(409, f"Slug '{data.slug}' already exists")
        item = await self.repo.create(**data.model_dump())
        return BlogCategoryResponse.model_validate(item)

    async def update(self, item_id: uuid.UUID, data: BlogCategoryUpdate) -> BlogCategoryResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Category not found")
        if data.slug and data.slug != item.slug and await self.repo.slug_exists(data.slug, exclude_id=item_id):
            raise HTTPException(409, f"Slug '{data.slug}' already exists")
        update_data = data.model_dump(exclude_unset=True)
        if update_data:
            item = await self.repo.update(item, **update_data)
        return BlogCategoryResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Category not found")
        await self.repo.delete(item)


class BlogTagService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = BlogTagRepository(session)

    async def get_all(self) -> list[BlogTagResponse]:
        items = await self.repo.get_all(order_by="name")
        return [BlogTagResponse.model_validate(i) for i in items]

    async def create(self, data: BlogTagCreate) -> BlogTagResponse:
        if await self.repo.slug_exists(data.slug):
            raise HTTPException(409, f"Slug '{data.slug}' already exists")
        item = await self.repo.create(**data.model_dump())
        return BlogTagResponse.model_validate(item)

    async def update(self, item_id: uuid.UUID, data: BlogTagUpdate) -> BlogTagResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Tag not found")
        if data.slug and data.slug != item.slug and await self.repo.slug_exists(data.slug, exclude_id=item_id):
            raise HTTPException(409, f"Slug '{data.slug}' already exists")
        update_data = data.model_dump(exclude_unset=True)
        if update_data:
            item = await self.repo.update(item, **update_data)
        return BlogTagResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Tag not found")
        await self.repo.delete(item)


class ArticleService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = ArticleRepository(session)
        self.gallery_repo = ArticleGalleryRepository(session)
        self.related_repo = RelatedArticleRepository(session)

    async def _attach_tags(self, article: Article, tag_ids: list[str]) -> None:
        stmt = select(ArticleTag).where(ArticleTag.article_id == article.id)
        result = await self.repo.session.execute(stmt)
        existing = {r.tag_id for r in result.scalars().unique().all()}
        new_ids = {uuid.UUID(t) for t in tag_ids}
        to_remove = existing - new_ids
        to_add = new_ids - existing
        if to_remove:
            for tid in to_remove:
                stmt = select(ArticleTag).where(ArticleTag.article_id == article.id, ArticleTag.tag_id == tid)
                r = await self.repo.session.execute(stmt)
                at = r.scalar_one_or_none()
                if at:
                    await self.repo.session.delete(at)
        for tid in to_add:
            self.repo.session.add(ArticleTag(article_id=article.id, tag_id=tid))

    async def _load_tags(self, article: Article) -> list:
        stmt = select(ArticleTag).where(ArticleTag.article_id == article.id)
        result = await self.repo.session.execute(stmt)
        tag_ids = [r.tag_id for r in result.scalars().unique().all()]
        if not tag_ids:
            return []
        from app.models.blog.tag import BlogTag
        tag_stmt = select(BlogTag).where(BlogTag.id.in_(tag_ids))
        tag_result = await self.repo.session.execute(tag_stmt)
        return list(tag_result.scalars().unique().all())

    async def _build_response(self, article: Article) -> ArticleResponse:
        tags = await self._load_tags(article)
        resp = ArticleResponse.model_validate(article)
        resp.tags = [BlogTagResponse.model_validate(t) for t in tags]
        return resp

    async def _build_detail(self, article: Article) -> ArticleDetailResponse:
        tags = await self._load_tags(article)
        gallery = await self.gallery_repo.get_by_article(article.id)
        related = await self.related_repo.get_by_article(article.id)
        resp = ArticleDetailResponse.model_validate(article)
        resp.tags = [BlogTagResponse.model_validate(t) for t in tags]
        resp.gallery = [ArticleGalleryResponse.model_validate(g) for g in gallery]
        related_articles = []
        for r in related:
            ra = await self.repo.get_by_id(r.related_article_id)
            if ra:
                related_articles.append(await self._build_response(ra))
        resp.related_articles = related_articles
        return resp

    async def get_all(self) -> list[ArticleResponse]:
        items = await self.repo.get_all(order_by="created_at")
        result = []
        for item in items:
            result.append(await self._build_response(item))
        return result

    async def get_by_id(self, item_id: uuid.UUID) -> ArticleDetailResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Article not found")
        return await self._build_detail(item)

    async def create(self, data: ArticleCreate) -> ArticleDetailResponse:
        if await self.repo.slug_exists(data.slug):
            raise HTTPException(409, f"Slug '{data.slug}' already exists")
        tag_ids = data.tag_ids
        kwargs = data.model_dump(exclude={"tag_ids"})
        await validate_media_ids(self.repo.session, {
            "featured_image_id": kwargs.get("featured_image_id"),
            "banner_image_id": kwargs.get("banner_image_id"),
        })
        if kwargs.get("category_id"):
            kwargs["category_id"] = uuid.UUID(kwargs["category_id"])
        if kwargs.get("featured_image_id"):
            kwargs["featured_image_id"] = uuid.UUID(kwargs["featured_image_id"])
        if kwargs.get("banner_image_id"):
            kwargs["banner_image_id"] = uuid.UUID(kwargs["banner_image_id"])
        article = await self.repo.create(**kwargs)
        if tag_ids:
            await self._attach_tags(article, tag_ids)
        return await self._build_detail(article)

    async def update(self, item_id: uuid.UUID, data: ArticleUpdate) -> ArticleDetailResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Article not found")
        if data.slug and data.slug != item.slug and await self.repo.slug_exists(data.slug, exclude_id=item_id):
            raise HTTPException(409, f"Slug '{data.slug}' already exists")
        await validate_media_ids(self.repo.session, {
            "featured_image_id": data.featured_image_id,
            "banner_image_id": data.banner_image_id,
        })
        kwargs = data.model_dump(exclude={"tag_ids", "category_id", "featured_image_id", "banner_image_id"}, exclude_unset=True)
        if data.category_id:
            kwargs["category_id"] = uuid.UUID(data.category_id)
        if data.featured_image_id:
            kwargs["featured_image_id"] = uuid.UUID(data.featured_image_id)
        if data.banner_image_id:
            kwargs["banner_image_id"] = uuid.UUID(data.banner_image_id)
        if kwargs:
            item = await self.repo.update(item, **kwargs)
        if data.tag_ids is not None:
            await self._attach_tags(item, data.tag_ids)
        return await self._build_detail(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Article not found")
        await self.repo.delete(item)

    async def publish(self, item_id: uuid.UUID) -> ArticleDetailResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Article not found")
        item.status = "published"
        item.published_at = datetime.now(timezone.utc)
        await self.repo.session.flush()
        return await self._build_detail(item)

    async def unpublish(self, item_id: uuid.UUID) -> ArticleDetailResponse:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Article not found")
        item.status = "draft"
        await self.repo.session.flush()
        return await self._build_detail(item)

    async def get_public(self) -> PublicBlogResponse:
        homepage_featured = await self.repo.get_homepage_featured()
        featured = await self.repo.get_featured()
        latest = await self.repo.get_latest()
        popular = await self.repo.get_popular()
        return PublicBlogResponse(
            homepage_featured=[await self._build_response(a) for a in homepage_featured],
            featured=[await self._build_response(a) for a in featured],
            latest=[await self._build_response(a) for a in latest],
            popular=[await self._build_response(a) for a in popular],
        )

    async def get_by_slug(self, slug: str) -> ArticleDetailResponse:
        item = await self.repo.get_by_slug(slug)
        if item is None or item.status != "published":
            raise HTTPException(404, "Article not found")
        item.views_count += 1
        await self.repo.session.flush()
        return await self._build_detail(item)

    async def get_by_category_slug(self, slug: str) -> list[ArticleResponse]:
        items = await self.repo.get_by_category_slug(slug)
        return [await self._build_response(a) for a in items]

    async def get_by_tag_slug(self, slug: str) -> list[ArticleResponse]:
        items = await self.repo.get_by_tag_slug(slug)
        return [await self._build_response(a) for a in items]


class ArticleGalleryService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = ArticleGalleryRepository(session)

    async def get_by_article(self, article_id: uuid.UUID) -> list[ArticleGalleryResponse]:
        items = await self.repo.get_by_article(article_id)
        return [ArticleGalleryResponse.model_validate(i) for i in items]

    async def create(self, article_id: uuid.UUID, data: ArticleGalleryCreate) -> ArticleGalleryResponse:
        kwargs = data.model_dump()
        kwargs["media_id"] = uuid.UUID(kwargs["media_id"])
        item = await self.repo.create(article_id=article_id, **kwargs)
        return ArticleGalleryResponse.model_validate(item)

    async def delete(self, item_id: uuid.UUID) -> None:
        item = await self.repo.get_by_id(item_id)
        if item is None:
            raise HTTPException(404, "Gallery item not found")
        await self.repo.delete(item)


class RelatedArticleService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = RelatedArticleRepository(session)

    async def create(self, article_id: uuid.UUID, data: RelatedArticleCreate) -> None:
        if article_id == uuid.UUID(data.related_article_id):
            raise HTTPException(400, "Article cannot reference itself")
        item = await self.repo.create(article_id=article_id, related_article_id=uuid.UUID(data.related_article_id), display_order=data.display_order)