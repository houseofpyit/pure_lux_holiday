import { apiClient } from '@/api/client';

export async function getAboutPage() {
  return apiClient.get('/api/v1/public/about');
}
