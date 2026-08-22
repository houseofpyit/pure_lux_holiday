/**
 * AboutStoryCms — About Page › Our Story
 *
 * Fully redesigned to match the website section layout.
 *
 * Website section layout (left-to-right):
 *   LEFT  — Hero image with years badge overlay
 *   RIGHT — Section label · Heading · Divider · Paragraph 1 · Paragraph 2 · CTA
 *
 * ─── Field mapping (backend ↔ UI) ───────────────────────────────────────────
 *
 *   Backend field          UI label              Notes
 *   ─────────────────────  ────────────────────  ──────────────────────────────
 *   our_story              Paragraph 1           Existing field — primary copy
 *   company_description    Paragraph 2           Existing field — secondary copy
 *   hero_image_id          Hero Image            Existing field — reused for story
 *
 *   ── Fields NOT yet on the backend model (see § Backend Mismatches) ─────────
 *   story_label            Section Label         "Our Story" eyebrow text
 *   story_heading          Main Heading          "A Legacy of…"
 *   story_paragraph_3      Paragraph 3           Third paragraph (optional)
 *   story_cta_text         CTA Button Text       "Begin Your Journey"
 *   story_cta_url          CTA Button Link       "/plan-my-journey"
 *   story_badge_number     Badge Number          "15+"
 *   story_badge_label      Badge Label           "Years"
 *   story_image_id         Hero Image            Dedicated story image (vs hero)
 *   story_display_order    Display Order         Section ordering
 *   story_is_active        Published             Section visibility
 *
 * ─── Backend Mismatches ──────────────────────────────────────────────────────
 *   The backend AboutPage model does not yet have the new story-specific fields.
 *   Until those fields are added via a migration, they are stored in localStorage
 *   under the key "about_story_draft" so the CMS is fully usable in the meantime.
 *   Once the backend is extended, replace the localStorage calls with the
 *   standard useAboutPage / useUpdateAboutPage pattern used by other fields.
 *
 *   Fields to add to backend AboutPage model:
 *     story_label          VARCHAR(100)
 *     story_heading        VARCHAR(255)
 *     story_paragraph_3    TEXT
 *     story_cta_text       VARCHAR(100)
 *     story_cta_url        VARCHAR(500)
 *     story_badge_number   VARCHAR(20)
 *     story_badge_label    VARCHAR(50)
 *     story_image_id       UUID FK → media.id
 *
 *   Fields to add to AboutPageUpdate / AboutPageResponse schemas:
 *     All of the above.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save, Loader2, AlertCircle, ChevronLeft,
  Eye, EyeOff, ArrowRight,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import MediaUploader from '@/components/media/MediaUploader';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import { useAboutPage, useUpdateAboutPage } from '@/hooks/use-about';

const cn = (...c) => c.filter(Boolean).join(' ');

// localStorage key for fields not yet on the backend
const DRAFT_KEY = 'about_story_draft';

function loadDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}'); } catch { return {}; }
}
function saveDraft(values) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(values)); } catch { /* ignore */ }
}

const TABS = ['General', 'Content', 'Media', 'Settings'];

