/**
 * React Query hooks for the Gallery Page CMS.
 *
 * Query keys:
 *   ['gallery', 'categories']  — existing category list (live backend)
 *   ['gallery', 'albums']      — existing album list (live backend)
 *   ['gallery', 'page', 'hero']      — hero singleton
 *   ['gallery', 'page', 'settings'] — display settings singleton
 *   ['gallery', 'page', 'seo']      — SEO singleton
 *
 * CTA reuses ['home', 'cta'] via useCTA / useUpdateCTA from use-home.js.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listGalleryCategories, listGalleryAlbums,
  getGalleryHero, updateGalleryHero,
  getGallerySettings, updateGallerySettings,
  getGallerySeo, updateGallerySeo,
} from '@/api/gallery.api';

export const GALLERY_QUERY_KEYS = {
  categories: ['gallery', 'categories'],
  albums:     ['gallery', 'albums'],
  hero:       ['gallery', 'page', 'hero'],
  settings:   ['gallery', 'page', 'settings'],
  seo:        ['gallery', 'page', 'seo'],
};

// ─── Existing data ────────────────────────────────────────────────────────────

export function useGalleryCategories() {
  return useQuery({
    queryKey: GALLERY_QUERY_KEYS.categories,
    queryFn: listGalleryCategories,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}

export function useGalleryAlbums() {
  return useQuery({
    queryKey: GALLERY_QUERY_KEYS.albums,
    queryFn: listGalleryAlbums,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export function useGalleryHero() {
  return useQuery({
    queryKey: GALLERY_QUERY_KEYS.hero,
    queryFn: getGalleryHero,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useUpdateGalleryHero(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => updateGalleryHero(payload),
    onSuccess: (data, ...rest) => {
      qc.setQueryData(GALLERY_QUERY_KEYS.hero, data);
      options.onSuccess?.(data, ...rest);
    },
    onError: options.onError,
  });
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function useGallerySettings() {
  return useQuery({
    queryKey: GALLERY_QUERY_KEYS.settings,
    queryFn: getGallerySettings,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useUpdateGallerySettings(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => updateGallerySettings(payload),
    onSuccess: (data, ...rest) => {
      qc.setQueryData(GALLERY_QUERY_KEYS.settings, data);
      options.onSuccess?.(data, ...rest);
    },
    onError: options.onError,
  });
}

// ─── SEO ──────────────────────────────────────────────────────────────────────

export function useGallerySeo() {
  return useQuery({
    queryKey: GALLERY_QUERY_KEYS.seo,
    queryFn: getGallerySeo,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useUpdateGallerySeo(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => updateGallerySeo(payload),
    onSuccess: (data, ...rest) => {
      qc.setQueryData(GALLERY_QUERY_KEYS.seo, data);
      options.onSuccess?.(data, ...rest);
    },
    onError: options.onError,
  });
}
