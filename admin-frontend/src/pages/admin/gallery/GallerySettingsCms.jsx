/**
 * GallerySettingsCms — Gallery Page › Gallery Settings
 *
 * Controls HOW gallery items are displayed.
 * Does NOT manage gallery content — that lives in Gallery Management.
 *
 * Category chips are derived from GET /api/v1/gallery/categories (live backend).
 * Display settings are persisted via useUpdateGallerySettings → gallery.api.js.
 *
 * Backend to add: GET/PUT /api/v1/gallery/page/settings
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Save, Loader2, AlertCircle,
  FolderOpen, LayoutGrid, Info,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { DrawerField, DrawerSelect } from '@/components/admin/Drawer';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import { useGalleryCategories, useGallerySettings, useUpdateGallerySettings } from '@/hooks/use-gallery';

const cn = (...c) => c.filter(Boolean).join(' ');

const LAYOUT_OPTIONS = [
  { value: 'grid', label: 'Grid (uniform)' },
  { value: 'masonry', label: 'Masonry (varying heights)' },
  { value: 'mixed', label: 'Mixed' },
];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'featured', label: 'Featured First' },
  { value: 'manual', label: 'Manual Order' },
];
const ITEMS_OPTIONS = [
  { value: '9', label: '9 per page' }, { value: '12', label: '12 per page' },
  { value: '18', label: '18 per page' }, { value: '24', label: '24 per page' },
];
const COL_OPTIONS = [
  { value: '1', label: '1 column' }, { value: '2', label: '2 columns' },
  { value: '3', label: '3 columns' }, { value: '4', label: '4 columns' },
  { value: '5', label: '5 columns' },
];
const ASPECT_OPTIONS = [
  { value: 'square', label: 'Square (1:1)' },
  { value: 'landscape', label: 'Landscape (16:9)' },
  { value: 'portrait', label: 'Portrait (3:4)' },
];

function Toggle({ checked, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <div className="pr-4">
        <p className="text-sm text-foreground">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <button type="button" onClick={() => onChange(!checked)}
        className={cn('relative w-10 h-5 rounded-full transition-colors shrink-0', checked ? 'bg-primary' : 'bg-muted-foreground/30')}>
        <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-soft transition-transform', checked ? 'translate-x-5' : 'translate-x-0.5')} />
      </button>
    </div>
  );
}

export default function GallerySettingsCms() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: settingsData, isLoading, isError } = useGallerySettings();
  const { data: categories = [] } = useGalleryCategories();
  const [form, setForm] = useState(null);

  // Build category order from live data + saved order
  const [categoryOrder, setCategoryOrder] = useState([]);

  useEffect(() => {
    if (settingsData && !form) {
      setForm(settingsData);
      const live = ['All', ...categories.map((c) => c.name)];
      const saved = settingsData.category_order ?? [];
      // Merge: keep saved order, append any new categories
      const merged = [...saved, ...live.filter((c) => !saved.includes(c))];
      setCategoryOrder(merged.length ? merged : live);
    }
  }, [settingsData, categories]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateMutation = useUpdateGallerySettings({
    onSuccess: () => toast({ title: 'Gallery settings saved' }),
    onError: (err) => handleApiError(err, toast),
  });

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = () => {
    if (!form) return;
    updateMutation.mutate({ ...form, category_order: categoryOrder });
  };

  if (isLoading || !form) return (
    <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  );
  if (isError) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive">
      <AlertCircle className="w-8 h-8" /><p className="text-sm">Failed to load gallery settings</p>
    </div>
  );

  const isSaving = updateMutation.isPending;

  return (
    <div>
      <button onClick={() => navigate('/admin/website/gallery')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ChevronLeft className="w-4 h-4" /> Gallery Page
      </button>

      <PageHeader title="Gallery Settings" description="Controls how gallery items are displayed — not the items themselves"
        searchPlaceholder="" onSearch={null} onAdd={null} filters={null} onFilter={null}
        activeFilter={null} onSort={null} onExport={null} onImport={null}
        actions={
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        }
      />

      <div className="flex items-start gap-3 mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Gallery albums and items are managed in <button onClick={() => navigate('/admin/media')} className="font-semibold underline underline-offset-2">Gallery Management</button>. This page only controls display preferences.</span>
      </div>
      <div className="flex items-start gap-3 mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <span className="shrink-0 font-bold mt-0.5">⚠</span>
        <span><strong>Backend pending.</strong> Saved via <code className="text-xs bg-amber-100 px-1 rounded">gallery.api.js</code> fallback until <code className="text-xs bg-amber-100 px-1 rounded">GET/PUT /api/v1/gallery/page/settings</code> is added.</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Layout & Sort ── */}
        <div className="space-y-5">
          <div className="bg-white border border-border rounded-xl p-6 space-y-5">
            <div><h3 className="text-sm font-semibold text-foreground">Layout</h3><p className="text-xs text-muted-foreground mt-0.5">How gallery items are arranged</p></div>
            <DrawerField label="Gallery Layout" hint="" required={false}>
              <DrawerSelect options={LAYOUT_OPTIONS} value={form.gallery_layout} onChange={(e) => set('gallery_layout', e.target.value)} defaultValue="grid" disabled={false} />
            </DrawerField>
            <DrawerField label="Image Aspect Ratio" hint="" required={false}>
              <DrawerSelect options={ASPECT_OPTIONS} value={form.image_aspect_ratio} onChange={(e) => set('image_aspect_ratio', e.target.value)} defaultValue="landscape" disabled={false} />
            </DrawerField>
            <DrawerField label="Items Per Page" hint="" required={false}>
              <DrawerSelect options={ITEMS_OPTIONS} value={String(form.items_per_page)} onChange={(e) => set('items_per_page', Number(e.target.value))} defaultValue="12" disabled={false} />
            </DrawerField>
            <DrawerField label="Sort Order" hint="" required={false}>
              <DrawerSelect options={SORT_OPTIONS} value={form.sort_order} onChange={(e) => set('sort_order', e.target.value)} defaultValue="newest" disabled={false} />
            </DrawerField>
            <div className="grid grid-cols-3 gap-3">
              <DrawerField label="Desktop Cols" hint="" required={false}>
                <DrawerSelect options={COL_OPTIONS} value={String(form.columns_desktop)} onChange={(e) => set('columns_desktop', Number(e.target.value))} defaultValue="3" disabled={false} />
              </DrawerField>
              <DrawerField label="Tablet Cols" hint="" required={false}>
                <DrawerSelect options={COL_OPTIONS} value={String(form.columns_tablet)} onChange={(e) => set('columns_tablet', Number(e.target.value))} defaultValue="2" disabled={false} />
              </DrawerField>
              <DrawerField label="Mobile Cols" hint="" required={false}>
                <DrawerSelect options={COL_OPTIONS} value={String(form.columns_mobile)} onChange={(e) => set('columns_mobile', Number(e.target.value))} defaultValue="1" disabled={false} />
              </DrawerField>
            </div>
          </div>

          {/* ── Behaviour toggles ── */}
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="mb-4"><h3 className="text-sm font-semibold text-foreground">Behaviour</h3><p className="text-xs text-muted-foreground mt-0.5">Interactive features for the gallery</p></div>
            <Toggle label="Show Featured First" checked={form.show_featured_first} onChange={(v) => set('show_featured_first', v)} />
            <Toggle label="Enable Lightbox" desc="Click to expand images full-screen" checked={form.enable_lightbox} onChange={(v) => set('enable_lightbox', v)} />
            <Toggle label="Enable Infinite Scroll" checked={form.enable_infinite_scroll} onChange={(v) => set('enable_infinite_scroll', v)} />
            <Toggle label="Enable Load More Button" checked={form.enable_load_more} onChange={(v) => set('enable_load_more', v)} />
            <Toggle label="Show Hover Animation" checked={form.show_hover_animation} onChange={(v) => set('show_hover_animation', v)} />
          </div>

          {/* ── Card display toggles ── */}
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="mb-4"><h3 className="text-sm font-semibold text-foreground">Card Display</h3><p className="text-xs text-muted-foreground mt-0.5">Which fields appear on each gallery card</p></div>
            <Toggle label="Show Category" checked={form.show_category} onChange={(v) => set('show_category', v)} />
            <Toggle label="Show Title" checked={form.show_title} onChange={(v) => set('show_title', v)} />
            <Toggle label="Show Location" checked={form.show_location} onChange={(v) => set('show_location', v)} />
          </div>
        </div>

        {/* ── Category Filter ── */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-5">
          <div><h3 className="text-sm font-semibold text-foreground">Category Filter Bar</h3><p className="text-xs text-muted-foreground mt-0.5">Filter chips above the gallery — from live backend categories</p></div>

          <Toggle label="Enable Category Filter" desc="Show filter chips above the gallery" checked={form.enable_filter} onChange={(v) => set('enable_filter', v)} />

          {form.enable_filter && (<>
            <DrawerField label="Default Category" hint="Which filter chip is active on page load" required={false}>
              <DrawerSelect options={categoryOrder.map((c) => ({ value: c, label: c }))} value={form.default_category}
                onChange={(e) => set('default_category', e.target.value)} defaultValue="All" disabled={false} />
            </DrawerField>

            <div>
              <p className="text-sm font-medium text-foreground mb-1">Category Display Order</p>
              <p className="text-xs text-muted-foreground mb-3">
                {categories.length} categories loaded from backend
              </p>
              {categoryOrder.length === 0 ? (
                <div className="flex items-center gap-2 py-4 px-3 border border-dashed border-border rounded-xl text-sm text-muted-foreground">
                  <FolderOpen className="w-4 h-4" />
                  <span>No categories found. Add them in <button onClick={() => navigate('/admin/media')} className="underline font-medium">Gallery Management</button>.</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {categoryOrder.map((cat, index) => (
                    <div key={cat}
                      className="flex items-center gap-2.5 px-3 py-2 bg-white border rounded-lg transition-all border-border hover:border-primary/30">
                      <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">{index + 1}</span>
                      <span className="text-sm font-medium text-foreground truncate flex-1">{cat}</span>
                      {cat === 'All' && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">default</span>}
                      <LayoutGrid className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>)}
        </div>

      </div>
    </div>
  );
}
