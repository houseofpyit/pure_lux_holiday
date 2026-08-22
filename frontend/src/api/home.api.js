import { apiClient } from '@/api/client';
export { buildMediaUrl as buildApiMediaUrl } from '@/lib/media';

export async function getHomepage() {
  return apiClient.get('/api/v1/public/home');
}
