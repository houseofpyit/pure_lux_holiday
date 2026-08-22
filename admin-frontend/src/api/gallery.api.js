/**
 * Gallery Page CMS API module.
 *
 * Two groups of endpoints:
 *
 *   A) Already-existing gallery data endpoints (reused):
 *      GET /api/v1/gallery/categories  — category list for filter chips
 *      GET /api/v1/gallery/albums       — album list for count display
 *
 *   B) Page-level CMS endpoints (to be created on backend):
 *      GET/PUT /api/v1/gallery/page/hero      — hero section singleton
 *      GET/PUT /api/v1/gallery/page/settings  — display settings singleton
 *      GET/PUT /api/v1/gallery/page/seo       — SEO singleton
 *
 * Until the page-level endpoints exist the hooks below fall back to
 * localStorage so the CMS is usable immediately. The fallback is
 * transparent — swap the localStorage lines for real API calls once
 * the backend migration is applied.
 */
import client from '@/api/client';

const BASE = '/api/v1/gallery';

// ─── Existing gallery data (already live) ────────────────────────────────────

/** GET /api/v1/gallery/categories */
export async function listGalleryCategories() {
  const res = await client.get(`${BASE}/categories`);
  return res.data;
}

/** GET /api/v1/gallery/albums */
export async function listGalleryAlbums() {
  const res = await client.get(`${BASE}/albums`);
  return res.data;
}

// ─── Page-level CMS endpoints (backend pending) ───────────────────────────────
// These will be replaced with real API calls once the backend adds the
// GalleryPage singleton model and its endpoints.

const HERO_KEY = 'gallery_page_hero';
const SETTINGS_KEY = 'gallery_page_settings';
const SEO_KEY = 'gallery_page_seo';

const HERO_DEFAULTS = {
  label: 'Our Gallery',
  heading: 'Gallery',
  description: 'A visual journey through our world of extraordinary travel.',
  background_image_id: null,
  background_image_url: null,
  overlay_opacity: 50,
  is_active: true,
};

const SETTINGS_DEFAULTS = {
  enable_filter: true,
  default_category: 'All',
  category_order: [],
  gallery_layout: 'grid',
  items_per_page: 12,
  columns_desktop: 3,
  columns_tablet: 2,
  columns_mobile: 1,
  sort_order: 'newest',
  show_featured_first: true,
  enable_lightbox: true,
  enable_infinite_scroll: false,
  enable_load_more: true,
  show_category: true,
  show_title: true,
  show_location: true,
  show_hover_animation: true,
  image_aspect_ratio: 'landscape',
};

const SEO_DEFAULTS = {
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  canonical_url: '',
  og_image_id: null,
  og_image_url: null,
  schema_json: '',
  robots: 'index, follow',
};

function lsGet(key, defaults) {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(key) ?? '{}') }; }
  catch { return { ...defaults }; }
}
function lsSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* ignore */ }
}

/** GET /api/v1/gallery/page/hero  (⚠ falls back to localStorage) */
export async function getGalleryHero() {
  // TODO: replace with → const res = await client.get(`${BASE}/page/hero`); return res.data;
  return lsGet(HERO_KEY, HERO_DEFAULTS);
}

/** PUT /api/v1/gallery/page/hero  (⚠ falls back to localStorage) */
export async function updateGalleryHero(payload) {
  // TODO: replace with → const res = await client.put(`${BASE}/page/hero`, payload); return res.data;
  const merged = { ...lsGet(HERO_KEY, HERO_DEFAULTS), ...payload };
  lsSet(HERO_KEY, merged);
  return merged;
}

/** GET /api/v1/gallery/page/settings  (⚠ falls back to localStorage) */
export async function getGallerySettings() {
  // TODO: replace with → const res = await client.get(`${BASE}/page/settings`); return res.data;
  return lsGet(SETTINGS_KEY, SETTINGS_DEFAULTS);
}

/** PUT /api/v1/gallery/page/settings  (⚠ falls back to localStorage) */
export async function updateGallerySettings(payload) {
  // TODO: replace with → const res = await client.put(`${BASE}/page/settings`, payload); return res.data;
  const merged = { ...lsGet(SETTINGS_KEY, SETTINGS_DEFAULTS), ...payload };
  lsSet(SETTINGS_KEY, merged);
  return merged;
}

/** GET /api/v1/gallery/page/seo  (⚠ falls back to localStorage) */
export async function getGallerySeo() {
  // TODO: replace with → const res = await client.get(`${BASE}/page/seo`); return res.data;
  return lsGet(SEO_KEY, SEO_DEFAULTS);
}

/** PUT /api/v1/gallery/page/seo  (⚠ falls back to localStorage) */
export async function updateGallerySeo(payload) {
  // TODO: replace with → const res = await client.put(`${BASE}/page/seo`, payload); return res.data;
  const merged = { ...lsGet(SEO_KEY, SEO_DEFAULTS), ...payload };
  lsSet(SEO_KEY, merged);
  return merged;
}
