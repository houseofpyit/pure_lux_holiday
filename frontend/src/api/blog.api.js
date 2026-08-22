import { apiClient } from '@/api/client';

export async function getPublicBlog() {
  return apiClient.get('/api/v1/public/blog');
}

export async function getPublicBlogArticleBySlug(slug) {
  return apiClient.get(`/api/v1/public/blog/${encodeURIComponent(slug)}`);
}

export async function getPublicBlogArticlesByCategory(slug) {
  return apiClient.get(`/api/v1/public/blog/categories/${encodeURIComponent(slug)}`);
}

export async function getPublicBlogArticlesByTag(slug) {
  return apiClient.get(`/api/v1/public/blog/tags/${encodeURIComponent(slug)}`);
}
