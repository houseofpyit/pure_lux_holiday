/**
 * AboutService — business logic for the About CMS module.
 *
 * Mirrors the architecture of HomeService:
 *   Component → useAbout hook → AboutService → about.api.js → Axios → Backend
 *
 * Media URL resolution delegates to MediaService.getById() — no duplication.
 */
import {
  getAboutPage, updateAboutPage,
  listCoreValues, createCoreValue, updateCoreValue, deleteCoreValue, reorderCoreValues,
  listLeadership, createLeader, updateLeader, deleteLeader, reorderLeadership,
  listTimeline, createTimelineItem, updateTimelineItem, deleteTimelineItem, reorderTimeline,
  listAwards, createAward, updateAward, deleteAward, reorderAwards,
  listPartners, createPartner, updatePartner, deletePartner, reorderPartners,
  listAboutStatistics, createAboutStatistic, updateAboutStatistic, deleteAboutStatistic, reorderAboutStatistics,
  listAboutFaqs, createAboutFaq, updateAboutFaq, deleteAboutFaq, reorderAboutFaqs,
} from '@/api/about.api';
import MediaService from '@/services/media.service';

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Resolve an image_id to a full browser URL. Silently returns null on failure. */
async function resolveUrl(mediaId) {
  if (!mediaId) return null;
  const m = await MediaService.getById(mediaId);
  return m?.full_url ?? null;
}

/** Resolve a list of items, each with one image field, in parallel. */
async function resolveList(items, imageField = 'image_id') {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      image_url: await resolveUrl(item[imageField]),
    })),
  );
}

// ─── About page (singleton) shape converters ─────────────────────────────────

function aboutApiToForm(data) {
  return {
    id: data.id,
    hero_title: data.hero_title ?? '',
    hero_subtitle: data.hero_subtitle ?? '',
    hero_image_id: data.hero_image_id ?? null,
    company_description: data.company_description ?? '',
    our_story: data.our_story ?? '',
    mission: data.mission ?? '',
    vision: data.vision ?? '',
    seo_title: data.seo_title ?? '',
    seo_description: data.seo_description ?? '',
    is_active: data.is_active ?? true,
    hero_image_url: null,  // resolved separately
  };
}

function aboutFormToApi(form) {
  return {
    hero_title: form.hero_title || undefined,
    hero_subtitle: form.hero_subtitle || undefined,
    hero_image_id: form.hero_image_id || undefined,
    company_description: form.company_description || undefined,
    our_story: form.our_story || undefined,
    mission: form.mission || undefined,
    vision: form.vision || undefined,
    seo_title: form.seo_title || undefined,
    seo_description: form.seo_description || undefined,
    is_active: form.is_active,
  };
}

// ─── Statistic converters ─────────────────────────────────────────────────────
// Backend: title, value, suffix, icon / UI "label" → backend "title"

function statApiToForm(data) {
  return {
    id: data.id,
    title: data.title ?? '',     // "label" in old UI — mapped to backend "title"
    value: data.value ?? '',
    suffix: data.suffix ?? '',
    icon: data.icon ?? '',
    display_order: data.display_order ?? 0,
    is_active: data.is_active ?? true,
  };
}
function statFormToApi(form) {
  return {
    title: form.title || undefined,
    value: form.value || undefined,
    suffix: form.suffix || undefined,
    icon: form.icon || undefined,
    display_order: form.display_order ?? 0,
    is_active: form.is_active,
  };
}

// ─── CoreValue converters ─────────────────────────────────────────────────────

function coreValueApiToForm(data) {
  return {
    id: data.id,
    title: data.title ?? '',
    description: data.description ?? '',
    icon: data.icon ?? '',
    display_order: data.display_order ?? 0,
    is_active: data.is_active ?? true,
  };
}
function coreValueFormToApi(form) {
  return {
    title: form.title || undefined,
    description: form.description || undefined,
    icon: form.icon || undefined,
    display_order: form.display_order ?? 0,
    is_active: form.is_active,
  };
}

// ─── Leadership converters ────────────────────────────────────────────────────

