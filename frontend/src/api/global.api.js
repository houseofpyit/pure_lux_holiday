import { apiClient } from '@/api/client';

export async function getActiveNavigation() {
  return apiClient.get('/api/v1/navigation/active');
}
