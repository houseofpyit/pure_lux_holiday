/**
 * BlogFeaturedCms — Blog Page › Featured Articles Section
 *
 * Allows editors to configure which articles appear in the featured section.
 * Uses the existing `is_featured` flag on articles via PATCH /api/v1/blog/articles/:id.
 *
 * Two modes:
 *   automatic — backend returns is_featured=true articles automatically
 *   manual    — editors explicitly toggle is_featured on individual articles
 *
 * Real API: PATCH /api/v1/blog/articles/:id { is_featured: bool }
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Save, Loader2, Star, Search,
  CheckCircle2, Circle, BookOpen, Newspaper, AlertCircle,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { TableSkeleton } from '@/components/admin/SkeletonTable';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import { useBlogArticles, useUpdateBlogArticle } from '@/hooks/use-blog';
import { buildMediaUrl } from '@/services/media.service';

const cn = (...c) => c.filter(Boolean).join(' ');

function formatDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
}

export default function BlogFeaturedCms() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'featured' | 'published'

  const { data: articles = [], isLoading, isError, error } = useBlogArticles();

  const updateMutation = useUpdateBlogArticle({
    onSuccess: (updated) => {
      toast({
        title: updated.is_featured ? 'Marked as featured' : 'Removed from featured',
        description: updated.title,
      });
    },
    onError: (err) => handleApiError(err, toast),
  });

  const featuredArticles = useMemo(() => articles.filter((a) => a.is_featured), [articles]);

  const filtered = useMemo(() => {
    let list = articles;
    if (filterMode === 'featured') list = list.filter((a) => a.is_featured);
    else if (filterMode === 'published') list = list.filter((a) => a.status === 'published');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) =>
        a.title?.toLowerCase().includes(q) ||
        (a.author_name ?? '').toLowerCase().includes(q) ||
        (a.category?.name ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [articles, search, filterMode]);

  const handleToggle = (article) => {
    if (updateMutation.isPending) return;
    updateMutation.mutate({ id: article.id, formValues: { is_featured: !article.is_featured } });
  };

  if (isLoading) {
    return (
      <div>
        <button onClick={() => navigate('/admin/website/blog')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="w-4 h-4" /> Blog Page
        </button>
        <PageHeader title="Featured Articles" description="Configure which articles appear in the featured section" searchPlaceholder="" onSearch={null} onAdd={null} filters={null} onFilter={null} activeFilter={null} onSort={null} onExport={null} onImport={null} />
        <TableSkeleton rows={5} columns={4} selectable={false} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm">{error?.message || 'Failed to load articles'}</p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate('/admin/website/blog')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> Blog Page
      </button>

      <PageHeader
        title="Featured Articles"
        description="Toggle which articles appear in the blog featured section"
        searchPlaceholder="" onSearch={null} onAdd={null} filters={null} onFilter={null}
        activeFilter={null} onSort={null} onExport={null} onImport={null}
      />

      <div className="flex items-start gap-3 mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p>
          Toggle the star on any article to feature or unfeature it.
          To edit article content, use the{' '}
          <button onClick={() => navigate('/admin/blog')} className="font-semibold underline underline-offset-2">Blog CMS</button>.
        </p>
      </div>

      {/* Featured count pill */}
      <div className="flex items-center gap-3 mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          {featuredArticles.length} article{featuredArticles.length !== 1 ? 's' : ''} featured
        </div>
      </div>

      {/* Filter tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1 text-sm">
          {[
            { key: 'all', label: 'All' },
            { key: 'featured', label: 'Featured' },
            { key: 'published', label: 'Published' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterMode(f.key)}
              className={cn(
                'px-3 py-1.5 rounded-md font-medium transition-colors',
                filterMode === f.key ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
              {f.key === 'featured' && featuredArticles.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold">
                  {featuredArticles.length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-0 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Search articles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-xl flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <Newspaper className="w-10 h-10 opacity-25" />
          <p className="text-sm font-medium">{search ? 'No articles match your search' : 'No articles found'}</p>
          <p className="text-xs opacity-70">
            {search ? 'Try a different search term.' : 'Create articles in the Blog CMS first.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="hidden sm:grid grid-cols-[2rem_3.5rem_1fr_7rem_6rem_6rem] gap-3 px-4 py-2.5 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span />
            <span />
            <span>Article</span>
            <span>Category</span>
            <span>Published</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-border">
            {filtered.map((article) => {
              const isToggling = updateMutation.isPending && updateMutation.variables?.id === article.id;
              const imgUrl = article.featured_image?.file_url ? buildMediaUrl(article.featured_image.file_url) : null;
              return (
                <div
                  key={article.id}
                  className={cn(
                    'group grid grid-cols-[2rem_3.5rem_1fr] sm:grid-cols-[2rem_3.5rem_1fr_7rem_6rem_6rem] gap-3 items-center px-4 py-3 transition-colors hover:bg-muted/20',
                    article.is_featured && 'bg-amber-50/40',
                  )}
                >
                  <button
                    onClick={() => handleToggle(article)}
                    disabled={isToggling}
                    title={article.is_featured ? 'Remove from featured' : 'Mark as featured'}
                    className="flex items-center justify-center shrink-0 transition-opacity disabled:opacity-50"
                  >
                    {isToggling ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : article.is_featured ? (
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                    )}
                  </button>
                  <div className="w-14 h-10 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                    {imgUrl
                      ? <img src={imgUrl} alt={article.title} className="w-full h-full object-cover" />
                      : <Newspaper className="w-4 h-4 text-muted-foreground/40" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{article.title}</p>
                      {article.is_featured && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {article.author_name || 'Unknown Author'}
                      {article.reading_time ? ` · ${article.reading_time} min read` : ''}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    {article.category?.name ? (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-md bg-muted text-muted-foreground truncate max-w-[6.5rem]">
                        {article.category.name}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-xs text-muted-foreground">{formatDate(article.published_at)}</span>
                  </div>
                  <div className="hidden sm:block">
                    <StatusBadge status={article.status === 'published' ? 'Published' : 'Draft'} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-muted-foreground text-right">
        {filtered.length} article{filtered.length !== 1 ? 's' : ''} shown
        {search ? ` matching "${search}"` : ''}
      </p>
    </div>
  );
}
