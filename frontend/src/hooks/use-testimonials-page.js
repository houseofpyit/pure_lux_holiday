import { useQuery } from '@tanstack/react-query';
import { getPublicTestimonials } from '@/api/testimonials.api';
import { queryKeys } from '@/api/query-keys';
import { cacheTimes } from '@/lib/api-cache';
import { mapPublicTestimonials } from '@/services/mappers/public.mapper';

export function useTestimonialsPage() {
  return useQuery({
    queryKey: queryKeys.testimonials.all,
    queryFn: async () => mapPublicTestimonials(await getPublicTestimonials()),
    staleTime: cacheTimes.list,
    retry: 1,
  });
}
