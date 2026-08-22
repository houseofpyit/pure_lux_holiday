/**
 * React Query hooks for the Packages module.
 *
 * Query keys:
 *   ['packages', 'categories']         — package category list
 *   ['packages', 'list', params]       — package list
 *   ['packages', 'detail', packageId]  — package detail
 *   ['packages', 'gallery', packageId] — package gallery items
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPackage,
  createPackageCategory,
  deletePackage,
  deletePackageCategory,
  getPackage,
  listPackageCategories,
  listPackages,
  updatePackage,
  updatePackageCategory,
  listPackageGallery,
  addPackageGalleryItem,
  deletePackageGalleryItem,
  reorderPackageGallery,
  listPackageItinerary,
  createPackageItinerary,
  updatePackageItinerary,
  deletePackageItinerary,
  reorderPackageItinerary,
  listPackageHighlights,
  createPackageHighlight,
  updatePackageHighlight,
  deletePackageHighlight,
  listPackageInclusions,
  createPackageInclusion,
  deletePackageInclusion,
  listPackageExclusions,
  createPackageExclusion,
  deletePackageExclusion,
  listPackageFaqs,
  createPackageFaq,
  updatePackageFaq,
  deletePackageFaq,
} from '@/api/packages.api';
import { handleApiError } from '@/lib/handleApiError';
import { useToast } from '@/components/ui/use-toast';
import { buildMediaUrl } from '@/services/media.service';

export const PACKAGES_QUERY_KEYS = {
  categories: ['packages', 'categories'],
  list: ['packages', 'list'],
  detail: (id) => ['packages', 'detail', id],
  gallery: (id) => ['packages', 'gallery', id],
  itinerary: (id) => ['packages', 'itinerary', id],
  highlights: (id) => ['packages', 'highlights', id],
  inclusions: (id) => ['packages', 'inclusions', id],
  exclusions: (id) => ['packages', 'exclusions', id],
  faqs: (id) => ['packages', 'faqs', id],
};

function usePackageMutation({ mutationFn, onSuccessInvalidate = [], options = {} }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      onSuccessInvalidate.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
      options.onSuccess?.(data, variables, context);
    },
    onError: (err) => {
      if (options.onError) options.onError(err);
      else handleApiError(err, toast);
    },
  });
}

export function usePackages(params = {}) {
  return useQuery({
    queryKey: [...PACKAGES_QUERY_KEYS.list, params],
    queryFn: () => listPackages(params),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export const usePackagesList = usePackages;

export function usePackage(id, options = {}) {
  return useQuery({
    queryKey: PACKAGES_QUERY_KEYS.detail(id),
    queryFn: () => getPackage(id),
    enabled: Boolean(id) && (options.enabled ?? true),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useCreatePackage(options = {}) {
  return usePackageMutation({
    mutationFn: createPackage,
    onSuccessInvalidate: [PACKAGES_QUERY_KEYS.list],
    options,
  });
}

export function useUpdatePackage(options = {}) {
  return usePackageMutation({
    mutationFn: ({ id, formValues }) => updatePackage(id, formValues),
    onSuccessInvalidate: [PACKAGES_QUERY_KEYS.list],
    options,
  });
}

export function useDeletePackage(options = {}) {
  return usePackageMutation({
    mutationFn: (id) => deletePackage(id),
    onSuccessInvalidate: [PACKAGES_QUERY_KEYS.list],
    options,
  });
}

export function usePackageCategories() {
  return useQuery({
    queryKey: PACKAGES_QUERY_KEYS.categories,
    queryFn: listPackageCategories,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}

export function useCreatePackageCategory(options = {}) {
  return usePackageMutation({
    mutationFn: createPackageCategory,
    onSuccessInvalidate: [PACKAGES_QUERY_KEYS.categories],
    options,
  });
}

export function useUpdatePackageCategory(options = {}) {
  return usePackageMutation({
    mutationFn: ({ id, formValues }) => updatePackageCategory(id, formValues),
    onSuccessInvalidate: [PACKAGES_QUERY_KEYS.categories, PACKAGES_QUERY_KEYS.list],
    options,
  });
}

export function useDeletePackageCategory(options = {}) {
  return usePackageMutation({
    mutationFn: (id) => deletePackageCategory(id),
    onSuccessInvalidate: [PACKAGES_QUERY_KEYS.categories, PACKAGES_QUERY_KEYS.list],
    options,
  });
}

// ─── Gallery Hooks ────────────────────────────────────────────────────────────

/**
 * Fetch all gallery items for a package.
 * Each item is enriched with a full_url computed from media.file_url.
 *
 * @param {string | null} packageId
 */
