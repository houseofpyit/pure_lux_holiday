/**
 * PackagesListingCms — Luxury Packages Page › Listing Settings
 *
 * Controls HOW package cards are displayed. Does NOT manage package records.
 * Category filter chips are derived from real Package Categories API.
 *
 * APIs reused:
 *   GET /api/v1/packages/categories  — real category data
 *
 * Backend to add:
 *   LuxuryPackagesPageSettings singleton with all display fields.
 * All settings stored locally until then.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Loader2, Briefcase, LayoutGrid, Info } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { DrawerField, DrawerSelect } from '@/components/admin/Drawer';
import { useToast } from '@/components/ui/use-toast';
import { usePackageCategories } from '@/hooks/use-packages';

const cn = (...c) => c.filter(Boolean).join(' ');
const DRAFT_KEY = 'pkg_listing_draft';
const load = () => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}'); } catch { return {}; } };
const save = (v) => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(v)); } catch { /**/ } };

const DEFAULTS = {
  enable_filter: true, default_filter: 'All',
  packages_per_page: 9, sort_order: 'featured', grid_layout: 'grid',
  show_featured_first: true, show_price: true, show_duration: true,
  show_starting_from: true, show_location: true,
};
const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name A–Z' },
  { value: 'newest', label: 'Newest First' },
];
const PER_PAGE_OPTIONS = [
  { value: '6', label: '6 per page' }, { value: '9', label: '9 per page' },
  { value: '12', label: '12 per page' }, { value: '18', label: '18 per page' },
];
const GRID_OPTIONS = [
  { value: 'grid', label: 'Grid (3 columns)' },
  { value: 'grid-2', label: 'Grid (2 columns)' },
  { value: 'list', label: 'List view' },
];

function Toggle({ checked, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <button type="button" onClick={() => onChange(!checked)} className={cn('relative w-10 h-5 rounded-full transition-colors shrink-0', checked ? 'bg-primary' : 'bg-muted-foreground/30')}>
        <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-soft transition-transform', checked ? 'translate-x-5' : 'translate-x-0.5')} />
      </button>
    </div>
  );
}

export default function PackagesListingCms() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState(() => ({ ...DEFAULTS, ...load() }));
  const [saving, setSaving] = useState(false);

  const { data: categories = [], isLoading: catLoading } = usePackageCategories();
  const allCats = ['All', ...categories.map((c) => c.name)];
  const [categoryOrder, setCategoryOrder] = useState(() => load().category_order ?? allCats);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = () => {
    setSaving(true);
    save({ ...form, category_order: categoryOrder });
    setTimeout(() => { setSaving(false); toast({ title: 'Listing settings saved' }); }, 300);
  };

  return (
    <div>
      <button onClick={() => navigate('/admin/website/packages')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ChevronLeft className="w-4 h-4" /> Luxury Packages Page
      </button>

      <PageHeader title="Listing Settings" description="Controls how package cards are displayed — not the cards themselves"
        searchPlaceholder="" onSearch={null} onAdd={null} filters={null} onFilter={null}
        activeFilter={null} onSort={null} onExport={null} onImport={null}
        actions={
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saving ? 'Saving…' : 'Save Changes'}
          </button>
        }
      />

      <div className="flex items-start gap-3 mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Package cards are managed in <button onClick={() => navigate('/admin/packages')} className="font-semibold underline underline-offset-2">Package Management</button>. This page only controls display preferences.</span>
      </div>
      <div className="flex items-start gap-3 mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <span className="shrink-0 font-bold mt-0.5">⚠</span>
        <span><strong>No backend endpoint yet.</strong> Saved locally until a <code className="text-xs bg-amber-100 px-1 rounded">LuxuryPackagesPageSettings</code> singleton is added.</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Display Options */}
        <div className="space-y-5">
          <div className="bg-white border border-border rounded-xl p-6 space-y-5">
            <div><h3 className="text-sm font-semibold text-foreground">Display Options</h3><p className="text-xs text-muted-foreground mt-0.5">How package cards are laid out and sorted</p></div>
            <DrawerField label="Grid Layout" hint="" required={false}>
              <DrawerSelect options={GRID_OPTIONS} value={form.grid_layout} onChange={(e) => set('grid_layout', e.target.value)} defaultValue="grid" disabled={false} />
            </DrawerField>
            <DrawerField label="Packages Per Page" hint="" required={false}>
              <DrawerSelect options={PER_PAGE_OPTIONS} value={String(form.packages_per_page)} onChange={(e) => set('packages_per_page', Number(e.target.value))} defaultValue="9" disabled={false} />
            </DrawerField>
            <DrawerField label="Sort Order" hint="" required={false}>
              <DrawerSelect options={SORT_OPTIONS} value={form.sort_order} onChange={(e) => set('sort_order', e.target.value)} defaultValue="featured" disabled={false} />
            </DrawerField>
          </div>

          {/* Card display toggles */}
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="mb-4"><h3 className="text-sm font-semibold text-foreground">Card Display</h3><p className="text-xs text-muted-foreground mt-0.5">Choose which fields appear on each package card</p></div>
            <Toggle label="Show Featured Packages First" checked={form.show_featured_first} onChange={(v) => set('show_featured_first', v)} />
            <Toggle label="Show Price" desc='e.g. "From $8,499"' checked={form.show_price} onChange={(v) => set('show_price', v)} />
            <Toggle label="Show Duration" desc='e.g. "7 Nights"' checked={form.show_duration} onChange={(v) => set('show_duration', v)} />
            <Toggle label='Show "Starting From" Label' checked={form.show_starting_from} onChange={(v) => set('show_starting_from', v)} />
            <Toggle label="Show Location / Destination" checked={form.show_location} onChange={(v) => set('show_location', v)} />
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-5">
          <div><h3 className="text-sm font-semibold text-foreground">Category Filter Bar</h3><p className="text-xs text-muted-foreground mt-0.5">Filter chips — derived from real Package Categories</p></div>

          <Toggle label="Enable Category Filter" desc="Show filter chips above the package grid" checked={form.enable_filter} onChange={(v) => set('enable_filter', v)} />

          {form.enable_filter && (<>
            <DrawerField label="Default Selected Category" hint="" required={false}>
              <DrawerSelect options={categoryOrder.map((c) => ({ value: c, label: c }))} value={form.default_filter} onChange={(e) => set('default_filter', e.target.value)} defaultValue="All" disabled={false} />
            </DrawerField>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Category Order</p>
              <p className="text-xs text-muted-foreground mb-3">
                {catLoading ? 'Loading categories…' : `${categories.length} categories from backend`}
              </p>
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
                {categoryOrder.length === 0 && (
                  <div className="flex items-center gap-2 py-4 px-3 border border-dashed border-border rounded-xl text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    <span>No categories found. Add them in <button onClick={() => navigate('/admin/travel/categories')} className="underline font-medium">Package Categories</button>.</span>
                  </div>
                )}
              </div>
            </div>
          </>)}
        </div>
      </div>
    </div>
  );
}
