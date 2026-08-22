import { useQuery } from '@tanstack/react-query';
import { getPublicGallery } from '@/api/gallery.api';
import { getHomepage } from '@/api/home.api';
import { cacheTimes } from '@/lib/api-cache';
import { queryKeys } from '@/api/query-keys';
import { mapPublicGallery, mapCta } from '@/services/mappers/public.mapper';

export function useGallery() {
  return useQuery({
    queryKey: queryKeys.gallery.all,
    queryFn: async () => {
      const raw = await getPublicGallery();
      return mapPublicGallery(raw);
    },
    staleTime: cacheTimes.list,
    retry: 1,
  });
}

export function useGalleryPageCta() {
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
