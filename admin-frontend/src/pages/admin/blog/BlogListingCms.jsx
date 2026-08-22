/**
 * BlogListingCms — Blog Page › Listing Settings
 *
 * Controls HOW blog article cards are displayed. Does NOT manage articles.
 * Category filter chips are derived from real Blog Categories API.
 *
 * Backend status: No dedicated endpoint. Saved locally until a
 * BlogPageSettings singleton is added to the backend.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Loader2, BookOpen, Info } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { DrawerField, DrawerSelect } from '@/components/admin/Drawer';
import { useToast } from '@/components/ui/use-toast';
import { useBlogCategories } from '@/hooks/use-blog';

const cn = (...c) => c.filter(Boolean).join(' ');

const DRAFT_KEY = 'blog_listing_draft';
const load = () => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}'); } catch { return {}; } };
const persist = (v) => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(v)); } catch { /**/ } };

const DEFAULTS = {
  enable_category_filter: true,
  enable_tag_filter: false,
  enable_search: true,
  enable_pagination: true,
  default_category: 'All',
  articles_per_page: 9,
  sort_order: 'newest',
  grid_layout: 'grid-3',
  show_featured_first: true,
  show_author: true,
  show_publish_date: true,
  show_reading_time: true,
  show_category: true,
  show_excerpt: true,
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'featured', label: 'Featured First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'name_asc', label: 'Title A–Z' },
];

const PER_PAGE_OPTIONS = [
  { value: '6', label: '6 per page' },
  { value: '9', label: '9 per page' },
  { value: '12', label: '12 per page' },
  { value: '18', label: '18 per page' },
];

const GRID_OPTIONS = [
  { value: 'grid-2', label: 'Grid (2 columns)' },
  { value: 'grid-3', label: 'Grid (3 columns)' },
  { value: 'grid-4', label: 'Grid (4 columns)' },
  { value: 'list', label: 'List view' },
];

function Toggle({ checked, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn('relative w-10 h-5 rounded-full transition-colors shrink-0', checked ? 'bg-primary' : 'bg-muted-foreground/30')}
      >
        <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-soft transition-transform', checked ? 'translate-x-5' : 'translate-x-0.5')} />
      </button>
    </div>
  );
}

export default function BlogListingCms() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState(() => ({ ...DEFAULTS, ...load() }));
  const [saving, setSaving] = useState(false);

  const { data: categories = [], isLoading: catLoading } = useBlogCategories();
  const allCats = ['All', ...categories.map((c) => c.name)];
  const [categoryOrder, setCategoryOrder] = useState(() => load().category_order ?? allCats);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = () => {
    setSaving(true);
    persist({ ...form, category_order: categoryOrder });
    setTimeout(() => { setSaving(false); toast({ title: 'Listing settings saved' }); }, 300);
  };

  return (
    <div>
      <button
        onClick={() => navigate('/admin/website/blog')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> Blog Page
      </button>

      <PageHeader
        title="Listing Settings"
        description="Controls how blog article cards are displayed — not the articles themselves"
        searchPlaceholder="" onSearch={null} onAdd={null} filters={null} onFilter={null}
        activeFilter={null} onSort={null} onExport={null} onImport={null}
        actions={
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        }
      />

      <div className="flex items-start gap-3 mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          Article content is managed in{' '}
          <button onClick={() => navigate('/admin/blog')} className="font-semibold underline underline-offset-2">
            Blog Management
          </button>. This page only controls display preferences.
        </span>
      </div>

      <div className="flex items-start gap-3 mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <span className="shrink-0 font-bold mt-0.5">⚠</span>
        <span>
          <strong>No backend endpoint yet.</strong> Saved locally until a{' '}
          <code className="text-xs bg-amber-100 px-1 rounded">BlogPageSettings</code> singleton is added.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column — Display options + Card toggles */}
        <div className="space-y-5">
          <div className="bg-white border border-border rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Display Options</h3>
              <p className="text-xs text-muted-foreground mt-0.5">How article cards are laid out and sorted</p>
            </div>
            <DrawerField label="Grid Layout">
              <DrawerSelect
                options={GRID_OPTIONS}
                value={form.grid_layout}
                onChange={(e) => set('grid_layout', e.target.value)}
              />
            </DrawerField>
            <DrawerField label="Articles Per Page">
              <DrawerSelect
                options={PER_PAGE_OPTIONS}
                value={String(form.articles_per_page)}
                onChange={(e) => set('articles_per_page', Number(e.target.value))}
              />
            </DrawerField>
            <DrawerField label="Sort Order">
              <DrawerSelect
                options={SORT_OPTIONS}
                value={form.sort_order}
                onChange={(e) => set('sort_order', e.target.value)}
              />
            </DrawerField>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground">Card Display</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Choose which fields appear on each article card</p>
            </div>
            <Toggle label="Show Featured Articles First" checked={form.show_featured_first} onChange={(v) => set('show_featured_first', v)} />
            <Toggle label="Show Author" desc="Author name below the title" checked={form.show_author} onChange={(v) => set('show_author', v)} />
            <Toggle label="Show Publish Date" checked={form.show_publish_date} onChange={(v) => set('show_publish_date', v)} />
            <Toggle label="Show Reading Time" desc='e.g. "5 min read"' checked={form.show_reading_time} onChange={(v) => set('show_reading_time', v)} />
            <Toggle label="Show Category Badge" checked={form.show_category} onChange={(v) => set('show_category', v)} />
            <Toggle label="Show Excerpt" desc="Short description below the title" checked={form.show_excerpt} onChange={(v) => set('show_excerpt', v)} />
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground">Features</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Additional listing page features</p>
            </div>
            <Toggle label="Enable Search Bar" desc="Article search above the grid" checked={form.enable_search} onChange={(v) => set('enable_search', v)} />
            <Toggle label="Enable Tag Filter" desc="Show tag filter chips" checked={form.enable_tag_filter} onChange={(v) => set('enable_tag_filter', v)} />
            <Toggle label="Enable Pagination" checked={form.enable_pagination} onChange={(v) => set('enable_pagination', v)} />
          </div>
        </div>

        {/* Right column — Category filter */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Category Filter Bar</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Filter chips — derived from real Blog Categories</p>
          </div>

          <Toggle
            label="Enable Category Filter"
            desc="Show filter chips above the article grid"
            checked={form.enable_category_filter}
            onChange={(v) => set('enable_category_filter', v)}
          />

          {form.enable_category_filter && (
            <>
              <DrawerField label="Default Selected Category">
                <DrawerSelect
                  options={categoryOrder.map((c) => ({ value: c, label: c }))}
                  value={form.default_category}
                  onChange={(e) => set('default_category', e.target.value)}
                />
              </DrawerField>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Category Order</p>
                <p className="text-xs text-muted-foreground mb-3">
                  {catLoading ? 'Loading categories…' : `${categories.length} categories from backend`}
                </p>
                <div className="space-y-1.5">
                  {categoryOrder.map((cat, index) => (
                    <div
                      key={cat}
                      className="flex items-center gap-2.5 px-3 py-2 bg-white border rounded-lg transition-all border-border hover:border-primary/30"
                    >
                      <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-foreground truncate flex-1">{cat}</span>
                      {cat === 'All' && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">default</span>
                      )}
                    </div>
                  ))}
                  {categoryOrder.length === 0 && (
                    <div className="flex items-center gap-2 py-4 px-3 border border-dashed border-border rounded-xl text-sm text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      <span>
                        No categories found. Add them in{' '}
                        <button onClick={() => navigate('/admin/categories')} className="underline font-medium">Blog Categories</button>.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
