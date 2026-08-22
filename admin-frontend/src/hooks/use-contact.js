/**
 * React Query hooks for the Contact CMS module.
 *
 * Query keys:
 *   ['contact', 'settings']   — ContactSettings singleton (phone, email, address, hours)
 *   ['contact', 'page']       — ContactPageCMS singleton  (hero, display toggles)
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getContactSettings, updateContactSettings,
  getContactPageCms, updateContactPageCms,
} from '@/api/contact.api';
import MediaService from '@/services/media.service';

export const CONTACT_QUERY_KEYS = {
  settings: ['contact', 'settings'],
  page:     ['contact', 'page'],
};

// ─── Contact Settings ─────────────────────────────────────────────────────────

export function useContactSettings() {
  return useQuery({
    queryKey: CONTACT_QUERY_KEYS.settings,
    queryFn: getContactSettings,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useUpdateContactSettings(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => updateContactSettings(payload),
    onSuccess: (data, ...rest) => {
      qc.setQueryData(CONTACT_QUERY_KEYS.settings, data);
      options.onSuccess?.(data, ...rest);
    },
    onError: options.onError,
  });
}

// ─── Contact Page CMS ─────────────────────────────────────────────────────────

export function useContactPageCms() {
  return useQuery({
    queryKey: CONTACT_QUERY_KEYS.page,
    queryFn: getContactPageCms,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useUpdateContactPageCms(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => updateContactPageCms(payload),
    onSuccess: (data, variables, ...rest) => {
      // Preserve the frontend-enriched hero_background_image_url.
      // The raw API response never contains a full browser URL — it is
      // computed client-side via buildMediaUrl(file_url).
      // We keep the URL the caller passed in (from their local form state)
      // so the image doesn't vanish after saving.
      qc.setQueryData(CONTACT_QUERY_KEYS.page, {
        ...data,
        hero_background_image_url:
          data.hero_background_image_url          // in case backend ever resolves it
          ?? variables?.hero_background_image_url  // carry it from the mutation payload
          ?? null,
      });
      options.onSuccess?.(data, ...rest);
    },
    onError: options.onError,
  });
}
