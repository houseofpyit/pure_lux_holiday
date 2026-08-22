import { useQuery } from '@tanstack/react-query';
import { getPublicPackages } from '@/api/packages.api';
import { getHomepage } from '@/api/home.api';
import { cacheTimes } from '@/lib/api-cache';
import { queryKeys } from '@/api/query-keys';
import { mapPublicPackages, mapCta, mapCollection } from '@/services/mappers/public.mapper';

export function usePackages() {
  return useQuery({
    queryKey: queryKeys.packages.all,
    queryFn: async () => {
      const raw = await getPublicPackages();
      return mapPublicPackages(raw);
    },
    staleTime: cacheTimes.list,
    retry: 1,
  });
}

export function usePackagesPageCta() {
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

export function usePackagesCollections() {
  return useQuery({
    queryKey: queryKeys.home.collections,
    queryFn: async () => {
      const raw = await getHomepage();
      return (raw?.collections || []).map(mapCollection);
    },
    staleTime: cacheTimes.cms,
    retry: 1,
  });
}
