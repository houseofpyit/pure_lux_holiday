"""API v1 router configuration.

All v1 endpoint routers are aggregated here and mounted
under the configured API prefix.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.cms import (
    contact_page_router,
    contact_router,
    cta_router,
    footer_router,
    nav_router,
    public_router as cms_public_router,
    settings_router,
)
from app.api.v1.endpoints.seo import (
    seo_router,
    page_seo_router,
    public_router as seo_public_router,
    redirect_router,
    robots_router,
    sitemap_router,
)
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.home import (
    about_section_router,
    collections_router,
    cta_router as home_cta_router,
    destinations_router,
    experiences_router,
    hero_router,
    public_router as home_public_router,
    statistics_router,
    why_choose_router,
)
from app.api.v1.endpoints.media import router as media_router
from app.api.v1.endpoints.gallery import (
    alb_router as gallery_alb_router,
    cat_router as gallery_cat_router,
    item_router as gallery_item_router,
    pub_router as gallery_pub_router,
)
from app.api.v1.endpoints.packages import (
    cat_router, pkg_router, gal_router, it_router,
    hl_router, faq_router, inc_router, exc_router,
    pub_router as pkg_public_router,
)
from app.api.v1.endpoints.testimonials import (
    cat_router as testimonial_cat_router,
    test_router,
    pub_router as testimonial_pub_router,
)
from app.api.v1.endpoints.blog import (
    art_router,
    cat_router as blog_cat_router,
    gal_router as blog_gal_router,
    pub_router as blog_pub_router,
    tag_router,
)
from app.api.v1.endpoints.about import (
    about_router,
    award_router,
    cv_router,
    faq_router as about_faq_router,
    lead_router,
    part_router,
    pub_router as about_pub_router,
    stat_router,
    time_router,
)
from app.api.v1.endpoints.crm import (
    inquiry_router,
    journey_router,
    newsletter_router,
)
from app.api.v1.endpoints.analytics import admin_router as analytics_router, pub_router as analytics_pub_router

router = APIRouter()

router.include_router(health_router)
router.include_router(auth_router)
router.include_router(media_router)
router.include_router(settings_router)
router.include_router(seo_router)
router.include_router(page_seo_router)
router.include_router(sitemap_router)
router.include_router(robots_router)
router.include_router(redirect_router)
router.include_router(seo_public_router)
router.include_router(nav_router)
router.include_router(footer_router)
router.include_router(contact_page_router)
router.include_router(contact_router)
router.include_router(cta_router)
router.include_router(cms_public_router)
router.include_router(hero_router)
router.include_router(about_section_router)
router.include_router(home_cta_router)
router.include_router(collections_router)
router.include_router(destinations_router)
router.include_router(experiences_router)
router.include_router(statistics_router)
router.include_router(why_choose_router)
router.include_router(home_public_router)
router.include_router(cat_router)
router.include_router(pkg_router)
router.include_router(gal_router)
router.include_router(it_router)
router.include_router(hl_router)
router.include_router(faq_router)
router.include_router(inc_router)
router.include_router(exc_router)
router.include_router(pkg_public_router)
router.include_router(gallery_cat_router)
router.include_router(gallery_alb_router)
router.include_router(gallery_item_router)
router.include_router(gallery_pub_router)
router.include_router(testimonial_cat_router)
router.include_router(test_router)
router.include_router(testimonial_pub_router)
router.include_router(blog_cat_router)
router.include_router(tag_router)
router.include_router(art_router)
router.include_router(blog_gal_router)
router.include_router(blog_pub_router)
router.include_router(about_router)
router.include_router(cv_router)
router.include_router(lead_router)
router.include_router(time_router)
router.include_router(award_router)
router.include_router(part_router)
router.include_router(stat_router)
router.include_router(about_faq_router)
router.include_router(about_pub_router)
router.include_router(inquiry_router)
router.include_router(journey_router)
router.include_router(newsletter_router)
router.include_router(analytics_router)
router.include_router(analytics_pub_router)
