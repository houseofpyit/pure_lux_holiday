#!/usr/bin/env python
"""Load backend/scripts/website_content.json into the CMS.

Idempotent: running it again updates existing rows (matched by slug, title, or
the singleton first-row pattern) instead of duplicating them.

Run from the backend directory with the virtualenv activated::

    python scripts/seed_website.py
"""

from __future__ import annotations

import asyncio
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from loguru import logger
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory
from app.models.about.about_page import AboutPage
from app.models.about.award import Award
from app.models.about.core_value import CoreValue
from app.models.about.faq import CompanyFAQ
from app.models.about.leadership import LeadershipMember
from app.models.about.partner import Partner
from app.models.about.statistic import CompanyStatistic
from app.models.about.timeline import CompanyTimeline
from app.models.blog.article import Article
from app.models.blog.article_tag import ArticleTag
from app.models.blog.category import BlogCategory
from app.models.blog.tag import BlogTag
from app.models.cms.contact_page_cms import ContactPageCMS
from app.models.cms.contact_settings import ContactSettings
from app.models.cms.cta_settings import CTASettings
from app.models.cms.footer import FooterLink, FooterSection
from app.models.cms.navigation import Navigation
from app.models.cms.site_settings import SiteSettings
from app.models.gallery.album import GalleryAlbum
from app.models.gallery.category import GalleryCategory
from app.models.gallery.item import GalleryItem
from app.models.home.about_section import HomeAboutSection
from app.models.home.collections import LuxuryCollection
from app.models.home.destinations import FeaturedDestination
from app.models.home.experiences import LuxuryExperience
from app.models.home.hero_section import HeroSection
from app.models.home.statistics import Statistic
from app.models.home.why_choose import WhyChooseUs
from app.models.packages.category import PackageCategory
from app.models.packages.exclusion import PackageExclusion
from app.models.packages.faq import PackageFAQ
from app.models.packages.gallery import PackageGallery
from app.models.packages.highlight import PackageHighlight
from app.models.packages.inclusion import PackageInclusion
from app.models.packages.itinerary import PackageItinerary
from app.models.packages.package import LuxuryPackage
from app.models.seo.page_seo import PageSEO
from app.models.seo.robots_settings import RobotsSettings
from app.models.seo.seo_settings import SEOSettings
from app.models.testimonials.testimonial import Testimonial

sys.path.insert(0, str(Path(__file__).resolve().parent))
from seed_media import get_or_create_media


