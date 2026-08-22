import { apiClient } from '@/api/client';

export async function getPublicDestinations() {
  return apiClient.get('/api/v1/public/destinations');
}
