import { apiClient } from '@/api/client';

export async function getPublicPackages() {
  return apiClient.get('/api/v1/public/packages');
}

export async function getPublicPackageBySlug(slug) {
  return apiClient.get(`/api/v1/public/packages/${encodeURIComponent(slug)}`);
}
