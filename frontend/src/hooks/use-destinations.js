import { useQuery } from '@tanstack/react-query';
import { getPublicDestinations } from '@/api/destinations.api';
import { getHomepage } from '@/api/home.api';
import { cacheTimes } from '@/lib/api-cache';
import { queryKeys } from '@/api/query-keys';
import { mapDestination, mapCta } from '@/services/mappers/public.mapper';

export function useDestinations() {
  return useQuery({
    queryKey: queryKeys.destinations.all,
    queryFn: async () => {
      const raw = await getPublicDestinations();
      return (raw || []).map(mapDestination);
    },
    staleTime: cacheTimes.list,
    retry: 1,
  });
}

export function useDestinationsPageCta() {
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
