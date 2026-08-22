/**
 * GalleryCtaCms — Gallery Page › CTA Section
 * Reuses global CTA hooks (useCTA / useUpdateCTA). Identical pattern to
 * PackagesCtaCms / ExperiencesCtaCms / DestinationsCtaCms.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { DrawerField, DrawerInput } from '@/components/admin/Drawer';
import MediaUploader from '@/components/media/MediaUploader';
import { useCTA, useUpdateCTA } from '@/hooks/use-home';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';

// Extended fields stored locally (eyebrow_text, overlay_opacity)
const EXT_KEY = 'gallery_cta_ext';
const loadExt = () => { try { return JSON.parse(localStorage.getItem(EXT_KEY) ?? '{}'); } catch { return {}; } };
const saveExt = (v) => { try { localStorage.setItem(EXT_KEY, JSON.stringify(v)); } catch { /* */ } };

export default function GalleryCtaCms() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: ctaData, isLoading, isError } = useCTA();
  const [form, setForm] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [extForm, setExtForm] = useState({ eyebrow_text: 'Your Journey Awaits', overlay_opacity: 65 });

  useEffect(() => {
    if (ctaData && !form) {
      setForm(ctaData);
      setExtForm((p) => ({ ...p, ...loadExt() }));
    }
  }, [ctaData]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateMutation = useUpdateCTA({
    onSuccess: () => { saveExt(extForm); toast({ title: 'CTA section saved' }); },
    onError: (err) => handleApiError(err, toast),
  });

  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const setExt = (f, v) => setExtForm((p) => ({ ...p, [f]: v }));

  const handleSave = () => {
    if (!form || updateMutation.isPending) return;
    if (!form.title?.trim()) { toast({ title: 'Heading is required', variant: 'destructive' }); return; }
    saveExt(extForm);
    updateMutation.mutate(form);
  };

  if (isLoading || !form) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (isError) return <div className="flex items-center justify-center min-h-[400px] text-destructive"><p className="text-sm">Failed to load CTA</p></div>;

  const isSaving = updateMutation.isPending;
  const overlayOpacity = (extForm.overlay_opacity ?? 65) / 100;

  return (
    <div>
      <button onClick={() => navigate('/admin/website/gallery')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ChevronLeft className="w-4 h-4" /> Gallery Page
      </button>

      <PageHeader title="CTA Section" description="Full-width call-to-action banner — reuses the global CTA configuration"
        searchPlaceholder="" onSearch={null} onAdd={null} filters={null} onFilter={null}
        activeFilter={null} onSort={null} onExport={null} onImport={null}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setPreviewOpen((v) => !v)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/8 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
              {previewOpen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}{previewOpen ? 'Hide Preview' : 'Preview'}
            </button>
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        }
      />

      <div className="flex items-start gap-3 mb-5 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <span className="shrink-0 mt-0.5">ℹ</span>
        <span>This CTA shares the global CTA config with all pages. Saving here updates it site-wide.</span>
      </div>

      {previewOpen && (
        <div className="mb-6 rounded-xl overflow-hidden border border-border">
          <div className="relative min-h-[240px] flex items-center justify-center overflow-hidden">
            {form.background_image_url ? <img src={form.background_image_url} alt="" className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-emerald-700" />}
            <div className="absolute inset-0 bg-emerald-950" style={{ opacity: overlayOpacity }} />
            <div className="relative z-10 text-center px-8 py-10 max-w-lg mx-auto">
              {extForm.eyebrow_text && <p className="text-amber-300/90 text-lg italic mb-3 font-medium">{extForm.eyebrow_text}</p>}
              <h2 className="text-white font-bold text-2xl leading-snug mb-4">{form.title || <span className="text-white/30 italic font-normal text-lg">No heading</span>}</h2>
              {form.subtitle && <p className="text-white/65 text-sm leading-relaxed mb-6 max-w-sm mx-auto">{form.subtitle}</p>}
              {form.button_text && <span className="inline-flex items-center px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 text-emerald-900 text-xs font-bold uppercase tracking-wider shadow-lg">{form.button_text}</span>}
            </div>
          </div>
          <div className="px-4 py-2 bg-muted/40 border-t border-border flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">Preview updates as you type</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="bg-white border border-border rounded-xl p-6 space-y-5">
            <h3 className="text-sm font-semibold text-foreground">Content</h3>
            <DrawerField label={<span>Eyebrow Label <span className="text-amber-500 font-mono text-xs">*</span></span>} hint='Script text above heading' required={false}>
              <DrawerInput value={extForm.eyebrow_text} onChange={(e) => setExt('eyebrow_text', e.target.value)} placeholder="Your Journey Awaits" maxLength={100} defaultValue="" textarea={false} disabled={false} />
            </DrawerField>
            <DrawerField label="Heading" hint="" required={false}>
              <DrawerInput value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ready to Begin Your Extraordinary Journey?" maxLength={255} defaultValue="" textarea={false} disabled={false} />
            </DrawerField>
            <DrawerField label="Body Text" hint="" required={false}>
              <DrawerInput textarea value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} placeholder="Let our travel specialists craft a bespoke itinerary…" defaultValue="" maxLength={500} disabled={false} />
            </DrawerField>
          </div>
          <div className="bg-white border border-border rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Button</h3>
            <div className="grid grid-cols-2 gap-4">
              <DrawerField label="Button Text" hint="" required={false}>
                <DrawerInput value={form.button_text} onChange={(e) => set('button_text', e.target.value)} placeholder="Plan My Journey" maxLength={100} defaultValue="" textarea={false} disabled={false} />
              </DrawerField>
              <DrawerField label="Button Link" hint="" required={false}>
                <DrawerInput value={form.button_url} onChange={(e) => set('button_url', e.target.value)} placeholder="/plan-my-journey" defaultValue="" textarea={false} maxLength={500} disabled={false} />
              </DrawerField>
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="mb-4"><h3 className="text-sm font-semibold text-foreground">Background Image</h3><p className="text-xs text-muted-foreground mt-0.5">Recommended: 1920×600px · Max 10MB</p></div>
            <MediaUploader module="gallery" section="cta" accept="image/*" maxSizeMB={10}
              value={form.background_image_url} mediaId={form.background_image_id} media={null}
              onChange={(m) => setForm((f) => ({ ...f, background_image_id: m.id, background_image_url: m.full_url }))}
              onClear={() => setForm((f) => ({ ...f, background_image_id: null, background_image_url: null }))}
              label="Upload background image" hint="Wide landscape photo works best" />
          </div>
          <div className="bg-white border border-border rounded-xl p-6 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Overlay Opacity <span className="text-amber-500 font-mono text-xs">*</span></h3>
            <DrawerField label={`Opacity: ${extForm.overlay_opacity}%`} hint="" required={false}>
              <input type="range" min={0} max={100} value={extForm.overlay_opacity} onChange={(e) => setExt('overlay_opacity', Number(e.target.value))} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>0%</span><span>{extForm.overlay_opacity}%</span><span>100%</span></div>
            </DrawerField>
          </div>
        </div>
      </div>
    </div>
  );
}
