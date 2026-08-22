/**
 * Map public routes to SEO page_key values used in admin / backend.
 */
export function resolveSeoPageKey(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';

  if (path === '/') return 'home';
  if (path === '/about') return 'about';
  if (path === '/destinations') return 'destinations';
  if (path === '/experiences') return 'experiences';
  if (path === '/packages') return 'packages';
  if (path.startsWith('/packages/')) return 'packages';
  if (path === '/gallery') return 'gallery';
  if (path === '/journal') return 'journal';
  if (path.startsWith('/journal/')) return 'journal';
  if (path === '/contact') return 'contact';
  if (path === '/plan-my-journey') return 'plan-my-journey';
  if (path === '/testimonials') return 'testimonials';
  if (path === '/faq') return 'faq';
  if (path === '/privacy') return 'privacy';
  if (path === '/terms') return 'terms';

  return null;
}

export function buildCanonicalUrl(pathname, baseUrl) {
  const base = (baseUrl || window.location.origin).replace(/\/+$/, '');
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${base}${path === '/' ? '' : path}` || base;
}
