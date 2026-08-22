/**
 * React Query hooks for the SEO module.
 *
 * Query keys:
 *   ['seo', 'global']         — global SEO settings singleton
 *   ['seo', 'pages']          — list of all page SEO records
 *   ['seo', 'page', pageKey]  — single page SEO record
 *   ['seo', 'sitemap']        — sitemap settings singleton
 *   ['seo', 'robots']         — robots.txt settings singleton
 *   ['seo', 'redirects']      — list of all redirects
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRedirect,
  deleteRedirect,
  getGlobalSeo,
  getPageSeoList,
  getRedirects,
  getRobotsSettings,
  getSitemapSettings,
  updateGlobalSeo,
  updatePageSeo,
  updateRedirect,
  updateRobotsSettings,
  updateSitemapSettings,
} from '@/api/seo.api';

export const SEO_QUERY_KEYS = {
  global: ['seo', 'global'],
  pages: ['seo', 'pages'],
  page: (key) => ['seo', 'page', key],
  sitemap: ['seo', 'sitemap'],
  robots: ['seo', 'robots'],
  redirects: ['seo', 'redirects'],
};

// ─── Global SEO ───────────────────────────────────────────────────────────────

export function useGlobalSeo() {
  return useQuery({
    queryKey: SEO_QUERY_KEYS.global,
    queryFn: getGlobalSeo,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useUpdateGlobalSeo(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => updateGlobalSeo(data),
    onSuccess: (updated, ...rest) => {
      queryClient.setQueryData(SEO_QUERY_KEYS.global, updated);
      options.onSuccess?.(updated, ...rest);
    },
    onError: options.onError,
  });
}

// ─── Page SEO ─────────────────────────────────────────────────────────────────

export function usePageSeoList() {
  return useQuery({
    queryKey: SEO_QUERY_KEYS.pages,
    queryFn: getPageSeoList,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useUpdatePageSeo(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pageKey, data }) => updatePageSeo(pageKey, data),
    onSuccess: (updated, variables, ...rest) => {
      queryClient.setQueryData(SEO_QUERY_KEYS.page(variables.pageKey), updated);
      queryClient.invalidateQueries({ queryKey: SEO_QUERY_KEYS.pages });
      options.onSuccess?.(updated, variables, ...rest);
    },
    onError: options.onError,
  });
}

// ─── Sitemap Settings ─────────────────────────────────────────────────────────

export function useSitemapSettings() {
  return useQuery({
    queryKey: SEO_QUERY_KEYS.sitemap,
    queryFn: getSitemapSettings,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useUpdateSitemapSettings(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => updateSitemapSettings(data),
    onSuccess: (updated, ...rest) => {
      queryClient.setQueryData(SEO_QUERY_KEYS.sitemap, updated);
      options.onSuccess?.(updated, ...rest);
    },
    onError: options.onError,
  });
}

// ─── Robots Settings ─────────────────────────────────────────────────────────

export function useRobotsSettings() {
  return useQuery({
    queryKey: SEO_QUERY_KEYS.robots,
    queryFn: getRobotsSettings,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useUpdateRobotsSettings(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => updateRobotsSettings(data),
    onSuccess: (updated, ...rest) => {
      queryClient.setQueryData(SEO_QUERY_KEYS.robots, updated);
      options.onSuccess?.(updated, ...rest);
    },
    onError: options.onError,
  });
}

// ─── Redirects ───────────────────────────────────────────────────────────────

export function useRedirects() {
  return useQuery({
    queryKey: SEO_QUERY_KEYS.redirects,
    queryFn: getRedirects,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}

export function useCreateRedirect(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createRedirect(data),
    onSuccess: (created, ...rest) => {
      queryClient.invalidateQueries({ queryKey: SEO_QUERY_KEYS.redirects });
      options.onSuccess?.(created, ...rest);
    },
    onError: options.onError,
  });
}

export function useUpdateRedirect(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateRedirect(id, data),
    onSuccess: (updated, ...rest) => {
      queryClient.invalidateQueries({ queryKey: SEO_QUERY_KEYS.redirects });
      options.onSuccess?.(updated, ...rest);
    },
    onError: options.onError,
  });
}

export function useDeleteRedirect(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteRedirect(id),
    onSuccess: (...rest) => {
      queryClient.invalidateQueries({ queryKey: SEO_QUERY_KEYS.redirects });
      options.onSuccess?.(...rest);
    },
    onError: options.onError,
  });
}
