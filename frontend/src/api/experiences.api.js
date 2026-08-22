import { apiClient } from '@/api/client';

export async function getPublicExperiences() {
  return apiClient.get('/api/v1/public/experiences');
}
