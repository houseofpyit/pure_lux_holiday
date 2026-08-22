import { useQuery } from '@tanstack/react-query';
import { getPublicPackageBySlug } from '@/api/packages.api';
import { getPublicPackageTestimonials } from '@/api/testimonials.api';
import { queryKeys } from '@/api/query-keys';
import { cacheTimes } from '@/lib/api-cache';
import { mapPackageDetail, mapTestimonial } from '@/services/mappers/public.mapper';

export function usePackageDetail(slug) {
  return useQuery({
    queryKey: queryKeys.packages.detail(slug),
    queryFn: async () => mapPackageDetail(await getPublicPackageBySlug(slug)),
    enabled: Boolean(slug),
    staleTime: cacheTimes.list,
    retry: 1,
  });
}

export function usePackageTestimonials(slug) {
  return useQuery({
    queryKey: queryKeys.testimonials.package(slug),
    queryFn: async () => {
      const raw = await getPublicPackageTestimonials(slug);
      return (raw || []).map(mapTestimonial);
    },
    enabled: Boolean(slug),
    staleTime: cacheTimes.list,
    retry: 1,
  });
}

