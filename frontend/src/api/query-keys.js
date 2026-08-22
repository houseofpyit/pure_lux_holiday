export const queryKeys = {
  home: {
    all: ['public', 'home'],
    hero: ['public', 'home', 'hero'],
    collections: ['public', 'home', 'collections'],
    destinations: ['public', 'home', 'destinations'],
    experiences: ['public', 'home', 'experiences'],
    statistics: ['public', 'home', 'statistics'],
    whyChoose: ['public', 'home', 'why-choose'],
    cta: ['public', 'home', 'cta'],
  },
  about: {
    all: ['public', 'about'],
  },
  packages: {
    all: ['public', 'packages'],
    detail: (slug) => ['public', 'packages', 'detail', slug],
  },
  destinations: {
    all: ['public', 'destinations'],
    detail: (slug) => ['public', 'destinations', 'detail', slug],
  },
  experiences: {
    all: ['public', 'experiences'],
    detail: (slug) => ['public', 'experiences', 'detail', slug],
  },
  gallery: {
    all: ['public', 'gallery'],
    albums: ['public', 'gallery', 'albums'],
    albumDetail: (slug) => ['public', 'gallery', 'albums', slug],
  },
  blog: {
    all: ['public', 'blog'],
    detail: (slug) => ['public', 'blog', 'detail', slug],
    category: (slug) => ['public', 'blog', 'category', slug],
    tag: (slug) => ['public', 'blog', 'tag', slug],
  },
  testimonials: {
    all: ['public', 'testimonials'],
    home: ['public', 'testimonials', 'home'],
    detail: (id) => ['public', 'testimonials', 'detail', id],
    package: (slug) => ['public', 'packages', slug, 'testimonials'],
    destination: (slug) => ['public', 'destinations', slug, 'testimonials'],
  },
  global: {
    settings: ['public', 'global', 'settings'],
    navigation: ['public', 'global', 'navigation'],
    footer: ['public', 'global', 'footer'],
    contact: ['public', 'contact'],
    cta: ['public', 'global', 'cta'],
  },
  seo: {
    global: ['public', 'seo', 'global'],
    page: (pageKey) => ['public', 'seo', 'page', pageKey],
    robots: ['public', 'seo', 'robots'],
  },
};
