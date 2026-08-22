import { resolveMedia } from '@/lib/media';

export function mapCta(data) {
  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    subtitle: data.subtitle,
    buttonText: data.button_text,
    buttonUrl: data.button_url,
    backgroundImageId: data.background_image_id,
    backgroundImage: resolveMedia(data.background_image || data.background_image_url),
    isActive: data.is_active,
    raw: data,
  };
}

export function mapSeo(data) {
  if (!data) return null;

  return {
    title: data.meta_title || data.default_meta_title || data.seo_title,
    description: data.meta_description || data.default_meta_description || data.seo_description,
    keywords: data.keywords || data.meta_keywords || data.default_keywords,
    canonicalUrl: data.canonical_url,
    robots: data.robots || data.default_robots,
    siteName: data.site_name,
    openGraph: {
      title: data.og_title || data.meta_title || data.default_meta_title,
      description: data.og_description || data.meta_description || data.default_meta_description,
      image: resolveMedia(data.og_image || data.default_og_image || data.og_image_url),
      imageId: data.og_image_id || data.default_og_image_id,
    },
    twitter: {
      card: data.twitter_card,
      title: data.twitter_title || data.meta_title,
      description: data.twitter_description || data.meta_description,
      image: resolveMedia(data.twitter_image || data.default_twitter_image || data.twitter_image_url),
      imageId: data.twitter_image_id || data.default_twitter_image_id,
    },
    themeColor: data.theme_color,
    schemaJson: data.schema_json,
    raw: data,
  };
}

export function mapPackageSummary(data) {
  if (!data) return null;

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    shortDescription: data.short_description,
    country: data.country,
    city: data.city,
    durationDays: data.duration_days,
    durationNights: data.duration_nights,
    startingPrice: data.starting_price,
    currency: data.currency,
    featuredImageId: data.featured_image_id,
    featuredImage: resolveMedia(data.featured_image),
    isFeatured: data.is_featured,
    isPopular: data.is_popular,
    isActive: data.is_active,
    category: data.category
      ? {
          id: data.category.id,
          name: data.category.name,
          slug: data.category.slug,
        }
      : null,
    raw: data,
  };
}

export function mapPublicPackages(data) {
  if (!data) return { featured: [], popular: [], latest: [], all: [] };

  const featured = (data.featured || []).map(mapPackageSummary);
  const popular = (data.popular || []).map(mapPackageSummary);
  const latest = (data.latest || []).map(mapPackageSummary);

  const seen = new Set();
  const all = [];
  for (const pkg of [...featured, ...popular, ...latest]) {
    if (pkg && !seen.has(pkg.id)) {
      seen.add(pkg.id);
      all.push(pkg);
    }
  }

  all.sort((a, b) => {
    if (Boolean(b.isFeatured) !== Boolean(a.isFeatured)) {
      return Number(b.isFeatured) - Number(a.isFeatured);
    }
    const aPrice = a.startingPrice ?? Number.MAX_SAFE_INTEGER;
    const bPrice = b.startingPrice ?? Number.MAX_SAFE_INTEGER;
    return aPrice - bPrice;
  });

  return { featured, popular, latest, all };
}

export function mapPackageDetail(data) {
  if (!data) return null;

  return {
    ...mapPackageSummary(data),
    description: data.description,
    bannerImageId: data.banner_image_id,
    bannerImage: resolveMedia(data.banner_image),
    videoId: data.video_id,
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
    gallery: (data.gallery || []).map((item) => ({
      id: item.id,
      media: resolveMedia(item.media),
      displayOrder: item.display_order,
    })),
    itinerary: (data.itinerary || []).map((day) => ({
      id: day.id,
      dayNumber: day.day_number,
      title: day.title,
      description: day.description,
      hotel: day.hotel,
      mealPlan: day.meal_plan,
      displayOrder: day.display_order,
    })),
    highlights: (data.highlights || []).map((item) => ({
      id: item.id,
      title: item.title,
      icon: item.icon,
      displayOrder: item.display_order,
    })),
    faqs: (data.faqs || []).map((item) => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
      displayOrder: item.display_order,
    })),
    inclusions: (data.inclusions || []).map((item) => ({
      id: item.id,
      title: item.title,
      displayOrder: item.display_order,
    })),
    exclusions: (data.exclusions || []).map((item) => ({
      id: item.id,
      title: item.title,
      displayOrder: item.display_order,
    })),
    raw: data,
  };
}