export function usePackageGallery(packageId) {
  return useQuery({
    queryKey: PACKAGES_QUERY_KEYS.gallery(packageId),
    queryFn: async () => {
      const items = await listPackageGallery(packageId);
      return items.map((item) => ({
        ...item,
        media: item.media
          ? { ...item.media, full_url: buildMediaUrl(item.media.file_url) }
          : null,
      }));
    },
    enabled: Boolean(packageId),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Add a new image to a package gallery.
 * Invalidates the gallery query on success.
 *
 * @param {string} packageId
 * @param {object} [options]  onSuccess, onError
 */
export function useAddPackageGalleryItem(packageId, options = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data) => addPackageGalleryItem(packageId, data),
    onSuccess: (data, ...rest) => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEYS.gallery(packageId) });
      options.onSuccess?.(data, ...rest);
    },
    onError: (err) => {
      if (options.onError) options.onError(err);
      else handleApiError(err, toast);
    },
  });
}

/**
 * Delete a gallery item by its item ID.
 * Invalidates the gallery query on success.
 *
 * @param {string} packageId  Parent package ID (needed to invalidate the right query)
 * @param {object} [options]  onSuccess, onError
 */
export function useDeletePackageGalleryItem(packageId, options = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (itemId) => deletePackageGalleryItem(itemId),
    onSuccess: (data, ...rest) => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEYS.gallery(packageId) });
      options.onSuccess?.(data, ...rest);
    },
    onError: (err) => {
      if (options.onError) options.onError(err);
      else handleApiError(err, toast);
    },
  });
}

/**
 * Persist a new display order for the gallery items.
 * Invalidates the gallery query on success.
 *
 * @param {string} packageId
 * @param {object} [options]  onSuccess, onError
 */
export function useReorderPackageGallery(packageId, options = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (items) => reorderPackageGallery(items),
    onSuccess: (data, ...rest) => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEYS.gallery(packageId) });
      options.onSuccess?.(data, ...rest);
    },
    onError: (err) => {
      if (options.onError) options.onError(err);
      else handleApiError(err, toast);
    },
  });
}

// ─── Itinerary Hooks ──────────────────────────────────────────────────────────

/**
 * Fetch all itinerary days for a package, sorted by display_order.
 * @param {string | null} packageId
 */
export function usePackageItinerary(packageId) {
  return useQuery({
    queryKey: PACKAGES_QUERY_KEYS.itinerary(packageId),
    queryFn: () => listPackageItinerary(packageId),
    enabled: Boolean(packageId),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Create a new itinerary day for a package.
 * Invalidates the itinerary query on success.
 *
 * @param {string} packageId
 * @param {object} [options]  onSuccess, onError
 */
export function useCreateItinerary(packageId, options = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data) => createPackageItinerary(packageId, data),
    onSuccess: (data, ...rest) => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEYS.itinerary(packageId) });
      options.onSuccess?.(data, ...rest);
    },
    onError: (err) => {
      if (options.onError) options.onError(err);
      else handleApiError(err, toast);
    },
  });
}

/**
 * Update an existing itinerary day.
 * Invalidates the itinerary query on success.
 *
 * @param {string} packageId  Parent package ID (for cache invalidation)
 * @param {object} [options]  onSuccess, onError
 */
export function useUpdateItinerary(packageId, options = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ itemId, data }) => updatePackageItinerary(itemId, data),
    onSuccess: (data, ...rest) => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEYS.itinerary(packageId) });
      options.onSuccess?.(data, ...rest);
    },
    onError: (err) => {
      if (options.onError) options.onError(err);
      else handleApiError(err, toast);
    },
  });
}

