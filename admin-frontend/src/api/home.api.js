/**
 * Home CMS API module.
 *
 * Thin wrappers around the Axios client for home section endpoints.
 * Services call these; React components never call Axios directly.
 */
import client from '@/api/client';

const BASE = '/api/v1/home';

// ─── Hero ────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/home/hero
 * @returns {Promise<HeroSectionResponse>}
 */
export async function getHero() {
  const res = await client.get(`${BASE}/hero`);
  return res.data;
}

/**
 * PUT /api/v1/home/hero
 * @param {Partial<HeroSectionUpdate>} payload
 * @returns {Promise<HeroSectionResponse>}
 */
export async function updateHero(payload) {
  const res = await client.put(`${BASE}/hero`, payload);
  return res.data;
}

// ─── About Section ──────────────────────────────────────────────────────────

export async function getAboutSection() {
  const res = await client.get(`${BASE}/about-section`);
  return res.data;
}

export async function updateAboutSection(payload) {
  const res = await client.put(`${BASE}/about-section`, payload);
  return res.data;
}

// ─── Home About Section ───────────────────────────────────────────────────────

/**
 * GET /api/v1/home/about-section
 * @returns {Promise<HomeAboutSectionResponse>}
 */
export async function getHomeAbout() {
  const res = await client.get(`${BASE}/about-section`);
  return res.data;
}

/**
 * PUT /api/v1/home/about-section
 * @param {HomeAboutSectionUpdate} payload
 * @returns {Promise<HomeAboutSectionResponse>}
 */
export async function updateHomeAbout(payload) {
  const res = await client.put(`${BASE}/about-section`, payload);
  return res.data;
}

// ─── CTA ────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/home/cta
 * @returns {Promise<CTASettingsResponse>}
 */
export async function getCTA() {
  const res = await client.get(`${BASE}/cta`);
  return res.data;
}

/**
 * PUT /api/v1/home/cta
 * @param {CTASettingsUpdate} payload
 * @returns {Promise<CTASettingsResponse>}
 */
export async function updateCTA(payload) {
  const res = await client.put(`${BASE}/cta`, payload);
  return res.data;
}

// ─── Collections ─────────────────────────────────────────────────────────────

/**
 * GET /api/v1/home/collections
 * @returns {Promise<LuxuryCollectionResponse[]>}
 */
export async function listCollections() {
  const res = await client.get(`${BASE}/collections`);
  return res.data;
}

/**
 * POST /api/v1/home/collections
 * @param {LuxuryCollectionCreate} payload
 * @returns {Promise<LuxuryCollectionResponse>}
 */
export async function createCollection(payload) {
  const res = await client.post(`${BASE}/collections`, payload);
  return res.data;
}

/**
 * PATCH /api/v1/home/collections/:id
 * @param {string} id
 * @param {LuxuryCollectionUpdate} payload
 * @returns {Promise<LuxuryCollectionResponse>}
 */
export async function updateCollection(id, payload) {
  const res = await client.patch(`${BASE}/collections/${id}`, payload);
  return res.data;
}

/**
 * DELETE /api/v1/home/collections/:id
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
export async function deleteCollection(id) {
  const res = await client.delete(`${BASE}/collections/${id}`);
  return res.data;
}

/**
 * PUT /api/v1/home/collections/reorder
 * @param {{ items: Array<{ id: string, display_order: number }> }} payload
 * @returns {Promise<LuxuryCollectionResponse[]>}
 */
export async function reorderCollections(payload) {
  const res = await client.put(`${BASE}/collections/reorder`, payload);
  return res.data;
}

// ─── Featured Destinations ────────────────────────────────────────────────────

/**
 * GET /api/v1/home/destinations
 * @returns {Promise<FeaturedDestinationResponse[]>}
 */
export async function listFeaturedDestinations() {
  const res = await client.get(`${BASE}/destinations`);
  return res.data;
}

/**
 * POST /api/v1/home/destinations
 * @param {FeaturedDestinationCreate} payload
 * @returns {Promise<FeaturedDestinationResponse>}
 */
