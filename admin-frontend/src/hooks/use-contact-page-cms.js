/**
 * React Query hooks for the Contact Page CMS module.
 *
 * Query keys:
 *   ['contact-page', 'cms'] — contact page CMS singleton
 *
 * All data mutations invalidate the relevant query key so the UI
 * automatically reflects the latest saved state.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ContactPageCMSService from '@/services/contact-page-cms.service';

export const CONTACT_PAGE_QUERY_KEYS = {
  cms: ['contact-page', 'cms'],
};

// ─── useContactPageCMS ────────────────────────────────────────────────────────

/**
 * Fetch the contact page CMS settings from the backend.
 * Returns the UI-ready form shape from ContactPageCMSService.load().
 */
export function useContactPageCMS() {
  return useQuery({
    queryKey: CONTACT_PAGE_QUERY_KEYS.cms,
    queryFn: () => ContactPageCMSService.load(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// ─── useUpdateContactPageCMS ──────────────────────────────────────────────────

/**
 * Mutation to save the contact page CMS settings.
 * On success invalidates ['contact-page', 'cms'] so the form reloads fresh data.
 *
 * @param {object} [options]  Optional useMutation options (onSuccess, onError, etc.)
 */
export function useUpdateContactPageCMS(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formValues) => ContactPageCMSService.update(formValues),
    onSuccess: (updatedData, variables, ...rest) => {
      queryClient.setQueryData(CONTACT_PAGE_QUERY_KEYS.cms, {
        ...updatedData,
        hero_background_image_url:
          updatedData.hero_background_image_url
          ?? variables?.hero_background_image_url
          ?? null,
      });
      queryClient.invalidateQueries({ queryKey: CONTACT_PAGE_QUERY_KEYS.cms });
      options.onSuccess?.(updatedData, variables, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useUploadContactPageHeroMedia ────────────────────────────────────────────

/**
 * Mutation to upload a media file for the contact page hero section.
 * Does NOT invalidate the contact page query — the caller must manually
 * store the returned media_id in the form before saving.
 *
 * @param {object} [options]  Optional useMutation options.
 */
export function useUploadContactPageHeroMedia(options = {}) {
  return useMutation({
    mutationFn: (params) => {
      const { file, folder, onProgress } = params;
      return ContactPageCMSService.uploadHeroMedia(file, folder, onProgress);
    },
    onSuccess: options.onSuccess,
    onError: options.onError,
  });
}
