import { useQuery } from '@tanstack/react-query';
import { getActiveNavigation } from '@/api/global.api';
import { getPublicFooter } from '@/api/footer.api';
import { getPublicContact } from '@/api/contact.api';
import { queryKeys } from '@/api/query-keys';
import { cacheTimes } from '@/lib/api-cache';
import { mapFooterSection, mapNavigationItem, mapPublicContact } from '@/services/mappers/public.mapper';

export function useNavigation() {
  return useQuery({
    queryKey: queryKeys.global.navigation,
    queryFn: async () => {
      const items = await getActiveNavigation();
      return (items || []).map(mapNavigationItem).filter(Boolean);
    },
    staleTime: cacheTimes.cms,
    retry: 1,
  });
}

export function useFooter() {
  return useQuery({
    queryKey: queryKeys.global.footer,
    queryFn: async () => {
      const sections = await getPublicFooter();
      return (sections || []).map(mapFooterSection).filter(Boolean);
    },
    staleTime: cacheTimes.cms,
    retry: 1,
  });
}

export function useFooterContact() {
  return useQuery({
    queryKey: queryKeys.global.contact,
    queryFn: async () => mapPublicContact(await getPublicContact()),
    staleTime: cacheTimes.cms,
    retry: 1,
  });
}
