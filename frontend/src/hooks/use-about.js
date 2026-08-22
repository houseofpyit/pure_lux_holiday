import { useQuery } from '@tanstack/react-query';
import { getAboutPage } from '@/api/about.api';
import { getHomepage } from '@/api/home.api';
import { cacheTimes } from '@/lib/api-cache';
import { queryKeys } from '@/api/query-keys';
import { mapPublicAbout, mapCta } from '@/services/mappers/public.mapper';

export function useAbout() {
  return useQuery({
    queryKey: queryKeys.about.all,
    queryFn: async () => {
      const raw = await getAboutPage();
      return mapPublicAbout(raw);
    },
    staleTime: cacheTimes.cms,
    retry: 1,
  });
}

export function useAboutPageCta() {
  return useQuery({
    queryKey: queryKeys.home.cta,
    queryFn: async () => {
      const raw = await getHomepage();
      return mapCta(raw?.cta);
    },
    staleTime: cacheTimes.cms,
    retry: 1,
  });
}