function leaderApiToForm(data) {
  return {
    id: data.id,
    name: data.name ?? '',
    designation: data.designation ?? '',
    bio: data.bio ?? '',
    profile_image_id: data.profile_image_id ?? null,
    linkedin_url: data.linkedin_url ?? '',
    twitter_url: data.twitter_url ?? '',
    email: data.email ?? '',
    display_order: data.display_order ?? 0,
    is_active: data.is_active ?? true,
    image_url: null,
  };
}
function leaderFormToApi(form) {
  return {
    name: form.name || undefined,
    designation: form.designation || undefined,
    bio: form.bio || undefined,
    profile_image_id: form.profile_image_id || undefined,
    linkedin_url: form.linkedin_url || undefined,
    twitter_url: form.twitter_url || undefined,
    email: form.email || undefined,
    display_order: form.display_order ?? 0,
    is_active: form.is_active,
  };
}

// ─── Timeline converters ──────────────────────────────────────────────────────

function timelineApiToForm(data) {
  return {
    id: data.id,
    year: data.year ?? '',
    title: data.title ?? '',
    description: data.description ?? '',
    image_id: data.image_id ?? null,
    display_order: data.display_order ?? 0,
    image_url: null,
  };
}
function timelineFormToApi(form) {
  return {
    year: form.year || undefined,
    title: form.title || undefined,
    description: form.description || undefined,
    image_id: form.image_id || undefined,
    display_order: form.display_order ?? 0,
  };
}

// ─── Award converters ─────────────────────────────────────────────────────────

function awardApiToForm(data) {
  return {
    id: data.id,
    title: data.title ?? '',
    organization: data.organization ?? '',
    award_date: data.award_date ?? '',
    description: data.description ?? '',
    image_id: data.image_id ?? null,
    display_order: data.display_order ?? 0,
    is_active: data.is_active ?? true,
    image_url: null,
  };
}
function awardFormToApi(form) {
  return {
    title: form.title || undefined,
    organization: form.organization || undefined,
    award_date: form.award_date || undefined,
    description: form.description || undefined,
    image_id: form.image_id || undefined,
    display_order: form.display_order ?? 0,
    is_active: form.is_active,
  };
}

// ─── Partner converters ───────────────────────────────────────────────────────

function partnerApiToForm(data) {
  return {
    id: data.id,
    name: data.name ?? '',
    website: data.website ?? '',
    logo_id: data.logo_id ?? null,
    description: data.description ?? '',
    display_order: data.display_order ?? 0,
    is_active: data.is_active ?? true,
    image_url: null,
  };
}
function partnerFormToApi(form) {
  return {
    name: form.name || undefined,
    website: form.website || undefined,
    logo_id: form.logo_id || undefined,
    description: form.description || undefined,
    display_order: form.display_order ?? 0,
    is_active: form.is_active,
  };
}

// ─── FAQ converters ───────────────────────────────────────────────────────────

function faqApiToForm(data) {
  return {
    id: data.id,
    question: data.question ?? '',
    answer: data.answer ?? '',
    display_order: data.display_order ?? 0,
    is_active: data.is_active ?? true,
  };
}
function faqFormToApi(form) {
  return {
    question: form.question || undefined,
    answer: form.answer || undefined,
    display_order: form.display_order ?? 0,
    is_active: form.is_active,
  };
}

// ─── AboutService ─────────────────────────────────────────────────────────────

