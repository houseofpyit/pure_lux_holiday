import { apiClient } from '@/api/client';

export async function getPublicFooter() {
  return apiClient.get('/api/v1/public/footer');
}
