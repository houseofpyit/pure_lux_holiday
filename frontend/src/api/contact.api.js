import { apiClient } from '@/api/client';

export async function getPublicContact() {
  return apiClient.get('/api/v1/public/contact');
}
