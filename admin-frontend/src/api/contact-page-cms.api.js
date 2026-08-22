/**
 * Contact Page CMS API module.
 *
 * Thin wrappers around the Axios client for contact page CMS endpoints.
 * Services call these; React components never call Axios directly.
 */

import client from '@/api/client';

const BASE = '/api/v1/contact-page';

/**
 * GET /api/v1/contact-page
 * @returns {Promise<ContactPageCMSResponse>}
 */
export async function getContactPageCMS() {
  const res = await client.get(BASE);
  return res.data;
}

/**
 * PUT /api/v1/contact-page
 * @param {ContactPageCMSUpdate} payload
 * @returns {Promise<ContactPageCMSResponse>}
 */
export async function updateContactPageCMS(payload) {
  const res = await client.put(BASE, payload);
  return res.data;
}
