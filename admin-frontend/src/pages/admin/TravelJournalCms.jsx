/**
 * TravelJournalCms — Home Travel Journal configuration page.
 *
 * Architecture:
 *   Component → React Query (useTravelJournal / useToggleHomepageFeatured)
 *             → HomeService → home.api.js → /api/v1/blog/articles → Backend
 *
 * This page does NOT manage blog content.
 * It only configures which existing published articles appear on the homepage
 * by toggling the `homepage_featured` flag on each article.
 *
 * Backend field mapping:
 *   title              → Article title
 *   featured_image_id  → Cover image (resolved via MediaService)
 *   published_at       → Published date
 *   category           → Category object { name }
 *   status             → 'published' | 'draft'
 *   homepage_featured  → Whether the article appears in the homepage section
 *   author_name        → Author display name
 *   excerpt            → Short description
 */
import { useState, useMemo } from 'react';
import {
  Eye, X, BookOpen, Newspaper, CheckCircle2,
  Circle, AlertCircle, Loader2, Search, BookMarked,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import EmptyState from '@/components/admin/EmptyState';
import { TableSkeleton } from '@/components/admin/SkeletonTable';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import { useTravelJournal, useToggleHomepageFeatured } from '@/hooks/use-home';

const cn = (...c) => c.filter(Boolean).join(' ');

/** Format an ISO date string to a readable short date. */
function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

export default function TravelJournalCms() {
  const { toast } = useToast();

  const { data: articles = [], isLoading, isError, error } = useTravelJournal();

  const [search, setSearch] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'featured' | 'published'

  const toggleMutation = useToggleHomepageFeatured({
    onSuccess: (updated) => {
      toast({
        title: updated.homepage_featured
          ? 'Added to Travel Journal'
          : 'Removed from Travel Journal',
        description: updated.title,
      });
    },
    onError: (err) => handleApiError(err, toast),
  });

  /** Articles currently shown on the homepage Travel Journal section. */
  const featuredArticles = useMemo(
    () => articles.filter((a) => a.homepage_featured),
    [articles],
  );

  /** Filtered list for the selector table. */
  const filtered = useMemo(() => {
    let list = articles;
    if (filterMode === 'featured') list = list.filter((a) => a.homepage_featured);
    else if (filterMode === 'published') list = list.filter((a) => a.status === 'published');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.author_name ?? '').toLowerCase().includes(q) ||
          (a.category?.name ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [articles, search, filterMode]);

  const handleToggle = (article) => {
    if (toggleMutation.isPending) return;
    const vars = { id: article.id, featured: !article.homepage_featured };
    toggleMutation.mutate(vars);
  };

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Home Travel Journal"
          description="Select which blog articles appear in the homepage Travel Journal section"
          searchPlaceholder="Search articles…"
          actions={null}
          onSearch={null}
          onAdd={null}
          filters={null}
          onFilter={null}
          activeFilter={null}
          onSort={null}
          onExport={null}
          onImport={null}
        />
        <TableSkeleton rows={5} columns={4} selectable={false} />
      </div>
    );
  }

  // ─── Error ──────────────────────────────────────────────────────────────────

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm">{error?.message || 'Failed to load articles'}</p>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title="Home Travel Journal"
        description="Select which blog articles appear in the homepage Travel Journal section"
        searchPlaceholder="Search articles…"
        onSearch={null}
        onAdd={null}
        filters={null}
        onFilter={null}
        activeFilter={null}
        onSort={null}
        onExport={null}
        onImport={null}
        actions={
          <button
            onClick={() => setPreviewOpen(!previewOpen)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/8 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
        }
      />

      {/* Info banner */}
      <div className="flex items-start gap-3 mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
        <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Toggle the checkbox on any article to show or hide it in the homepage Travel Journal section.
          To edit article content, use the{' '}
          <span className="font-medium text-foreground">Blog CMS</span>.
        </p>
      </div>

      {/* Featured count pill */}
      <div className="flex items-center gap-3 mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <BookMarked className="w-3.5 h-3.5" />
          {featuredArticles.length} article{featuredArticles.length !== 1 ? 's' : ''} on homepage
        </div>
      </div>

      {/* Live Preview */}
      {previewOpen && (
        <div className="mb-6 bg-white border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Section Preview</h3>
              <span className="text-xs text-muted-foreground">({featuredArticles.length} articles)</span>
            </div>
            <button
              onClick={() => setPreviewOpen(false)}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {featuredArticles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No articles selected. Toggle articles below to add them to the homepage.
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {featuredArticles.map((article) => (
                <div key={article.id} className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="aspect-video overflow-hidden bg-muted relative">
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Newspaper className="w-8 h-8 opacity-30" />
                      </div>
                    )}
                    {article.category?.name && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-primary text-white rounded-md">
                        {article.category.name}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                      {article.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {article.author_name || 'Unknown Author'} · {formatDate(article.published_at)}
                    </p>
                    {article.excerpt && (
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1 text-sm">
          {[
            { key: 'all', label: 'All' },
            { key: 'featured', label: 'On Homepage' },
            { key: 'published', label: 'Published' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterMode(f.key)}
              className={cn(
                'px-3 py-1.5 rounded-md font-medium transition-colors',
                filterMode === f.key
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
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

      {/* Article list */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-xl">
          <EmptyState
            icon={Newspaper}
            title={search ? 'No articles match your search' : 'No articles found'}
            message={
              search
                ? 'Try a different search term or clear the filter.'
                : 'Create articles in the Blog CMS first, then return here to feature them on the homepage.'
            }
            action={null}
            actionLabel={null}
            onAction={null}
          />
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          {/* Table header */}
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
              const isToggling =
                toggleMutation.isPending &&
                toggleMutation.variables?.id === article.id;

              return (
                <div
                  key={article.id}
                  className={cn(
                    'group grid grid-cols-[2rem_3.5rem_1fr] sm:grid-cols-[2rem_3.5rem_1fr_7rem_6rem_6rem] gap-3 items-center px-4 py-3 transition-colors hover:bg-muted/20',
                    article.homepage_featured && 'bg-primary/[0.03]',
                  )}
                >
                  {/* Toggle checkbox */}
                  <button
                    onClick={() => handleToggle(article)}
                    disabled={isToggling}
                    title={
                      article.homepage_featured
                        ? 'Remove from homepage'
                        : 'Add to homepage'
                    }
                    className="flex items-center justify-center shrink-0 transition-opacity disabled:opacity-50"
                  >
                    {isToggling ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : article.homepage_featured ? (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                    )}
                  </button>

                  {/* Thumbnail */}
                  <div className="w-14 h-10 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Newspaper className="w-4 h-4 text-muted-foreground/40" />
                    )}
                  </div>

                  {/* Title + author */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {article.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {article.author_name || 'Unknown Author'}
                      {article.reading_time ? ` · ${article.reading_time} min read` : ''}
                    </p>
                  </div>

                  {/* Category */}
                  <div className="hidden sm:block">
                    {article.category?.name ? (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-md bg-muted text-muted-foreground truncate max-w-[6.5rem]">
                        {article.category.name}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </div>

                  {/* Published date */}
                  <div className="hidden sm:block">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(article.published_at)}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="hidden sm:block">
                    <StatusBadge
                      status={article.status === 'published' ? 'Published' : 'Draft'}
                      className=""
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer count */}
      <p className="mt-3 text-xs text-muted-foreground text-right">
        {filtered.length} article{filtered.length !== 1 ? 's' : ''} shown
        {search ? ` matching "${search}"` : ''}
      </p>
    </div>
  );
}
