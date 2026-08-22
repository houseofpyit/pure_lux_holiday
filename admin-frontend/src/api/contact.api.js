/**
 * Contact CMS API module.
 *
 * Endpoints:
 *   GET/PUT /api/v1/contact        — ContactSettings  (phone, email, address, hours)
 *   GET/PUT /api/v1/contact-page   — ContactPageCMS   (hero, display toggles)
 *
 * Components never call axios directly.
 */
import client from '@/api/client';

// ─── Contact Settings ─────────────────────────────────────────────────────────

export async function getContactSettings() {
  const res = await client.get('/api/v1/contact');
  return res.data;
}

export async function updateContactSettings(payload) {
  const res = await client.put('/api/v1/contact', payload);
  return res.data;
}

// ─── Contact Page CMS ─────────────────────────────────────────────────────────

export async function getContactPageCms() {
  const res = await client.get('/api/v1/contact-page');
  return res.data;
}

export async function updateContactPageCms(payload) {
  const res = await client.put('/api/v1/contact-page', payload);
  return res.data;
}
