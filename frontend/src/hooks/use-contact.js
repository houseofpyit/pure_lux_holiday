import { useQuery } from '@tanstack/react-query';
import { getPublicContact } from '@/api/contact.api';
import { cacheTimes } from '@/lib/api-cache';
import { queryKeys } from '@/api/query-keys';
import { mapPublicContact } from '@/services/mappers/public.mapper';

export function useContact() {
  return useQuery({
    queryKey: queryKeys.global.contact,
    queryFn: async () => {
      const raw = await getPublicContact();
      return mapPublicContact(raw);
    },
    staleTime: cacheTimes.cms,
    retry: 1,
  });
}
