/**
 * React Query hooks for the Blog module.
 *
 * Query keys:
 *   ['blog', 'categories']         — blog category list
 *   ['blog', 'tags']               — blog tag list
 *   ['blog', 'articles']           — article list
 *   ['blog', 'article', id]        — article detail
 *   ['blog', 'gallery', articleId] — article gallery
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listBlogCategories,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  listBlogTags,
  createBlogTag,
  updateBlogTag,
  deleteBlogTag,
  listBlogArticles,
  getBlogArticle,
  createBlogArticle,
  updateBlogArticle,
  deleteBlogArticle,
  publishBlogArticle,
  unpublishBlogArticle,
  listArticleGallery,
  addArticleGalleryItem,
  deleteArticleGalleryItem,
  addRelatedArticle,
} from '@/api/blog.api';
import { handleApiError } from '@/lib/handleApiError';
import { useToast } from '@/components/ui/use-toast';

export const BLOG_QUERY_KEYS = {
  categories: ['blog', 'categories'],
  tags: ['blog', 'tags'],
  articles: ['blog', 'articles'],
  article: (id) => ['blog', 'article', id],
  gallery: (id) => ['blog', 'gallery', id],
};

function useBlogMutation({ mutationFn, onSuccessInvalidate = [], options = {} }) {
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

// ─── Blog Categories ──────────────────────────────────────────────────────────

export function useBlogCategories() {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.categories,
    queryFn: listBlogCategories,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}

export function useCreateBlogCategory(options = {}) {
  return useBlogMutation({
    mutationFn: createBlogCategory,
    onSuccessInvalidate: [BLOG_QUERY_KEYS.categories],
    options,
  });
}

export function useUpdateBlogCategory(options = {}) {
  return useBlogMutation({
    mutationFn: ({ id, formValues }) => updateBlogCategory(id, formValues),
    onSuccessInvalidate: [BLOG_QUERY_KEYS.categories],
    options,
  });
}

export function useDeleteBlogCategory(options = {}) {
  return useBlogMutation({
    mutationFn: (id) => deleteBlogCategory(id),
    onSuccessInvalidate: [BLOG_QUERY_KEYS.categories],
    options,
  });
}

// ─── Blog Tags ────────────────────────────────────────────────────────────────

export function useBlogTags() {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.tags,
    queryFn: listBlogTags,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}

export function useCreateBlogTag(options = {}) {
  return useBlogMutation({
    mutationFn: createBlogTag,
    onSuccessInvalidate: [BLOG_QUERY_KEYS.tags],
    options,
  });
}

export function useUpdateBlogTag(options = {}) {
  return useBlogMutation({
    mutationFn: ({ id, formValues }) => updateBlogTag(id, formValues),
    onSuccessInvalidate: [BLOG_QUERY_KEYS.tags],
    options,
  });
}

export function useDeleteBlogTag(options = {}) {
  return useBlogMutation({
    mutationFn: (id) => deleteBlogTag(id),
    onSuccessInvalidate: [BLOG_QUERY_KEYS.tags],
    options,
  });
}

// ─── Blog Articles ────────────────────────────────────────────────────────────

export function useBlogArticles() {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.articles,
    queryFn: listBlogArticles,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useBlogArticle(id, options = {}) {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.article(id),
    queryFn: () => getBlogArticle(id),
    enabled: Boolean(id) && (options.enabled ?? true),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useCreateBlogArticle(options = {}) {
  return useBlogMutation({
    mutationFn: createBlogArticle,
    onSuccessInvalidate: [BLOG_QUERY_KEYS.articles],
    options,
  });
}

export function useUpdateBlogArticle(options = {}) {
  return useBlogMutation({
    mutationFn: ({ id, formValues }) => updateBlogArticle(id, formValues),
    onSuccessInvalidate: [BLOG_QUERY_KEYS.articles],
    options,
  });
}

export function useDeleteBlogArticle(options = {}) {
  return useBlogMutation({
    mutationFn: (id) => deleteBlogArticle(id),
    onSuccessInvalidate: [BLOG_QUERY_KEYS.articles],
    options,
  });
}

export function usePublishBlogArticle(options = {}) {
  return useBlogMutation({
    mutationFn: (id) => publishBlogArticle(id),
    onSuccessInvalidate: [BLOG_QUERY_KEYS.articles],
    options,
  });
}

export function useUnpublishBlogArticle(options = {}) {
  return useBlogMutation({
    mutationFn: (id) => unpublishBlogArticle(id),
    onSuccessInvalidate: [BLOG_QUERY_KEYS.articles],
    options,
  });
}

// ─── Article Gallery ──────────────────────────────────────────────────────────

export function useArticleGallery(articleId) {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.gallery(articleId),
    queryFn: () => listArticleGallery(articleId),
    enabled: Boolean(articleId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useAddArticleGalleryItem(articleId, options = {}) {
  return useBlogMutation({
    mutationFn: (data) => addArticleGalleryItem(articleId, data),
    onSuccessInvalidate: [BLOG_QUERY_KEYS.gallery(articleId)],
    options,
  });
}

export function useDeleteArticleGalleryItem(articleId, options = {}) {
  return useBlogMutation({
    mutationFn: (itemId) => deleteArticleGalleryItem(itemId),
    onSuccessInvalidate: [BLOG_QUERY_KEYS.gallery(articleId)],
    options,
  });
}

// ─── Related Articles ─────────────────────────────────────────────────────────

export function useAddRelatedArticle(articleId, options = {}) {
  return useBlogMutation({
    mutationFn: (data) => addRelatedArticle(articleId, data),
    onSuccessInvalidate: [BLOG_QUERY_KEYS.article(articleId)],
    options,
  });
}
