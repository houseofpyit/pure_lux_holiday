/**
 * DestinationsSeoCms — Destinations Page › SEO Settings
 *
 * Reuses the same pattern as AboutSeoCms.
 * All fields stored in localStorage until a dedicated backend SEO endpoint
 * is created for the Destinations page.
 *
 * ─── Backend APIs reused ─────────────────────────────────────────────────────
 *   GET  /api/v1/seo          — global SEO settings (reused for reference)
 *   Future: GET/PUT /api/v1/destinations/seo  — page-specific SEO
 *
 * ─── Fields ──────────────────────────────────────────────────────────────────
 *   seo_title        VARCHAR(60)   — page <title> tag
 *   seo_description  VARCHAR(160)  — meta description
 *   og_image_id      UUID FK       — Open Graph image (media)
 *
 * React Query keys (future):
 *   ['destinations', 'seo']
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { DrawerField, DrawerInput } from '@/components/admin/Drawer';
import { useToast } from '@/components/ui/use-toast';

const DRAFT_KEY = 'dest_seo_draft';
function loadDraft() { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}'); } catch { return {}; } }
function saveDraft(v) { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(v)); } catch { /* ignore */ } }

const TITLE_MAX = 60;
const DESC_MAX = 160;

const DEFAULTS = {
  seo_title: '',
  seo_description: '',
};

export default function DestinationsSeoCms() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState(() => ({ ...DEFAULTS, ...loadDraft() }));
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = () => {
    setSaving(true);
    saveDraft(form);
    setTimeout(() => {
      setSaving(false);
      toast({ title: 'SEO settings saved' });
    }, 300);
  };

  const titleLen = (form.seo_title ?? '').length;
  const descLen = (form.seo_description ?? '').length;

  return (
    <div>
      <button
        onClick={() => navigate('/admin/website/destinations')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> Destinations Page
      </button>

      <PageHeader
        title="SEO Settings"
        description="Page title and meta description for the Destinations page"
        searchPlaceholder=""
        onSearch={null} onAdd={null} filters={null} onFilter={null}
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

      {/* Backend notice */}
      <div className="flex items-start gap-3 mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <span className="shrink-0 font-bold mt-0.5">⚠</span>
        <span>
          <strong>Saved locally.</strong> A dedicated <code className="text-xs bg-amber-100 px-1 rounded">GET/PUT /api/v1/destinations/seo</code> endpoint is needed to persist these to the database.
        </span>
      </div>

      <div className="bg-white border border-border rounded-xl p-6 space-y-5 max-w-2xl">
        <DrawerField
          label="SEO Title"
          hint={`${titleLen}/${TITLE_MAX} characters · Recommended: 50–60`}
          required={false}
        >
          <DrawerInput
            value={form.seo_title}
            onChange={(e) => handleChange('seo_title', e.target.value)}
            placeholder="Destinations — Pure Luxe Holidays"
            maxLength={TITLE_MAX}
          />
        </DrawerField>

        <DrawerField
          label="Meta Description"
          hint={`${descLen}/${DESC_MAX} characters · Recommended: 120–160`}
          required={false}
        >
          <DrawerInput
            textarea
            value={form.seo_description}
            onChange={(e) => handleChange('seo_description', e.target.value)}
            placeholder="Explore a curated atlas of the world's most extraordinary destinations…"
            maxLength={DESC_MAX}
          />
        </DrawerField>

        {/* SERP preview */}
        <div className="rounded-xl border border-border p-4 bg-muted/20">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Search Result Preview</p>
          <p className="text-base font-medium text-blue-700 truncate">
            {form.seo_title || 'Destinations — Pure Luxe Holidays'}
          </p>
          <p className="text-xs text-green-700 mt-0.5">yourdomain.com/destinations</p>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {form.seo_description || 'Add a meta description to see a preview here.'}
          </p>
        </div>
      </div>
    </div>
  );
}
