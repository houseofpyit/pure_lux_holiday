/**
 * DestinationsHeroCms — Destinations Page › Hero Section
 *
 * Controls the top hero banner of the Destinations landing page.
 *
 * ─── Field mapping ───────────────────────────────────────────────────────────
 *   All fields stored in localStorage (key: dest_hero_draft) until a dedicated
 *   backend endpoint is created for the Destinations page hero.
 *
 *   Fields to add to backend:
 *     DestinationsHero table (or singleton):
 *       label            VARCHAR(100)   — small eyebrow text
 *       heading          VARCHAR(255)   — main heading
 *       description      TEXT           — subtitle paragraph
 *       background_image_id UUID FK → media.id
 *       overlay_opacity  FLOAT          — 0.0–1.0
 *       is_active        BOOLEAN
 *
 * Architecture:
 *   Component → localStorage (until backend ready)
 *   Media upload → MediaUploader → existing /api/v1/media endpoint
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Save, Eye, EyeOff, Loader2,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import MediaUploader from '@/components/media/MediaUploader';
import { useToast } from '@/components/ui/use-toast';

const cn = (...c) => c.filter(Boolean).join(' ');

const DRAFT_KEY = 'dest_hero_draft';
function loadDraft() { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}'); } catch { return {}; } }
function saveDraft(v) { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(v)); } catch { /* ignore */ } }

const DEFAULTS = {
  label: 'Explore the World',
  heading: 'Destinations',
  description: 'A curated atlas of the world\'s most extraordinary places, each chosen for its ability to inspire wonder.',
  background_image_id: null,
  background_image_url: null,
  overlay_opacity: 50,
  is_active: true,
};

const TABS = ['Content', 'Media', 'Settings'];

export default function DestinationsHeroCms() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState(() => ({ ...DEFAULTS, ...loadDraft() }));
  const [activeTab, setActiveTab] = useState('Content');
  const [previewOpen, setPreviewOpen] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = () => {
    setSaving(true);
    saveDraft(form);
    setTimeout(() => {
      setSaving(false);
      toast({ title: 'Hero section saved' });
    }, 300);
  };

  return (
    <div>
      <button
        onClick={() => navigate('/admin/website/destinations')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> Destinations Page
      </button>

      <PageHeader
        title="Hero Section"
        description="Top banner of the Destinations page"
        searchPlaceholder=""
        onSearch={null} onAdd={null} filters={null} onFilter={null}
        activeFilter={null} onSort={null} onExport={null} onImport={null}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/8 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors"
            >
              {previewOpen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {previewOpen ? 'Hide Preview' : 'Preview'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        }
      />

      {/* Backend notice */}
      <div className="flex items-start gap-3 mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <span className="shrink-0 font-bold mt-0.5">⚠</span>
        <span>
          <strong>No backend endpoint yet.</strong> All fields are saved locally until a <code className="text-xs bg-amber-100 px-1 rounded">DestinationsPage</code> model is added to the backend.
        </span>
      </div>

      {/* Live Preview */}
      {previewOpen && (
        <div className="mb-6 rounded-xl overflow-hidden border border-border">
          <div className="relative h-48 flex items-center justify-center overflow-hidden">
            {form.background_image_url ? (
              <img src={form.background_image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-emerald-700" />
            )}
            <div
              className="absolute inset-0 bg-emerald-950"
              style={{ opacity: (form.overlay_opacity ?? 50) / 100 }}
            />
            <div className="relative z-10 text-center px-6">
              {form.label && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/80 mb-2">
                  {form.label}
                </p>
              )}
              <h1 className="text-2xl font-bold text-white mb-2 leading-snug">
                {form.heading || <span className="text-white/30 italic font-normal text-lg">No heading</span>}
              </h1>
              {form.description && (
                <p className="text-sm text-white/65 max-w-sm mx-auto line-clamp-2">{form.description}</p>
              )}
            </div>
          </div>
          <div className="px-4 py-2 bg-muted/40 border-t border-border flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Preview updates as you type</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        {/* Form */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center gap-1 px-6 border-b border-border">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-3 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-5">
            {activeTab === 'Content' && (
              <>
                <DrawerField label="Section Label" hint='Small eyebrow text (e.g. "Explore the World")' required={false}>
                  <DrawerInput
                    value={form.label}
                    onChange={(e) => handleChange('label', e.target.value)}
                    placeholder="Explore the World"
                    maxLength={100}
                  />
                </DrawerField>
                <DrawerField label="Heading" hint="Main page heading" required={false}>
                  <DrawerInput
                    value={form.heading}
                    onChange={(e) => handleChange('heading', e.target.value)}
                    placeholder="Destinations"
                    maxLength={255}
                  />
                </DrawerField>
                <DrawerField label="Description" hint="Subtitle paragraph below the heading" required={false}>
                  <DrawerInput
                    textarea
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="A curated atlas of the world's most extraordinary places…"
                  />
                </DrawerField>
              </>
            )}

            {activeTab === 'Media' && (
              <DrawerField label="Background Image" hint="Recommended: 1920×800px · JPG or WebP · Max 10MB" required={false}>
                <MediaUploader
                  module="destinations"
                  section="hero"
                  accept="image/*"
                  maxSizeMB={10}
                  value={form.background_image_url}
                  mediaId={form.background_image_id}
                  onChange={(media) => setForm((f) => ({ ...f, background_image_id: media.id, background_image_url: media.full_url }))}
                  onClear={() => setForm((f) => ({ ...f, background_image_id: null, background_image_url: null }))}
                  label="Upload hero background"
                  hint="Wide landscape photo works best"
                />
              </DrawerField>
            )}

            {activeTab === 'Settings' && (
              <>
                <DrawerField label="Overlay Opacity" hint={`Controls the dark overlay: ${form.overlay_opacity}%`} required={false}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={form.overlay_opacity}
                    onChange={(e) => handleChange('overlay_opacity', Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0% (transparent)</span>
                    <span>{form.overlay_opacity}%</span>
                    <span>100% (opaque)</span>
                  </div>
                </DrawerField>
                <DrawerField label="Visibility" hint="" required={false}>
                  <DrawerSelect
                    options={[{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }]}
                    value={form.is_active ? 'published' : 'draft'}
                    onChange={(e) => handleChange('is_active', e.target.value === 'published')}
                    defaultValue={form.is_active ? 'published' : 'draft'}
                    disabled={false}
                  />
                </DrawerField>
              </>
            )}
          </div>
        </div>

        {/* Field reference card */}
        <div className="bg-white border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Field Reference</h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            {[
              { field: 'label', status: '⚠ Local', note: 'Eyebrow text' },
              { field: 'heading', status: '⚠ Local', note: 'Main H1' },
              { field: 'description', status: '⚠ Local', note: 'Subtitle' },
              { field: 'background_image_id', status: '⚠ Local', note: 'Media UUID' },
              { field: 'overlay_opacity', status: '⚠ Local', note: '0–100 → 0.0–1.0' },
              { field: 'is_active', status: '⚠ Local', note: 'Visibility toggle' },
            ].map(({ field, status, note }) => (
              <div key={field} className="flex items-start justify-between gap-2">
                <code className="font-mono text-foreground">{field}</code>
                <div className="text-right shrink-0">
                  <span className="text-amber-600">{status}</span>
                  <p className="text-muted-foreground/70">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
