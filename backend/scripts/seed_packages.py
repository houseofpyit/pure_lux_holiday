#!/usr/bin/env python
"""Standalone script to seed luxury packages, categories, destinations, and testimonials.

Run from the project root with the virtualenv activated::

    python scripts/seed_packages.py
"""

from __future__ import annotations
import asyncio
import json
import sys
from pathlib import Path

# Ensure project root is in the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from loguru import logger
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory
from app.models.packages.category import PackageCategory
from app.models.packages.package import LuxuryPackage
from app.models.packages.highlight import PackageHighlight
from app.models.packages.itinerary import PackageItinerary
from app.models.packages.inclusion import PackageInclusion
from app.models.packages.exclusion import PackageExclusion
from app.models.packages.faq import PackageFAQ
from app.models.packages.gallery import PackageGallery
from app.models.home.destinations import FeaturedDestination
from app.models.home.experiences import LuxuryExperience
from app.models.home.collections import LuxuryCollection
from app.models.testimonials.testimonial import Testimonial
from seed_media import get_or_create_media


async def seed_dataset(session: AsyncSession) -> None:
    logger.info("Reading packages dataset from JSON...")
    data_path = Path(__file__).resolve().parent / "packages_data.json"
    with open(data_path, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    # 1. Seed Categories
    logger.info("Seeding package categories...")
    category_slug_map = {}
    for cat_data in dataset.get("categories", []):
        slug = cat_data["slug"]
        stmt = select(PackageCategory).where(PackageCategory.slug == slug)
        res = await session.execute(stmt)
        cat = res.scalar_one_or_none()

        if not cat:
            cat = PackageCategory(
                name=cat_data["name"],
                slug=slug,
                is_active=True
            )
            session.add(cat)
            await session.flush()
            logger.info(f"Created category: {cat.name}")
        else:
            cat.name = cat_data["name"]
            logger.info(f"Category already exists: {cat.name}")

        category_slug_map[slug] = cat.id

    # 2. Seed Destinations
    logger.info("Seeding featured destinations...")
    for dest_data in dataset.get("destinations", []):
        slug = dest_data["slug"]
        stmt = select(FeaturedDestination).where(FeaturedDestination.slug == slug)
        res = await session.execute(stmt)
        dest = res.scalar_one_or_none()

        image_id = None
        if dest_data.get("image_url"):
            image_id = await get_or_create_media(
                session, dest_data["image_url"], f"dest_{slug}.jpg"
            )

        if not dest:
            dest = FeaturedDestination(
                name=dest_data["name"],
                slug=slug,
                country=dest_data.get("country"),
                short_description=dest_data.get("short_description"),
                image_id=image_id,
                button_text=dest_data.get("button_text", "Discover"),
                button_url=dest_data.get("button_url"),
                is_featured=dest_data.get("is_featured", True),
                is_active=True
            )
            session.add(dest)
            logger.info(f"Created destination: {dest.name}")
        else:
            dest.name = dest_data["name"]
            dest.country = dest_data.get("country")
            dest.short_description = dest_data.get("short_description")
            dest.image_id = image_id
            dest.button_text = dest_data.get("button_text", "Discover")
            dest.is_featured = dest_data.get("is_featured", True)
            logger.info(f"Updated destination: {dest.name}")

    # 3. Seed Packages
    logger.info("Seeding luxury packages...")
    for pkg_data in dataset.get("packages", []):
        slug = pkg_data["slug"]
        category_slug = pkg_data["category_slug"]
        category_id = category_slug_map.get(category_slug)

        stmt = select(LuxuryPackage).where(LuxuryPackage.slug == slug)
        res = await session.execute(stmt)
        pkg = res.scalar_one_or_none()

        featured_image_id = None
        if pkg_data.get("featured_image_url"):
            featured_image_id = await get_or_create_media(
                session, pkg_data["featured_image_url"], f"pkg_feat_{slug}.jpg"
            )

        banner_image_id = None
        if pkg_data.get("banner_image_url"):
            banner_image_id = await get_or_create_media(
                session, pkg_data["banner_image_url"], f"pkg_banner_{slug}.jpg"
            )

        if not pkg:
            pkg = LuxuryPackage(
                category_id=category_id,
                title=pkg_data["title"],
                slug=slug,
                short_description=pkg_data.get("short_description"),
                description=pkg_data.get("description"),
                country=pkg_data.get("country"),
                city=pkg_data.get("city"),
                duration_days=pkg_data.get("duration_days", 1),
                duration_nights=pkg_data.get("duration_nights", 0),
                starting_price=pkg_data.get("starting_price"),
                currency=pkg_data.get("currency", "USD"),
                is_featured=pkg_data.get("is_featured", False),
                is_popular=pkg_data.get("is_popular", False),
                featured_image_id=featured_image_id,
                banner_image_id=banner_image_id,
                is_active=True
            )
            session.add(pkg)
            await session.flush()
            logger.info(f"Created package: {pkg.title}")
        else:
            pkg.category_id = category_id
            pkg.title = pkg_data["title"]
            pkg.short_description = pkg_data.get("short_description")
            pkg.description = pkg_data.get("description")
            pkg.country = pkg_data.get("country")
            pkg.city = pkg_data.get("city")
            pkg.duration_days = pkg_data.get("duration_days", 1)
            pkg.duration_nights = pkg_data.get("duration_nights", 0)
            pkg.starting_price = pkg_data.get("starting_price")
            pkg.currency = pkg_data.get("currency", "USD")
            pkg.is_featured = pkg_data.get("is_featured", False)
            pkg.is_popular = pkg_data.get("is_popular", False)
            pkg.featured_image_id = featured_image_id
            pkg.banner_image_id = banner_image_id
            logger.info(f"Updated package: {pkg.title}")

        # Delete existing child items to re-create clean ones
        await session.execute(delete(PackageHighlight).where(PackageHighlight.package_id == pkg.id))
        await session.execute(delete(PackageItinerary).where(PackageItinerary.package_id == pkg.id))
        await session.execute(delete(PackageInclusion).where(PackageInclusion.package_id == pkg.id))
        await session.execute(delete(PackageExclusion).where(PackageExclusion.package_id == pkg.id))
        await session.execute(delete(PackageFAQ).where(PackageFAQ.package_id == pkg.id))
        await session.execute(delete(PackageGallery).where(PackageGallery.package_id == pkg.id))

        # Highlights
        for hl in pkg_data.get("highlights", []):
            new_hl = PackageHighlight(
                package_id=pkg.id,
                title=hl["title"],
                icon=hl.get("icon"),
                display_order=hl.get("display_order", 0)
            )
            session.add(new_hl)

        # Itinerary
        for day in pkg_data.get("itinerary", []):
            new_day = PackageItinerary(
                package_id=pkg.id,
                day_number=day["day_number"],
                title=day["title"],
                description=day.get("description"),
                hotel=day.get("hotel"),
                meal_plan=day.get("meal_plan"),
                display_order=day.get("display_order", 0)
            )
            session.add(new_day)

        # Inclusions
        for inc in pkg_data.get("inclusions", []):
            new_inc = PackageInclusion(
                package_id=pkg.id,
                title=inc["title"],
                display_order=inc.get("display_order", 0)
            )
            session.add(new_inc)

        # Exclusions
        for exc in pkg_data.get("exclusions", []):
            new_exc = PackageExclusion(
                package_id=pkg.id,
                title=exc["title"],
                display_order=exc.get("display_order", 0)
            )
            session.add(new_exc)

        # FAQs
        for faq in pkg_data.get("faqs", []):
            new_faq = PackageFAQ(
                package_id=pkg.id,
                question=faq["question"],
                answer=faq.get("answer"),
                display_order=faq.get("display_order", 0)
            )
            session.add(new_faq)

        # Gallery
        for idx, g_url in enumerate(pkg_data.get("gallery_urls", [])):
            g_media_id = await get_or_create_media(
                session, g_url, f"pkg_gal_{slug}_{idx}.jpg"
            )
            new_gal = PackageGallery(
                package_id=pkg.id,
                media_id=g_media_id,
                display_order=idx
            )
            session.add(new_gal)

        # Testimonials
        for t_data in pkg_data.get("testimonials", []):
            # Check if testimonial already exists for this package
            stmt_t = select(Testimonial).where(
                Testimonial.package_id == pkg.id,
                Testimonial.customer_name == t_data["customer_name"]
            )
            res_t = await session.execute(stmt_t)
            test = res_t.scalar_one_or_none()

            if not test:
                test = Testimonial(
                    package_id=pkg.id,
                    customer_name=t_data["customer_name"],
                    customer_location=t_data.get("customer_location"),
                    customer_designation=t_data.get("customer_designation"),
                    rating=t_data.get("rating", 5),
                    title=t_data["title"],
                    review=t_data.get("review"),
                    is_featured=True,
                    is_active=True
                )
                session.add(test)
                logger.info(f"Created testimonial from: {test.customer_name}")

    # 4. Seed Experiences
    logger.info("Seeding luxury experiences...")
    for exp_data in dataset.get("experiences", []):
        slug = exp_data["slug"]
        stmt = select(LuxuryExperience).where(LuxuryExperience.slug == slug)
        res = await session.execute(stmt)
        exp = res.scalar_one_or_none()

        image_id = None
        if exp_data.get("image_url"):
            image_id = await get_or_create_media(
                session, exp_data["image_url"], f"exp_{slug}.jpg"
            )

        if not exp:
            exp = LuxuryExperience(
                title=exp_data["title"],
                slug=slug,
                short_description=exp_data.get("short_description"),
                icon=exp_data.get("icon"),
                image_id=image_id,
                button_text=exp_data.get("button_text", "Enquire About This Experience"),
                button_url=exp_data.get("button_url"),
                display_order=exp_data.get("display_order", 0),
                is_active=True
            )
            session.add(exp)
            logger.info(f"Created experience: {exp.title}")
        else:
            exp.title = exp_data["title"]
            exp.short_description = exp_data.get("short_description")
            exp.icon = exp_data.get("icon")
            exp.image_id = image_id
            exp.button_text = exp_data.get("button_text", "Enquire About This Experience")
            exp.display_order = exp_data.get("display_order", 0)
            logger.info(f"Updated experience: {exp.title}")

    # 5. Seed Homepage Collections
    logger.info("Seeding homepage collections...")
    for col_data in dataset.get("collections", []):
        slug = col_data["slug"]
        stmt = select(LuxuryCollection).where(LuxuryCollection.slug == slug)
        res = await session.execute(stmt)
        col = res.scalar_one_or_none()

        image_id = None
        if col_data.get("image_url"):
            image_id = await get_or_create_media(
                session, col_data["image_url"], f"col_{slug}.jpg"
            )

        if not col:
            col = LuxuryCollection(
                title=col_data["title"],
                slug=slug,
                short_description=col_data.get("short_description"),
                image_id=image_id,
                button_text=col_data.get("button_text", "Discover"),
                button_url=col_data.get("button_url"),
                display_order=col_data.get("display_order", 0),
                is_active=True
            )
            session.add(col)
            logger.info(f"Created collection: {col.title}")
        else:
            col.title = col_data["title"]
            col.short_description = col_data.get("short_description")
            col.image_id = image_id
            col.button_text = col_data.get("button_text", "Discover")
            col.button_url = col_data.get("button_url")
            col.display_order = col_data.get("display_order", 0)
            logger.info(f"Updated collection: {col.title}")

    logger.info("All operations flushed.")


async def main() -> None:
    logger.info("Initializing database seed for packages...")
    async with async_session_factory() as session:
        try:
            await seed_dataset(session)
            await session.commit()
            logger.info("Seeding completed successfully.")
        except Exception as exc:
            await session.rollback()
            logger.error(f"Seeding failed, transaction rolled back: {exc}")
            raise


if __name__ == "__main__":
    asyncio.run(main())
