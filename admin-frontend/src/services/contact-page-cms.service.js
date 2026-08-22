/**
 * ContactPageCMSService — business logic for the Contact Page CMS module.
 *
 * Converts between UI-friendly values and backend API shapes:
 *  - overlay_opacity:  backend 0.0–1.0  ↔  UI 0–100 integer
 *  - is_active:        boolean           ↔  UI 'published' | 'draft' string
 *
 * Components call this service. This service calls the API layer.
 * No React component should call the API modules directly.
 */

import {
  getContactPageCMS,
  updateContactPageCMS,
} from '@/api/contact-page-cms.api';
import MediaService from '@/services/media.service';

// Re-export buildMediaUrl from the canonical media service so existing
// imports from this module continue to work without changes.
export { buildMediaUrl } from '@/services/media.service';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Backend stores opacity as 0.0–1.0; UI shows/edits as 0–100. */
export const opacityToUi = (v) => Math.round((v ?? 0.5) * 100);
export const opacityToApi = (v) => Math.max(0, Math.min(1, (v ?? 50) / 100));

/** Map is_active boolean to UI status string and back. */
export const activeToStatus = (v) => (v ? 'published' : 'draft');
export const statusToActive = (v) => v === 'published';

// ─── Contact Page CMS ────────────────────────────────────────────────────────

const ContactPageCMSService = {
  /**
   * Load the contact page CMS settings and convert to UI-ready form values.
   * @returns {Promise<UiContactPageCMSForm>}
   */
  async load() {
    const data = await getContactPageCMS();
    const form = contactPageApiToForm(data);
    const media = await ContactPageCMSService.getMedia(form.hero_background_image_id);
    return {
      ...form,
      hero_background_image_url: media?.full_url ?? null,
    };
  },

  /**
   * Save the contact page CMS settings.
   * Converts UI form values back to API shape before sending.
   *
   * @param {UiContactPageCMSForm} formValues
   * @returns {Promise<UiContactPageCMSForm>}
   */
  async update(formValues) {
    const payload = contactPageFormToApi(formValues);
    const data = await updateContactPageCMS(payload);
    const form = contactPageApiToForm(data);
    const media = await ContactPageCMSService.getMedia(form.hero_background_image_id);
    return {
      ...form,
      hero_background_image_url:
        media?.full_url ?? formValues.hero_background_image_url ?? null,
    };
  },

  /**
   * Upload a media file and return the enriched media record.
   * Delegates to MediaService.upload() — single upload implementation.
   *
   * @param {File} file
   * @param {string} [folder='contact']
   * @param {(pct: number) => void} [onProgress]
   * @returns {Promise<{ id: string, file_url: string, full_url: string }>}
   */
  async uploadHeroMedia(file, folder = 'contact', onProgress) {
    return MediaService.upload(file, folder, undefined, onProgress);
  },

  /**
   * Fetch a media record by ID with full_url resolved.
   * Delegates to MediaService.getById() — single media fetch implementation.
   *
   * @param {string} mediaId
   * @returns {Promise<{ id: string, file_url: string, full_url: string } | null>}
   */
  async getMedia(mediaId) {
    return MediaService.getById(mediaId);
  },
};

export default ContactPageCMSService;

// ─── Shape converters ────────────────────────────────────────────────────────

/**
 * Convert the API response to the UI form shape.
 * @param {ContactPageCMSResponse} data
 * @returns {UiContactPageCMSForm}
 */
function contactPageApiToForm(data) {
  return {
    id: data.id,
    // Hero Section
    hero_label: data.hero_label ?? '',
    hero_heading: data.hero_heading ?? '',
    hero_description: data.hero_description ?? '',
    hero_background_image_id: data.hero_background_image_id ?? null,
    hero_overlay_opacity: opacityToUi(data.hero_overlay_opacity),
    hero_is_published: data.hero_is_published ?? true,
    // Resolved URL populated separately by the caller after fetching media record
    hero_background_image_url: null,
    // Contact Page Settings
    show_office_locations: data.show_office_locations ?? true,
    show_business_hours: data.show_business_hours ?? true,
    show_google_map: data.show_google_map ?? true,
    show_contact_form: data.show_contact_form ?? true,
    show_social_links: data.show_social_links ?? true,
    default_map_zoom: data.default_map_zoom ?? '15',
    enable_whatsapp_button: data.enable_whatsapp_button ?? true,
    enable_call_button: data.enable_call_button ?? true,
    enable_email_button: data.enable_email_button ?? true,
    // Reusable Sections
    cta_settings_id: data.cta_settings_id ?? null,
    seo_settings_id: data.seo_settings_id ?? null,
  };
}

/**
 * Convert the UI form shape back to the API update payload.
 * Only includes fields supported by ContactPageCMSUpdate.
 * @param {UiContactPageCMSForm} form
 * @returns {ContactPageCMSUpdate}
 */
function contactPageFormToApi(form) {
  return {
    // Hero Section
    hero_label: form.hero_label || undefined,
    hero_heading: form.hero_heading || undefined,
    hero_description: form.hero_description || undefined,
    hero_background_image_id: form.hero_background_image_id ?? null,
    hero_overlay_opacity: opacityToApi(form.hero_overlay_opacity),
    hero_is_published: form.hero_is_published,
    // Contact Page Settings
    show_office_locations: form.show_office_locations,
    show_business_hours: form.show_business_hours,
    show_google_map: form.show_google_map,
    show_contact_form: form.show_contact_form,
    show_social_links: form.show_social_links,
    default_map_zoom: form.default_map_zoom || undefined,
    enable_whatsapp_button: form.enable_whatsapp_button,
    enable_call_button: form.enable_call_button,
    enable_email_button: form.enable_email_button,
    // Reusable Sections
    cta_settings_id: form.cta_settings_id || undefined,
    seo_settings_id: form.seo_settings_id || undefined,
  };
}
