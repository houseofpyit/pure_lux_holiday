/**
 * PackagesSeoCms — Luxury Packages Page › SEO Settings
 * Full SEO: title, description, keywords, canonical, OG image, schema, robots.
 * Stored locally until GET/PUT /api/v1/packages/seo endpoint is created.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import MediaUploader from '@/components/media/MediaUploader';
import { useToast } from '@/components/ui/use-toast';

const DRAFT_KEY = 'pkg_seo_draft';
const load = () => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}'); } catch { return {}; } };
const save = (v) => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(v)); } catch { /**/ } };

const TITLE_MAX = 60;
const DESC_MAX = 160;

const DEFAULTS = {
  seo_title: '', seo_description: '', seo_keywords: '',
  canonical_url: '', og_image_id: null, og_image_url: null,
  schema_json: '', robots: 'index, follow',
};

const ROBOTS_OPTIONS = [
  { value: 'index, follow', label: 'index, follow (default)' },
  { value: 'noindex, follow', label: 'noindex, follow' },
  { value: 'index, nofollow', label: 'index, nofollow' },
  { value: 'noindex, nofollow', label: 'noindex, nofollow' },
];

export default function PackagesSeoCms() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState(() => ({ ...DEFAULTS, ...load() }));
  const [saving, setSaving] = useState(false);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const handleSave = () => { setSaving(true); save(form); setTimeout(() => { setSaving(false); toast({ title: 'SEO settings saved' }); }, 300); };

  const titleLen = (form.seo_title ?? '').length;
  const descLen = (form.seo_description ?? '').length;

  return (
    <div>
      <button onClick={() => navigate('/admin/website/packages')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ChevronLeft className="w-4 h-4" /> Luxury Packages Page
      </button>

      <PageHeader title="SEO Settings" description="Search engine optimisation for the Luxury Packages page"
        searchPlaceholder="" onSearch={null} onAdd={null} filters={null} onFilter={null}
        activeFilter={null} onSort={null} onExport={null} onImport={null}
        actions={
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saving ? 'Saving…' : 'Save Changes'}
          </button>
        }
      />

      <div className="flex items-start gap-3 mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <span className="shrink-0 font-bold mt-0.5">⚠</span>
        <span><strong>Saved locally.</strong> A <code className="text-xs bg-amber-100 px-1 rounded">GET/PUT /api/v1/packages/seo</code> endpoint is needed to persist to the database.</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="bg-white border border-border rounded-xl p-6 space-y-5">
            <h3 className="text-sm font-semibold text-foreground">Core SEO</h3>
            <DrawerField label="SEO Title" hint={`${titleLen}/${TITLE_MAX} chars · Recommended: 50–60`} required={false}>
              <DrawerInput value={form.seo_title} onChange={(e) => set('seo_title', e.target.value)} placeholder="Luxury Packages — Pure Luxe Holidays" maxLength={TITLE_MAX} defaultValue="" textarea={false} disabled={false} />
            </DrawerField>
            <DrawerField label="Meta Description" hint={`${descLen}/${DESC_MAX} chars · Recommended: 120–160`} required={false}>
              <DrawerInput textarea value={form.seo_description} onChange={(e) => set('seo_description', e.target.value)} placeholder="Explore our curated collection of luxury travel packages…" defaultValue="" maxLength={DESC_MAX} disabled={false} />
            </DrawerField>
            <DrawerField label="Keywords" hint="Comma-separated (optional)" required={false}>
              <DrawerInput value={form.seo_keywords} onChange={(e) => set('seo_keywords', e.target.value)} placeholder="luxury packages, bespoke travel, premium holidays" defaultValue="" textarea={false} maxLength={500} disabled={false} />
            </DrawerField>
            <DrawerField label="Canonical URL" hint="Leave blank to use the page URL" required={false}>
              <DrawerInput value={form.canonical_url} onChange={(e) => set('canonical_url', e.target.value)} placeholder="https://yourdomain.com/packages" defaultValue="" textarea={false} maxLength={500} disabled={false} />
            </DrawerField>
            <DrawerField label="Robots" hint="" required={false}>
              <DrawerSelect options={ROBOTS_OPTIONS} value={form.robots} onChange={(e) => set('robots', e.target.value)} defaultValue="index, follow" disabled={false} />
            </DrawerField>
          </div>
          {/* SERP Preview */}
          <div className="bg-white border border-border rounded-xl p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Search Result Preview</p>
            <p className="text-base font-medium text-blue-700 truncate">{form.seo_title || 'Luxury Packages — Pure Luxe Holidays'}</p>
            <p className="text-xs text-green-700 mt-0.5">yourdomain.com/packages</p>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{form.seo_description || 'Add a meta description to see a preview here.'}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="mb-4"><h3 className="text-sm font-semibold text-foreground">Open Graph Image</h3><p className="text-xs text-muted-foreground mt-0.5">Shown when the page is shared on social · Recommended: 1200×630px</p></div>
            <MediaUploader module="packages" section="seo/og" accept="image/*" maxSizeMB={5}
              value={form.og_image_url} mediaId={form.og_image_id} media={null}
              onChange={(m) => setForm((f) => ({ ...f, og_image_id: m.id, og_image_url: m.full_url }))}
              onClear={() => setForm((f) => ({ ...f, og_image_id: null, og_image_url: null }))}
              label="Upload OG image" hint="JPG or PNG · Max 5MB" />
          </div>
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-1">Schema JSON-LD</h3>
            <p className="text-xs text-muted-foreground mb-4">Optional structured data for rich search results</p>
            <DrawerField label="Schema JSON" hint='Valid JSON-LD e.g. {"@context":"https://schema.org",...}' required={false}>
              <DrawerInput textarea value={form.schema_json} onChange={(e) => set('schema_json', e.target.value)} placeholder='{"@context": "https://schema.org", "@type": "ItemList", ...}' defaultValue="" maxLength={5000} disabled={false} />
            </DrawerField>
          </div>
        </div>
      </div>
    </div>
  );
}
