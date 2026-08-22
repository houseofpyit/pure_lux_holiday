/**
 * AboutMissionVisionCms — About Page › Mission & Vision
 *
 * Website section layout (dark green background, two columns):
 *   LEFT  column — Label ("OUR VISION") · Heading ("Beyond Luxury") · Divider · Body
 *   RIGHT column — Label ("OUR MISSION") · Heading ("Crafting Wonder") · Divider · Body
 *
 * ─── Field mapping (backend ↔ UI) ───────────────────────────────────────────
 *
 *   Backend field    UI label           Notes
 *   ───────────────  ─────────────────  ─────────────────────────────────────
 *   vision           Vision Body Text   Existing field — saved to DB
 *   mission          Mission Body Text  Existing field — saved to DB
 *
 *   ── Fields NOT yet on backend (stored in localStorage until migration) ────
 *   vision_label     Vision Label       "OUR VISION" eyebrow text
 *   vision_heading   Vision Heading     "Beyond Luxury"
 *   mission_label    Mission Label      "OUR MISSION" eyebrow text
 *   mission_heading  Mission Heading    "Crafting Wonder"
 *
 *   Backend fields to add:
 *     vision_label    VARCHAR(100)
 *     vision_heading  VARCHAR(255)
 *     mission_label   VARCHAR(100)
 *     mission_heading VARCHAR(255)
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save, Loader2, AlertCircle, ChevronLeft,
  Eye, EyeOff,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { DrawerField, DrawerInput } from '@/components/admin/Drawer';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import { useAboutPage, useUpdateAboutPage } from '@/hooks/use-about';

const cn = (...c) => c.filter(Boolean).join(' ');

const DRAFT_KEY = 'about_mission_vision_draft';
function loadDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}'); } catch { return {}; }
}
function saveDraft(values) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(values)); } catch { /* ignore */ }
}

export default function AboutMissionVisionCms() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: pageData, isLoading, isError } = useAboutPage();
  const [previewOpen, setPreviewOpen] = useState(true);

  // Fields that exist on the backend
  const [backendForm, setBackendForm] = useState(null);

  // Fields not yet on backend
  const [extForm, setExtForm] = useState({
    vision_label: 'Our Vision',
    vision_heading: 'Beyond Luxury',
    mission_label: 'Our Mission',
    mission_heading: 'Crafting Wonder',
  });

  useEffect(() => {
    if (pageData && !backendForm) {
      setBackendForm({
        vision: pageData.vision ?? '',
        mission: pageData.mission ?? '',
      });
      const draft = loadDraft();
      setExtForm((prev) => ({ ...prev, ...draft }));
    }
  }, [pageData]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateMutation = useUpdateAboutPage({
    onSuccess: () => {
      saveDraft(extForm);
      toast({ title: 'Mission & Vision saved' });
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
        title="Mission & Vision"
        description="Two-column dark section — label, heading, divider, and body text for each"
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
          <strong>Partial backend support.</strong> Fields marked{' '}
          <span className="font-mono text-xs bg-amber-100 px-1 rounded">*</span> (labels and headings) are not yet in the backend model — they are saved locally in your browser. Body text fields save to the database normally.
        </span>
      </div>

      {/* Live Preview */}
      {previewOpen && (
        <div className="mb-6 rounded-xl overflow-hidden border border-border">
          {/* Dark green preview mimicking the website section */}
          <div className="bg-emerald-900 px-8 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-3xl">

              {/* Vision column */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/80 mb-2">
                  {extForm.vision_label || 'Our Vision'}
                </p>
                <p className="text-xl font-bold text-white mb-2 leading-snug">
                  {extForm.vision_heading || (
                    <span className="text-white/30 italic text-base font-normal">No heading</span>
                  )}
                </p>
                <div className="w-8 h-px bg-amber-500/50 mb-3" />
                <p className="text-sm text-white/60 leading-relaxed">
                  {backendForm.vision || (
                    <span className="italic text-white/30">No body text yet</span>
                  )}
                </p>
              </div>

              {/* Mission column */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/80 mb-2">
                  {extForm.mission_label || 'Our Mission'}
                </p>
                <p className="text-xl font-bold text-white mb-2 leading-snug">
                  {extForm.mission_heading || (
                    <span className="text-white/30 italic text-base font-normal">No heading</span>
                  )}
                </p>
                <div className="w-8 h-px bg-amber-500/50 mb-3" />
                <p className="text-sm text-white/60 leading-relaxed">
                  {backendForm.mission || (
                    <span className="italic text-white/30">No body text yet</span>
                  )}
                </p>
              </div>

            </div>
          </div>
          <div className="px-4 py-2 bg-muted/40 border-t border-border flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Preview updates as you type</span>
          </div>
        </div>
      )}

      {/* Form — two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Vision ── */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground">Vision</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Left column of the section</p>
          </div>
          <div className="p-6 space-y-5">
            <DrawerField
              label={<span>Section Label <span className="text-amber-500 font-mono text-xs">*</span></span>}
              hint='Eyebrow text (e.g. "Our Vision")'
              required={false}
            >
              <DrawerInput
                value={extForm.vision_label}
                onChange={(e) => handleExtChange('vision_label', e.target.value)}
                placeholder="Our Vision"
                maxLength={100}
              />
            </DrawerField>

            <DrawerField
              label={<span>Heading <span className="text-amber-500 font-mono text-xs">*</span></span>}
              hint='Large heading (e.g. "Beyond Luxury")'
              required={false}
            >
              <DrawerInput
                value={extForm.vision_heading}
                onChange={(e) => handleExtChange('vision_heading', e.target.value)}
                placeholder="Beyond Luxury"
                maxLength={255}
              />
            </DrawerField>

            <DrawerField
              label="Body Text"
              hint="Vision statement paragraph — saved to database"
              required={false}
            >
              <DrawerInput
                textarea
                value={backendForm.vision}
                onChange={(e) => handleBackendChange('vision', e.target.value)}
                placeholder="To be the world's most trusted luxury travel curator…"
              />
            </DrawerField>
          </div>
        </div>

        {/* ── Mission ── */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground">Mission</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Right column of the section</p>
          </div>
          <div className="p-6 space-y-5">
            <DrawerField
              label={<span>Section Label <span className="text-amber-500 font-mono text-xs">*</span></span>}
              hint='Eyebrow text (e.g. "Our Mission")'
              required={false}
            >
              <DrawerInput
                value={extForm.mission_label}
                onChange={(e) => handleExtChange('mission_label', e.target.value)}
                placeholder="Our Mission"
                maxLength={100}
              />
            </DrawerField>

            <DrawerField
              label={<span>Heading <span className="text-amber-500 font-mono text-xs">*</span></span>}
              hint='Large heading (e.g. "Crafting Wonder")'
              required={false}
            >
              <DrawerInput
                value={extForm.mission_heading}
                onChange={(e) => handleExtChange('mission_heading', e.target.value)}
                placeholder="Crafting Wonder"
                maxLength={255}
              />
            </DrawerField>

            <DrawerField
              label="Body Text"
              hint="Mission statement paragraph — saved to database"
              required={false}
            >
              <DrawerInput
                textarea
                value={backendForm.mission}
                onChange={(e) => handleBackendChange('mission', e.target.value)}
                placeholder="To craft unforgettable luxury journeys through personalized service…"
              />
            </DrawerField>
          </div>
        </div>

      </div>
    </div>
  );
}