export default function AboutStoryCms() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: pageData, isLoading, isError } = useAboutPage();

  const [activeTab, setActiveTab] = useState('General');
  const [previewOpen, setPreviewOpen] = useState(true);

  // ── Form state ────────────────────────────────────────────────────────────
  // Fields that exist on the backend
  const [backendForm, setBackendForm] = useState(null);
  // Fields not yet on backend (stored locally until migration)
  const [extForm, setExtForm] = useState({
    story_label: 'Our Story',
    story_heading: 'A Legacy of Extraordinary Journeys',
    story_paragraph_3: '',
    story_cta_text: 'Begin Your Journey',
    story_cta_url: '/plan-my-journey',
    story_badge_number: '15+',
    story_badge_label: 'Years',
    story_image_id: null,
    story_image_url: null,
    story_display_order: 2,
    story_is_active: true,
  });

  // Initialise from backend + localStorage draft
  useEffect(() => {
    if (pageData && !backendForm) {
      setBackendForm({
        our_story: pageData.our_story ?? '',
        company_description: pageData.company_description ?? '',
      });
      const draft = loadDraft();
      setExtForm((prev) => ({ ...prev, ...draft }));
    }
  }, [pageData]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateMutation = useUpdateAboutPage({
    onSuccess: () => {
      // also persist extended fields locally
      saveDraft(extForm);
      toast({ title: 'Our Story saved' });
    },
    onError: (err) => handleApiError(err, toast),
  });

  const handleBackendChange = (field, value) =>
    setBackendForm((f) => ({ ...f, [field]: value }));

  const handleExtChange = (field, value) =>
    setExtForm((f) => ({ ...f, [field]: value }));

  const handleSave = () => {
    saveDraft(extForm);
    updateMutation.mutate(backendForm);
  };

  // ── Loading / Error ───────────────────────────────────────────────────────
  if (isLoading || !backendForm) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm">Failed to load about page data</p>
      </div>
    );
  }

  const isSaving = updateMutation.isPending;

  // ── Preview data (merge backend + ext fields) ─────────────────────────────
  const preview = {
    label: extForm.story_label || 'Our Story',
    heading: extForm.story_heading || 'A Legacy of Extraordinary Journeys',
    p1: backendForm.our_story || '',
    p2: backendForm.company_description || '',
    p3: extForm.story_paragraph_3 || '',
    ctaText: extForm.story_cta_text || 'Begin Your Journey',
    ctaUrl: extForm.story_cta_url || '/plan-my-journey',
    badgeNumber: extForm.story_badge_number || '15+',
    badgeLabel: extForm.story_badge_label || 'Years',
    imageUrl: extForm.story_image_url || null,
    isActive: extForm.story_is_active,
  };

  return (
    <div>
      {/* Back link */}
      <button
        onClick={() => navigate('/admin/website/about')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> About Page Sections
      </button>

      <PageHeader
        title="Our Story"
        description="Left-right section with hero image, heading, paragraphs and CTA"
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
      {/* <div className="flex items-start gap-3 mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <span className="shrink-0 font-bold mt-0.5">⚠</span>
        <span>
          <strong>Partial backend support.</strong> Fields marked with <span className="font-mono text-xs bg-amber-100 px-1 rounded">*</span> (Label, Heading, Paragraphs 3, CTA, Badge, Image) are not yet in the backend model. They are saved locally in your browser until the backend migration is applied. All other fields save to the database normally.
        </span>
      </div> */}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 items-start">

        {/* ── Form panel ──────────────────────────────────────────────────── */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-6 border-b border-border">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-3 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-5">

            {/* ── General tab ── */}
            {activeTab === 'General' && (
              <>
                <DrawerField
                  label={<span>Section Label <span className="text-amber-500 font-mono text-xs">*</span></span>}
                  hint='Eyebrow text above the heading (e.g. "Our Story")'
                  required={false}
                >
                  <DrawerInput
                    value={extForm.story_label}
                    onChange={(e) => handleExtChange('story_label', e.target.value)}
                    placeholder="Our Story"
                    maxLength={100}
                  />
                </DrawerField>
              </>
            )}

            {/* ── Content tab ── */}
            {activeTab === 'Content' && (
              <>
                <DrawerField
                  label={<span>Main Heading <span className="text-amber-500 font-mono text-xs">*</span></span>}
                  hint="Large heading text (e.g. A Legacy of Extraordinary Journeys)"
                  required={false}
                >
                  <DrawerInput
                    value={extForm.story_heading}
                    onChange={(e) => handleExtChange('story_heading', e.target.value)}
                    placeholder="A Legacy of Extraordinary Journeys"
                    maxLength={255}
                  />
                </DrawerField>

                <DrawerField
                  label="Paragraph 1"
                  hint="First body paragraph — primary story text (saved to database)"
                  required={false}
                >
                  <DrawerInput
                    textarea
                    value={backendForm.our_story}
                    onChange={(e) => handleBackendChange('our_story', e.target.value)}
                    placeholder="Pure Luxe Holidays was born from a simple belief…"
                  />
                </DrawerField>

                <DrawerField
                  label="Paragraph 2"
                  hint="Second body paragraph — company overview (saved to database)"
                  required={false}
                >
                  <DrawerInput
                    textarea
                    value={backendForm.company_description}
                    onChange={(e) => handleBackendChange('company_description', e.target.value)}
                    placeholder="Today, we are a team of dedicated travel curators…"
                  />
                </DrawerField>

                <DrawerField
                  label={<span>Paragraph 3 <span className="text-amber-500 font-mono text-xs">*</span></span>}
                  hint="Optional third paragraph"
                  required={false}
                >
                  <DrawerInput
                    textarea
                    value={extForm.story_paragraph_3}
                    onChange={(e) => handleExtChange('story_paragraph_3', e.target.value)}
                    placeholder="Optional additional paragraph…"
                  />
                </DrawerField>

                <div className="grid grid-cols-2 gap-4">
                  <DrawerField
                    label={<span>CTA Button Text <span className="text-amber-500 font-mono text-xs">*</span></span>}
                    hint=""
                    required={false}
                  >
                    <DrawerInput
                      value={extForm.story_cta_text}
                      onChange={(e) => handleExtChange('story_cta_text', e.target.value)}
                      placeholder="Begin Your Journey"
                      maxLength={100}
                    />
                  </DrawerField>
                  <DrawerField
                    label={<span>CTA Button Link <span className="text-amber-500 font-mono text-xs">*</span></span>}
                    hint=""
                    required={false}
                  >
                    <DrawerInput
                      value={extForm.story_cta_url}
                      onChange={(e) => handleExtChange('story_cta_url', e.target.value)}
                      placeholder="/plan-my-journey"
                    />
                  </DrawerField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <DrawerField
                    label={<span>Badge Number <span className="text-amber-500 font-mono text-xs">*</span></span>}
                    hint='e.g. "15+"'
                    required={false}
                  >
                    <DrawerInput
                      value={extForm.story_badge_number}
                      onChange={(e) => handleExtChange('story_badge_number', e.target.value)}
                      placeholder="15+"
                      maxLength={20}
                    />
                  </DrawerField>
                  <DrawerField
                    label={<span>Badge Label <span className="text-amber-500 font-mono text-xs">*</span></span>}
                    hint='e.g. "Years"'
                    required={false}
                  >
                    <DrawerInput
                      value={extForm.story_badge_label}
                      onChange={(e) => handleExtChange('story_badge_label', e.target.value)}
                      placeholder="Years"
                      maxLength={50}
                    />
                  </DrawerField>
                </div>
              </>
            )}

            {/* ── Media tab ── */}
            {activeTab === 'Media' && (
              <DrawerField
                label={<span>Hero Image <span className="text-amber-500 font-mono text-xs">*</span></span>}
                hint="Left-side image. Recommended 800×1000px · JPG or WebP · Max 10MB"
                required={false}
              >
                <MediaUploader
                  module="about"
                  section="our-story"
                  accept="image/*"
                  maxSizeMB={10}
                  value={extForm.story_image_url}
                  mediaId={extForm.story_image_id}
                  onChange={(media) =>
                    setExtForm((f) => ({
                      ...f,
                      story_image_id: media.id,
                      story_image_url: media.full_url,
                    }))
                  }
                  onClear={() =>
                    setExtForm((f) => ({
                      ...f,
                      story_image_id: null,
                      story_image_url: null,
                    }))
                  }
                  aspectClass="aspect-[4/5]"
                  label="Upload story image"
                  hint="Displayed on the left side of the Our Story section"
                />
              </DrawerField>
            )}

            {/* ── Settings tab ── */}
            {activeTab === 'Settings' && (
              <>
                <DrawerField
                  label={<span>Display Order <span className="text-amber-500 font-mono text-xs">*</span></span>}
                  hint="Controls section ordering on the About page"
                  required={false}
                >
                  <DrawerInput
                    type="number"
                    value={String(extForm.story_display_order)}
                    onChange={(e) => handleExtChange('story_display_order', Number(e.target.value))}
                    placeholder="2"
                  />
                </DrawerField>
                <DrawerField
                  label={<span>Visibility <span className="text-amber-500 font-mono text-xs">*</span></span>}
                  hint="Show or hide this section on the About page"
                  required={false}
                >
                  <DrawerSelect
                    options={[
                      { value: 'published', label: 'Published' },
                      { value: 'draft', label: 'Draft' },
                    ]}
                    value={extForm.story_is_active ? 'published' : 'draft'}
                    onChange={(e) => handleExtChange('story_is_active', e.target.value === 'published')}
                    defaultValue={extForm.story_is_active ? 'published' : 'draft'}
                    disabled={false}
                  />
                </DrawerField>
              </>
            )}
          </div>
        </div>

        {/* ── Live Preview panel ────────────────────────────────────────────── */}
        {previewOpen && (
          <div className="bg-white border border-border rounded-xl overflow-hidden sticky top-6">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Section Preview</span>
              </div>
              <span className="text-xs text-muted-foreground">Approximate layout</span>
            </div>

            {/* Preview render */}
            <div className="p-4 bg-white">
              <div className="flex gap-4 items-start">

                {/* Left — image + badge */}
                <div className="relative shrink-0 w-32">
                  <div className="aspect-[4/5] rounded-xl overflow-hidden bg-muted">
                    {preview.imageUrl ? (
                      <img
                        src={preview.imageUrl}
                        alt="Story"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-xs text-center px-2">
                        No image
                      </div>
                    )}
                  </div>
                  {/* Years badge */}
                  {(preview.badgeNumber || preview.badgeLabel) && (
                    <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full bg-emerald-900 flex flex-col items-center justify-center text-center shadow-md">
                      <p className="text-white text-[10px] font-bold leading-none">{preview.badgeNumber}</p>
                      <p className="text-white/60 text-[7px] uppercase tracking-wider leading-none mt-0.5">{preview.badgeLabel}</p>
                    </div>
                  )}
                </div>

                {/* Right — text */}
                <div className="flex-1 min-w-0 pt-1">
                  {/* Section label */}
                  {preview.label && (
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-amber-600 mb-1.5">
                      {preview.label}
                    </p>
                  )}

                  {/* Heading */}
                  <p className="text-sm font-bold text-foreground leading-snug mb-2 line-clamp-3">
                    {preview.heading || <span className="text-muted-foreground/40 italic">No heading</span>}
                  </p>

                  {/* Decorative divider */}
                  <div className="w-8 h-px bg-amber-500/60 mb-2" />

                  {/* Paragraphs */}
                  {preview.p1 && (
                    <p className="text-[10px] text-muted-foreground leading-relaxed mb-1.5 line-clamp-3">
                      {preview.p1}
                    </p>
                  )}
                  {preview.p2 && (
                    <p className="text-[10px] text-muted-foreground leading-relaxed mb-1.5 line-clamp-2">
                      {preview.p2}
                    </p>
                  )}
                  {preview.p3 && (
                    <p className="text-[10px] text-muted-foreground leading-relaxed mb-1.5 line-clamp-2">
                      {preview.p3}
                    </p>
                  )}

                  {/* CTA */}
                  {preview.ctaText && (
                    <div className="inline-flex items-center gap-1 mt-2 text-[10px] font-semibold text-foreground border-b border-amber-500/40 pb-0.5">
                      {preview.ctaText}
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
              </div>

              {/* Status indicator */}
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Display order: {extForm.story_display_order}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium',
                    preview.isActive
                      ? 'bg-green-50 text-green-700'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      preview.isActive ? 'bg-green-500' : 'bg-muted-foreground',
                    )}
                  />
                  {preview.isActive ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
