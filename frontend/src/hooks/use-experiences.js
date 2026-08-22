import { useQuery } from '@tanstack/react-query';
import { getPublicExperiences } from '@/api/experiences.api';
import { getHomepage } from '@/api/home.api';
import { cacheTimes } from '@/lib/api-cache';
import { queryKeys } from '@/api/query-keys';
import { mapExperience, mapCta } from '@/services/mappers/public.mapper';

export function useExperiences() {
  return useQuery({
    queryKey: queryKeys.experiences.all,
    queryFn: async () => {
      const raw = await getPublicExperiences();
      return (raw || []).map(mapExperience);
    },
    staleTime: cacheTimes.list,
    retry: 1,
  });
}

export function useExperiencesPageCta() {
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
