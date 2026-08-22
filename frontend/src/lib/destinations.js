/**
 * Build Plan My Journey URL with optional destination pre-selection.
 * @param {{ slug?: string, name?: string } | string | null | undefined} destination
 */
export function planJourneyUrl(destination) {
  if (!destination) return '/plan-my-journey';

  const slug = typeof destination === 'string'
    ? destination
    : destination.slug;

  if (!slug) return '/plan-my-journey';

  return `/plan-my-journey?destination=${encodeURIComponent(slug)}`;
}

/**
 * Resolve a display name for Plan My Journey from slug and/or name hints.
 */
export function resolveDestinationName(destinations, { name, slug } = {}) {
  if (slug && destinations?.length) {
    const bySlug = destinations.find((dest) => dest.slug === slug);
    if (bySlug) return bySlug.name;
  }

  if (name) {
    if (destinations?.length) {
      const byName = destinations.find(
        (dest) => dest.name === name || dest.slug === name,
      );
      if (byName) return byName.name;
    }
    return name;
  }

  return '';
}