/**
 * Delete an itinerary day by its item ID.
 * Invalidates the itinerary query on success.
 *
 * @param {string} packageId  Parent package ID (for cache invalidation)
 * @param {object} [options]  onSuccess, onError
 */
export function useDeleteItinerary(packageId, options = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (itemId) => deletePackageItinerary(itemId),
    onSuccess: (data, ...rest) => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEYS.itinerary(packageId) });
      options.onSuccess?.(data, ...rest);
    },
    onError: (err) => {
      if (options.onError) options.onError(err);
      else handleApiError(err, toast);
    },
  });
}

/**
 * Persist a new display order for itinerary days.
 * Invalidates the itinerary query on success.
 *
 * @param {string} packageId
 * @param {object} [options]  onSuccess, onError
 */
export function useReorderItinerary(packageId, options = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (items) => reorderPackageItinerary(items),
    onSuccess: (data, ...rest) => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEYS.itinerary(packageId) });
      options.onSuccess?.(data, ...rest);
    },
    onError: (err) => {
      if (options.onError) options.onError(err);
      else handleApiError(err, toast);
    },
  });
}

// ─── Highlights Hooks ─────────────────────────────────────────────────────────

/**
 * Fetch all highlights for a package, sorted by display_order.
 * @param {string | null} packageId
 */
export function usePackageHighlights(packageId) {
  return useQuery({
    queryKey: PACKAGES_QUERY_KEYS.highlights(packageId),
    queryFn: () => listPackageHighlights(packageId),
    enabled: Boolean(packageId),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Create a new highlight for a package.
 * @param {string} packageId
 * @param {object} [options]  onSuccess, onError
 */
export function useCreateHighlight(packageId, options = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data) => createPackageHighlight(packageId, data),
    onSuccess: (data, ...rest) => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEYS.highlights(packageId) });
      options.onSuccess?.(data, ...rest);
    },
    onError: (err) => {
      if (options.onError) options.onError(err);
      else handleApiError(err, toast);
    },
  });
}

/**
 * Update an existing highlight.
 * @param {string} packageId  Parent package ID (for cache invalidation)
 * @param {object} [options]  onSuccess, onError
 */
export function useUpdateHighlight(packageId, options = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ itemId, data }) => updatePackageHighlight(itemId, data),
    onSuccess: (data, ...rest) => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEYS.highlights(packageId) });
      options.onSuccess?.(data, ...rest);
    },
    onError: (err) => {
      if (options.onError) options.onError(err);
      else handleApiError(err, toast);
    },
  });
}

/**
 * Delete a highlight by its item ID.
 * @param {string} packageId  Parent package ID (for cache invalidation)
 * @param {object} [options]  onSuccess, onError
 */
export function useDeleteHighlight(packageId, options = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (itemId) => deletePackageHighlight(itemId),
    onSuccess: (data, ...rest) => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEYS.highlights(packageId) });
      options.onSuccess?.(data, ...rest);
    },
    onError: (err) => {
      if (options.onError) options.onError(err);
      else handleApiError(err, toast);
    },
  });
}

// ─── Inclusions Hooks ─────────────────────────────────────────────────────────
// NOTE: backend has no PATCH endpoint for inclusions — only GET, POST, DELETE.
// Editing is not supported; items must be deleted and re-created.

/**
 * Fetch all inclusions for a package.
 * @param {string | null} packageId
 */
export function usePackageInclusions(packageId) {
  return useQuery({
    queryKey: PACKAGES_QUERY_KEYS.inclusions(packageId),
    queryFn: () => listPackageInclusions(packageId),
    enabled: Boolean(packageId),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Create a new inclusion.
 * @param {string} packageId
 * @param {object} [options]  onSuccess, onError
 */
export function useCreateInclusion(packageId, options = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data) => createPackageInclusion(packageId, data),
    onSuccess: (data, ...rest) => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEYS.inclusions(packageId) });
      options.onSuccess?.(data, ...rest);
    },
    onError: (err) => {
      if (options.onError) options.onError(err);
      else handleApiError(err, toast);
    },
  });
}

