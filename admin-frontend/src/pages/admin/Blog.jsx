import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle, BookOpen, Image as ImageIcon, Loader2,
  Pencil, Plus, Power, Star, Trash2, X,
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import PageHeader from '@/components/admin/PageHeader';
import Pagination from '@/components/admin/Pagination';
import Drawer, { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { TableSkeleton } from '@/components/admin/SkeletonTable';
import MediaUploader from '@/components/media/MediaUploader';
import MediaPicker from '@/components/media/MediaPicker';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import { buildMediaUrl } from '@/services/media.service';
import {
  useBlogArticles,
  useBlogCategories,
  useBlogTags,
  useCreateBlogArticle,
  useUpdateBlogArticle,
  useDeleteBlogArticle,
  usePublishBlogArticle,
  useUnpublishBlogArticle,
  useArticleGallery,
  useAddArticleGalleryItem,
  useDeleteArticleGalleryItem,
  useAddRelatedArticle,
} from '@/hooks/use-blog';

const PER_PAGE = 10;
const TABS = ['General', 'Content', 'Media', 'Related', 'SEO', 'Settings'];
const SEO_TITLE_MAX = 60;
const SEO_DESC_MAX = 160;

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    [{ align: [] }],
    ['clean'],
  ],
};
const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'blockquote', 'code-block',
  'link', 'image', 'align',
];

const EMPTY_FORM = {
  title: '',
  slug: '',
  category_id: '',
  author_name: '',
  excerpt: '',
  content: '',
  featured_image_id: null,
  featured_image_url: null,
  banner_image_id: null,
  banner_image_url: null,
  reading_time: 5,
  status: 'draft',
  is_featured: false,
  homepage_featured: false,
  allow_comments: true,
  seo_title: '',
  seo_description: '',
  tag_ids: [],
};

function toSlug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '—';
  }
}

function featuredImageUrl(article) {
  if (article?.featured_image?.file_url) return buildMediaUrl(article.featured_image.file_url);
  return null;
}

// ─── ArticleGalleryTab ────────────────────────────────────────────────────────

function ArticleGalleryTab({ articleId }) {
  const { toast } = useToast();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: items = [], isLoading } = useArticleGallery(articleId);

  const addMutation = useAddArticleGalleryItem(articleId, {
    onSuccess: () => toast({ title: 'Image added to gallery' }),
    onError: (err) => handleApiError(err, toast),
  });

  const deleteMutation = useDeleteArticleGalleryItem(articleId, {
    onSuccess: () => { toast({ title: 'Image removed' }); setDeleteTarget(null); },
    onError: (err) => handleApiError(err, toast),
  });

  const handlePickerSelect = (media) => {
    if (items.some((i) => i.media_id === media.id)) {
      toast({ title: 'Already in gallery', variant: 'destructive' });
      return;
    }
    addMutation.mutate({ media_id: media.id, display_order: items.length });
  };

  if (!articleId) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
        <p className="text-sm font-medium text-foreground">Save the article first</p>
        <p className="mt-1 text-sm text-muted-foreground">Create the article on the General tab, then add gallery images here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">
          Gallery Images
          {items.length > 0 && <span className="ml-2 text-xs font-normal text-muted-foreground">({items.length})</span>}
        </p>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          disabled={addMutation.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/8 rounded-lg hover:bg-primary/12 transition-colors disabled:opacity-60"
        >
          <Plus className="w-3.5 h-3.5" /> Add from Library
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/10 py-8 text-center text-muted-foreground">
          <ImageIcon className="w-8 h-8 opacity-25 mx-auto mb-2" />
          <p className="text-sm">No gallery images yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item) => {
            const url = item.media?.full_url ?? buildMediaUrl(item.media?.file_url) ?? null;
            return (
              <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden border-2 border-border bg-muted">
                {url
                  ? <img src={url} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 opacity-30" /></div>}
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} folder="blog/gallery" accept="image/*" onSelect={handlePickerSelect} />
      <ConfirmDialog
        open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Remove Image" message="Remove this image from the gallery?" itemName={deleteTarget?.media?.original_name}
      />
    </div>
  );
}

// ─── RelatedArticlesTab ───────────────────────────────────────────────────────

