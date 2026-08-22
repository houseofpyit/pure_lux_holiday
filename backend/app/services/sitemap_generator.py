"""Generate XML sitemap from CMS content and SEO settings."""

from __future__ import annotations

from datetime import datetime, timezone
from xml.etree.ElementTree import Element, SubElement, tostring

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.blog.article import Article
from app.models.packages.package import Package
from app.models.seo.page_seo import PageSEO
from app.models.seo.sitemap_settings import SitemapSettings
from app.models.seo.seo_settings import SEOSettings
from app.repositories.seo_repositories import SitemapRepository, SEOSettingsRepository


def _fmt_date(dt: datetime | None) -> str:
    if not dt:
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.strftime("%Y-%m-%d")


def _add_url(urlset: Element, loc: str, *, lastmod: str, changefreq: str, priority: str) -> None:
    url = SubElement(urlset, "url")
    SubElement(url, "loc").text = loc
    SubElement(url, "lastmod").text = lastmod
    SubElement(url, "changefreq").text = changefreq
    SubElement(url, "priority").text = priority


class SitemapGeneratorService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.sitemap_repo = SitemapRepository(session)
        self.seo_repo = SEOSettingsRepository(session)

    async def generate_xml(self) -> str:
        settings: SitemapSettings = await self.sitemap_repo.get_singleton()
        seo: SEOSettings = await self.seo_repo.get_singleton()
        base = (seo.website_url or seo.canonical_url or "https://pureluxeholidays.com").rstrip("/")

        urlset = Element("urlset")
        urlset.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")

        default_priority = str(float(settings.default_priority or 0.5))
        default_freq = settings.default_change_frequency or "weekly"

        if settings.enabled and settings.include_pages:
            pages = (
                await self.session.execute(
                    select(PageSEO).where(PageSEO.is_active.is_(True)).order_by(PageSEO.page_key)
                )
            ).scalars().all()
            for page in pages:
                if page.include_in_sitemap is False:
                    continue
                path = page.slug or f"/{page.page_key.replace('_', '-')}"
                if not path.startswith("/"):
                    path = f"/{path}"
                _add_url(
                    urlset,
                    f"{base}{path}",
                    lastmod=_fmt_date(page.updated_at),
                    changefreq=page.change_frequency or default_freq,
                    priority=str(float(page.priority or default_priority)),
                )

        if settings.enabled and settings.include_packages:
            packages = (
                await self.session.execute(
                    select(Package).where(Package.is_active.is_(True)).order_by(Package.slug)
                )
            ).scalars().all()
            for pkg in packages:
                if not pkg.slug:
                    continue
                _add_url(
                    urlset,
                    f"{base}/packages/{pkg.slug}",
                    lastmod=_fmt_date(pkg.updated_at),
                    changefreq="weekly",
                    priority="0.8",
                )

        if settings.enabled and settings.include_blog:
            articles = (
                await self.session.execute(
                    select(Article).where(Article.status == "published").order_by(Article.slug)
                )
            ).scalars().all()
            for article in articles:
                if not article.slug:
                    continue
                _add_url(
                    urlset,
                    f"{base}/journal/{article.slug}",
                    lastmod=_fmt_date(article.updated_at or article.published_at),
                    changefreq="monthly",
                    priority="0.7",
                )

        return '<?xml version="1.0" encoding="UTF-8"?>\n' + tostring(urlset, encoding="unicode")
