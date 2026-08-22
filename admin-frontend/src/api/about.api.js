/**
 * About CMS API module.
 *
 * Thin wrappers around the Axios client for all About page endpoints.
 * Services call these — React components never call Axios directly.
 */
import client from '@/api/client';

const BASE = '/api/v1/about';

// ─── About Page (singleton) ───────────────────────────────────────────────────

/** GET /api/v1/about */
export async function getAboutPage() {
  const res = await client.get(BASE);
  return res.data;
}

/** PUT /api/v1/about */
export async function updateAboutPage(payload) {
  const res = await client.put(BASE, payload);
  return res.data;
}

// ─── Core Values ─────────────────────────────────────────────────────────────

export async function listCoreValues() {
  const res = await client.get(`${BASE}/core-values`);
  return res.data;
}
export async function createCoreValue(payload) {
  const res = await client.post(`${BASE}/core-values`, payload);
  return res.data;
}
export async function updateCoreValue(id, payload) {
  const res = await client.patch(`${BASE}/core-values/${id}`, payload);
  return res.data;
}
export async function deleteCoreValue(id) {
  const res = await client.delete(`${BASE}/core-values/${id}`);
  return res.data;
}
export async function reorderCoreValues(payload) {
  const res = await client.put(`${BASE}/core-values/reorder`, payload);
  return res.data;
}

// ─── Leadership ───────────────────────────────────────────────────────────────

export async function listLeadership() {
  const res = await client.get(`${BASE}/leadership`);
  return res.data;
}
export async function createLeader(payload) {
  const res = await client.post(`${BASE}/leadership`, payload);
  return res.data;
}
export async function updateLeader(id, payload) {
  const res = await client.patch(`${BASE}/leadership/${id}`, payload);
  return res.data;
}
export async function deleteLeader(id) {
  const res = await client.delete(`${BASE}/leadership/${id}`);
  return res.data;
}
export async function reorderLeadership(payload) {
  const res = await client.put(`${BASE}/leadership/reorder`, payload);
  return res.data;
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export async function listTimeline() {
  const res = await client.get(`${BASE}/timeline`);
  return res.data;
}
export async function createTimelineItem(payload) {
  const res = await client.post(`${BASE}/timeline`, payload);
  return res.data;
}
export async function updateTimelineItem(id, payload) {
  const res = await client.patch(`${BASE}/timeline/${id}`, payload);
  return res.data;
}
export async function deleteTimelineItem(id) {
  const res = await client.delete(`${BASE}/timeline/${id}`);
  return res.data;
}
export async function reorderTimeline(payload) {
  const res = await client.put(`${BASE}/timeline/reorder`, payload);
  return res.data;
}

// ─── Awards ───────────────────────────────────────────────────────────────────

export async function listAwards() {
  const res = await client.get(`${BASE}/awards`);
  return res.data;
}
export async function createAward(payload) {
  const res = await client.post(`${BASE}/awards`, payload);
  return res.data;
}
export async function updateAward(id, payload) {
  const res = await client.patch(`${BASE}/awards/${id}`, payload);
  return res.data;
}
export async function deleteAward(id) {
  const res = await client.delete(`${BASE}/awards/${id}`);
  return res.data;
}
export async function reorderAwards(payload) {
  const res = await client.put(`${BASE}/awards/reorder`, payload);
  return res.data;
}

// ─── Partners ─────────────────────────────────────────────────────────────────

export async function listPartners() {
  const res = await client.get(`${BASE}/partners`);
  return res.data;
}
export async function createPartner(payload) {
  const res = await client.post(`${BASE}/partners`, payload);
  return res.data;
}
export async function updatePartner(id, payload) {
  const res = await client.patch(`${BASE}/partners/${id}`, payload);
  return res.data;
}
export async function deletePartner(id) {
  const res = await client.delete(`${BASE}/partners/${id}`);
  return res.data;
}
export async function reorderPartners(payload) {
  const res = await client.put(`${BASE}/partners/reorder`, payload);
  return res.data;
}

// ─── Statistics ───────────────────────────────────────────────────────────────

export async function listAboutStatistics() {
  const res = await client.get(`${BASE}/statistics`);
  return res.data;
}
export async function createAboutStatistic(payload) {
  const res = await client.post(`${BASE}/statistics`, payload);
  return res.data;
}
export async function updateAboutStatistic(id, payload) {
  const res = await client.patch(`${BASE}/statistics/${id}`, payload);
  return res.data;
}
export async function deleteAboutStatistic(id) {
  const res = await client.delete(`${BASE}/statistics/${id}`);
  return res.data;
}
export async function reorderAboutStatistics(payload) {
  const res = await client.put(`${BASE}/statistics/reorder`, payload);
  return res.data;
}

// ─── FAQs ─────────────────────────────────────────────────────────────────────

export async function listAboutFaqs() {
  const res = await client.get(`${BASE}/faqs`);
  return res.data;
}
export async function createAboutFaq(payload) {
  const res = await client.post(`${BASE}/faqs`, payload);
  return res.data;
}
export async function updateAboutFaq(id, payload) {
  const res = await client.patch(`${BASE}/faqs/${id}`, payload);
  return res.data;
}
export async function deleteAboutFaq(id) {
  const res = await client.delete(`${BASE}/faqs/${id}`);
  return res.data;
}
export async function reorderAboutFaqs(payload) {
  const res = await client.put(`${BASE}/faqs/reorder`, payload);
  return res.data;
}
