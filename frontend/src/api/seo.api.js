import { apiClient } from '@/api/client';

export async function getGlobalSeo() {
  return apiClient.get('/api/v1/public/seo');
}

export async function getPageSeo(pageKey) {
  return apiClient.get(`/api/v1/public/seo/pages/${encodeURIComponent(pageKey)}`);
}

export async function getRobotsText() {
  return apiClient.get('/robots.txt', {
    headers: {
      Accept: 'text/plain',
    },
  });
}
