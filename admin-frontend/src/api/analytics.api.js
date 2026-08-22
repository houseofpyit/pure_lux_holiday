import client from '@/api/client';

/** GET /api/v1/analytics/stats */
export async function getAnalyticsStats() {
  const res = await client.get('/api/v1/analytics/stats');
  return res.data;
}
