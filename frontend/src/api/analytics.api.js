import { apiClient } from '@/api/client';

export async function trackPageView(payload) {
  return apiClient.post('/api/v1/public/analytics/track', payload);
}

export async function sendAnalyticsHeartbeat(payload) {
  return apiClient.post('/api/v1/public/analytics/heartbeat', payload);
}
