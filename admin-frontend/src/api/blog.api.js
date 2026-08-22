/**
 * Blog API module.
 *
 * Thin wrappers around the Axios client for all Blog endpoints.
 * Services call these — React components never call Axios directly.
 */
import client from '@/api/client';

const BASE = '/api/v1/blog';

// ─── Blog Categories ──────────────────────────────────────────────────────────

/** GET /api/v1/blog/categories */
export async function listBlogCategories() {
  const res = await client.get(`${BASE}/categories`);
  return res.data;
}

/** POST /api/v1/blog/categories */
export async function createBlogCategory(data) {
  const res = await client.post(`${BASE}/categories`, data);
  return res.data;
}

/** PATCH /api/v1/blog/categories/:id */
export async function updateBlogCategory(id, data) {
  const res = await client.patch(`${BASE}/categories/${id}`, data);
  return res.data;
}

/** DELETE /api/v1/blog/categories/:id */
export async function deleteBlogCategory(id) {
  const res = await client.delete(`${BASE}/categories/${id}`);
  return res.data;
}

// ─── Blog Tags ────────────────────────────────────────────────────────────────

/** GET /api/v1/blog/tags */
export async function listBlogTags() {
  const res = await client.get(`${BASE}/tags`);
  return res.data;
}

/** POST /api/v1/blog/tags */
export async function createBlogTag(data) {
  const res = await client.post(`${BASE}/tags`, data);
  return res.data;
}

/** PATCH /api/v1/blog/tags/:id */
export async function updateBlogTag(id, data) {
  const res = await client.patch(`${BASE}/tags/${id}`, data);
  return res.data;
}

/** DELETE /api/v1/blog/tags/:id */
export async function deleteBlogTag(id) {
  const res = await client.delete(`${BASE}/tags/${id}`);
  return res.data;
}

// ─── Blog Articles ────────────────────────────────────────────────────────────

/** GET /api/v1/blog/articles */
export async function listBlogArticles() {
  const res = await client.get(`${BASE}/articles`);
  return res.data;
}

/** GET /api/v1/blog/articles/:id */
export async function getBlogArticle(id) {
  const res = await client.get(`${BASE}/articles/${id}`);
  return res.data;
}

/** POST /api/v1/blog/articles */
export async function createBlogArticle(data) {
  const res = await client.post(`${BASE}/articles`, data);
  return res.data;
}

/** PATCH /api/v1/blog/articles/:id */
export async function updateBlogArticle(id, data) {
  const res = await client.patch(`${BASE}/articles/${id}`, data);
  return res.data;
}

/** DELETE /api/v1/blog/articles/:id */
export async function deleteBlogArticle(id) {
  const res = await client.delete(`${BASE}/articles/${id}`);
  return res.data;
}

/** PUT /api/v1/blog/articles/:id/publish */
export async function publishBlogArticle(id) {
  const res = await client.put(`${BASE}/articles/${id}/publish`);
  return res.data;
}

/** PUT /api/v1/blog/articles/:id/unpublish */
export async function unpublishBlogArticle(id) {
  const res = await client.put(`${BASE}/articles/${id}/unpublish`);
  return res.data;
}

// ─── Article Gallery ──────────────────────────────────────────────────────────

/** GET /api/v1/blog/gallery/:articleId */
export async function listArticleGallery(articleId) {
  const res = await client.get(`${BASE}/gallery/${articleId}`);
  return res.data;
}

/** POST /api/v1/blog/gallery/:articleId */
export async function addArticleGalleryItem(articleId, data) {
  const res = await client.post(`${BASE}/gallery/${articleId}`, data);
  return res.data;
}

/** DELETE /api/v1/blog/gallery/:itemId */
export async function deleteArticleGalleryItem(itemId) {
  const res = await client.delete(`${BASE}/gallery/${itemId}`);
  return res.data;
}

// ─── Related Articles ─────────────────────────────────────────────────────────

/** POST /api/v1/blog/articles/:articleId/related */
export async function addRelatedArticle(articleId, data) {
  const res = await client.post(`${BASE}/articles/${articleId}/related`, data);
  return res.data;
}
