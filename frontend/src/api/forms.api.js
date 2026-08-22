import { apiClient } from '@/api/client';

export async function createContactInquiry(payload) {
  return apiClient.post('/api/v1/crm/inquiries', payload);
}

export async function createJourneyRequest(payload) {
  return apiClient.post('/api/v1/crm/journey-requests', payload);
}

export async function subscribeToNewsletter(payload) {
  return apiClient.post('/api/v1/crm/newsletter', payload);
}
