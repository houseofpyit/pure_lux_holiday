import { useQuery } from '@tanstack/react-query';
import { getPublicBlog, getPublicBlogArticleBySlug } from '@/api/blog.api';
import { queryKeys } from '@/api/query-keys';
import { cacheTimes } from '@/lib/api-cache';
import { mapArticleDetail, mapPublicBlog } from '@/services/mappers/public.mapper';

export function useBlog() {
  return useQuery({
    queryKey: queryKeys.blog.all,
    queryFn: async () => mapPublicBlog(await getPublicBlog()),
    staleTime: cacheTimes.list,
    retry: 1,
  });
}

export function useBlogArticle(slug) {
  return useQuery({
    queryKey: queryKeys.blog.detail(slug),
    queryFn: async () => mapArticleDetail(await getPublicBlogArticleBySlug(slug)),
    enabled: Boolean(slug),
    staleTime: cacheTimes.list,
    retry: 1,
  });
}
