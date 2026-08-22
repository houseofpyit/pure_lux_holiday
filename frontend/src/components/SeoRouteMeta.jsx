import { useLocation } from 'react-router-dom';
import SeoMeta from '@/components/SeoMeta';
import { buildCanonicalUrl, resolveSeoPageKey } from '@/lib/seo-routes';

export default function SeoRouteMeta() {
  const { pathname } = useLocation();
  const pageKey = resolveSeoPageKey(pathname);

  return (
    <SeoMeta
      pageKey={pageKey}
      canonicalUrl={buildCanonicalUrl(pathname)}
    />
  );
}
