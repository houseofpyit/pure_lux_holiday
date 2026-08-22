/**
 * CRM API module.
 *
 * Thin wrappers around the Axios client for all CRM endpoints.
 * Components never call Axios directly.
 */
import client from '@/api/client';

const BASE = '/api/v1/crm';

// ─── Contact Inquiries ────────────────────────────────────────────────────────

/** GET /api/v1/crm/inquiries */
export async function listInquiries() {
  const res = await client.get(`${BASE}/inquiries`);
  return res.data;
}

/** GET /api/v1/crm/inquiries/:id */
export async function getInquiry(id) {
  const res = await client.get(`${BASE}/inquiries/${id}`);
  return res.data;
}

/** POST /api/v1/crm/inquiries (public — website form) */
export async function createInquiry(data) {
  const res = await client.post(`${BASE}/inquiries`, data);
  return res.data;
}

/** PATCH /api/v1/crm/inquiries/:id */
export async function updateInquiry(id, data) {
  const res = await client.patch(`${BASE}/inquiries/${id}`, data);
  return res.data;
}

/** DELETE /api/v1/crm/inquiries/:id */
export async function deleteInquiry(id) {
  const res = await client.delete(`${BASE}/inquiries/${id}`);
  return res.data;
}

// ─── Journey Requests ────────────────────────────────────────────────────────

/** GET /api/v1/crm/journey-requests */
export async function listJourneyRequests() {
  const res = await client.get(`${BASE}/journey-requests`);
  return res.data;
}

/** GET /api/v1/crm/journey-requests/:id */
export async function getJourneyRequest(id) {
  const res = await client.get(`${BASE}/journey-requests/${id}`);
  return res.data;
}

/** POST /api/v1/crm/journey-requests (public — website form) */
export async function createJourneyRequest(data) {
  const res = await client.post(`${BASE}/journey-requests`, data);
  return res.data;
}

/** PATCH /api/v1/crm/journey-requests/:id */
export async function updateJourneyRequest(id, data) {
  const res = await client.patch(`${BASE}/journey-requests/${id}`, data);
  return res.data;
}

/** DELETE /api/v1/crm/journey-requests/:id */
export async function deleteJourneyRequest(id) {
  const res = await client.delete(`${BASE}/journey-requests/${id}`);
  return res.data;
}

// ─── Newsletter Subscribers ───────────────────────────────────────────────────

/** GET /api/v1/crm/newsletter */
export async function listSubscribers() {
  const res = await client.get(`${BASE}/newsletter`);
  return res.data;
}

/** GET /api/v1/crm/newsletter/:id */
export async function getSubscriber(id) {
  const res = await client.get(`${BASE}/newsletter/${id}`);
  return res.data;
}

/** POST /api/v1/crm/newsletter (public — website form) */
export async function createSubscriber(data) {
  const res = await client.post(`${BASE}/newsletter`, data);
  return res.data;
}

/** PATCH /api/v1/crm/newsletter/:id */
export async function updateSubscriber(id, data) {
  const res = await client.patch(`${BASE}/newsletter/${id}`, data);
  return res.data;
}

/** DELETE /api/v1/crm/newsletter/:id */
export async function deleteSubscriber(id) {
  const res = await client.delete(`${BASE}/newsletter/${id}`);
  return res.data;
}
