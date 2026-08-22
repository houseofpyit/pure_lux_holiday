/**
 * ExperiencesListingCms — Experiences Page › Listing Settings
 *
 * Controls HOW experience cards are displayed.
 * Does NOT manage experience records — those live in /admin/experiences.
 *
 * Category chips are derived from existing experience slugs/titles.
 * All settings stored in localStorage (key: exp_listing_draft) until backend added.
 *
 * Backend to add:
 *   ExperiencesPageSettings singleton:
 *     enable_filter  BOOLEAN, default_filter VARCHAR,
 *     cards_per_page INTEGER, sort_order VARCHAR, grid_style VARCHAR
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Loader2, Compass, LayoutGrid, Info } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { DrawerField, DrawerSelect } from '@/components/admin/Drawer';
import { useToast } from '@/components/ui/use-toast';
import { useExperiences } from '@/hooks/use-home';

const cn = (...c) => c.filter(Boolean).join(' ');
const DRAFT_KEY = 'exp_listing_draft';
function loadDraft() { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}'); } catch { return {}; } }
function saveDraft(v) { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(v)); } catch { /* ignore */ } }

const DEFAULTS = { enable_filter: true, default_filter: 'All', cards_per_page: 6, sort_order: 'featured', grid_style: 'grid' };

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured First' },
  { value: 'title_asc', label: 'Title A–Z' },
  { value: 'title_desc', label: 'Title Z–A' },
  { value: 'newest', label: 'Newest First' },
];
const CARDS_OPTIONS = [
  { value: '3', label: '3 per page' }, { value: '6', label: '6 per page' },
  { value: '9', label: '9 per page' }, { value: '12', label: '12 per page' },
];
const GRID_OPTIONS = [
  { value: 'grid', label: 'Grid (default)' },
  { value: 'masonry', label: 'Masonry' },
];

export default function ExperiencesListingCms() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState(() => ({ ...DEFAULTS, ...loadDraft() }));
  const [saving, setSaving] = useState(false);

  const { data: experiences = [] } = useExperiences();

  // Derive unique category labels from existing experience slugs
  const derived = ['All', ...Array.from(new Set(
    experiences.map((e) => e.slug?.split('-')[0]).filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
  ))];

  const [categoryOrder, setCategoryOrder] = useState(() => {
    const draft = loadDraft();
    return draft.category_order ?? derived;
  });

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = () => {
    setSaving(true);
    saveDraft({ ...form, category_order: categoryOrder });
    setTimeout(() => { setSaving(false); toast({ title: 'Listing settings saved' }); }, 300);
  };

  return (
    <div>
      <button onClick={() => navigate('/admin/website/experiences')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ChevronLeft className="w-4 h-4" /> Experiences Page
      </button>

      <PageHeader
        title="Listing Settings" description="Controls how experience cards are displayed — not the cards themselves"
        searchPlaceholder="" onSearch={null} onAdd={null} filters={null} onFilter={null}
        activeFilter={null} onSort={null} onExport={null} onImport={null}
        actions={
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        }
      />

      <div className="flex items-start gap-3 mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Experience cards are managed in <button onClick={() => navigate('/admin/experiences')} className="font-semibold underline underline-offset-2">Experience Management</button>. This page only controls display preferences.</span>
      </div>

      <div className="flex items-start gap-3 mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <span className="shrink-0 font-bold mt-0.5">⚠</span>
        <span><strong>No backend endpoint yet.</strong> Saved locally until an <code className="text-xs bg-amber-100 px-1 rounded">ExperiencesPageSettings</code> singleton is added.</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Display Options */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Display Options</h3>
            <p className="text-xs text-muted-foreground mt-0.5">How experience cards are laid out and sorted</p>
          </div>
          <DrawerField label="Grid Style" hint="Layout style for experience cards" required={false}>
            <DrawerSelect options={GRID_OPTIONS} value={form.grid_style} onChange={(e) => handleChange('grid_style', e.target.value)} defaultValue="grid" disabled={false} />
          </DrawerField>
          <DrawerField label="Cards Per Page" hint="Number of cards shown before pagination" required={false}>
            <DrawerSelect options={CARDS_OPTIONS} value={String(form.cards_per_page)} onChange={(e) => handleChange('cards_per_page', Number(e.target.value))} defaultValue="6" disabled={false} />
          </DrawerField>
          <DrawerField label="Sort Order" hint="Default sort applied to experience cards" required={false}>
            <DrawerSelect options={SORT_OPTIONS} value={form.sort_order} onChange={(e) => handleChange('sort_order', e.target.value)} defaultValue="featured" disabled={false} />
          </DrawerField>
        </div>

        {/* Category Filter */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Category Filter Bar</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Filter chips shown above the experience grid</p>
          </div>
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm text-foreground">Enable Category Filter</p>
              <p className="text-xs text-muted-foreground mt-0.5">Show filter chips above the grid</p>
            </div>
            <button type="button" onClick={() => handleChange('enable_filter', !form.enable_filter)}
              className={cn('relative w-10 h-5 rounded-full transition-colors shrink-0', form.enable_filter ? 'bg-primary' : 'bg-muted-foreground/30')}>
              <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-soft transition-transform', form.enable_filter ? 'translate-x-5' : 'translate-x-0.5')} />
            </button>
          </div>

          {form.enable_filter && (<>
            <DrawerField label="Default Selected Category" hint="Which filter chip is active on page load" required={false}>
              <DrawerSelect options={categoryOrder.map((c) => ({ value: c, label: c }))} value={form.default_filter}
                onChange={(e) => handleChange('default_filter', e.target.value)} defaultValue="All" disabled={false} />
            </DrawerField>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Category Order</p>
              <p className="text-xs text-muted-foreground mb-3">Derived from existing experience records.</p>
              {categoryOrder.length === 0 ? (
                <div className="flex items-center gap-2 py-4 px-3 border border-dashed border-border rounded-xl text-sm text-muted-foreground">
                  <Compass className="w-4 h-4" />
                  <span>No experiences found. Add them in <button onClick={() => navigate('/admin/experiences')} className="underline font-medium">Experience Management</button>.</span>
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