const AboutService = {

  // ── About Page ──────────────────────────────────────────────────────────────

  async loadAboutPage() {
    const data = await getAboutPage();
    const form = aboutApiToForm(data);
    form.hero_image_url = await resolveUrl(form.hero_image_id);
    return form;
  },

  async updateAboutPage(formValues) {
    const payload = aboutFormToApi(formValues);
    const data = await updateAboutPage(payload);
    const form = aboutApiToForm(data);
    form.hero_image_url = await resolveUrl(form.hero_image_id);
    return form;
  },

  // ── Statistics ───────────────────────────────────────────────────────────────

  async loadStatistics() {
    const items = await listAboutStatistics();
    return items.map(statApiToForm);
  },
  async createStatistic(form) {
    const data = await createAboutStatistic(statFormToApi(form));
    return statApiToForm(data);
  },
  async updateStatistic(id, form) {
    const data = await updateAboutStatistic(id, statFormToApi(form));
    return statApiToForm(data);
  },
  async deleteStatistic(id) { await deleteAboutStatistic(id); },
  async reorderStatistics(items) {
    const data = await reorderAboutStatistics({ items });
    return data.map(statApiToForm);
  },

  // ── Core Values ──────────────────────────────────────────────────────────────

  async loadCoreValues() {
    const items = await listCoreValues();
    return items.map(coreValueApiToForm);
  },
  async createCoreValue(form) {
    const data = await createCoreValue(coreValueFormToApi(form));
    return coreValueApiToForm(data);
  },
  async updateCoreValue(id, form) {
    const data = await updateCoreValue(id, coreValueFormToApi(form));
    return coreValueApiToForm(data);
  },
  async deleteCoreValue(id) { await deleteCoreValue(id); },
  async reorderCoreValues(items) {
    const data = await reorderCoreValues({ items });
    return data.map(coreValueApiToForm);
  },

  // ── Leadership ───────────────────────────────────────────────────────────────

  async loadLeadership() {
    const items = await listLeadership();
    const forms = items.map(leaderApiToForm);
    return resolveList(forms, 'profile_image_id');
  },
  async createLeader(form) {
    const data = await createLeader(leaderFormToApi(form));
    const f = leaderApiToForm(data);
    f.image_url = await resolveUrl(f.profile_image_id);
    return f;
  },
  async updateLeader(id, form) {
    const data = await updateLeader(id, leaderFormToApi(form));
    const f = leaderApiToForm(data);
    f.image_url = await resolveUrl(f.profile_image_id);
    return f;
  },
  async deleteLeader(id) { await deleteLeader(id); },
  async reorderLeadership(items) {
    const data = await reorderLeadership({ items });
    return data.map(leaderApiToForm);
  },

  // ── Timeline ─────────────────────────────────────────────────────────────────

  async loadTimeline() {
    const items = await listTimeline();
    const forms = items.map(timelineApiToForm);
    return resolveList(forms, 'image_id');
  },
  async createTimelineItem(form) {
    const data = await createTimelineItem(timelineFormToApi(form));
    const f = timelineApiToForm(data);
    f.image_url = await resolveUrl(f.image_id);
    return f;
  },
  async updateTimelineItem(id, form) {
    const data = await updateTimelineItem(id, timelineFormToApi(form));
    const f = timelineApiToForm(data);
    f.image_url = await resolveUrl(f.image_id);
    return f;
  },
  async deleteTimelineItem(id) { await deleteTimelineItem(id); },
  async reorderTimeline(items) {
    const data = await reorderTimeline({ items });
    return data.map(timelineApiToForm);
  },

  // ── Awards ───────────────────────────────────────────────────────────────────

  async loadAwards() {
    const items = await listAwards();
    const forms = items.map(awardApiToForm);
    return resolveList(forms, 'image_id');
  },
  async createAward(form) {
    const data = await createAward(awardFormToApi(form));
    const f = awardApiToForm(data);
    f.image_url = await resolveUrl(f.image_id);
    return f;
  },
  async updateAward(id, form) {
    const data = await updateAward(id, awardFormToApi(form));
    const f = awardApiToForm(data);
    f.image_url = await resolveUrl(f.image_id);
    return f;
  },
  async deleteAward(id) { await deleteAward(id); },
  async reorderAwards(items) {
    const data = await reorderAwards({ items });
    return data.map(awardApiToForm);
  },

  // ── Partners ─────────────────────────────────────────────────────────────────

  async loadPartners() {
    const items = await listPartners();
    const forms = items.map(partnerApiToForm);
    return resolveList(forms, 'logo_id');
  },
  async createPartner(form) {
    const data = await createPartner(partnerFormToApi(form));
    const f = partnerApiToForm(data);
    f.image_url = await resolveUrl(f.logo_id);
    return f;
  },
  async updatePartner(id, form) {
    const data = await updatePartner(id, partnerFormToApi(form));
    const f = partnerApiToForm(data);
    f.image_url = await resolveUrl(f.logo_id);
    return f;
  },
  async deletePartner(id) { await deletePartner(id); },
  async reorderPartners(items) {
    const data = await reorderPartners({ items });
    return data.map(partnerApiToForm);
  },

  // ── FAQs ─────────────────────────────────────────────────────────────────────

  async loadFaqs() {
    const items = await listAboutFaqs();
    return items.map(faqApiToForm);
  },
  async createFaq(form) {
    const data = await createAboutFaq(faqFormToApi(form));
    return faqApiToForm(data);
  },
  async updateFaq(id, form) {
    const data = await updateAboutFaq(id, faqFormToApi(form));
    return faqApiToForm(data);
  },
  async deleteFaq(id) { await deleteAboutFaq(id); },
  async reorderFaqs(items) {
    const data = await reorderAboutFaqs({ items });
    return data.map(faqApiToForm);
  },
};

export default AboutService;