export async function createFeaturedDestination(payload) {
  const res = await client.post(`${BASE}/destinations`, payload);
  return res.data;
}

/**
 * PATCH /api/v1/home/destinations/:id
 * @param {string} id
 * @param {FeaturedDestinationUpdate} payload
 * @returns {Promise<FeaturedDestinationResponse>}
 */
export async function updateFeaturedDestination(id, payload) {
  const res = await client.patch(`${BASE}/destinations/${id}`, payload);
  return res.data;
}

/**
 * DELETE /api/v1/home/destinations/:id
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
export async function deleteFeaturedDestination(id) {
  const res = await client.delete(`${BASE}/destinations/${id}`);
  return res.data;
}

/**
 * PUT /api/v1/home/destinations/reorder
 * @param {{ items: Array<{ id: string, display_order: number }> }} payload
 * @returns {Promise<FeaturedDestinationResponse[]>}
 */
export async function reorderFeaturedDestinations(payload) {
  const res = await client.put(`${BASE}/destinations/reorder`, payload);
  return res.data;
}

// ─── Experiences ──────────────────────────────────────────────────────────────

/**
 * GET /api/v1/home/experiences
 * @returns {Promise<LuxuryExperienceResponse[]>}
 */
export async function listExperiences() {
  const res = await client.get(`${BASE}/experiences`);
  return res.data;
}

/**
 * POST /api/v1/home/experiences
 * @param {LuxuryExperienceCreate} payload
 * @returns {Promise<LuxuryExperienceResponse>}
 */
export async function createExperience(payload) {
  const res = await client.post(`${BASE}/experiences`, payload);
  return res.data;
}

/**
 * PATCH /api/v1/home/experiences/:id
 * @param {string} id
 * @param {LuxuryExperienceUpdate} payload
 * @returns {Promise<LuxuryExperienceResponse>}
 */
export async function updateExperience(id, payload) {
  const res = await client.patch(`${BASE}/experiences/${id}`, payload);
  return res.data;
}

/**
 * DELETE /api/v1/home/experiences/:id
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
export async function deleteExperience(id) {
  const res = await client.delete(`${BASE}/experiences/${id}`);
  return res.data;
}

/**
 * PUT /api/v1/home/experiences/reorder
 * @param {{ items: Array<{ id: string, display_order: number }> }} payload
 * @returns {Promise<LuxuryExperienceResponse[]>}
 */
export async function reorderExperiences(payload) {
  const res = await client.put(`${BASE}/experiences/reorder`, payload);
  return res.data;
}

// ─── Why Choose Us ────────────────────────────────────────────────────────────

/**
 * GET /api/v1/home/why-choose
 * @returns {Promise<WhyChooseUsResponse[]>}
 */
export async function listWhyChooseUs() {
  const res = await client.get(`${BASE}/why-choose`);
  return res.data;
}

/**
 * POST /api/v1/home/why-choose
 * @param {WhyChooseUsCreate} payload
 * @returns {Promise<WhyChooseUsResponse>}
 */
export async function createWhyChooseUs(payload) {
  const res = await client.post(`${BASE}/why-choose`, payload);
  return res.data;
}

/**
 * PATCH /api/v1/home/why-choose/:id
 * @param {string} id
 * @param {WhyChooseUsUpdate} payload
 * @returns {Promise<WhyChooseUsResponse>}
 */
export async function updateWhyChooseUs(id, payload) {
  const res = await client.patch(`${BASE}/why-choose/${id}`, payload);
  return res.data;
}

/**
 * DELETE /api/v1/home/why-choose/:id
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
export async function deleteWhyChooseUs(id) {
  const res = await client.delete(`${BASE}/why-choose/${id}`);
  return res.data;
}

/**
 * PUT /api/v1/home/why-choose/reorder
 * @param {{ items: Array<{ id: string, display_order: number }> }} payload
 * @returns {Promise<WhyChooseUsResponse[]>}
 */