/**
 * Delete an inclusion by its item ID.
 * @param {string} packageId  Parent package ID (for cache invalidation)
 * @param {object} [options]  onSuccess, onError
 */
export function useDeleteInclusion(packageId, options = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (itemId) => deletePackageInclusion(itemId),
    onSuccess: (data, ...rest) => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEYS.inclusions(packageId) });
      options.onSuccess?.(data, ...rest);
    },
    onError: (err) => {
      if (options.onError) options.onError(err);
      else handleApiError(err, toast);
    },
  });
}

// ─── Exclusions Hooks ─────────────────────────────────────────────────────────
// NOTE: backend has no PATCH endpoint for exclusions — only GET, POST, DELETE.
// Editing is not supported; items must be deleted and re-created.

/**
 * Fetch all exclusions for a package.
 * @param {string | null} packageId
 */
export function usePackageExclusions(packageId) {
  return useQuery({
    queryKey: PACKAGES_QUERY_KEYS.exclusions(packageId),
    queryFn: () => listPackageExclusions(packageId),
    enabled: Boolean(packageId),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Create a new exclusion.
 * @param {string} packageId
 * @param {object} [options]  onSuccess, onError
 */
export function useCreateExclusion(packageId, options = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data) => createPackageExclusion(packageId, data),
    onSuccess: (data, ...rest) => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEYS.exclusions(packageId) });
      options.onSuccess?.(data, ...rest);
    },
    onError: (err) => {
      if (options.onError) options.onError(err);
      else handleApiError(err, toast);
    },
  });
}

/**
 * Delete an exclusion by its item ID.
 * @param {string} packageId  Parent package ID (for cache invalidation)
 * @param {object} [options]  onSuccess, onError
 */
export function useDeleteExclusion(packageId, options = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (itemId) => deletePackageExclusion(itemId),
    onSuccess: (data, ...rest) => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEYS.exclusions(packageId) });
      options.onSuccess?.(data, ...rest);
    },
    onError: (err) => {
      if (options.onError) options.onError(err);
      else handleApiError(err, toast);
    },
  });
}

// ─── FAQ Hooks ────────────────────────────────────────────────────────────────
// Backend supports: GET, POST /{package_id}, PATCH /{item_id}, DELETE /{item_id}
// No reorder endpoint — display_order is patched per-item on drag-drop.

/**
 * Fetch all FAQs for a package, sorted by display_order.
 * @param {string | null} packageId
 */
export function usePackageFaqs(packageId) {
  return useQuery({
    queryKey: PACKAGES_QUERY_KEYS.faqs(packageId),
    queryFn: () => listPackageFaqs(packageId),
    enabled: Boolean(packageId),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Create a new FAQ.
 * @param {string} packageId
 * @param {object} [options]  onSuccess, onError
 */
export function useCreateFaq(packageId, options = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data) => createPackageFaq(packageId, data),
    onSuccess: (data, ...rest) => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEYS.faqs(packageId) });
      options.onSuccess?.(data, ...rest);
    },
    onError: (err) => {
      if (options.onError) options.onError(err);
      else handleApiError(err, toast);
    },
  });
}

/**
 * Update an existing FAQ (question, answer, display_order).
 * @param {string} packageId  For cache invalidation
 * @param {object} [options]  onSuccess, onError
 */
export function useUpdateFaq(packageId, options = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ itemId, data }) => updatePackageFaq(itemId, data),
    onSuccess: (data, ...rest) => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEYS.faqs(packageId) });
      options.onSuccess?.(data, ...rest);
    },
    onError: (err) => {
      if (options.onError) options.onError(err);
      else handleApiError(err, toast);
    },
  });
}

/**
 * Delete a FAQ by its item ID.
 * @param {string} packageId  For cache invalidation
 * @param {object} [options]  onSuccess, onError
 */
export function useDeleteFaq(packageId, options = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (itemId) => deletePackageFaq(itemId),
    onSuccess: (data, ...rest) => {
      queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEYS.faqs(packageId) });
      options.onSuccess?.(data, ...rest);
    },
    onError: (err) => {
      if (options.onError) options.onError(err);
      else handleApiError(err, toast);
    },
  });
}
