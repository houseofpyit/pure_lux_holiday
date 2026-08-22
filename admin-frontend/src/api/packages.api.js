/**
 * Packages API module.
 * Thin wrappers for package-related endpoints.
 * Components never call axios directly.
 */
import client from '@/api/client';

const BASE = '/api/v1/packages';

/** GET /api/v1/packages/categories */
export async function listPackageCategories() {
  const res = await client.get(`${BASE}/categories`);
  return res.data;
}

/** POST /api/v1/packages/categories */
export async function createPackageCategory(data) {
  const res = await client.post(`${BASE}/categories`, data);
  return res.data;
}

/** PATCH /api/v1/packages/categories/:id */
export async function updatePackageCategory(id, data) {
  const res = await client.patch(`${BASE}/categories/${id}`, data);
  return res.data;
}

/** DELETE /api/v1/packages/categories/:id */
export async function deletePackageCategory(id) {
  const res = await client.delete(`${BASE}/categories/${id}`);
  return res.data;
}

/** GET /api/v1/packages */
export async function listPackages(params = {}) {
  const res = await client.get(BASE, { params });
  return res.data;
}

/** GET /api/v1/packages/:id */
export async function getPackage(id) {
  const res = await client.get(`${BASE}/${id}`);
  return res.data;
}

/** POST /api/v1/packages */
export async function createPackage(data) {
  const res = await client.post(BASE, data);
  return res.data;
}

/** PATCH /api/v1/packages/:id */
export async function updatePackage(id, data) {
  const res = await client.patch(`${BASE}/${id}`, data);
  return res.data;
}

/** DELETE /api/v1/packages/:id */
export async function deletePackage(id) {
  const res = await client.delete(`${BASE}/${id}`);
  return res.data;
}

// ─── Package Gallery ──────────────────────────────────────────────────────────

/** GET /api/v1/packages/gallery/:packageId */
export async function listPackageGallery(packageId) {
  const res = await client.get(`${BASE}/gallery/${packageId}`);
  return res.data;
}

/** POST /api/v1/packages/gallery/:packageId */
export async function addPackageGalleryItem(packageId, data) {
  const res = await client.post(`${BASE}/gallery/${packageId}`, data);
  return res.data;
}

/** DELETE /api/v1/packages/gallery/:itemId */
export async function deletePackageGalleryItem(itemId) {
  const res = await client.delete(`${BASE}/gallery/${itemId}`);
  return res.data;
}

/** PUT /api/v1/packages/gallery/reorder */
export async function reorderPackageGallery(items) {
  const res = await client.put(`${BASE}/gallery/reorder`, { items });
  return res.data;
}

// ─── Package Itinerary ────────────────────────────────────────────────────────

/** GET /api/v1/packages/itinerary/:packageId */
export async function listPackageItinerary(packageId) {
  const res = await client.get(`${BASE}/itinerary/${packageId}`);
  return res.data;
}

/** POST /api/v1/packages/itinerary/:packageId */
export async function createPackageItinerary(packageId, data) {
  const res = await client.post(`${BASE}/itinerary/${packageId}`, data);
  return res.data;
}

/** PATCH /api/v1/packages/itinerary/:itemId */
export async function updatePackageItinerary(itemId, data) {
  const res = await client.patch(`${BASE}/itinerary/${itemId}`, data);
  return res.data;
}

/** DELETE /api/v1/packages/itinerary/:itemId */
export async function deletePackageItinerary(itemId) {
  const res = await client.delete(`${BASE}/itinerary/${itemId}`);
  return res.data;
}

/** PUT /api/v1/packages/itinerary/reorder */
export async function reorderPackageItinerary(items) {
  const res = await client.put(`${BASE}/itinerary/reorder`, { items });
  return res.data;
}

// ─── Package Highlights ───────────────────────────────────────────────────────

/** GET /api/v1/packages/highlights/:packageId */
export async function listPackageHighlights(packageId) {
  const res = await client.get(`${BASE}/highlights/${packageId}`);
  return res.data;
}

/** POST /api/v1/packages/highlights/:packageId */
export async function createPackageHighlight(packageId, data) {
  const res = await client.post(`${BASE}/highlights/${packageId}`, data);
  return res.data;
}

/** PATCH /api/v1/packages/highlights/:itemId */
export async function updatePackageHighlight(itemId, data) {
  const res = await client.patch(`${BASE}/highlights/${itemId}`, data);
  return res.data;
}

/** DELETE /api/v1/packages/highlights/:itemId */
export async function deletePackageHighlight(itemId) {
  const res = await client.delete(`${BASE}/highlights/${itemId}`);
  return res.data;
}

// ─── Package Inclusions ───────────────────────────────────────────────────────

/** GET /api/v1/packages/inclusions/:packageId */
export async function listPackageInclusions(packageId) {
  const res = await client.get(`${BASE}/inclusions/${packageId}`);
  return res.data;
}

/** POST /api/v1/packages/inclusions/:packageId */
export async function createPackageInclusion(packageId, data) {
  const res = await client.post(`${BASE}/inclusions/${packageId}`, data);
  return res.data;
}

/** DELETE /api/v1/packages/inclusions/:itemId */
export async function deletePackageInclusion(itemId) {
  const res = await client.delete(`${BASE}/inclusions/${itemId}`);
  return res.data;
}

// ─── Package Exclusions ───────────────────────────────────────────────────────

/** GET /api/v1/packages/exclusions/:packageId */
export async function listPackageExclusions(packageId) {
  const res = await client.get(`${BASE}/exclusions/${packageId}`);
  return res.data;
}

/** POST /api/v1/packages/exclusions/:packageId */
export async function createPackageExclusion(packageId, data) {
  const res = await client.post(`${BASE}/exclusions/${packageId}`, data);
  return res.data;
}

/** DELETE /api/v1/packages/exclusions/:itemId */
export async function deletePackageExclusion(itemId) {
  const res = await client.delete(`${BASE}/exclusions/${itemId}`);
  return res.data;
}

// ─── Package FAQs ─────────────────────────────────────────────────────────────

/** GET /api/v1/packages/faqs/:packageId */
export async function listPackageFaqs(packageId) {
  const res = await client.get(`${BASE}/faqs/${packageId}`);
  return res.data;
}

/** POST /api/v1/packages/faqs/:packageId */
export async function createPackageFaq(packageId, data) {
  const res = await client.post(`${BASE}/faqs/${packageId}`, data);
  return res.data;
}

/** PATCH /api/v1/packages/faqs/:itemId */
export async function updatePackageFaq(itemId, data) {
  const res = await client.patch(`${BASE}/faqs/${itemId}`, data);
  return res.data;
}

/** DELETE /api/v1/packages/faqs/:itemId */
export async function deletePackageFaq(itemId) {
  const res = await client.delete(`${BASE}/faqs/${itemId}`);
  return res.data;
}
