import { useQuery } from '@tanstack/react-query';
import { getGlobalSeo, getPageSeo } from '@/api/seo.api';
import { queryKeys } from '@/api/query-keys';
import { cacheTimes } from '@/lib/api-cache';
import { mapSeo } from '@/services/mappers/public.mapper';

export function useGlobalSeo() {
  return useQuery({
    queryKey: queryKeys.seo.global,
    queryFn: async () => mapSeo(await getGlobalSeo()),
    staleTime: cacheTimes.cms,
    retry: 1,
  });
}

export function usePageSeo(pageKey) {
  return useQuery({
    queryKey: queryKeys.seo.page(pageKey),
    queryFn: async () => {
      try {
        return mapSeo(await getPageSeo(pageKey));
      } catch (err) {
        if (err?.status === 404) return null;
        throw err;
      }
    },
    enabled: Boolean(pageKey),
    staleTime: cacheTimes.cms,
    retry: (count, err) => err?.status !== 404 && count < 1,
  });
}
