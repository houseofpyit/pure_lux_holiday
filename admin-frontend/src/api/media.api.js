/**
 * Media API module.
 *
 * All media upload and management calls go through here.
 * No other module should call these endpoints directly —
 * use MediaService or the useMedia hooks instead.
 */
import client from '@/api/client';

const BASE = '/api/v1/media';

// ─── Upload ──────────────────────────────────────────────────────────────────

/**
 * Upload a file to the media library.
 * @param {File} file
 * @param {string} [folder='general']
 * @param {string} [altText]
 * @param {(pct: number) => void} [onProgress]
 * @returns {Promise<MediaUploadResponse>}
 */
export async function uploadMedia(file, folder = 'general', altText, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  if (altText) formData.append('alt_text', altText);

  const res = await client.post(`${BASE}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (evt) => {
          if (evt.total) onProgress(Math.round((evt.loaded * 100) / evt.total));
        }
      : undefined,
  });
  return res.data;
}

// ─── List / Get ───────────────────────────────────────────────────────────────

/**
 * GET /api/v1/media
 * @param {object} [params]
 * @returns {Promise<MediaListResponse>}
 */
export async function listMedia(params = {}) {
  const res = await client.get(BASE, { params });
  return res.data;
}

/**
 * GET /api/v1/media/:id
 * @param {string} mediaId
 * @returns {Promise<MediaDetailResponse>}
 */
export async function getMedia(mediaId) {
  const res = await client.get(`${BASE}/${mediaId}`);
  return res.data;
}

/**
 * GET /api/v1/media/folders
 * @returns {Promise<Array<{ name: string, count: number }>>}
 */
export async function listFolders() {
  const res = await client.get(`${BASE}/folders`);
  return res.data;
}

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/media/:id  (update alt text)
 * @param {string} mediaId
 * @param {string} altText
 * @returns {Promise<MediaDetailResponse>}
 */
export async function updateMediaAltText(mediaId, altText) {
  const res = await client.patch(`${BASE}/${mediaId}`, { alt_text: altText });
  return res.data;
}

/**
 * PATCH /api/v1/media/:id/move
 * @param {string} mediaId
 * @param {string} folder
 * @returns {Promise<MediaDetailResponse>}
 */
export async function moveMedia(mediaId, folder) {
  const res = await client.patch(`${BASE}/${mediaId}/move`, { folder });
  return res.data;
}

// ─── Delete / Restore ────────────────────────────────────────────────────────

/**
 * DELETE /api/v1/media/:id
 * @param {string} mediaId
 * @returns {Promise<{ message: string }>}
 */
export async function deleteMedia(mediaId) {
  const res = await client.delete(`${BASE}/${mediaId}`);
  return res.data;
}

/**
 * POST /api/v1/media/bulk-delete
 * @param {string[]} ids
 * @returns {Promise<BulkActionResponse>}
 */
export async function bulkDeleteMedia(ids) {
  const res = await client.post(`${BASE}/bulk-delete`, { ids });
  return res.data;
}