def parse_dt(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    if value.endswith("Z"):
        value = value[:-1] + "+00:00"
    return datetime.fromisoformat(value)


async def get_or_create_singleton(session: AsyncSession, model):
    result = await session.execute(select(model).limit(1))
    row = result.scalar_one_or_none()
    if row:
        return row
    row = model()
    session.add(row)
    await session.flush()
    return row


async def upsert_by(session: AsyncSession, model, where, defaults: dict[str, Any]):
    result = await session.execute(select(model).where(*where))
    row = result.scalar_one_or_none()
    if not row:
        row = model(**defaults)
        session.add(row)
        await session.flush()
        return row, True
    for key, value in defaults.items():
        setattr(row, key, value)
    return row, False


async def seed_singletons(session: AsyncSession, data: dict[str, Any]) -> None:
    site = data.get("site_settings", {})
    row = await get_or_create_singleton(session, SiteSettings)
    for key in (
        "site_name",
        "tagline",
        "email",
        "phone",
        "whatsapp",
        "address",
        "google_map_url",
        "timezone",
        "default_language",
        "maintenance_mode",
        "analytics_enabled",
    ):
        if key in site:
            setattr(row, key, site[key])
    logger.info("Site settings ready: {}", row.site_name)

    contact = data.get("contact_settings", {})
    row = await get_or_create_singleton(session, ContactSettings)
    for key in (
        "email",
        "phone",
        "whatsapp",
        "address",
        "working_hours",
        "google_map_url",
        "emergency_number",
    ):
        if key in contact:
            setattr(row, key, contact[key])
    logger.info("Contact settings ready")

    seo = data.get("seo", {})
    row = await get_or_create_singleton(session, SEOSettings)
    og_id = await get_or_create_media(
        session, seo.get("default_og_image_url"), "seo_og.jpg"
    )
    for key in (
        "site_name",
        "website_url",
        "default_meta_title",
        "default_meta_description",
        "default_keywords",
        "canonical_url",
        "default_robots",
        "organization_name",
        "twitter_card",
        "schema_json",
    ):
        if key in seo:
            setattr(row, key, seo[key])
    if og_id:
        row.default_og_image_id = og_id
        row.default_twitter_image_id = og_id
    logger.info("SEO settings ready")

    cta = data.get("cta", {})
    row = await get_or_create_singleton(session, CTASettings)
    bg_id = await get_or_create_media(
        session, cta.get("background_image_url"), "cta_bg.jpg"
    )
    for key in ("title", "subtitle", "button_text", "button_url", "is_active"):
        if key in cta:
            setattr(row, key, cta[key])
    if bg_id:
        row.background_image_id = bg_id
    logger.info("CTA settings ready")

    page = data.get("contact_page", {})
    row = await get_or_create_singleton(session, ContactPageCMS)
    hero_id = await get_or_create_media(
        session, page.get("hero_background_image_url"), "contact_hero.jpg"
    )
    for key in (
        "hero_label",
        "hero_heading",
        "hero_description",
        "hero_overlay_opacity",
        "hero_is_published",
        "show_office_locations",
        "show_business_hours",
        "show_google_map",
        "show_contact_form",
        "show_social_links",
    ):
        if key in page:
            setattr(row, key, page[key])
    if hero_id:
        row.hero_background_image_id = hero_id
    logger.info("Contact page CMS ready")

    hero = data.get("hero", {})
    row = await get_or_create_singleton(session, HeroSection)
    bg_id = await get_or_create_media(
        session, hero.get("background_image_url"), "home_hero.jpg"
    )
    for key in (
        "title",
        "subtitle",
        "description",
        "button_text",
        "button_url",
        "secondary_button_text",
        "secondary_button_url",
        "overlay_opacity",
        "is_active",
    ):
        if key in hero:
            setattr(row, key, hero[key])
    if bg_id:
        row.background_image_id = bg_id
    logger.info("Hero section ready")

    about = data.get("home_about", {})
    row = await get_or_create_singleton(session, HomeAboutSection)
    image_id = await get_or_create_media(
        session, about.get("image_url"), "home_about.jpg"
    )
    for key in (
        "eyebrow",
        "heading",
        "description",
        "button_text",
        "button_url",
        "image_alt",
        "is_active",
    ):
        if key in about:
            setattr(row, key, about[key])
    if image_id:
        row.image_id = image_id
    logger.info("Home about section ready")

    about_page = data.get("about", {})
    row = await get_or_create_singleton(session, AboutPage)
    hero_id = await get_or_create_media(
        session, about_page.get("hero_image_url"), "about_hero.jpg"
    )
    for key in (
        "hero_title",
        "hero_subtitle",
        "company_description",
        "our_story",
        "mission",
        "vision",
        "seo_title",
        "seo_description",
        "is_active",
    ):
        if key in about_page:
            setattr(row, key, about_page[key])
    if hero_id:
        row.hero_image_id = hero_id
    logger.info("About page ready")


async def seed_navigation_and_footer(session: AsyncSession, data: dict[str, Any]) -> None:
    for item in data.get("navigation", []):
        _, created = await upsert_by(
            session,
            Navigation,
            (Navigation.slug == item["slug"],),
            {
                "title": item["title"],
                "slug": item["slug"],
                "url": item.get("url"),
                "order": item.get("order", 0),
                "target": item.get("target", "_self"),
                "is_active": True,
            },
        )
        logger.info("{} nav: {}", "Created" if created else "Updated", item["title"])

    for section_data in data.get("footer", []):
        section, created = await upsert_by(
            session,
            FooterSection,
            (FooterSection.title == section_data["title"],),
            {
                "title": section_data["title"],
                "order": section_data.get("order", 0),
                "is_active": True,
            },
        )
        await session.execute(
            delete(FooterLink).where(FooterLink.footer_section_id == section.id)
        )
        for link in section_data.get("links", []):
            session.add(
                FooterLink(
                    footer_section_id=section.id,
                    title=link["title"],
                    url=link["url"],
                    order=link.get("order", 0),
                    target=link.get("target", "_self"),
                )
            )
        logger.info(
            "{} footer section: {}",
            "Created" if created else "Updated",
            section.title,
        )


async def seed_home_lists(session: AsyncSession, data: dict[str, Any]) -> None:
    for item in data.get("statistics", []):
        _, created = await upsert_by(
            session,
            Statistic,
            (Statistic.title == item["title"],),
            {
                "title": item["title"],
                "value": item["value"],
                "suffix": item.get("suffix"),
                "icon": item.get("icon"),
                "display_order": item.get("display_order", 0),
                "is_active": True,
            },
        )
        logger.info("{} statistic: {}", "Created" if created else "Updated", item["title"])

    for item in data.get("why_choose_us", []):
        _, created = await upsert_by(
            session,
            WhyChooseUs,
            (WhyChooseUs.title == item["title"],),
            {
                "title": item["title"],
                "description": item.get("description"),
                "icon": item.get("icon"),
                "display_order": item.get("display_order", 0),
                "is_active": True,
            },
        )
        logger.info("{} why-choose: {}", "Created" if created else "Updated", item["title"])

    for item in data.get("collections", []):
        image_id = await get_or_create_media(
            session, item.get("image_url"), f"col_{item['slug']}.jpg"
        )
        _, created = await upsert_by(
            session,
            LuxuryCollection,
            (LuxuryCollection.slug == item["slug"],),
            {
                "title": item["title"],
                "slug": item["slug"],
                "short_description": item.get("short_description"),
                "image_id": image_id,
                "button_text": item.get("button_text", "Discover"),
                "button_url": item.get("button_url"),
                "display_order": item.get("display_order", 0),
                "is_active": True,
            },
        )
        logger.info("{} collection: {}", "Created" if created else "Updated", item["title"])

    for item in data.get("destinations", []):
        image_id = await get_or_create_media(
            session, item.get("image_url"), f"dest_{item['slug']}.jpg"
        )
        _, created = await upsert_by(
            session,
            FeaturedDestination,
            (FeaturedDestination.slug == item["slug"],),
            {
                "name": item["name"],
                "slug": item["slug"],
                "country": item.get("country"),
                "short_description": item.get("short_description"),
                "image_id": image_id,
                "button_text": item.get("button_text", "Discover"),
                "button_url": item.get("button_url"),
                "display_order": item.get("display_order", 0),
                "is_featured": item.get("is_featured", True),
                "is_active": True,
            },
        )
        logger.info("{} destination: {}", "Created" if created else "Updated", item["name"])

    for item in data.get("experiences", []):
        image_id = await get_or_create_media(
            session, item.get("image_url"), f"exp_{item['slug']}.jpg"
        )
        _, created = await upsert_by(
            session,
            LuxuryExperience,
            (LuxuryExperience.slug == item["slug"],),
            {
                "title": item["title"],
                "slug": item["slug"],
                "short_description": item.get("short_description"),
                "icon": item.get("icon"),
                "image_id": image_id,
                "button_text": item.get("button_text", "Enquire"),
                "button_url": item.get("button_url"),
                "display_order": item.get("display_order", 0),
                "is_active": True,
            },
        )
        logger.info("{} experience: {}", "Created" if created else "Updated", item["title"])


async def seed_packages(session: AsyncSession, data: dict[str, Any]) -> dict[str, Any]:
    category_ids: dict[str, Any] = {}
    for item in data.get("package_categories", []):
        row, created = await upsert_by(
            session,
            PackageCategory,
            (PackageCategory.slug == item["slug"],),
            {
                "name": item["name"],
                "slug": item["slug"],
                "description": item.get("description"),
                "display_order": item.get("display_order", 0),
                "is_active": True,
            },
        )
        category_ids[item["slug"]] = row.id
        logger.info("{} package category: {}", "Created" if created else "Updated", item["name"])

    package_ids: dict[str, Any] = {}
    for pkg in data.get("packages", []):
        slug = pkg["slug"]
        featured_image_id = await get_or_create_media(
            session,
            pkg.get("featured_image_url"),
            f"pkg_feat_{slug}.jpg",
            fallback_url=pkg.get("banner_image_url"),
        )
        banner_image_id = await get_or_create_media(
            session,
            pkg.get("banner_image_url"),
            f"pkg_banner_{slug}.jpg",
            fallback_url=pkg.get("featured_image_url"),
        )
        row, created = await upsert_by(
            session,
            LuxuryPackage,
            (LuxuryPackage.slug == slug,),
            {
                "category_id": category_ids.get(pkg.get("category_slug")),
                "title": pkg["title"],
                "slug": slug,
                "short_description": pkg.get("short_description"),
                "description": pkg.get("description"),
                "country": pkg.get("country"),
                "city": pkg.get("city"),
                "duration_days": pkg.get("duration_days", 1),
                "duration_nights": pkg.get("duration_nights", 0),
                "starting_price": pkg.get("starting_price"),
                "currency": pkg.get("currency", "USD"),
                "is_featured": pkg.get("is_featured", False),
                "is_popular": pkg.get("is_popular", False),
                "featured_image_id": featured_image_id,
                "banner_image_id": banner_image_id,
                "seo_title": pkg.get("seo_title"),
                "seo_description": pkg.get("seo_description"),
                "is_active": True,
            },
        )
        package_ids[slug] = row.id
        logger.info("{} package: {}", "Created" if created else "Updated", row.title)

        await session.execute(delete(PackageHighlight).where(PackageHighlight.package_id == row.id))
        await session.execute(delete(PackageItinerary).where(PackageItinerary.package_id == row.id))
        await session.execute(delete(PackageInclusion).where(PackageInclusion.package_id == row.id))
        await session.execute(delete(PackageExclusion).where(PackageExclusion.package_id == row.id))
        await session.execute(delete(PackageFAQ).where(PackageFAQ.package_id == row.id))
        await session.execute(delete(PackageGallery).where(PackageGallery.package_id == row.id))

        for hl in pkg.get("highlights", []):
            session.add(
                PackageHighlight(
                    package_id=row.id,
                    title=hl["title"],
                    icon=hl.get("icon"),
                    display_order=hl.get("display_order", 0),
                )
            )
        for day in pkg.get("itinerary", []):
            session.add(
                PackageItinerary(
                    package_id=row.id,
                    day_number=day["day_number"],
                    title=day["title"],
                    description=day.get("description"),
                    hotel=day.get("hotel"),
                    meal_plan=day.get("meal_plan"),
                    display_order=day.get("display_order", 0),
                )
            )
        for inc in pkg.get("inclusions", []):
            session.add(
                PackageInclusion(
                    package_id=row.id,
                    title=inc["title"],
                    display_order=inc.get("display_order", 0),
                )
            )
        for exc in pkg.get("exclusions", []):
            session.add(
                PackageExclusion(
                    package_id=row.id,
                    title=exc["title"],
                    display_order=exc.get("display_order", 0),
                )
            )
        for faq in pkg.get("faqs", []):
            session.add(
                PackageFAQ(
                    package_id=row.id,
                    question=faq["question"],
                    answer=faq.get("answer"),
                    display_order=faq.get("display_order", 0),
                )
            )
        gallery_urls = pkg.get("gallery_image_urls") or pkg.get("gallery_urls") or []
        for idx, url in enumerate(gallery_urls):
            media_id = await get_or_create_media(session, url, f"pkg_gal_{slug}_{idx}.jpg")
            session.add(
                PackageGallery(package_id=row.id, media_id=media_id, display_order=idx)
            )

    return package_ids


async def seed_about_lists(session: AsyncSession, data: dict[str, Any]) -> None:
    for item in data.get("core_values", []):
        _, created = await upsert_by(
            session,
            CoreValue,
            (CoreValue.title == item["title"],),
            {
                "title": item["title"],
                "description": item.get("description"),
                "icon": item.get("icon"),
                "display_order": item.get("display_order", 0),
                "is_active": True,
            },
        )
        logger.info("{} core value: {}", "Created" if created else "Updated", item["title"])

    for item in data.get("leadership", []):
        image_id = await get_or_create_media(
            session,
            item.get("profile_image_url"),
            f"leader_{item['name'].lower().replace(' ', '_')}.jpg",
        )
        _, created = await upsert_by(
            session,
            LeadershipMember,
            (LeadershipMember.name == item["name"],),
            {
                "name": item["name"],
                "designation": item.get("designation"),
                "bio": item.get("bio"),
                "profile_image_id": image_id,
                "email": item.get("email"),
                "display_order": item.get("display_order", 0),
                "is_active": True,
            },
        )
        logger.info("{} leadership: {}", "Created" if created else "Updated", item["name"])

    for item in data.get("timeline", []):
        _, created = await upsert_by(
            session,
            CompanyTimeline,
            (CompanyTimeline.year == item["year"], CompanyTimeline.title == item["title"]),
            {
                "year": item["year"],
                "title": item["title"],
                "description": item.get("description"),
                "display_order": item.get("display_order", 0),
            },
        )
        logger.info("{} timeline: {} {}", "Created" if created else "Updated", item["year"], item["title"])

    for item in data.get("awards", []):
        _, created = await upsert_by(
            session,
            Award,
            (Award.title == item["title"],),
            {
                "title": item["title"],
                "organization": item.get("organization"),
                "award_date": item.get("award_date"),
                "description": item.get("description"),
                "display_order": item.get("display_order", 0),
                "is_active": True,
            },
        )
        logger.info("{} award: {}", "Created" if created else "Updated", item["title"])

    for item in data.get("partners", []):
        _, created = await upsert_by(
            session,
            Partner,
            (Partner.name == item["name"],),
            {
                "name": item["name"],
                "website": item.get("website"),
                "description": item.get("description"),
                "display_order": item.get("display_order", 0),
                "is_active": True,
            },
        )
        logger.info("{} partner: {}", "Created" if created else "Updated", item["name"])

    for item in data.get("company_statistics", []):
        _, created = await upsert_by(
            session,
            CompanyStatistic,
            (CompanyStatistic.title == item["title"],),
            {
                "title": item["title"],
                "value": item["value"],
                "suffix": item.get("suffix"),
                "icon": item.get("icon"),
                "display_order": item.get("display_order", 0),
                "is_active": True,
            },
        )
        logger.info("{} company statistic: {}", "Created" if created else "Updated", item["title"])

    for item in data.get("faqs", []):
        _, created = await upsert_by(
            session,
            CompanyFAQ,
            (CompanyFAQ.question == item["question"],),
            {
                "question": item["question"],
                "answer": item.get("answer"),
                "display_order": item.get("display_order", 0),
                "is_active": True,
            },
        )
        logger.info("{} FAQ", "Created" if created else "Updated")


async def seed_blog(session: AsyncSession, data: dict[str, Any]) -> None:
    category_ids: dict[str, Any] = {}
    for item in data.get("blog_categories", []):
        row, created = await upsert_by(
            session,
            BlogCategory,
            (BlogCategory.slug == item["slug"],),
            {
                "name": item["name"],
                "slug": item["slug"],
                "description": item.get("description"),
                "display_order": item.get("display_order", 0),
                "is_active": True,
            },
        )
        category_ids[item["slug"]] = row.id
        logger.info("{} blog category: {}", "Created" if created else "Updated", item["name"])

    tag_ids: dict[str, Any] = {}
    for item in data.get("blog_tags", []):
        row, created = await upsert_by(
            session,
            BlogTag,
            (BlogTag.slug == item["slug"],),
            {"name": item["name"], "slug": item["slug"]},
        )
        tag_ids[item["slug"]] = row.id
        logger.info("{} blog tag: {}", "Created" if created else "Updated", item["name"])

    for item in data.get("articles", []):
        slug = item["slug"]
        featured_image_id = await get_or_create_media(
            session,
            item.get("featured_image_url"),
            f"article_{slug}.jpg",
            fallback_url=item.get("banner_image_url"),
        )
        banner_image_id = await get_or_create_media(
            session,
            item.get("banner_image_url"),
            f"article_banner_{slug}.jpg",
            fallback_url=item.get("featured_image_url"),
        )
        row, created = await upsert_by(
            session,
            Article,
            (Article.slug == slug,),
            {
                "category_id": category_ids.get(item.get("category_slug")),
                "title": item["title"],
                "slug": slug,
                "excerpt": item.get("excerpt"),
                "content": item.get("content"),
                "featured_image_id": featured_image_id,
                "banner_image_id": banner_image_id,
                "author_name": item.get("author_name"),
                "reading_time": item.get("reading_time", 5),
                "published_at": parse_dt(item.get("published_at")),
                "status": item.get("status", "published"),
                "is_featured": item.get("is_featured", False),
                "homepage_featured": item.get("homepage_featured", False),
            },
        )
        await session.execute(delete(ArticleTag).where(ArticleTag.article_id == row.id))
        for tag_slug in item.get("tag_slugs", []):
            tag_id = tag_ids.get(tag_slug)
            if tag_id:
                session.add(ArticleTag(article_id=row.id, tag_id=tag_id))
        logger.info("{} article: {}", "Created" if created else "Updated", row.title)


async def seed_gallery(session: AsyncSession, data: dict[str, Any]) -> None:
    category_ids: dict[str, Any] = {}
    for item in data.get("gallery_categories", []):
        row, created = await upsert_by(
            session,
            GalleryCategory,
            (GalleryCategory.slug == item["slug"],),
            {
                "name": item["name"],
                "slug": item["slug"],
                "icon": item.get("icon"),
                "display_order": item.get("display_order", 0),
                "is_active": True,
            },
        )
        category_ids[item["slug"]] = row.id
        logger.info("{} gallery category: {}", "Created" if created else "Updated", item["name"])

    for album in data.get("gallery_albums", []):
        cover_id = await get_or_create_media(
            session, album.get("cover_image_url"), f"album_{album['slug']}.jpg"
        )
        row, created = await upsert_by(
            session,
            GalleryAlbum,
            (GalleryAlbum.slug == album["slug"],),
            {
                "category_id": category_ids.get(album.get("category_slug")),
                "title": album["title"],
                "slug": album["slug"],
                "description": album.get("description"),
                "cover_media_id": cover_id,
                "country": album.get("country"),
                "city": album.get("city"),
                "featured": album.get("featured", False),
                "homepage_featured": album.get("homepage_featured", False),
                "display_order": album.get("display_order", 0),
                "is_active": True,
            },
        )
        await session.execute(delete(GalleryItem).where(GalleryItem.album_id == row.id))
        for idx, item in enumerate(album.get("items", [])):
            media_id = await get_or_create_media(
                session, item.get("image_url"), f"gal_{album['slug']}_{idx}.jpg"
            )
            session.add(
                GalleryItem(
                    album_id=row.id,
                    media_id=media_id,
                    title=item.get("title"),
                    media_type="image",
                    display_order=item.get("display_order", idx),
                    is_featured=item.get("is_featured", False),
                )
            )
        logger.info("{} gallery album: {}", "Created" if created else "Updated", album["title"])


async def seed_testimonials(
    session: AsyncSession, data: dict[str, Any], package_ids: dict[str, Any]
) -> None:
    for item in data.get("testimonials", []):
        profile_id = await get_or_create_media(
            session,
            item.get("profile_image_url"),
            f"testimonial_{item['customer_name'].lower().replace(' ', '_')}.jpg",
        )
        background_id = await get_or_create_media(
            session,
            item.get("background_image_url"),
            f"testimonial_bg_{item['customer_name'].lower().replace(' ', '_')}.jpg",
        )
        _, created = await upsert_by(
            session,
            Testimonial,
            (Testimonial.customer_name == item["customer_name"],),
            {
                "package_id": package_ids.get(item.get("package_slug")),
                "destination_slug": item.get("destination_slug"),
                "customer_name": item["customer_name"],
                "customer_location": item.get("customer_location"),
                "customer_designation": item.get("customer_designation"),
                "rating": item.get("rating", 5),
                "title": item.get("title"),
                "review": item.get("review"),
                "profile_image_id": profile_id,
                "background_image_id": background_id,
                "travel_date": parse_dt(item.get("travel_date")),
                "is_featured": item.get("is_featured", False),
                "homepage_featured": item.get("homepage_featured", False),
                "display_order": item.get("display_order", 0),
                "is_active": True,
                "is_verified": True,
            },
        )
        logger.info(
            "{} testimonial: {}",
            "Created" if created else "Updated",
            item["customer_name"],
        )


async def seed_page_seo(session: AsyncSession, data: dict[str, Any]) -> None:
    pages = data.get("page_seo", [])
    for item in pages:
        page_key = item.get("page_key")
        if not page_key:
            continue
        row = (
            await session.execute(select(PageSEO).where(PageSEO.page_key == page_key))
        ).scalar_one_or_none()
        if row is None:
            row = PageSEO(page_key=page_key)
            session.add(row)
        for key in (
            "meta_title",
            "meta_description",
            "keywords",
            "canonical_url",
            "slug",
            "robots",
            "priority",
            "change_frequency",
            "include_in_sitemap",
            "is_active",
        ):
            if key in item:
                setattr(row, key, item[key])
        if "include_in_sitemap" not in item:
            row.include_in_sitemap = True
        if "is_active" not in item:
            row.is_active = True
        logger.info("Page SEO ready: {}", page_key)


async def seed_robots(session: AsyncSession, data: dict[str, Any]) -> None:
    robots = data.get("robots_settings", {})
    row = await get_or_create_singleton(session, RobotsSettings)
    if robots.get("robots_content"):
        row.robots_content = robots["robots_content"]
    logger.info("Robots.txt settings ready")


async def seed_dataset(session: AsyncSession) -> None:
    data_path = Path(__file__).resolve().parent / "website_content.json"
    logger.info("Reading {}", data_path)
    with data_path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)

    await seed_singletons(session, data)
    await seed_page_seo(session, data)
    await seed_robots(session, data)
    await seed_navigation_and_footer(session, data)
    await seed_home_lists(session, data)
    package_ids = await seed_packages(session, data)
    await seed_about_lists(session, data)
    await seed_blog(session, data)
    await seed_gallery(session, data)
    await seed_testimonials(session, data, package_ids)


async def main() -> None:
    logger.info("Seeding full website content...")
    async with async_session_factory() as session:
        try:
            await seed_dataset(session)
            await session.commit()
            logger.info("Website content seeded successfully.")
        except Exception as exc:
            await session.rollback()
            logger.error("Seeding failed, transaction rolled back: {}", exc)
            raise


if __name__ == "__main__":
    asyncio.run(main())