export function mapPublicBlog(data) {
  if (!data) {
    return { homepageFeatured: [], featured: [], latest: [], popular: [], all: [] };
  }

  const homepageFeatured = (data.homepage_featured || []).map(mapArticle);
  const featured = (data.featured || []).map(mapArticle);
  const latest = (data.latest || []).map(mapArticle);
  const popular = (data.popular || []).map(mapArticle);

  const seen = new Set();
  const all = [];
  for (const article of [...homepageFeatured, ...featured, ...latest, ...popular]) {
    if (article && !seen.has(article.id)) {
      seen.add(article.id);
      all.push(article);
    }
  }

  all.sort((a, b) => {
    const aTime = a?.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b?.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime;
  });

  return { homepageFeatured, featured, latest, popular, all };
}

export function mapArticleDetail(data) {
  if (!data) return null;

  return {
    ...mapArticle(data),
    content: data.content,
    authorName: data.author_name,
    readingTime: data.reading_time,
    bannerImage: resolveMedia(data.banner_image),
    tags: (data.tags || []).map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    })),
    relatedArticles: (data.related_articles || []).map(mapArticle),
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
    raw: data,
  };
}

export function mapPublicTestimonials(data) {
  if (!data) {
    return { featured: [], homepageFeatured: [], latest: [], all: [] };
  }

  const featured = (data.featured || []).map(mapTestimonial);
  const homepageFeatured = (data.homepage_featured || []).map(mapTestimonial);
  const latest = (data.latest || []).map(mapTestimonial);

  const seen = new Set();
  const all = [];
  for (const item of [...featured, ...homepageFeatured, ...latest]) {
    if (item && !seen.has(item.id)) {
      seen.add(item.id);
      all.push(item);
    }
  }

  return { featured, homepageFeatured, latest, all };
}

export function mapNavigationItem(data) {
  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    url: data.url || `/${data.slug}`,
    target: data.target || '_self',
    order: data.order,
    isActive: data.is_active,
    children: (data.children || []).map(mapNavigationItem).filter(Boolean),
    raw: data,
  };
}

export function mapFooterLink(data) {
  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    url: data.url,
    target: data.target || '_self',
    order: data.order,
    raw: data,
  };
}

export function mapFooterSection(data) {
  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    order: data.order,
    isActive: data.is_active,
    links: (data.links || []).map(mapFooterLink).filter(Boolean),
    raw: data,
  };
}

export function mapLeadership(data) {
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    designation: data.designation,
    bio: data.bio,
    profileImageId: data.profile_image_id,
    linkedinUrl: data.linkedin_url,
    twitterUrl: data.twitter_url,
    email: data.email,
    displayOrder: data.display_order,
    isActive: data.is_active,
    raw: data,
  };
}

export function mapAward(data) {
  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    organization: data.organization,
    awardDate: data.award_date,
    description: data.description,
    imageId: data.image_id,
    displayOrder: data.display_order,
    isActive: data.is_active,
    raw: data,
  };
}

export function mapPartner(data) {
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    website: data.website,
    logoId: data.logo_id,
    description: data.description,
    displayOrder: data.display_order,
    isActive: data.is_active,
    raw: data,
  };
}

export function mapCompanyFaq(data) {
  if (!data) return null;

  return {
    id: data.id,
    question: data.question,
    answer: data.answer,
    displayOrder: data.display_order,
    isActive: data.is_active,
    raw: data,
  };
}

// ─── Home section mappers ─────────────────────────────────────────────────────

export function mapHero(data) {
  if (!data) return null;
  return {
    id: data.id,
    title: data.title,
    subtitle: data.subtitle,
    description: data.description,
    buttonText: data.button_text,
    buttonUrl: data.button_url,
    secondaryButtonText: data.secondary_button_text,
    secondaryButtonUrl: data.secondary_button_url,
    backgroundImageId: data.background_image_id,
    backgroundImage: resolveMedia(data.background_image),
    mobileBackgroundImageId: data.mobile_background_image_id,
    mobileBackgroundImage: resolveMedia(data.mobile_background_image),
    videoId: data.video_id,
    overlayOpacity: data.overlay_opacity ?? 0.5,
    isActive: data.is_active,
    raw: data,
  };
}

export function mapCollection(data) {
  if (!data) return null;
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    shortDescription: data.short_description,
    imageId: data.image_id,
    image: resolveMedia(data.image),
    buttonText: data.button_text,
    buttonUrl: data.button_url,
    displayOrder: data.display_order,
    isActive: data.is_active,
    raw: data,
  };
}