export async function reorderWhyChooseUs(payload) {
  const res = await client.put(`${BASE}/why-choose/reorder`, payload);
  return res.data;
}

// ─── Statistics ───────────────────────────────────────────────────────────────

/**
 * GET /api/v1/home/statistics
 * @returns {Promise<StatisticResponse[]>}
 */
export async function listStatistics() {
  const res = await client.get(`${BASE}/statistics`);
  return res.data;
}

/**
 * POST /api/v1/home/statistics
 * @param {StatisticCreate} payload
 * @returns {Promise<StatisticResponse>}
 */
export async function createStatistic(payload) {
  const res = await client.post(`${BASE}/statistics`, payload);
  return res.data;
}

/**
 * PATCH /api/v1/home/statistics/:id
 * @param {string} id
 * @param {StatisticUpdate} payload
 * @returns {Promise<StatisticResponse>}
 */
export async function updateStatistic(id, payload) {
  const res = await client.patch(`${BASE}/statistics/${id}`, payload);
  return res.data;
}

/**
 * DELETE /api/v1/home/statistics/:id
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
export async function deleteStatistic(id) {
  const res = await client.delete(`${BASE}/statistics/${id}`);
  return res.data;
}

/**
 * PUT /api/v1/home/statistics/reorder
 * @param {{ items: Array<{ id: string, display_order: number }> }} payload
 * @returns {Promise<StatisticResponse[]>}
 */
export async function reorderStatistics(payload) {
  const res = await client.put(`${BASE}/statistics/reorder`, payload);
  return res.data;
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
// Note: testimonials live at /api/v1/testimonials (not under /home/)

const TESTIMONIALS_BASE = '/api/v1/testimonials';

/**
 * GET /api/v1/testimonials
 * @returns {Promise<TestimonialResponse[]>}
 */
export async function listTestimonials() {
  const res = await client.get(TESTIMONIALS_BASE);
  return res.data;
}

/**
 * POST /api/v1/testimonials
 * @param {TestimonialCreate} payload
 * @returns {Promise<TestimonialResponse>}
 */
export async function createTestimonial(payload) {
  const res = await client.post(TESTIMONIALS_BASE, payload);
  return res.data;
}

/**
 * PATCH /api/v1/testimonials/:id
 * @param {string} id
 * @param {TestimonialUpdate} payload
 * @returns {Promise<TestimonialResponse>}
 */
export async function updateTestimonial(id, payload) {
  const res = await client.patch(`${TESTIMONIALS_BASE}/${id}`, payload);
  return res.data;
}

/**
 * DELETE /api/v1/testimonials/:id
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
export async function deleteTestimonial(id) {
  const res = await client.delete(`${TESTIMONIALS_BASE}/${id}`);
  return res.data;
}

/**
 * PUT /api/v1/testimonials/reorder
 * @param {{ items: Array<{ id: string, display_order: number }> }} payload
 * @returns {Promise<TestimonialResponse[]>}
 */
export async function reorderTestimonials(payload) {
  const res = await client.put(`${TESTIMONIALS_BASE}/reorder`, payload);
  return res.data;
}

// ─── Travel Journal (Blog Articles) ──────────────────────────────────────────
// The homepage Travel Journal section is powered by existing blog articles.
// These wrappers reuse /api/v1/blog/articles — no duplicate CMS, just homepage config.

const BLOG_BASE = '/api/v1/blog';

/**
 * GET /api/v1/blog/articles
 * Returns all articles (admin view — all statuses).
 * @returns {Promise<ArticleResponse[]>}
 */
export async function listArticles() {
  const res = await client.get(`${BLOG_BASE}/articles`);
  return res.data;
}

/**
 * PATCH /api/v1/blog/articles/:id
 * Used to toggle homepage_featured on an existing article.
 * @param {string} id
 * @param {Partial<ArticleUpdate>} payload
 * @returns {Promise<ArticleDetailResponse>}
 */
export async function patchArticle(id, payload) {
  const res = await client.patch(`${BLOG_BASE}/articles/${id}`, payload);
  return res.data;
}
