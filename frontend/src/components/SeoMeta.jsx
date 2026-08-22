import { useEffect } from 'react';
import { useGlobalSeo, usePageSeo } from '@/hooks/use-seo';

function upsertMeta(attr, key, content) {
  if (!content) return;

  const selector = `meta[${attr}="${key}"]`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertLink(rel, href) {
  if (!href) return;

  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function upsertJsonLd(id, schemaJson) {
  const existing = document.getElementById(id);
  if (!schemaJson) {
    existing?.remove();
    return;
  }

  let script = existing;
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    document.head.appendChild(script);
  }
  script.textContent = schemaJson;
}

export default function SeoMeta({ pageKey, title, description, image, canonicalUrl, robots }) {
  const { data: globalSeo } = useGlobalSeo();
  const { data: pageSeo } = usePageSeo(pageKey);

  const resolvedTitle = title || pageSeo?.title || globalSeo?.title || 'Pure Luxe Holidays';
  const resolvedDescription = description || pageSeo?.description || globalSeo?.description || '';
  const resolvedKeywords = pageSeo?.keywords || globalSeo?.keywords || '';
  const resolvedImage = image || pageSeo?.openGraph?.image?.url || globalSeo?.openGraph?.image?.url || '';
  const resolvedCanonical = canonicalUrl || pageSeo?.canonicalUrl || globalSeo?.canonicalUrl || window.location.href;
  const resolvedRobots = robots || pageSeo?.robots || globalSeo?.robots || 'index, follow';
  const resolvedSchema = pageSeo?.schemaJson || globalSeo?.schemaJson || '';

  useEffect(() => {
    document.title = resolvedTitle;
    upsertMeta('name', 'description', resolvedDescription);
    upsertMeta('name', 'keywords', resolvedKeywords);
    upsertMeta('name', 'robots', resolvedRobots);
    upsertMeta('name', 'geo.region', 'IN-GJ');
    upsertMeta('name', 'geo.placename', 'Surat');
    upsertMeta('name', 'geo.position', '21.1702;72.8311');
    upsertMeta('name', 'ICBM', '21.1702, 72.8311');
    upsertMeta('property', 'og:title', resolvedTitle);
    upsertMeta('property', 'og:description', resolvedDescription);
    upsertMeta('property', 'og:image', resolvedImage);
    upsertMeta('property', 'og:url', resolvedCanonical);
    upsertMeta('property', 'og:locale', 'en_IN');
    upsertMeta('property', 'og:site_name', globalSeo?.siteName || 'Pure Luxe Holidays');
    upsertMeta('name', 'twitter:card', globalSeo?.twitter?.card || 'summary_large_image');
    upsertMeta('name', 'twitter:title', resolvedTitle);
    upsertMeta('name', 'twitter:description', resolvedDescription);
    upsertMeta('name', 'twitter:image', resolvedImage);
    upsertLink('canonical', resolvedCanonical);
    upsertJsonLd('seo-schema-jsonld', resolvedSchema);
  }, [
    resolvedTitle,
    resolvedDescription,
    resolvedKeywords,
    resolvedImage,
    resolvedCanonical,
    resolvedRobots,
    resolvedSchema,
    globalSeo?.siteName,
    globalSeo?.twitter?.card,
  ]);

  return null;
}
