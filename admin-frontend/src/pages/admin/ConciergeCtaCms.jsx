/**
 * ConciergeCtaCms — Home Page › CTA Section
 *
 * Website layout (from design):
 *   Full-width background image · dark green overlay
 *   Centered: Script eyebrow label · Large serif heading · Body text · Gold pill button
 *
 * Backend fields (existing):
 *   title             → Main heading
 *   subtitle          → Body text paragraph
 *   button_text       → Button label
 *   button_url        → Button link
 *   background_image_id / background_image_url → Background photo
 *   is_active         → Section visibility toggle
 *
 * New fields (stored locally until backend migration):
 *   eyebrow_text      → Script label above heading (e.g. "Your Journey Awaits")
 */
import { useEffect, useState } from 'react';
import { AlertCircle, Eye, EyeOff, Loader2, Save } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { DrawerField, DrawerInput } from '@/components/admin/Drawer';
import MediaUploader from '@/components/media/MediaUploader';
import { useCTA, useUpdateCTA } from '@/hooks/use-home';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';

const cn = (...c) => c.filter(Boolean).join(' ');

const DRAFT_KEY = 'home_cta_draft';
function loadDraft() { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}'); } catch { return {}; } }
function saveDraft(v) { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(v)); } catch { /* ignore */ } }

export default function ConciergeCtaCms() {
  const { toast } = useToast();
  const { data: ctaData, isLoading, isError, error } = useCTA();
  const [form, setForm] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(true);

  // Extended fields not yet on backend
  const [extForm, setExtForm] = useState({ eyebrow_text: 'Your Journey Awaits' });

  useEffect(() => {
    if (ctaData && !form) {
      setForm(ctaData);
      const draft = loadDraft();
      setExtForm((p) => ({ ...p, ...draft }));
    }
  }, [ctaData]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateMutation = useUpdateCTA({
    onSuccess: () => {
      saveDraft(extForm);
      toast({ title: 'CTA section saved' });
    },
    onError: (err) => handleApiError(err, toast),
  });

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = () => {
    if (!form || updateMutation.isPending) return;
    if (!form.title?.trim()) {
      toast({ title: 'Heading is required', variant: 'destructive' });
      return;
    }
    saveDraft(extForm);
    updateMutation.mutate(form);
  };

  if (isLoading || !form) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-destructive">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm">{error?.message || 'Failed to load CTA section'}</p>
      </div>
    );
  }

  const isSaving = updateMutation.isPending;

  return (
    <div>
      <PageHeader
        title="CTA Section"
        description="Full-width call-to-action banner with background image"
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
              disabled={isSaving}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        }
      />

      {/* ── Live Preview ─────────────────────────────────────────────────── */}
      {previewOpen && (
        <div className="mb-6 rounded-xl overflow-hidden border border-border">
          <div className="relative min-h-[260px] flex items-center justify-center overflow-hidden">
            {/* Background */}
            {form.background_image_url ? (
              <img
                src={form.background_image_url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-emerald-700" />
            )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-emerald-950/65" />

            {/* Content */}
            <div className="relative z-10 text-center px-8 py-12 max-w-lg mx-auto">
              {/* Script eyebrow */}
              {extForm.eyebrow_text && (
                <p className="text-amber-300/90 text-lg italic mb-3 font-medium">
                  {extForm.eyebrow_text}
                </p>
              )}
              {/* Heading */}
              <h2 className="text-white font-bold text-2xl leading-snug mb-4">
                {form.title || <span className="text-white/30 font-normal italic text-lg">No heading</span>}
              </h2>
              {/* Body */}
              {form.subtitle && (
                <p className="text-white/65 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
                  {form.subtitle}
                </p>
              )}
              {/* Button */}
              {form.button_text && (
                <span className="inline-flex items-center px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 text-emerald-900 text-xs font-bold uppercase tracking-wider shadow-lg">
                  {form.button_text}
                </span>
              )}
            </div>
          </div>
          <div className="px-4 py-2 bg-muted/40 border-t border-border flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Preview updates as you type</span>
          </div>
        </div>
      )}

      {/* ── Form ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left — content */}
        <div className="space-y-5">

          <div className="bg-white border border-border rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Content</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Text displayed in the center of the section</p>
            </div>

            <DrawerField
              label={<span>Eyebrow Label <span className="text-amber-500 font-mono text-xs">*</span></span>}
              hint='Script text above the heading (e.g. "Your Journey Awaits")'
              required={false}
            >
              <DrawerInput
                value={extForm.eyebrow_text}
                onChange={(e) => setExtForm((f) => ({ ...f, eyebrow_text: e.target.value }))}
                placeholder="Your Journey Awaits"
                maxLength={100}
              />
            </DrawerField>

            <DrawerField label="Heading" hint="Main CTA heading" required>
              <DrawerInput
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ready to Begin Your Extraordinary Journey?"
                maxLength={255}
              />
            </DrawerField>

            <DrawerField label="Body Text" hint="Supporting paragraph below the heading">
              <DrawerInput
                textarea
                value={form.subtitle}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                placeholder="Let our travel specialists craft a bespoke itinerary…"
              />
            </DrawerField>
          </div>

          <div className="bg-white border border-border rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Button</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Gold pill button below the body text</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <DrawerField label="Button Text" hint="">
                <DrawerInput
                  value={form.button_text}
                  onChange={(e) => handleChange('button_text', e.target.value)}
                  placeholder="Plan My Journey"
                  maxLength={100}
                />
              </DrawerField>
              <DrawerField label="Button Link" hint="">
                <DrawerInput
                  value={form.button_url}
                  onChange={(e) => handleChange('button_url', e.target.value)}
                  placeholder="/plan-my-journey"
                />
              </DrawerField>
            </div>
          </div>
        </div>

        {/* Right — background + settings */}
        <div className="space-y-5">

          <div className="bg-white border border-border rounded-xl p-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground">Background Image</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Recommended: 1920×600px · JPG or WebP · Max 10MB</p>
            </div>
            <MediaUploader
              module="home"
              section="cta"
              accept="image/*"
              maxSizeMB={10}
              value={form.background_image_url}
              mediaId={form.background_image_id}
              onChange={(media) =>
                setForm((f) => ({
                  ...f,
                  background_image_id: media.id,
                  background_image_url: media.full_url,
                }))
              }
              onClear={() =>
                setForm((f) => ({
                  ...f,
                  background_image_id: null,
                  background_image_url: null,
                }))
              }
              label="Upload background image"
              hint="Wide landscape photo works best"
            />
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Settings</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Section Enabled</p>
                <p className="text-xs text-muted-foreground mt-0.5">Show this section on the homepage</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('is_active', !form.is_active)}
                className={cn(
                  'relative w-10 h-5 rounded-full transition-colors',
                  form.is_active ? 'bg-primary' : 'bg-muted-foreground/30',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-soft transition-transform',
                    form.is_active ? 'translate-x-5' : 'translate-x-0.5',
                  )}
                />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
