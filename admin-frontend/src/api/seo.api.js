/**
 * SEO API module.
 *
 * Thin wrappers around the Axios client for all SEO-related endpoints.
 * Components never call Axios directly — use these functions or the
 * React Query hooks in hooks/use-seo.js instead.
 */
import client from '@/api/client';

// ─── Global SEO Settings ──────────────────────────────────────────────────────

/** GET /api/v1/seo */
export async function getGlobalSeo() {
  const res = await client.get('/api/v1/seo');
  return res.data;
}

/** PUT /api/v1/seo */
export async function updateGlobalSeo(data) {
  const res = await client.put('/api/v1/seo', data);
  return res.data;
}

// ─── Page SEO ─────────────────────────────────────────────────────────────────

/** GET /api/v1/seo/pages */
export async function getPageSeoList() {
  const res = await client.get('/api/v1/seo/pages');
  return res.data;
}

/** GET /api/v1/seo/pages/:pageKey */
export async function getPageSeo(pageKey) {
  const res = await client.get(`/api/v1/seo/pages/${encodeURIComponent(pageKey)}`);
  return res.data;
}

/** PUT /api/v1/seo/pages/:pageKey */
export async function updatePageSeo(pageKey, data) {
  const res = await client.put(`/api/v1/seo/pages/${encodeURIComponent(pageKey)}`, data);
  return res.data;
}

// ─── Sitemap Settings ─────────────────────────────────────────────────────────

/** GET /api/v1/seo/sitemap */
export async function getSitemapSettings() {
  const res = await client.get('/api/v1/seo/sitemap');
  return res.data;
}

/** PUT /api/v1/seo/sitemap */
export async function updateSitemapSettings(data) {
  const res = await client.put('/api/v1/seo/sitemap', data);
  return res.data;
}

// ─── Robots Settings ─────────────────────────────────────────────────────────

/** GET /api/v1/seo/robots */
export async function getRobotsSettings() {
  const res = await client.get('/api/v1/seo/robots');
  return res.data;
}

/** PUT /api/v1/seo/robots */
export async function updateRobotsSettings(data) {
  const res = await client.put('/api/v1/seo/robots', data);
  return res.data;
}

// ─── Redirects ───────────────────────────────────────────────────────────────

/** GET /api/v1/seo/redirects */
export async function getRedirects() {
  const res = await client.get('/api/v1/seo/redirects');
  return res.data;
}

/** POST /api/v1/seo/redirects */
export async function createRedirect(data) {
  const res = await client.post('/api/v1/seo/redirects', data);
  return res.data;
}

/** PATCH /api/v1/seo/redirects/:id */
export async function updateRedirect(id, data) {
  const res = await client.patch(`/api/v1/seo/redirects/${id}`, data);
  return res.data;
}

/** DELETE /api/v1/seo/redirects/:id */
export async function deleteRedirect(id) {
  const res = await client.delete(`/api/v1/seo/redirects/${id}`);
  return res.data;
}