export function mapDestination(data) {
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    country: data.country,
    shortDescription: data.short_description,
    imageId: data.image_id,
    image: resolveMedia(data.image),
    buttonText: data.button_text,
    buttonUrl: data.button_url,
    displayOrder: data.display_order,
    isFeatured: data.is_featured,
    isActive: data.is_active,
    raw: data,
  };
}

export function mapExperience(data) {
  if (!data) return null;
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    shortDescription: data.short_description,
    icon: data.icon,
    imageId: data.image_id,
    image: resolveMedia(data.image),
    buttonText: data.button_text,
    buttonUrl: data.button_url,
    displayOrder: data.display_order,
    isActive: data.is_active,
    raw: data,
  };
}

export function mapStatistic(data) {
  if (!data) return null;
  return {
    id: data.id,
    title: data.title,
    value: data.value,
    suffix: data.suffix,
    icon: data.icon,
    displayOrder: data.display_order,
    isActive: data.is_active,
    raw: data,
  };
}

export function mapWhyChooseItem(data) {
  if (!data) return null;
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    icon: data.icon,
    imageId: data.image_id,
    image: resolveMedia(data.image),
    displayOrder: data.display_order,
    isActive: data.is_active,
    raw: data,
  };
}

export function mapTestimonial(data) {
  if (!data) return null;
  return {
    id: data.id,
    customerName: data.customer_name,
    customerLocation: data.customer_location,
    customerDesignation: data.customer_designation,
    rating: data.rating,
    title: data.title,
    review: data.review,
    profileImageId: data.profile_image_id,
    profileImage: resolveMedia(data.profile_image),
    customerPhotoId: data.customer_photo_id,
    customerPhoto: resolveMedia(data.customer_photo),
    backgroundImageId: data.background_image_id,
    backgroundImage: resolveMedia(data.background_image),
    videoId: data.video_id,
    video: resolveMedia(data.video),
    videoThumbnailId: data.video_thumbnail_id,
    videoThumbnail: resolveMedia(data.video_thumbnail),
    travelDate: data.travel_date,
    isFeatured: data.is_featured,
    homepageFeatured: data.homepage_featured,
    displayOrder: data.display_order,
    isActive: data.is_active,
    raw: data,
  };
}

export function mapArticle(data) {
  if (!data) return null;

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    publishedAt: data.published_at,
    category: data.category?.name || data.category_name || '',
    featuredImageId: data.featured_image_id,
    featuredImage: resolveMedia(data.featured_image),
    homepageFeatured: data.homepage_featured,
    isFeatured: data.is_featured,
    raw: data,
  };
}

export function mapHomepage(data) {
  if (!data) return null;
  return {
    hero: mapHero(data.hero),
    aboutSection: data.about_section,
    collections: (data.collections || []).map(mapCollection),
    destinations: (data.destinations || []).map(mapDestination),
    experiences: (data.experiences || []).map(mapExperience),
    statistics: (data.statistics || []).map(mapStatistic),
    whyChooseUs: (data.why_choose_us || []).map(mapWhyChooseItem),
    cta: mapCta(data.cta),
    raw: data,
  };
}

export function mapGalleryCategory(data) {
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    icon: data.icon,
    displayOrder: data.display_order,
    isActive: data.is_active,
    raw: data,
  };
}

export function mapGalleryAlbum(data) {
  if (!data) return null;
  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    description: data.description,
    country: data.country,
    city: data.city,
    coverMediaId: data.cover_media_id,
    cover: resolveMedia(data.cover),
    featured: data.featured,
    homepageFeatured: data.homepage_featured,
    displayOrder: data.display_order,
    isActive: data.is_active,
    category: data.category ? mapGalleryCategory(data.category) : null,
    raw: data,
  };
}

export function mapGalleryItem(data) {
  if (!data) return null;
  return {
    id: data.id,
    albumId: data.album_id,
    title: data.title || data.album_title,
    description: data.description,
    media: resolveMedia(data.media),
    mediaType: data.media_type,
    isFeatured: data.is_featured,
    displayOrder: data.display_order,
    destination: data.category_slug || null,
    collection: data.category_slug || 'all',
    albumSlug: data.album_slug,
    albumTitle: data.album_title,
    categoryName: data.category_name,
    raw: data,
  };
}

export function mapPublicGallery(data) {
  if (!data) {
    return {
      featuredAlbums: [],
      homepageAlbums: [],
      latestAlbums: [],
      albums: [],
      categories: [],
      items: [],
    };
  }

  return {
    featuredAlbums: (data.featured_albums || []).map(mapGalleryAlbum),
    homepageAlbums: (data.homepage_albums || []).map(mapGalleryAlbum),
    latestAlbums: (data.latest_albums || []).map(mapGalleryAlbum),
    albums: (data.albums || []).map(mapGalleryAlbum),
    categories: (data.categories || []).map(mapGalleryCategory),
    items: (data.items || []).map(mapGalleryItem),
  };
}