function RelatedArticlesTab({ articleId, currentArticleId }) {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const { data: allArticles = [] } = useBlogArticles();

  const addMutation = useAddRelatedArticle(articleId, {
    onSuccess: () => toast({ title: 'Related article added' }),
    onError: (err) => handleApiError(err, toast),
  });

  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allArticles.filter((a) => {
      if (a.id === currentArticleId) return false;
      if (!q) return true;
      return a.title?.toLowerCase().includes(q) || a.slug?.toLowerCase().includes(q);
    });
  }, [allArticles, search, currentArticleId]);

  if (!articleId) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
        <p className="text-sm font-medium text-foreground">Save the article first</p>
        <p className="mt-1 text-sm text-muted-foreground">Create the article on the General tab, then link related articles here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-foreground mb-1">Link Related Articles</p>
        <p className="text-xs text-muted-foreground">Select articles to display as related content below this article.</p>
      </div>
      <div className="relative">
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles by title or slug..."
          className="w-full pl-3 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
      </div>
      {candidates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/10 py-6 text-center text-muted-foreground">
          <p className="text-sm">No articles found</p>
        </div>
      ) : (
        <div className="divide-y divide-border border border-border rounded-xl overflow-hidden max-h-80 overflow-y-auto">
          {candidates.map((article) => (
            <div key={article.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{article.title}</p>
                <p className="text-xs text-muted-foreground truncate">{article.slug}</p>
              </div>
              <button
                type="button"
                onClick={() => addMutation.mutate({ related_article_id: article.id, display_order: 0 })}
                disabled={addMutation.isPending}
                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary bg-primary/8 rounded-lg hover:bg-primary/12 transition-colors disabled:opacity-60"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── BlogSeoTab ───────────────────────────────────────────────────────────────

function BlogSeoTab({ form, onChange, articleId }) {
  const titleLen = (form.seo_title ?? '').length;
  const descLen = (form.seo_description ?? '').length;
  const titleColour = titleLen > SEO_TITLE_MAX ? 'text-destructive' : titleLen > 50 ? 'text-warning' : 'text-muted-foreground';
  const descColour = descLen > SEO_DESC_MAX ? 'text-destructive' : descLen > 140 ? 'text-warning' : 'text-muted-foreground';

  if (!articleId) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
        <p className="text-sm font-medium text-foreground">Save the article first</p>
        <p className="mt-1 text-sm text-muted-foreground">Create the article on the General tab, then configure SEO here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <span className="shrink-0 mt-0.5">ℹ</span>
        <span>Changes here are saved when you click <strong>Save Changes</strong> in the drawer footer.</span>
      </div>

      <DrawerField label="Meta Title" hint={<span className={titleColour}>{titleLen}/{SEO_TITLE_MAX} · Recommended: 50–60 characters</span>}>
        <DrawerInput
          value={form.seo_title ?? ''}
          onChange={(e) => onChange('seo_title', e.target.value)}
          placeholder={form.title || 'SEO title...'}
          maxLength={SEO_TITLE_MAX + 20}
        />
      </DrawerField>

      <DrawerField label="Meta Description" hint={<span className={descColour}>{descLen}/{SEO_DESC_MAX} · Recommended: 120–160 characters</span>}>
        <DrawerInput
          textarea
          value={form.seo_description ?? ''}
          onChange={(e) => onChange('seo_description', e.target.value)}
          placeholder="Compelling description for search results..."
          maxLength={SEO_DESC_MAX + 20}
        />
      </DrawerField>

      <div className="rounded-xl border border-border bg-white p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Google Search Preview</p>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground shrink-0">G</div>
            <span className="text-xs text-muted-foreground truncate">
              yourdomain.com › blog › <span className="text-foreground">{form.slug || 'article-slug'}</span>
            </span>
          </div>
          <p className="text-base font-medium text-blue-700 leading-snug line-clamp-1">
            {form.seo_title?.trim() || form.title?.trim() || 'Page title not set'}
          </p>
          <p className="text-sm text-muted-foreground leading-snug line-clamp-2 mt-0.5">
            {form.seo_description?.trim() || 'Add a meta description to see a preview here.'}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/20 p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">URL Slug</p>
        <p className="text-sm text-foreground font-mono break-all">
          /blog/<span className="text-primary">{form.slug || 'article-slug'}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">Edit the slug on the General tab.</p>
      </div>
    </div>
  );
}

// ─── Main Blog component ──────────────────────────────────────────────────────

export default function Blog() {
  const { toast } = useToast();
  const { data: articles = [], isLoading, isError, error } = useBlogArticles();
  const { data: categories = [] } = useBlogCategories();
  const { data: tags = [] } = useBlogTags();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [activeTab, setActiveTab] = useState('General');
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { setPage(1); }, [search, activeFilter]);

  useEffect(() => {
    if (!drawerOpen) return;
    if (editItem) {
      setForm({
        title: editItem.title ?? '',
        slug: editItem.slug ?? '',
        category_id: editItem.category_id ?? editItem.category?.id ?? '',
        author_name: editItem.author_name ?? '',
        excerpt: editItem.excerpt ?? '',
        content: editItem.content ?? '',
        featured_image_id: editItem.featured_image_id ?? null,
        featured_image_url: featuredImageUrl(editItem),
        banner_image_id: editItem.banner_image_id ?? null,
        banner_image_url: editItem.banner_image?.file_url ? buildMediaUrl(editItem.banner_image.file_url) : null,
        reading_time: editItem.reading_time ?? 5,
        status: editItem.status ?? 'draft',
        is_featured: editItem.is_featured ?? false,
        homepage_featured: editItem.homepage_featured ?? false,
        allow_comments: editItem.allow_comments ?? true,
        seo_title: editItem.seo_title ?? '',
        seo_description: editItem.seo_description ?? '',
        tag_ids: (editItem.tags ?? []).map((t) => t.id),
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [drawerOpen, editItem]);

  const createMutation = useCreateBlogArticle({
    onSuccess: (created) => {
      toast({ title: 'Article created' });
      setEditItem(created);
      setActiveTab('General');
    },
    onError: (err) => handleApiError(err, toast),
  });

  const updateMutation = useUpdateBlogArticle({
    onSuccess: () => toast({ title: 'Article saved' }),
    onError: (err) => handleApiError(err, toast),
  });

  const deleteMutation = useDeleteBlogArticle({
    onSuccess: () => { toast({ title: 'Article deleted' }); setDeleteTarget(null); setDrawerOpen(false); },
    onError: (err) => handleApiError(err, toast),
  });

  const publishMutation = usePublishBlogArticle({
    onSuccess: () => toast({ title: 'Article published' }),
    onError: (err) => handleApiError(err, toast),
  });

  const unpublishMutation = useUnpublishBlogArticle({
    onSuccess: () => toast({ title: 'Article unpublished' }),
    onError: (err) => handleApiError(err, toast),
  });

  const filtered = useMemo(() => {
    let list = articles;
    if (activeFilter === 'Published') list = list.filter((a) => a.status === 'published');
    if (activeFilter === 'Draft') list = list.filter((a) => a.status === 'draft');
    if (activeFilter === 'Featured') list = list.filter((a) => a.is_featured);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) =>
        a.title?.toLowerCase().includes(q) ||
        a.slug?.toLowerCase().includes(q) ||
        a.author_name?.toLowerCase().includes(q) ||
        a.category?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [articles, search, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const publishedCount = articles.filter((a) => a.status === 'published').length;
  const draftCount = articles.filter((a) => a.status === 'draft').length;
  const featuredCount = articles.filter((a) => a.is_featured).length;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const filters = [
    { label: 'All', value: 'all', count: articles.length },
    { label: 'Published', value: 'Published', count: publishedCount },
    { label: 'Draft', value: 'Draft', count: draftCount },
    { label: 'Featured', value: 'Featured', count: featuredCount },
  ];

  const categoryOptions = [
    { value: '', label: 'Uncategorized' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const tagOptions = tags.map((t) => ({ value: t.id, label: t.name }));

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleTitleChange = (value) => setForm((f) => ({
    ...f,
    title: value,
    slug: editItem ? f.slug : toSlug(value),
  }));

  const handleTagToggle = (tagId) => {
    setForm((f) => {
      const ids = f.tag_ids.includes(tagId)
        ? f.tag_ids.filter((id) => id !== tagId)
        : [...f.tag_ids, tagId];
      return { ...f, tag_ids: ids };
    });
  };

  const handleSave = () => {
    if (!form.title.trim()) { toast({ title: 'Article title is required', variant: 'destructive' }); return; }
    if (!form.slug.trim()) { toast({ title: 'Slug is required', variant: 'destructive' }); return; }

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      category_id: form.category_id || null,
      author_name: form.author_name?.trim() || null,
      excerpt: form.excerpt?.trim() || null,
      content: form.content || null,
      featured_image_id: form.featured_image_id || null,
      banner_image_id: form.banner_image_id || null,
      reading_time: Number(form.reading_time) || 5,
      status: form.status || 'draft',
      is_featured: Boolean(form.is_featured),
      homepage_featured: Boolean(form.homepage_featured),
      allow_comments: Boolean(form.allow_comments),
      seo_title: form.seo_title?.trim() || null,
      seo_description: form.seo_description?.trim() || null,
      tag_ids: form.tag_ids,
    };

    if (editItem) updateMutation.mutate({ id: editItem.id, formValues: payload });
    else createMutation.mutate(payload);
  };

  const openCreate = () => { setEditItem(null); setActiveTab('General'); setDrawerOpen(true); };
  const openEdit = (item) => { setEditItem(item); setActiveTab('General'); setDrawerOpen(true); };

  const toggleStatus = (event, article) => {
    event.stopPropagation();
    if (article.status === 'published') unpublishMutation.mutate(article.id);
    else publishMutation.mutate(article.id);
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Blog Articles" description="Create and manage travel blog content" />
        <TableSkeleton rows={8} columns={5} selectable={false} />
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
      <PageHeader
        title="Blog Articles"
        description="Create and manage travel blog content"
        searchPlaceholder="Search articles..."
        onSearch={setSearch}
        filters={filters}
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
        onAdd={openCreate}
        addLabel="New Article"
      />

      {paginated.length === 0 ? (
        <div className="bg-white border border-border rounded-xl">
          <EmptyState
            icon={BookOpen}
            title={search ? `No results for "${search}"` : 'No articles yet'}
            message={search ? 'Try a different search term.' : 'Write your first blog article.'}
            actionLabel="New Article"
            onAction={openCreate}
          />
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[minmax(14rem,1.4fr)_10rem_8rem_8rem_7rem] gap-3 px-4 py-2.5 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span>Article</span>
            <span>Category</span>
            <span>Status</span>
            <span>Publish Date</span>
            <span />
          </div>
          <div className="divide-y divide-border">
            {paginated.map((article) => {
              const imgUrl = featuredImageUrl(article);
              return (
                <div
                  key={article.id}
                  onClick={() => openEdit(article)}
                  className="group grid grid-cols-[minmax(14rem,1.4fr)_10rem_8rem_8rem_7rem] gap-3 items-center px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                      {imgUrl
                        ? <img src={imgUrl} alt={article.title} className="w-full h-full object-cover" />
                        : <BookOpen className="w-4 h-4 text-muted-foreground/50" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="font-medium text-foreground truncate">{article.title}</p>
                        {article.is_featured && <Star className="w-3.5 h-3.5 text-warning fill-warning shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {article.author_name ? `by ${article.author_name}` : article.slug}
                      </p>
                    </div>
                  </div>
                  <span className="text-muted-foreground truncate text-sm">{article.category?.name || 'Uncategorized'}</span>
                  <StatusBadge status={article.status === 'published' ? 'Published' : 'Draft'} />
                  <span className="text-muted-foreground text-xs">{formatDate(article.published_at)}</span>
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button onClick={(e) => toggleStatus(e, article)} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" title={article.status === 'published' ? 'Unpublish' : 'Publish'}>
                      <Power className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEdit(article)} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(article)} className="p-2 rounded-lg text-destructive hover:bg-destructive/5">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} total={filtered.length} perPage={PER_PAGE} onPageChange={setPage} />

      {/* ── Drawer ── */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editItem ? 'Edit Article' : 'Create Article'}
        description={editItem ? `${editItem.title} · ${formatDate(editItem.updated_at ?? editItem.created_at)}` : 'Write and publish a new blog article'}
        tabs={TABS}
        width="xl"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSave={activeTab === 'General' || activeTab === 'SEO' || activeTab === 'Settings' ? handleSave : undefined}
        isSaving={isSaving}
        onDelete={editItem ? () => { setDrawerOpen(false); setDeleteTarget(editItem); } : undefined}
      >
        {(tab) => (
          <div className="space-y-5">
            {/* ── GENERAL TAB ── */}
            {tab === 'General' && (
              <>
                <DrawerField label="Article Title" required>
                  <DrawerInput value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="e.g. Top 10 Luxury Honeymoon Destinations" maxLength={255} />
                </DrawerField>
                <DrawerField label="Slug" required hint="Auto-generated from title — edit only if needed">
                  <DrawerInput value={form.slug} onChange={(e) => handleChange('slug', toSlug(e.target.value))} placeholder="top-10-luxury-honeymoon-destinations" maxLength={255} />
                </DrawerField>
                <div className="grid grid-cols-2 gap-4">
                  <DrawerField label="Category">
                    <DrawerSelect value={form.category_id} onChange={(e) => handleChange('category_id', e.target.value)} options={categoryOptions} />
                  </DrawerField>
                  <DrawerField label="Author Name">
                    <DrawerInput value={form.author_name} onChange={(e) => handleChange('author_name', e.target.value)} placeholder="e.g. Sarah Mitchell" maxLength={255} />
                  </DrawerField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <DrawerField label="Status">
                    <DrawerSelect
                      value={form.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      options={[{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }]}
                    />
                  </DrawerField>
                  <DrawerField label="Reading Time (min)">
                    <DrawerInput type="number" value={form.reading_time} onChange={(e) => handleChange('reading_time', e.target.value)} placeholder="5" />
                  </DrawerField>
                </div>
                <DrawerField label="Excerpt" hint="Short summary shown in article listings">
                  <DrawerInput textarea value={form.excerpt} onChange={(e) => handleChange('excerpt', e.target.value)} placeholder="A brief description of the article..." />
                </DrawerField>
                {tags.length > 0 && (
                  <DrawerField label="Tags">
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => {
                        const selected = form.tag_ids.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleTagToggle(tag.id)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                              selected ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground border-border hover:border-primary/40'
                            }`}
                          >
                            {tag.name}
                          </button>
                        );
                      })}
                    </div>
                  </DrawerField>
                )}
              </>
            )}

            {/* ── CONTENT TAB ── */}
            {tab === 'Content' && (
              <>
                <DrawerField label="Article Content" hint="Full article body — supports rich text formatting">
                  <div className="border border-border rounded-lg overflow-hidden blog-editor">
                    <ReactQuill
                      theme="snow"
                      value={form.content}
                      onChange={(value) => handleChange('content', value)}
                      modules={QUILL_MODULES}
                      formats={QUILL_FORMATS}
                      placeholder="Start writing your article..."
                      style={{ minHeight: '320px' }}
                    />
                  </div>
                </DrawerField>
              </>
            )}

            {/* ── MEDIA TAB ── */}
            {tab === 'Media' && (
              <>
                <DrawerField label="Featured Image" hint="Main image shown in article listings and social shares">
                  <MediaUploader
                    module="blog"
                    section="featured"
                    value={form.featured_image_url}
                    mediaId={form.featured_image_id}
                    onChange={(media) => setForm((f) => ({ ...f, featured_image_id: media.id, featured_image_url: media.full_url }))}
                    onClear={() => setForm((f) => ({ ...f, featured_image_id: null, featured_image_url: null }))}
                    hint="Recommended: 1200×630px"
                  />
                </DrawerField>
                <DrawerField label="Banner Image" hint="Optional wide banner image shown at the top of the article">
                  <MediaUploader
                    module="blog"
                    section="banner"
                    value={form.banner_image_url}
                    mediaId={form.banner_image_id}
                    onChange={(media) => setForm((f) => ({ ...f, banner_image_id: media.id, banner_image_url: media.full_url }))}
                    onClear={() => setForm((f) => ({ ...f, banner_image_id: null, banner_image_url: null }))}
                    hint="Recommended: 1600×600px"
                  />
                </DrawerField>
                <ArticleGalleryTab articleId={editItem?.id ?? null} />
              </>
            )}

            {/* ── RELATED TAB ── */}
            {tab === 'Related' && (
              <RelatedArticlesTab articleId={editItem?.id ?? null} currentArticleId={editItem?.id} />
            )}

            {/* ── SEO TAB ── */}
            {tab === 'SEO' && (
              <BlogSeoTab form={form} onChange={handleChange} articleId={editItem?.id ?? null} />
            )}

            {/* ── SETTINGS TAB ── */}
            {tab === 'Settings' && (
              <>
                <DrawerField label="Featured Article">
                  <label className="flex items-center gap-3 cursor-pointer h-10">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) => handleChange('is_featured', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                    />
                    <span className="text-sm text-muted-foreground">Show in featured articles section</span>
                  </label>
                </DrawerField>
                <DrawerField label="Homepage Featured">
                  <label className="flex items-center gap-3 cursor-pointer h-10">
                    <input
                      type="checkbox"
                      checked={form.homepage_featured}
                      onChange={(e) => handleChange('homepage_featured', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                    />
                    <span className="text-sm text-muted-foreground">Show in homepage Travel Journal section</span>
                  </label>
                </DrawerField>
                <DrawerField label="Allow Comments">
                  <label className="flex items-center gap-3 cursor-pointer h-10">
                    <input
                      type="checkbox"
                      checked={form.allow_comments}
                      onChange={(e) => handleChange('allow_comments', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                    />
                    <span className="text-sm text-muted-foreground">Enable reader comments on this article</span>
                  </label>
                </DrawerField>
              </>
            )}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete Article"
        message="Are you sure you want to delete this article? This action cannot be undone."
        itemName={deleteTarget?.title}
      />
    </div>
  );
}
