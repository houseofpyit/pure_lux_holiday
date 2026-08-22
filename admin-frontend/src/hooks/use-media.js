/**
 * React Query hooks for the Media Library module.
 *
 * Query keys:
 *   ['media']                   — paginated media list
 *   ['media', 'folders']        — folder list with counts
 *   ['media', 'item', id]       — single media item
 *
 * All CMS modules that need to upload or display images should
 * use useUploadMedia and useMediaItem from this file.
 */
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import MediaService from '@/services/media.service';

export const MEDIA_QUERY_KEYS = {
  list: (params = {}) => ['media', params],
  folders: ['media', 'folders'],
  item: (id) => ['media', 'item', id],
};

// ─── useMediaList ─────────────────────────────────────────────────────────────

/**
 * Paginated list of media items with optional filters.
 * @param {object} [params]  page, page_size, folder, media_type, search, sort_by, sort_order
 */
export function useMediaList(params = {}) {
  return useQuery({
    queryKey: MEDIA_QUERY_KEYS.list(params),
    queryFn: () => MediaService.list(params),
    staleTime: 1000 * 60 * 2,
    keepPreviousData: true,
  });
}

// ─── useMediaFolders ─────────────────────────────────────────────────────────

/**
 * List of all folders with file counts.
 */
export function useMediaFolders() {
  return useQuery({
    queryKey: MEDIA_QUERY_KEYS.folders,
    queryFn: () => MediaService.getFolders(),
    staleTime: 1000 * 60 * 5,
  });
}

// ─── useMediaItem ─────────────────────────────────────────────────────────────

/**
 * Single media item by ID.
 * @param {string | null} mediaId
 */
export function useMediaItem(mediaId) {
  return useQuery({
    queryKey: MEDIA_QUERY_KEYS.item(mediaId),
    queryFn: () => MediaService.getById(mediaId),
    enabled: !!mediaId,
    staleTime: 1000 * 60 * 10,
  });
}

// ─── useUploadMedia ───────────────────────────────────────────────────────────

/**
 * Mutation to upload a file.
 * On success invalidates the media list and folders queries.
 *
 * Usage in any CMS form:
 *   const uploadMutation = useUploadMedia({
 *     onSuccess: (media) => {
 *       setForm(f => ({ ...f, image_id: media.id }));
 *       setPreviewUrl(media.full_url);
 *     },
 *   });
 *   uploadMutation.mutate({ file, folder: 'hero' });
 *
 * @param {object} [options]  onSuccess, onError, onProgress
 */
export function useUploadMedia(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, folder = 'general', altText, onProgress }) =>
      MediaService.upload(file, folder, altText, onProgress),
    onSuccess: (media, ...rest) => {
      // Invalidate list so the new file appears in MediaLibrary immediately
      queryClient.invalidateQueries({ queryKey: ['media'] });
      options.onSuccess?.(media, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useDeleteMedia ───────────────────────────────────────────────────────────

/**
 * Mutation to soft-delete a single media item.
 * @param {object} [options]
 */
export function useDeleteMedia(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mediaId) => MediaService.delete(mediaId),
    onSuccess: (_data, mediaId, ...rest) => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      options.onSuccess?.(_data, mediaId, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useBulkDeleteMedia ───────────────────────────────────────────────────────

/**
 * Mutation to bulk soft-delete media items.
 * @param {object} [options]
 */
export function useBulkDeleteMedia(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids) => MediaService.bulkDelete(ids),
    onSuccess: (result, ...rest) => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      options.onSuccess?.(result, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useUpdateMediaAltText ────────────────────────────────────────────────────

/**
 * Mutation to update alt text on a media item.
 * @param {object} [options]
 */
export function useUpdateMediaAltText(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mediaId, altText }) => MediaService.updateAltText(mediaId, altText),
    onSuccess: (updated, ...rest) => {
      queryClient.setQueryData(MEDIA_QUERY_KEYS.item(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: ['media'] });
      options.onSuccess?.(updated, ...rest);
    },
    onError: options.onError,
  });
}

// ─── useMoveMedia ─────────────────────────────────────────────────────────────

/**
 * Mutation to move a media item to a different folder.
 * @param {object} [options]
 */
export function useMoveMedia(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mediaId, folder }) => MediaService.move(mediaId, folder),
    onSuccess: (updated, ...rest) => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      options.onSuccess?.(updated, ...rest);
    },
    onError: options.onError,
  });
}
