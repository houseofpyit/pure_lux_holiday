/**
 * MediaService — business logic for the Media Library module.
 *
 * This is the SINGLE SOURCE OF TRUTH for all media operations.
 * Every CMS module (Hero, Collections, Destinations, Experiences, etc.)
 * must use this service instead of calling media.api.js directly.
 *
 * Flow:
 *   Component → useMedia hook → MediaService → media.api.js → Axios → Backend
 */
import {
  uploadMedia,
  listMedia,
  getMedia,
  listFolders,
  updateMediaAltText,
  moveMedia,
  deleteMedia,
  bulkDeleteMedia,
} from '@/api/media.api';

// ─── URL helper (shared with home.service.js) ─────────────────────────────────

/**
 * Build a fully-qualified browser URL from the backend's relative file_url.
 * Backend returns paths like "/uploads/hero/banner.jpg".
 * In dev, VITE_API_BASE_URL is "http://localhost:8000".
 * In production, files are served from the same origin so base is "".
 *
 * @param {string | null} fileUrl
 * @returns {string | null}
 */
export function buildMediaUrl(fileUrl) {
  if (!fileUrl) return null;
  if (fileUrl.startsWith('http')) return fileUrl;
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  return `${base}${fileUrl}`;
}

/**
 * Enrich a raw API media record with a browser-accessible full_url.
 * @param {object} media  Raw MediaDetailResponse from the API
 * @returns {object}  Media record with full_url added
 */
export function enrichMedia(media) {
  if (!media) return null;
  return { ...media, full_url: buildMediaUrl(media.file_url) };
}

// ─── MediaService ─────────────────────────────────────────────────────────────

const MediaService = {

  /**
   * Upload a file and return the enriched media record.
   * This is the ONE upload function all CMS modules must use.
   *
   * @param {File} file
   * @param {string} [folder='general']  Target folder (e.g. 'hero', 'collections')
   * @param {string} [altText]
   * @param {(pct: number) => void} [onProgress]
   * @returns {Promise<{ id: string, full_url: string, file_url: string, ... }>}
   */
  async upload(file, folder = 'general', altText, onProgress) {
    const media = await uploadMedia(file, folder, altText, onProgress);
    return enrichMedia(media);
  },

  /**
   * List media items with optional filters + pagination.
   * Returns items enriched with full_url.
   *
   * @param {object} [params]  Query params: page, page_size, folder, media_type, search
   * @returns {Promise<{ items: object[], total: number, page: number, ... }>}
   */
  async list(params = {}) {
    const data = await listMedia(params);
    return {
      ...data,
      items: data.items.map(enrichMedia),
    };
  },

  /**
   * Get a single media record by ID, enriched with full_url.
   *
   * @param {string | null} mediaId
   * @returns {Promise<object | null>}
   */
  async getById(mediaId) {
    if (!mediaId) return null;
    try {
      const media = await getMedia(mediaId);
      return enrichMedia(media);
    } catch {
      return null;
    }
  },

  /**
   * Resolve multiple media IDs to enriched records in parallel.
   * Individual failures are silently ignored (returns null for that item).
   *
   * @param {(string | null)[]} mediaIds
   * @returns {Promise<(object | null)[]>}
   */
  async resolveMany(mediaIds) {
    return Promise.all(mediaIds.map((id) => MediaService.getById(id)));
  },

  /**
   * Get all folders with file counts.
   * @returns {Promise<Array<{ name: string, count: number }>>}
   */
  async getFolders() {
    return listFolders();
  },

  /**
   * Update the alt text of a media item.
   * @param {string} mediaId
   * @param {string} altText
   * @returns {Promise<object>}
   */
  async updateAltText(mediaId, altText) {
    const media = await updateMediaAltText(mediaId, altText);
    return enrichMedia(media);
  },

  /**
   * Move a media item to a different folder.
   * @param {string} mediaId
   * @param {string} folder
   * @returns {Promise<object>}
   */
  async move(mediaId, folder) {
    const media = await moveMedia(mediaId, folder);
    return enrichMedia(media);
  },

  /**
   * Soft-delete a single media item.
   * @param {string} mediaId
   * @returns {Promise<void>}
   */
  async delete(mediaId) {
    await deleteMedia(mediaId);
  },

  /**
   * Bulk soft-delete media items.
   * @param {string[]} ids
   * @returns {Promise<{ success_count: number, failed_ids: string[] }>}
   */
  async bulkDelete(ids) {
    return bulkDeleteMedia(ids);
  },
};

export default MediaService;
