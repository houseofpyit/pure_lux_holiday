import { useQuery } from '@tanstack/react-query';
import { getHomepage } from '@/api/home.api';
import { getPublicTestimonials } from '@/api/testimonials.api';
import { getPublicBlog } from '@/api/blog.api';
import { cacheTimes } from '@/lib/api-cache';
import { queryKeys } from '@/api/query-keys';
import { mapHomepage, mapTestimonial, mapArticle } from '@/services/mappers/public.mapper';

export const PUBLIC_HOME_QUERY_KEY = queryKeys.home.all;

export function useHomepage() {
  return useQuery({
    queryKey: PUBLIC_HOME_QUERY_KEY,
    queryFn: async () => {
      const raw = await getHomepage();
      return mapHomepage(raw);
    },
    staleTime: cacheTimes.cms,
    retry: 1,
  });
}

export function useHomeTestimonials() {
  return useQuery({
    queryKey: queryKeys.testimonials.home,
    queryFn: async () => {
      const raw = await getPublicTestimonials();
      const list = raw?.homepage_featured?.length
        ? raw.homepage_featured
        : raw?.featured?.length
          ? raw.featured
          : (raw?.latest || []);
      return list.map(mapTestimonial);
    },
    staleTime: cacheTimes.cms,
    retry: 1,
  });
}

export function useHomeJournal() {
  return useQuery({
    queryKey: queryKeys.blog.all,
    queryFn: async () => {
      const raw = await getPublicBlog();
      const list = raw?.homepage_featured?.length
        ? raw.homepage_featured
        : raw?.featured?.length
          ? raw.featured
          : (raw?.latest || []);
      return list.slice(0, 3).map(mapArticle);
    },
    staleTime: cacheTimes.list,
    retry: 1,
  });
}
