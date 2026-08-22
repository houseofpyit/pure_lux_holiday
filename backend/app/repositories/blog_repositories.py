"""Blog repositories for Travel Journal / Blog CMS."""

from __future__ import annotations
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.repositories.base_repository import BaseRepository
from app.models.blog import Article, ArticleGallery, ArticleTag, BlogCategory, BlogTag, RelatedArticle


class BlogCategoryRepository(BaseRepository[BlogCategory]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, BlogCategory)
    async def slug_exists(self, slug: str, exclude_id: Optional[object] = None) -> bool:
        stmt = select(BlogCategory).where(BlogCategory.slug == slug)
        if exclude_id is not None:
            stmt = stmt.where(BlogCategory.id != exclude_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None


class BlogTagRepository(BaseRepository[BlogTag]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, BlogTag)
    async def slug_exists(self, slug: str, exclude_id: Optional[object] = None) -> bool:
        stmt = select(BlogTag).where(BlogTag.slug == slug)
        if exclude_id is not None:
            stmt = stmt.where(BlogTag.id != exclude_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None


class ArticleRepository(BaseRepository[Article]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Article)
    async def slug_exists(self, slug: str, exclude_id: Optional[object] = None) -> bool:
        stmt = select(Article).where(Article.slug == slug)
        if exclude_id is not None:
            stmt = stmt.where(Article.id != exclude_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None
    async def get_featured(self) -> list[Article]:
        stmt = select(Article).where(Article.is_featured.is_(True), Article.status == "published").order_by(Article.published_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())
    async def get_homepage_featured(self, limit: int = 3) -> list[Article]:
        stmt = (
            select(Article)
            .where(Article.homepage_featured.is_(True), Article.status == "published")
            .order_by(Article.published_at.desc())
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())
    async def get_latest(self, limit: int = 6) -> list[Article]:
        stmt = select(Article).where(Article.status == "published").order_by(Article.published_at.desc()).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())
    async def get_popular(self, limit: int = 6) -> list[Article]:
        stmt = select(Article).where(Article.status == "published").order_by(Article.views_count.desc()).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())
    async def get_by_slug(self, slug: str) -> Optional[Article]:
        stmt = select(Article).where(Article.slug == slug)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    async def get_by_category_slug(self, slug: str) -> list[Article]:
        from app.models.blog.category import BlogCategory
        cat_stmt = select(BlogCategory).where(BlogCategory.slug == slug)
        cat_result = await self.session.execute(cat_stmt)
        cat = cat_result.scalar_one_or_none()
        if cat is None:
            return []
        stmt = select(Article).where(Article.category_id == cat.id, Article.status == "published").order_by(Article.published_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())
    async def get_by_tag_slug(self, slug: str) -> list[Article]:
        tag_stmt = select(BlogTag).where(BlogTag.slug == slug)
        tag_result = await self.session.execute(tag_stmt)
        tag = tag_result.scalar_one_or_none()
        if tag is None:
            return []
        at_stmt = select(ArticleTag).where(ArticleTag.tag_id == tag.id)
        at_result = await self.session.execute(at_stmt)
        article_ids = [row.article_id for row in at_result.scalars().unique().all()]
        if not article_ids:
            return []
        stmt = select(Article).where(Article.id.in_(article_ids), Article.status == "published").order_by(Article.published_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())


class ArticleGalleryRepository(BaseRepository[ArticleGallery]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, ArticleGallery)
    async def get_by_article(self, article_id: object) -> list[ArticleGallery]:
        stmt = select(ArticleGallery).where(ArticleGallery.article_id == article_id).order_by(ArticleGallery.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())


class RelatedArticleRepository(BaseRepository[RelatedArticle]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, RelatedArticle)
    async def get_by_article(self, article_id: object) -> list[RelatedArticle]:
        stmt = select(RelatedArticle).where(RelatedArticle.article_id == article_id).order_by(RelatedArticle.display_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())