export function mapAboutPage(data) {
  if (!data) return null;

  return {
    id: data.id,
    heroTitle: data.hero_title,
    heroSubtitle: data.hero_subtitle,
    heroImageId: data.hero_image_id,
    heroImage: resolveMedia(data.hero_image),
    companyDescription: data.company_description,
    ourStory: data.our_story,
    mission: data.mission,
    vision: data.vision,
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
    isActive: data.is_active,
    raw: data,
  };
}

export function mapCoreValue(data) {
  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    icon: data.icon,
    displayOrder: data.display_order,
    isActive: data.is_active,
    raw: data,
  };
}

export function mapTimelineItem(data) {
  if (!data) return null;

  return {
    id: data.id,
    year: data.year,
    title: data.title,
    description: data.description,
    imageId: data.image_id,
    displayOrder: data.display_order,
    raw: data,
  };
}

export function mapCompanyStatistic(data) {
  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    value: data.value,
    suffix: data.suffix,
    icon: data.icon,
    displayOrder: data.display_order,
    isActive: data.is_active,
    raw: data,
  };
}

export function mapPublicAbout(data) {
  if (!data) {
    return {
      about: null,
      coreValues: [],
      leadership: [],
      timeline: [],
      awards: [],
      partners: [],
      statistics: [],
      faqs: [],
    };
  }

  return {
    about: mapAboutPage(data.about),
    coreValues: (data.core_values || []).map(mapCoreValue),
    leadership: (data.leadership || []).map(mapLeadership),
    timeline: (data.timeline || []).map(mapTimelineItem),
    awards: (data.awards || []).map(mapAward),
    partners: (data.partners || []).map(mapPartner),
    statistics: (data.statistics || []).map(mapCompanyStatistic),
    faqs: (data.faqs || []).map(mapCompanyFaq),
    raw: data,
  };
}

export function mapContactSettings(data) {
  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    phone: data.phone,
    whatsapp: data.whatsapp,
    address: data.address,
    workingHours: data.working_hours,
    googleMapUrl: data.google_map_url,
    emergencyNumber: data.emergency_number,
    raw: data,
  };
}

export function mapContactPage(data) {
  if (!data) return null;

  return {
    id: data.id,
    heroLabel: data.hero_label,
    heroHeading: data.hero_heading,
    heroDescription: data.hero_description,
    heroBackgroundImageId: data.hero_background_image_id,
    heroBackgroundImage: resolveMedia(data.hero_background_image),
    heroOverlayOpacity: data.hero_overlay_opacity,
    heroIsPublished: data.hero_is_published,
    showOfficeLocations: data.show_office_locations,
    showBusinessHours: data.show_business_hours,
    showGoogleMap: data.show_google_map,
    showContactForm: data.show_contact_form,
    showSocialLinks: data.show_social_links,
    defaultMapZoom: data.default_map_zoom,
    enableWhatsappButton: data.enable_whatsapp_button,
    enableCallButton: data.enable_call_button,
    enableEmailButton: data.enable_email_button,
    raw: data,
  };
}

export function mapPublicContact(data) {
  if (!data) {
    return { page: null, settings: null, cta: null };
  }

  return {
    page: mapContactPage(data.page),
    settings: mapContactSettings(data.settings),
    cta: mapCta(data.cta),
    raw: data,
  };
}

export function mapContactInquiryPayload(form) {
  const name = [form.firstName, form.lastName].filter(Boolean).join(' ').trim();

  return {
    name,
    email: form.email,
    phone: form.phone || null,
    subject: form.destination || null,
    message: form.message || null,
    source: 'contact_page',
  };
}

function parseTravelers(value) {
  if (!value) return null;
  const match = String(value).match(/\d+/);
  return match ? Number(match[0]) : null;
}

export function mapJourneyRequestPayload(form) {
  return {
    name: form.name?.trim(),
    email: form.email?.trim(),
    phone: form.phone?.trim() || null,
    destination: form.destination || null,
    travel_date: form.dates || null,
    duration: form.duration || null,
    travelers: parseTravelers(form.travelers),
    budget: form.budget || null,
    special_requirements: form.notes || null,
    message: form.notes || null,
    source: 'plan_my_journey',
  };
}

export function mapNewsletterPayload(email, name = null) {
  return {
    email: email.trim(),
    name: name?.trim() || null,
    source: 'footer',
  };
}
