/**
 * HeroBannerCms — Home Hero Banner CMS page.
 *
 * Architecture:
 *   Component → React Query (useHero / useUpdateHero / useUploadHeroMedia)
 *             → HomeService → home.api.js / media.api.js → Axios client
 *
 * Layout and UI are unchanged from the original design.
 * Mock data has been replaced entirely with backend data.
 *
 * Backend field mapping:
 *   title, subtitle, description             → text fields
 *   button_text / button_url                 → primary CTA
 *   secondary_button_text / _url             → secondary CTA
 *   background_image_id                      → desktop banner (media upload)
 *   mobile_background_image_id               → mobile banner (media upload)
 *   video_id                                 → optional video (media upload)
 *   overlay_opacity                          → slider (UI: 0-100, API: 0.0-1.0)
 *   is_active                                → published / draft toggle
 *   display_order                            → hidden number field
 *
 * Fields NOT in backend (removed from form):
 *   highlightedTitle, badge, trustBadge, animation, scrollIndicator, overlay
 */
import { useEffect, useRef, useState } from 'react';
import {
  Save,
  Eye,
  Image as ImageIcon,
  Monitor,
  Tablet,
  Smartphone,
  Loader2,
  Upload,
  AlertCircle,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import { useHero, useUpdateHero, useUploadHeroMedia } from '@/hooks/use-home';

const cn = (...c) => c.filter(Boolean).join(' ');

const deviceConfig = {
  desktop: { icon: Monitor, label: 'Desktop', w: 'w-full max-w-[700px]', aspect: 'aspect-[16/9]' },
  tablet: { icon: Tablet, label: 'Tablet', w: 'w-[500px]', aspect: 'aspect-[4/3]' },
  mobile: { icon: Smartphone, label: 'Mobile', w: 'w-[280px]', aspect: 'aspect-[9/16]' },
};

// Accepted image MIME types
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE_MB = 10;

export default function HeroBannerCms() {
  const { toast } = useToast();
  const [device, setDevice] = useState('desktop');

  // ── Remote data ────────────────────────────────────────────────────────────
  const { data: heroData, isLoading, isError, error } = useHero();

  // ── Local form state (mirrors backend fields only) ─────────────────────────
  const [form, setForm] = useState(null);

  // Separate URL state for image preview (resolved from media_id after load)
  const [bgImageUrl, setBgImageUrl] = useState(null);
  const [mobileBgImageUrl, setMobileBgImageUrl] = useState(null);

  // ── Populate form when data loads ─────────────────────────────────────────
  useEffect(() => {
    if (heroData) {
      setForm(heroData);
      // Restore preview URLs if they were previously resolved
      if (heroData.background_image_url) setBgImageUrl(heroData.background_image_url);
      if (heroData.mobile_background_image_url) setMobileBgImageUrl(heroData.mobile_background_image_url);
    }
  }, [heroData]);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const updateMutation = useUpdateHero({
    onSuccess: () => {
      toast({ title: 'Hero banner saved', description: 'Changes published successfully.' });
    },
    onError: (err) => handleApiError(err, toast),
  });

  const uploadBgMutation = useUploadHeroMedia({
    onSuccess: (media) => {
      setForm((f) => ({ ...f, background_image_id: media.id }));
      setBgImageUrl(media.full_url);
      toast({ title: 'Desktop image uploaded' });
    },
    onError: (err) => handleApiError(err, toast),
  });

  const uploadMobileMutation = useUploadHeroMedia({
    onSuccess: (media) => {
      setForm((f) => ({ ...f, mobile_background_image_id: media.id }));
      setMobileBgImageUrl(media.full_url);
      toast({ title: 'Mobile image uploaded' });
    },
    onError: (err) => handleApiError(err, toast),
  });

  // ── Refs for hidden file inputs ────────────────────────────────────────────
  const bgFileRef = useRef(null);
  const mobileFileRef = useRef(null);

  // Prevent duplicate save submissions
  const isSaving = updateMutation.isPending;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSave = () => {
    if (!form || isSaving) return;

    // Required field validation
    if (!form.title?.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }
    if (form.title.length > 255) {
      toast({ title: 'Title must be 255 characters or less', variant: 'destructive' });
      return;
    }
    if (form.subtitle && form.subtitle.length > 500) {
      toast({ title: 'Subtitle must be 500 characters or less', variant: 'destructive' });
      return;
    }

    updateMutation.mutate(form);
  };

  const handleImageSelect = (mutationRef, fileInputRef) => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e, mutation, maxSizeMB = MAX_IMAGE_SIZE_MB) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // reset so same file can be re-selected

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload JPG, PNG, WebP, or GIF.', variant: 'destructive' });
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({ title: `File too large`, description: `Maximum size is ${maxSizeMB}MB.`, variant: 'destructive' });
      return;
    }

    mutation.mutate({ file, folder: 'home/hero' });
  };

  // ── Loading / Error states ─────────────────────────────────────────────────
  if (isLoading || !form) {
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
        <p className="text-sm">{error?.message || 'Failed to load hero banner'}</p>
      </div>
    );
  }

  // ── Preview image — desktop shows bg, mobile shows mobile bg ──────────────
  const previewImageUrl =
    device === 'mobile'
      ? (mobileBgImageUrl || bgImageUrl)
      : (bgImageUrl || mobileBgImageUrl);

  const cfg = deviceConfig[device];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Hidden file inputs */}
      <input
        ref={bgFileRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={(e) => handleFileChange(e, uploadBgMutation)}
      />
      <input
        ref={mobileFileRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={(e) => handleFileChange(e, uploadMobileMutation)}
      />

      <PageHeader
        title="Hero Banner CMS"
        description="Manage the homepage hero banner with responsive previews"
        actions={
          <>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Saving…' : 'Save & Publish'}
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ── Form ── */}
        <div className="space-y-6">

          {/* Banner Images */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-1">Responsive Banners</h3>
            <p className="text-sm text-muted-foreground mb-5">Upload separate banners for each device</p>
            <div className="grid grid-cols-2 gap-4">

              {/* Desktop Banner */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Monitor className="w-3.5 h-3.5" /> Desktop
                </div>
                <div className="aspect-video rounded-lg overflow-hidden border border-border bg-muted relative group">
                  {bgImageUrl ? (
                    <img src={bgImageUrl} alt="Desktop banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                  )}
                  {uploadBgMutation.isPending && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleImageSelect(uploadBgMutation, bgFileRef)}
                  disabled={uploadBgMutation.isPending}
                  className="w-full flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-primary bg-primary/8 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-60"
                >
                  <Upload className="w-3 h-3" />
                  {bgImageUrl ? 'Replace' : 'Upload'}
                </button>
              </div>

              {/* Mobile Banner */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Smartphone className="w-3.5 h-3.5" /> Mobile
                </div>
                <div className="aspect-video rounded-lg overflow-hidden border border-border bg-muted relative group">
                  {mobileBgImageUrl ? (
                    <img src={mobileBgImageUrl} alt="Mobile banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                  )}
                  {uploadMobileMutation.isPending && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleImageSelect(uploadMobileMutation, mobileFileRef)}
                  disabled={uploadMobileMutation.isPending}
                  className="w-full flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-primary bg-primary/8 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-60"
                >
                  <Upload className="w-3 h-3" />
                  {mobileBgImageUrl ? 'Replace' : 'Upload'}
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-1">Banner Content</h3>
            <p className="text-sm text-muted-foreground mb-5">Text content displayed on the banner</p>
            <div className="space-y-4">
              <DrawerField label="Title" required>
                <DrawerInput
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. Curated Luxury Travel Experiences"
                  maxLength={255}
                />
              </DrawerField>
              <DrawerField label="Subtitle">
                <DrawerInput
                  value={form.subtitle}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
                  placeholder="e.g. Bespoke journeys for the discerning traveler"
                  maxLength={500}
                />
              </DrawerField>
              <DrawerField label="Description">
                <DrawerInput
                  textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Longer description shown below the subtitle…"
                />
              </DrawerField>
            </div>
          </div>

          {/* Buttons */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-1">Call-to-Action Buttons</h3>
            <p className="text-sm text-muted-foreground mb-5">Primary and secondary button configuration</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DrawerField label="Primary Button Text">
                  <DrawerInput
                    value={form.button_text}
                    onChange={(e) => handleChange('button_text', e.target.value)}
                    placeholder="Explore Packages"
                    maxLength={255}
                  />
                </DrawerField>
                <DrawerField label="Primary Button Link">
                  <DrawerInput
                    value={form.button_url}
                    onChange={(e) => handleChange('button_url', e.target.value)}
                    placeholder="/packages"
                  />
                </DrawerField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DrawerField label="Secondary Button Text">
                  <DrawerInput
                    value={form.secondary_button_text}
                    onChange={(e) => handleChange('secondary_button_text', e.target.value)}
                    placeholder="Plan My Journey"
                    maxLength={255}
                  />
                </DrawerField>
                <DrawerField label="Secondary Button Link">
                  <DrawerInput
                    value={form.secondary_button_url}
                    onChange={(e) => handleChange('secondary_button_url', e.target.value)}
                    placeholder="/plan-journey"
                  />
                </DrawerField>
              </div>
            </div>
          </div>

          {/* Overlay & Effects */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-1">Overlay & Effects</h3>
            <p className="text-sm text-muted-foreground mb-5">Control the dark overlay on the banner image</p>
            <DrawerField label="Overlay Opacity" hint="0 = no overlay · 100 = fully dark">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.overlay_opacity}
                  onChange={(e) => handleChange('overlay_opacity', Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="text-sm text-muted-foreground w-10 text-right">
                  {form.overlay_opacity}%
                </span>
              </div>
            </DrawerField>
          </div>

          {/* Status */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-1">Status</h3>
            <p className="text-sm text-muted-foreground mb-5">Control whether the hero banner is visible on the website</p>
            <DrawerField label="Visibility">
              <DrawerSelect
                options={[
                  { value: 'published', label: 'Published' },
                  { value: 'draft', label: 'Draft' },
                ]}
                value={form.is_active ? 'published' : 'draft'}
                onChange={(e) => handleChange('is_active', e.target.value === 'published')}
              />
            </DrawerField>
          </div>
        </div>

        {/* ── Live Preview ── */}
        <div className="xl:sticky xl:top-20 xl:self-start">
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <h3 className="text-base font-semibold text-foreground">Live Preview</h3>
              </div>
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                {Object.entries(deviceConfig).map(([key, val]) => {
                  const Icon = val.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setDevice(key)}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all',
                        device === key
                          ? 'bg-white shadow-soft text-primary'
                          : 'text-muted-foreground',
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{val.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center">
              <div
                className={cn(
                  'bg-white border border-border rounded-xl overflow-hidden shadow-card transition-all duration-300',
                  cfg.w,
                )}
              >
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-2">
                    <div className="px-2 py-0.5 text-[10px] text-muted-foreground bg-white rounded border border-border truncate">
                      https://pureluxeholidays.com
                    </div>
                  </div>
                </div>

                {/* Hero preview */}
                <div className={cn('relative overflow-hidden bg-gray-900', cfg.aspect)}>
                  {previewImageUrl ? (
                    <img
                      src={previewImageUrl}
                      alt="Banner preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                      <ImageIcon className="w-12 h-12 text-white/20" />
                    </div>
                  )}

                  {/* Overlay */}
                  <div
                    className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"
                    style={{ opacity: form.overlay_opacity / 100 }}
                  />

                  {/* Content */}
                  <div className="relative h-full flex flex-col items-center justify-center text-center p-6">
                    {form.title && (
                      <h1 className="text-2xl font-bold text-white leading-tight">
                        {form.title}
                      </h1>
                    )}
                    {form.subtitle && (
                      <p className="text-xs text-white/80 mt-2 max-w-xs">{form.subtitle}</p>
                    )}
                    {form.description && (
                      <p className="text-[11px] text-white/60 mt-1 max-w-sm hidden sm:block line-clamp-2">
                        {form.description}
                      </p>
                    )}
                    {(form.button_text || form.secondary_button_text) && (
                      <div className="flex items-center gap-2 mt-4">
                        {form.button_text && (
                          <button className="px-4 py-2 text-xs font-medium text-blue-900 bg-white rounded-lg">
                            {form.button_text}
                          </button>
                        )}
                        {form.secondary_button_text && (
                          <button className="px-4 py-2 text-xs font-medium text-white border border-white/40 rounded-lg">
                            {form.secondary_button_text}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
