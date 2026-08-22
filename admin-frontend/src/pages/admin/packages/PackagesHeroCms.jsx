/**
 * PackagesHeroCms — Luxury Packages Page › Hero Section
 * Fields: label, heading, description, background_image_id, overlay_opacity, is_active
 * Stored locally (key: pkg_hero_draft) until backend endpoint added.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Eye, EyeOff, Loader2 } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import MediaUploader from '@/components/media/MediaUploader';
import { useToast } from '@/components/ui/use-toast';

const cn = (...c) => c.filter(Boolean).join(' ');
const DRAFT_KEY = 'pkg_hero_draft';
const load = () => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}'); } catch { return {}; } };
const save = (v) => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(v)); } catch { /**/ } };

const DEFAULTS = {
  label: 'Curated Luxury', heading: 'Luxury Packages',
  description: 'Bespoke journeys crafted for those who seek the extraordinary.',
  background_image_id: null, background_image_url: null,
  overlay_opacity: 55, is_active: true,
};

const TABS = ['Content', 'Media', 'Settings'];

export default function PackagesHeroCms() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState(() => ({ ...DEFAULTS, ...load() }));
  const [activeTab, setActiveTab] = useState('Content');
  const [previewOpen, setPreviewOpen] = useState(true);
  const [saving, setSaving] = useState(false);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const handleSave = () => { setSaving(true); save(form); setTimeout(() => { setSaving(false); toast({ title: 'Hero section saved' }); }, 300); };

  return (
    <div>
      <button onClick={() => navigate('/admin/website/packages')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ChevronLeft className="w-4 h-4" /> Luxury Packages Page
      </button>

      <PageHeader title="Hero Section" description="Top banner of the Luxury Packages page"
        searchPlaceholder="" onSearch={null} onAdd={null} filters={null} onFilter={null}
        activeFilter={null} onSort={null} onExport={null} onImport={null}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setPreviewOpen((v) => !v)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/8 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
              {previewOpen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}{previewOpen ? 'Hide' : 'Preview'}
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        }
      />

      <div className="flex items-start gap-3 mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <span className="shrink-0 font-bold mt-0.5">⚠</span>
        <span><strong>No backend endpoint yet.</strong> Saved locally until a <code className="text-xs bg-amber-100 px-1 rounded">LuxuryPackagesPage</code> model is added.</span>
      </div>

      {previewOpen && (
        <div className="mb-6 rounded-xl overflow-hidden border border-border">
          <div className="relative h-48 flex items-center justify-center overflow-hidden">
            {form.background_image_url ? <img src={form.background_image_url} alt="" className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 bg-gradient-to-br from-amber-900 to-amber-700" />}
            <div className="absolute inset-0 bg-slate-950" style={{ opacity: (form.overlay_opacity ?? 55) / 100 }} />
            <div className="relative z-10 text-center px-6">
              {form.label && <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/80 mb-2">{form.label}</p>}
              <h1 className="text-2xl font-bold text-white mb-2">{form.heading || <span className="text-white/30 italic font-normal text-lg">No heading</span>}</h1>
              {form.description && <p className="text-sm text-white/65 max-w-sm mx-auto line-clamp-2">{form.description}</p>}
            </div>
          </div>
          <div className="px-4 py-2 bg-muted/40 border-t border-border flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Preview updates as you type</span>
          </div>
        </div>
      )}

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-1 px-6 border-b border-border">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn('px-3 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap', activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>{tab}</button>
          ))}
        </div>
        <div className="p-6 space-y-5">
          {activeTab === 'Content' && (<>
            <DrawerField label="Section Label" hint='Eyebrow text (e.g. "Curated Luxury")' required={false}>
              <DrawerInput value={form.label} onChange={(e) => set('label', e.target.value)} placeholder="Curated Luxury" maxLength={100} defaultValue="" textarea={false} disabled={false} />
            </DrawerField>
            <DrawerField label="Heading" hint="Main page heading" required={false}>
              <DrawerInput value={form.heading} onChange={(e) => set('heading', e.target.value)} placeholder="Luxury Packages" maxLength={255} defaultValue="" textarea={false} disabled={false} />
            </DrawerField>
            <DrawerField label="Description" hint="Subtitle below the heading" required={false}>
              <DrawerInput textarea value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Bespoke journeys crafted for those who seek the extraordinary." defaultValue="" maxLength={500} disabled={false} />
            </DrawerField>
          </>)}
          {activeTab === 'Media' && (
            <DrawerField label="Background Image" hint="Recommended: 1920×800px · JPG or WebP · Max 10MB" required={false}>
              <MediaUploader module="packages" section="hero" accept="image/*" maxSizeMB={10}
                value={form.background_image_url} mediaId={form.background_image_id} media={null}
                onChange={(m) => setForm((f) => ({ ...f, background_image_id: m.id, background_image_url: m.full_url }))}
                onClear={() => setForm((f) => ({ ...f, background_image_id: null, background_image_url: null }))}
                label="Upload hero background" hint="Wide landscape photo works best" />
            </DrawerField>
          )}
          {activeTab === 'Settings' && (<>
            <DrawerField label="Overlay Opacity" hint={`Dark overlay strength: ${form.overlay_opacity}%`} required={false}>
              <input type="range" min={0} max={100} value={form.overlay_opacity} onChange={(e) => set('overlay_opacity', Number(e.target.value))} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>0%</span><span>{form.overlay_opacity}%</span><span>100%</span></div>
            </DrawerField>
            <DrawerField label="Visibility" hint="" required={false}>
              <DrawerSelect options={[{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }]}
                value={form.is_active ? 'published' : 'draft'} onChange={(e) => set('is_active', e.target.value === 'published')}
                defaultValue={form.is_active ? 'published' : 'draft'} disabled={false} />
            </DrawerField>
          </>)}
        </div>
      </div>
    </div>
  );
}
