/**
 * HomeService — business logic for the Home CMS module.
 *
 * Converts between UI-friendly values and backend API shapes:
 *  - overlay_opacity:  backend 0.0–1.0  ↔  UI 0–100 integer
 *  - is_active:        boolean           ↔  UI 'published' | 'draft' string
 *
 * Components call this service. This service calls the API layer.
 * No React component should call the API modules directly.
 */
import { getHero, updateHero, getHomeAbout, updateHomeAbout, getCTA, updateCTA, listCollections, createCollection, updateCollection, deleteCollection, reorderCollections, listFeaturedDestinations, createFeaturedDestination, updateFeaturedDestination, deleteFeaturedDestination, reorderFeaturedDestinations, listExperiences, createExperience, updateExperience, deleteExperience, reorderExperiences, listWhyChooseUs, createWhyChooseUs, updateWhyChooseUs, deleteWhyChooseUs, reorderWhyChooseUs, listStatistics, createStatistic, updateStatistic, deleteStatistic, reorderStatistics, listTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, reorderTestimonials, listArticles, patchArticle } from '@/api/home.api';
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

// ─── Hero ────────────────────────────────────────────────────────────────────

const HomeService = {
  /**
   * Load the hero section and convert to UI-ready form values.
   * @returns {Promise<UiHeroForm>}
   */
  async loadHero() {
    const data = await getHero();
    return heroApiToForm(data);
  },

  /**
   * Save the hero section.
   * Converts UI form values back to API shape before sending.
   *
   * @param {UiHeroForm} formValues
   * @returns {Promise<UiHeroForm>}
   */
  async updateHero(formValues) {
    const payload = heroFormToApi(formValues);
    const data = await updateHero(payload);
    return heroApiToForm(data);
  },

  /**
   * Upload a media file and return the enriched media record.
   * Delegates to MediaService.upload() — single upload implementation.
   *
   * @param {File} file
   * @param {string} [folder='hero']
   * @param {(pct: number) => void} [onProgress]
   * @returns {Promise<{ id: string, file_url: string, full_url: string }>}
   */
  async uploadHeroMedia(file, folder = 'hero', onProgress) {
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

  // ─── About Section ────────────────────────────────────────────────────────

  async loadAboutSection() {
    const data = await getHomeAbout();
    const form = aboutSectionApiToForm(data);
    const media = await HomeService.getMedia(form.image_id);
    return { ...form, image_url: media?.full_url ?? data.image_url ?? null };
  },

  async updateAboutSection(formValues) {
    const payload = aboutSectionFormToApi(formValues);
    const data = await updateHomeAbout(payload);
    const form = aboutSectionApiToForm(data);
    const media = await HomeService.getMedia(form.image_id);
    return { ...form, image_url: media?.full_url ?? data.image_url ?? null };
  },

  // ─── CTA ─────────────────────────────────────────────────────────────────

  async loadCTA() {
    const data = await getCTA();
    const form = ctaApiToForm(data);
    const media = await HomeService.getMedia(form.background_image_id);
    return { ...form, background_image_url: media?.full_url ?? null };
  },

  async updateCTA(formValues) {
    const data = await updateCTA(ctaFormToApi(formValues));
    const form = ctaApiToForm(data);
    const media = await HomeService.getMedia(form.background_image_id);
    return {
      ...form,
      background_image_url:
        media?.full_url ?? formValues.background_image_url ?? null,
    };
  },

  // ─── Collections ──────────────────────────────────────────────────────────

  /**
   * Load all collections and resolve image URLs in parallel.
   * @returns {Promise<UiCollection[]>}
   */
  async loadCollections() {
    const items = await listCollections();
    const forms = items.map(collectionApiToForm);

    // Resolve all image URLs in parallel; individual failures are silently ignored
    const resolved = await Promise.all(
      forms.map(async (f) => {
        const media = await HomeService.getMedia(f.image_id);
        return { ...f, image_url: media?.full_url ?? null };
      }),
    );
    return resolved;
  },

  /**
   * Create a new collection.
   * @param {UiCollectionForm} formValues
   * @returns {Promise<UiCollection>}
   */
  async createCollection(formValues) {
    const payload = collectionFormToApi(formValues);
    const data = await createCollection(payload);
    const form = collectionApiToForm(data);
    const media = await HomeService.getMedia(form.image_id);
    return { ...form, image_url: media?.full_url ?? null };
  },

  /**
   * Update an existing collection.
   * @param {string} id
   * @param {UiCollectionForm} formValues
   * @returns {Promise<UiCollection>}
   */
  async updateCollection(id, formValues) {
    const payload = collectionFormToApi(formValues);
    const data = await updateCollection(id, payload);
    const form = collectionApiToForm(data);
    const media = await HomeService.getMedia(form.image_id);
    return { ...form, image_url: media?.full_url ?? null };
  },

  /**
   * Delete a collection by ID.
   * @param {string} id
   * @returns {Promise<void>}
   */
  async deleteCollection(id) {
    await deleteCollection(id);
  },

  /**
   * Reorder collections.
   * @param {Array<{ id: string, display_order: number }>} items
   * @returns {Promise<UiCollection[]>}
   */
  async reorderCollections(items) {
    const data = await reorderCollections({ items });
    return data.map(collectionApiToForm);
  },

  // ─── Featured Destinations ────────────────────────────────────────────────

  /**
   * Load all featured destinations and resolve image URLs in parallel.
   * @returns {Promise<UiFeaturedDestination[]>}
   */
  async loadFeaturedDestinations() {
    const items = await listFeaturedDestinations();
    const forms = items.map(destinationApiToForm);
    const resolved = await Promise.all(
      forms.map(async (f) => {
        const media = await HomeService.getMedia(f.image_id);
        return { ...f, image_url: media?.full_url ?? null };
      }),
    );
    return resolved;
  },

  /**
   * Create a new featured destination.
   * @param {UiFeaturedDestinationForm} formValues
   * @returns {Promise<UiFeaturedDestination>}
   */
  async createFeaturedDestination(formValues) {
    const payload = destinationFormToApi(formValues);
    const data = await createFeaturedDestination(payload);
    const form = destinationApiToForm(data);
    const media = await HomeService.getMedia(form.image_id);
    return { ...form, image_url: media?.full_url ?? null };
  },

  /**
   * Update an existing featured destination.
   * @param {string} id
   * @param {UiFeaturedDestinationForm} formValues
   * @returns {Promise<UiFeaturedDestination>}
   */
  async updateFeaturedDestination(id, formValues) {
    const payload = destinationFormToApi(formValues);
    const data = await updateFeaturedDestination(id, payload);
    const form = destinationApiToForm(data);
    const media = await HomeService.getMedia(form.image_id);
    return { ...form, image_url: media?.full_url ?? null };
  },

  /**
   * Delete a featured destination by ID.
   * @param {string} id
   * @returns {Promise<void>}
   */
  async deleteFeaturedDestination(id) {
    await deleteFeaturedDestination(id);
  },

  /**
   * Reorder featured destinations.
   * @param {Array<{ id: string, display_order: number }>} items
   * @returns {Promise<UiFeaturedDestination[]>}
   */
  async reorderFeaturedDestinations(items) {
    const data = await reorderFeaturedDestinations({ items });
    return data.map(destinationApiToForm);
  },

  // ─── Experiences ──────────────────────────────────────────────────────────

  /**
   * Load all experiences and resolve image URLs in parallel.
   * @returns {Promise<UiExperience[]>}
   */
  async loadExperiences() {
    const items = await listExperiences();
    const forms = items.map(experienceApiToForm);
    const resolved = await Promise.all(
      forms.map(async (f) => {
        const media = await HomeService.getMedia(f.image_id);
        return { ...f, image_url: media?.full_url ?? null };
      }),
    );
    return resolved;
  },

  /**
   * Create a new experience.
   * @param {UiExperienceForm} formValues
   * @returns {Promise<UiExperience>}
   */
  async createExperience(formValues) {
    const payload = experienceFormToApi(formValues);
    const data = await createExperience(payload);
    const form = experienceApiToForm(data);
    const media = await HomeService.getMedia(form.image_id);
    return { ...form, image_url: media?.full_url ?? null };
  },

  /**
   * Update an existing experience.
   * @param {string} id
   * @param {UiExperienceForm} formValues
   * @returns {Promise<UiExperience>}
   */
  async updateExperience(id, formValues) {
    const payload = experienceFormToApi(formValues);
    const data = await updateExperience(id, payload);
    const form = experienceApiToForm(data);
    const media = await HomeService.getMedia(form.image_id);
    return { ...form, image_url: media?.full_url ?? null };
  },

  /**
   * Delete an experience by ID.
   * @param {string} id
   * @returns {Promise<void>}
   */
  async deleteExperience(id) {
    await deleteExperience(id);
  },

  /**
   * Reorder experiences.
   * @param {Array<{ id: string, display_order: number }>} items
   * @returns {Promise<UiExperience[]>}
   */
  async reorderExperiences(items) {
    const data = await reorderExperiences({ items });
    return data.map(experienceApiToForm);
  },

  // ─── Why Choose Us ────────────────────────────────────────────────────────

  /**
   * Load all Why Choose Us items and resolve image URLs in parallel.
   * @returns {Promise<UiWhyChooseUs[]>}
   */
  async loadWhyChooseUs() {
    const items = await listWhyChooseUs();
    const forms = items.map(whyChooseUsApiToForm);
    const resolved = await Promise.all(
      forms.map(async (f) => {
        const media = await HomeService.getMedia(f.image_id);
        return { ...f, image_url: media?.full_url ?? null };
      }),
    );
    return resolved;
  },

  /**
   * Create a new Why Choose Us item.
   * @param {UiWhyChooseUsForm} formValues
   * @returns {Promise<UiWhyChooseUs>}
   */
  async createWhyChooseUs(formValues) {
    const payload = whyChooseUsFormToApi(formValues);
    const data = await createWhyChooseUs(payload);
    const form = whyChooseUsApiToForm(data);
    const media = await HomeService.getMedia(form.image_id);
    return { ...form, image_url: media?.full_url ?? null };
  },

  /**
   * Update an existing Why Choose Us item.
   * @param {string} id
   * @param {UiWhyChooseUsForm} formValues
   * @returns {Promise<UiWhyChooseUs>}
   */
  async updateWhyChooseUs(id, formValues) {
    const payload = whyChooseUsFormToApi(formValues);
    const data = await updateWhyChooseUs(id, payload);
    const form = whyChooseUsApiToForm(data);
    const media = await HomeService.getMedia(form.image_id);
    return { ...form, image_url: media?.full_url ?? null };
  },

  /**
   * Delete a Why Choose Us item by ID.
   * @param {string} id
   * @returns {Promise<void>}
   */
  async deleteWhyChooseUs(id) {
    await deleteWhyChooseUs(id);
  },

  /**
   * Reorder Why Choose Us items.
   * @param {Array<{ id: string, display_order: number }>} items
   * @returns {Promise<UiWhyChooseUs[]>}
   */
  async reorderWhyChooseUs(items) {
    const data = await reorderWhyChooseUs({ items });
    return data.map(whyChooseUsApiToForm);
  },

  // ─── Statistics ──────────────────────────────────────────────────────────

  /** Load all statistics. */
  async loadStatistics() {
    const items = await listStatistics();
    return items.map(statisticApiToForm);
  },

  /** Create a statistic. */
  async createStatistic(formValues) {
    const data = await createStatistic(statisticFormToApi(formValues));
    return statisticApiToForm(data);
  },

  /** Update a statistic. */
  async updateStatistic(id, formValues) {
    const data = await updateStatistic(id, statisticFormToApi(formValues));
    return statisticApiToForm(data);
  },

  /** Delete a statistic. */
  async deleteStatistic(id) {
    await deleteStatistic(id);
  },

  /** Reorder statistics. */
  async reorderStatistics(items) {
    const data = await reorderStatistics({ items });
    return data.map(statisticApiToForm);
  },

  // ─── Testimonials ────────────────────────────────────────────────────────

  /** Load all testimonials with resolved media previews. */
  async loadTestimonials() {
    const items = await listTestimonials();
    const forms = items.map(testimonialApiToForm);
    return Promise.all(forms.map(resolveTestimonialMedia));
  },

  /** Create a testimonial. */
  async createTestimonial(formValues) {
    const data = await createTestimonial(testimonialFormToApi(formValues));
    const form = testimonialApiToForm(data);
    return resolveTestimonialMedia(form);
  },

  /** Update a testimonial. */
  async updateTestimonial(id, formValues) {
    const data = await updateTestimonial(id, testimonialFormToApi(formValues));
    const form = testimonialApiToForm(data);
    return resolveTestimonialMedia(form);
  },

  /** Delete a testimonial. */
  async deleteTestimonial(id) {
    await deleteTestimonial(id);
  },

  /** Reorder testimonials. */
  async reorderTestimonials(items) {
    const data = await reorderTestimonials({ items });
    return Promise.all(data.map(testimonialApiToForm).map(resolveTestimonialMedia));
  },

  // ─── Travel Journal (Blog Articles for Homepage) ──────────────────────────

  /**
   * Load all articles and resolve featured_image URLs in parallel.
   * Returns UI-ready items for the Travel Journal selector.
   * @returns {Promise<UiTravelJournalArticle[]>}
   */
  async loadArticles() {
    const items = await listArticles();
    const forms = items.map(articleApiToForm);
    return Promise.all(
      forms.map(async (f) => {
        const media = await HomeService.getMedia(f.featured_image_id);
        return { ...f, image_url: media?.full_url ?? null };
      }),
    );
  },

  /**
   * Toggle homepage_featured on an article (add/remove from Travel Journal).
   * @param {string} id
   * @param {boolean} featured
   * @returns {Promise<UiTravelJournalArticle>}
   */
  async toggleHomepageFeatured(id, featured) {
    const data = await patchArticle(id, { homepage_featured: featured });
    const form = articleApiToForm(data);
    const media = await HomeService.getMedia(form.featured_image_id);
    return { ...form, image_url: media?.full_url ?? null };
  },
};

export default HomeService;

// ─── Hero shape converters ───────────────────────────────────────────────────

/**
 * Convert the API response to the UI form shape.
 * @param {HeroSectionResponse} data
 * @returns {UiHeroForm}
 */
function heroApiToForm(data) {
  return {
    id: data.id,
    title: data.title ?? '',
    subtitle: data.subtitle ?? '',
    description: data.description ?? '',
    button_text: data.button_text ?? '',
    button_url: data.button_url ?? '',
    secondary_button_text: data.secondary_button_text ?? '',
    secondary_button_url: data.secondary_button_url ?? '',
    background_image_id: data.background_image_id ?? null,
    mobile_background_image_id: data.mobile_background_image_id ?? null,
    video_id: data.video_id ?? null,
    overlay_opacity: opacityToUi(data.overlay_opacity),
    display_order: data.display_order ?? 0,
    is_active: data.is_active ?? true,
    // Resolved URLs populated separately by the hook after fetching media records
    background_image_url: null,
    mobile_background_image_url: null,
  };
}

/**
 * Convert the UI form shape back to the API update payload.
 * Only includes fields supported by HeroSectionUpdate.
 * @param {UiHeroForm} form
 * @returns {HeroSectionUpdate}
 */
function heroFormToApi(form) {
  return {
    title: form.title || undefined,
    subtitle: form.subtitle || undefined,
    description: form.description || undefined,
    button_text: form.button_text || undefined,
    button_url: form.button_url || undefined,
    secondary_button_text: form.secondary_button_text || undefined,
    secondary_button_url: form.secondary_button_url || undefined,
    background_image_id: form.background_image_id || undefined,
    mobile_background_image_id: form.mobile_background_image_id || undefined,
    video_id: form.video_id || undefined,
    overlay_opacity: opacityToApi(form.overlay_opacity),
    display_order: form.display_order,
    is_active: form.is_active,
  };
}

// ─── About Section shape converters ─────────────────────────────────────────

function aboutSectionApiToForm(data) {
  return {
    id: data.id,
    eyebrow: data.eyebrow ?? '',
    heading: data.heading ?? '',
    description: data.description ?? '',
    button_text: data.button_text ?? '',
    button_url: data.button_url ?? '',
    image_id: data.image_id ?? null,
    image_alt: data.image_alt ?? '',
    is_active: data.is_active ?? true,
    image_url: null,
  };
}

function aboutSectionFormToApi(form) {
  return {
    eyebrow: form.eyebrow || undefined,
    heading: form.heading || undefined,
    description: form.description || undefined,
    button_text: form.button_text || undefined,
    button_url: form.button_url || undefined,
    image_id: form.image_id || undefined,
    image_alt: form.image_alt || undefined,
    is_active: form.is_active,
  };
}

// ─── CTA shape converters ───────────────────────────────────────────────────

function ctaApiToForm(data) {
  return {
    id: data.id,
    title: data.title ?? '',
    subtitle: data.subtitle ?? '',
    button_text: data.button_text ?? '',
    button_url: data.button_url ?? '',
    background_image_id: data.background_image_id ?? null,
    is_active: data.is_active ?? true,
    background_image_url: null,
  };
}

function ctaFormToApi(form) {
  return {
    title: form.title || undefined,
    subtitle: form.subtitle || undefined,
    button_text: form.button_text || undefined,
    button_url: form.button_url || undefined,
    background_image_id: form.background_image_id ?? null,
    is_active: form.is_active,
  };
}

// ─── Collection shape converters ─────────────────────────────────────────────

/**
 * Convert a LuxuryCollectionResponse to UI form shape.
 * image_url is NOT set here — callers must resolve it via getMedia().
 * @param {LuxuryCollectionResponse} data
 * @returns {UiCollection}
 */
function collectionApiToForm(data) {
  return {
    id: data.id,
    title: data.title ?? '',
    slug: data.slug ?? '',
    short_description: data.short_description ?? '',
    image_id: data.image_id ?? null,
    button_text: data.button_text ?? '',
    button_url: data.button_url ?? '',
    display_order: data.display_order ?? 0,
    is_active: data.is_active ?? true,
    // Resolved URL populated by the caller after fetching media
    image_url: null,
  };
}

/**
 * Convert UI form values to API create/update payload.
 * @param {UiCollection} form
 * @returns {LuxuryCollectionCreate | LuxuryCollectionUpdate}
 */
function collectionFormToApi(form) {
  return {
    title: form.title || undefined,
    slug: form.slug || undefined,
    short_description: form.short_description || undefined,
    image_id: form.image_id || undefined,
    button_text: form.button_text || undefined,
    button_url: form.button_url || undefined,
    display_order: form.display_order ?? 0,
    is_active: form.is_active,
  };
}

// ─── Featured Destination shape converters ───────────────────────────────────

/**
 * Convert a FeaturedDestinationResponse to UI form shape.
 * image_url is NOT set here — callers must resolve it via getMedia().
 * @param {FeaturedDestinationResponse} data
 * @returns {UiFeaturedDestination}
 */
function destinationApiToForm(data) {
  return {
    id: data.id,
    name: data.name ?? '',
    slug: data.slug ?? '',
    country: data.country ?? '',
    short_description: data.short_description ?? '',
    image_id: data.image_id ?? null,
    button_text: data.button_text ?? '',
    button_url: data.button_url ?? '',
    display_order: data.display_order ?? 0,
    is_featured: data.is_featured ?? false,
    is_active: data.is_active ?? true,
    // Resolved URL populated by the caller after fetching media
    image_url: null,
  };
}

/**
 * Convert UI form values to API create/update payload.
 * @param {UiFeaturedDestination} form
 * @returns {FeaturedDestinationCreate | FeaturedDestinationUpdate}
 */
function destinationFormToApi(form) {
  const payload = {};

  if (form.name !== undefined) payload.name = form.name || undefined;
  if (form.slug !== undefined) payload.slug = form.slug || undefined;
  if (form.country !== undefined) payload.country = form.country?.trim() || null;
  if (form.short_description !== undefined) payload.short_description = form.short_description?.trim() || null;
  if (form.image_id !== undefined) payload.image_id = form.image_id || null;
  if (form.button_text !== undefined) payload.button_text = form.button_text?.trim() || null;
  if (form.button_url !== undefined) payload.button_url = form.button_url?.trim() || null;
  if (form.display_order !== undefined) payload.display_order = form.display_order ?? 0;
  if (form.is_featured !== undefined) payload.is_featured = form.is_featured;
  if (form.is_active !== undefined) payload.is_active = form.is_active;

  return payload;
}

// ─── Experience shape converters ─────────────────────────────────────────────

/**
 * Convert a LuxuryExperienceResponse to UI form shape.
 * image_url is NOT set here — callers must resolve it via getMedia().
 * @param {LuxuryExperienceResponse} data
 * @returns {UiExperience}
 */
function experienceApiToForm(data) {
  return {
    id: data.id,
    title: data.title ?? '',
    slug: data.slug ?? '',
    short_description: data.short_description ?? '',
    icon: data.icon ?? '',
    image_id: data.image_id ?? null,
    button_text: data.button_text ?? '',
    button_url: data.button_url ?? '',
    display_order: data.display_order ?? 0,
    is_active: data.is_active ?? true,
    // Resolved URL populated by the caller after fetching media
    image_url: null,
  };
}

/**
 * Convert UI form values to API create/update payload.
 * @param {UiExperience} form
 * @returns {LuxuryExperienceCreate | LuxuryExperienceUpdate}
 */
function experienceFormToApi(form) {
  return {
    title: form.title || undefined,
    slug: form.slug || undefined,
    short_description: form.short_description || undefined,
    icon: form.icon || undefined,
    image_id: form.image_id || undefined,
    button_text: form.button_text || undefined,
    button_url: form.button_url || undefined,
    display_order: form.display_order ?? 0,
    is_active: form.is_active,
  };
}

// ─── Why Choose Us shape converters ─────────────────────────────────────────

/**
 * Convert a WhyChooseUsResponse to UI form shape.
 * image_url is NOT set here — callers must resolve it via getMedia().
 * @param {WhyChooseUsResponse} data
 * @returns {UiWhyChooseUs}
 */
function whyChooseUsApiToForm(data) {
  return {
    id: data.id,
    title: data.title ?? '',
    description: data.description ?? '',
    icon: data.icon ?? '',
    image_id: data.image_id ?? null,
    display_order: data.display_order ?? 0,
    is_active: data.is_active ?? true,
    // Resolved URL populated by the caller after fetching media
    image_url: null,
  };
}

/**
 * Convert UI form values to API create/update payload.
 * @param {UiWhyChooseUs} form
 * @returns {WhyChooseUsCreate | WhyChooseUsUpdate}
 */
function whyChooseUsFormToApi(form) {
  return {
    title: form.title || undefined,
    description: form.description || undefined,
    icon: form.icon || undefined,
    image_id: form.image_id || undefined,
    display_order: form.display_order ?? 0,
    is_active: form.is_active,
  };
}

// ─── Statistic shape converters ──────────────────────────────────────────────

/**
 * Convert a StatisticResponse to UI form shape.
 * Backend uses "title" — the UI historically called this "label".
 * We keep "title" in the form (matching the backend) and update the UI.
 * @param {StatisticResponse} data
 * @returns {UiStatistic}
 */
function statisticApiToForm(data) {
  return {
    id: data.id,
    title: data.title ?? '',    // displayed as "Label" in the UI
    value: data.value ?? '',
    suffix: data.suffix ?? '',
    icon: data.icon ?? '',
    display_order: data.display_order ?? 0,
    is_active: data.is_active ?? true,
  };
}

/**
 * Convert UI form values to API create/update payload.
 * @param {UiStatistic} form
 * @returns {StatisticCreate | StatisticUpdate}
 */
function statisticFormToApi(form) {
  return {
    title: form.title || undefined,
    value: form.value || undefined,
    suffix: form.suffix || undefined,
    icon: form.icon || undefined,
    display_order: form.display_order ?? 0,
    is_active: form.is_active,
  };
}

// ─── Testimonial shape converters ────────────────────────────────────────────

/**
 * Backend → UI form shape.
 * Field mapping:
 *   customer_name      → customer_name  (UI shows as "Customer Name")
 *   customer_location  → customer_location
 *   customer_designation → customer_designation
 *   review             → review
 *   rating             → rating (1–5)
 *   customer_photo_id  → customer_photo_id (media ID)
 *   background_image_id → background_image_id (media ID)
 *   video_id           → video_id (media ID)
 *   video_thumbnail_id → video_thumbnail_id (media ID)
 *   travel_date        → travel_date (string)
 *   homepage_featured  → homepage_featured (bool — marks as home section item)
 *   is_featured        → is_featured
 *   is_active          → is_active
 *   display_order      → display_order
 * @param {TestimonialResponse} data
 * @returns {UiTestimonial}
 */
function testimonialApiToForm(data) {
  const customerPhotoId = data.customer_photo_id ?? data.profile_image_id ?? null;
  return {
    id: data.id,
    customer_name: data.customer_name ?? '',
    customer_location: data.customer_location ?? '',
    customer_designation: data.customer_designation ?? '',
    title: data.title ?? '',
    review: data.review ?? '',
    rating: data.rating ?? 5,
    customer_photo_id: customerPhotoId,
    profile_image_id: customerPhotoId,
    background_image_id: data.background_image_id ?? null,
    video_id: data.video_id ?? null,
    video_thumbnail_id: data.video_thumbnail_id ?? null,
    travel_date: data.travel_date ? String(data.travel_date).substring(0, 10) : '',
    homepage_featured: data.homepage_featured ?? false,
    is_featured: data.is_featured ?? false,
    is_active: data.is_active ?? true,
    display_order: data.display_order ?? 0,
    // Resolved preview-only values populated by resolveTestimonialMedia.
    image_url: null,
    customer_photo_url: null,
    background_image_url: null,
    video_url: null,
    video_thumbnail_url: null,
    customer_photo_media: null,
    background_image_media: null,
    video_media: null,
    video_thumbnail_media: null,
  };
}

async function resolveTestimonialMedia(form) {
  const [
    customerPhoto,
    backgroundImage,
    video,
    videoThumbnail,
  ] = await MediaService.resolveMany([
    form.customer_photo_id,
    form.background_image_id,
    form.video_id,
    form.video_thumbnail_id,
  ]);

  return {
    ...form,
    image_url: customerPhoto?.full_url ?? null,
    customer_photo_url: customerPhoto?.full_url ?? null,
    background_image_url: backgroundImage?.full_url ?? null,
    video_url: video?.full_url ?? null,
    video_thumbnail_url: videoThumbnail?.full_url ?? null,
    customer_photo_media: customerPhoto,
    background_image_media: backgroundImage,
    video_media: video,
    video_thumbnail_media: videoThumbnail,
  };
}

/**
 * UI form → API create/update payload.
 * @param {UiTestimonial} form
 * @returns {TestimonialCreate | TestimonialUpdate}
 */
function testimonialFormToApi(form) {
  return {
    customer_name: form.customer_name || undefined,
    customer_location: form.customer_location || undefined,
    customer_designation: form.customer_designation || undefined,
    title: form.title || undefined,
    review: form.review || undefined,
    rating: form.rating ?? 5,
    customer_photo_id: form.customer_photo_id || null,
    background_image_id: form.background_image_id || null,
    video_id: form.video_id || null,
    video_thumbnail_id: form.video_thumbnail_id || null,
    travel_date: form.travel_date || undefined,
    homepage_featured: form.homepage_featured,
    is_featured: form.is_featured,
    is_active: form.is_active,
    display_order: form.display_order ?? 0,
  };
}

// ─── Article (Travel Journal) shape converters ───────────────────────────────

/**
 * Convert an ArticleResponse to the UI travel journal shape.
 * image_url is NOT set here — callers must resolve via getMedia().
 * @param {ArticleResponse} data
 * @returns {UiTravelJournalArticle}
 */
function articleApiToForm(data) {
  return {
    id: data.id,
    title: data.title ?? '',
    slug: data.slug ?? '',
    excerpt: data.excerpt ?? '',
    author_name: data.author_name ?? '',
    status: data.status ?? 'draft',
    is_featured: data.is_featured ?? false,
    homepage_featured: data.homepage_featured ?? false,
    featured_image_id: data.featured_image_id ?? null,
    category: data.category ?? null,
    tags: data.tags ?? [],
    published_at: data.published_at ?? null,
    reading_time: data.reading_time ?? 5,
    views_count: data.views_count ?? 0,
    // Resolved URL populated by the caller after fetching media
    image_url: null,
  };
}
