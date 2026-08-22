/**
 * AboutCtaCms — About Page › CTA Section
 *
 * Website layout (matches ConciergeCTA on Home):
 *   Full-width background image · dark green overlay
 *   Centered: Script eyebrow label · Large serif heading · Body text · Gold pill button
 *
 * ─── Field mapping ───────────────────────────────────────────────────────────
 *   All fields stored in localStorage until the backend AboutPage model
 *   is extended with the CTA columns.
 *
 *   Fields to add to backend:
 *     cta_eyebrow_text     VARCHAR(100)
 *     cta_title            VARCHAR(255)
 *     cta_subtitle         TEXT
 *     cta_button_text      VARCHAR(100)
 *     cta_button_url       VARCHAR(500)
 *     cta_background_image_id  UUID FK → media.id
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2, AlertCircle, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { DrawerField, DrawerInput } from '@/components/admin/Drawer';
import MediaUploader from '@/components/media/MediaUploader';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import { useAboutPage, useUpdateAboutPage } from '@/hooks/use-about';

const cn = (...c) => c.filter(Boolean).join(' ');

const DRAFT_KEY = 'about_cta_draft';
function loadDraft() { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}'); } catch { return {}; } }
function saveDraft(v) { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(v)); } catch { /* ignore */ } }

const DEFAULT_EXT = {
  cta_eyebrow_text: 'Your Journey Awaits',
  cta_title: 'Ready to Begin Your Extraordinary Journey?',
  cta_subtitle: "Let our travel specialists craft a bespoke itinerary tailored to your dreams. Because the world's most extraordinary experiences begin with a single conversation.",
  cta_button_text: 'Plan My Journey',
  cta_button_url: '/plan-my-journey',
  cta_background_image_id: null,
  cta_background_image_url: null,
};

export default function AboutCtaCms() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: pageData, isLoading, isError } = useAboutPage();
  const [previewOpen, setPreviewOpen] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // All CTA fields are extended (not yet on backend)
  const [extForm, setExtForm] = useState(DEFAULT_EXT);

  useEffect(() => {
    if (pageData && !initialized) {
      setInitialized(true);
      const draft = loadDraft();
      setExtForm((prev) => ({ ...prev, ...draft }));
    }
  }, [pageData]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateMutation = useUpdateAboutPage({
    onSuccess: () => {
      saveDraft(extForm);
      toast({ title: 'CTA section saved' });
    },
    onError: (err) => handleApiError(err, toast),
  });

  const handleChange = (field, value) => setExtForm((f) => ({ ...f, [field]: value }));

  const handleSave = () => {
    saveDraft(extForm);
    // Send only the backend-supported fields on the singleton (a no-op payload
    // keeps the API call valid; CTA fields will be included once backend is updated)
    updateMutation.mutate({});
  };

  if (isLoading || !initialized) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive">
      <AlertCircle className="w-8 h-8" />
      <p className="text-sm">Failed to load about page data</p>
    </div>
  );

  const isSaving = updateMutation.isPending;

  return (
    <div>
      <button
        onClick={() => navigate('/admin/website/about')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> About Page Sections
      </button>

      <PageHeader
        title="CTA Section"
        description="Full-width call-to-action banner at the bottom of the About page"
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
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        }
      />

      {/* Backend mismatch notice */}
      <div className="flex items-start gap-3 mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <span className="shrink-0 font-bold mt-0.5">⚠</span>
        <span>
          <strong>All CTA fields are saved locally</strong> until the backend AboutPage model is extended with CTA columns. Your edits are preserved in the browser.
        </span>
      </div>

      {/* ── Live Preview ─────────────────────────────────────────────────── */}
      {previewOpen && (
        <div className="mb-6 rounded-xl overflow-hidden border border-border">
          <div className="relative min-h-[260px] flex items-center justify-center overflow-hidden">
            {extForm.cta_background_image_url ? (
              <img
                src={extForm.cta_background_image_url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-emerald-700" />
            )}
            <div className="absolute inset-0 bg-emerald-950/65" />

            <div className="relative z-10 text-center px-8 py-12 max-w-lg mx-auto">
              {extForm.cta_eyebrow_text && (
                <p className="text-amber-300/90 text-lg italic mb-3 font-medium">
                  {extForm.cta_eyebrow_text}
                </p>
              )}
              <h2 className="text-white font-bold text-2xl leading-snug mb-4">
                {extForm.cta_title || <span className="text-white/30 font-normal italic text-lg">No heading</span>}
              </h2>
              {extForm.cta_subtitle && (
                <p className="text-white/65 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
                  {extForm.cta_subtitle}
                </p>
              )}
              {extForm.cta_button_text && (
                <span className="inline-flex items-center px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 text-emerald-900 text-xs font-bold uppercase tracking-wider shadow-lg">
                  {extForm.cta_button_text}
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

            <DrawerField label="Eyebrow Label" hint='Script text above the heading (e.g. "Your Journey Awaits")' required={false}>
              <DrawerInput
                value={extForm.cta_eyebrow_text}
                onChange={(e) => handleChange('cta_eyebrow_text', e.target.value)}
                placeholder="Your Journey Awaits"
                maxLength={100}
              />
            </DrawerField>

            <DrawerField label="Heading" hint="Main CTA heading" required={false}>
              <DrawerInput
                value={extForm.cta_title}
                onChange={(e) => handleChange('cta_title', e.target.value)}
                placeholder="Ready to Begin Your Extraordinary Journey?"
                maxLength={255}
              />
            </DrawerField>

            <DrawerField label="Body Text" hint="Supporting paragraph below the heading" required={false}>
              <DrawerInput
                textarea
                value={extForm.cta_subtitle}
                onChange={(e) => handleChange('cta_subtitle', e.target.value)}
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
              <DrawerField label="Button Text" hint="" required={false}>
                <DrawerInput
                  value={extForm.cta_button_text}
                  onChange={(e) => handleChange('cta_button_text', e.target.value)}
                  placeholder="Plan My Journey"
                  maxLength={100}
                />
              </DrawerField>
              <DrawerField label="Button Link" hint="" required={false}>
                <DrawerInput
                  value={extForm.cta_button_url}
                  onChange={(e) => handleChange('cta_button_url', e.target.value)}
                  placeholder="/plan-my-journey"
                />
              </DrawerField>
            </div>
          </div>
        </div>

        {/* Right — background image */}
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Background Image</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Recommended: 1920×600px · JPG or WebP · Max 10MB</p>
          </div>
          <MediaUploader
            module="about"
            section="cta"
            accept="image/*"
            maxSizeMB={10}
            value={extForm.cta_background_image_url}
            mediaId={extForm.cta_background_image_id}
            onChange={(media) =>
              setExtForm((f) => ({
                ...f,
                cta_background_image_id: media.id,
                cta_background_image_url: media.full_url,
              }))
            }
            onClear={() =>
              setExtForm((f) => ({
                ...f,
                cta_background_image_id: null,
                cta_background_image_url: null,
              }))
            }
            label="Upload background image"
            hint="Wide landscape photo works best. The section adds a dark overlay automatically."
          />
        </div>

      </div>
    </div>
  );
}
