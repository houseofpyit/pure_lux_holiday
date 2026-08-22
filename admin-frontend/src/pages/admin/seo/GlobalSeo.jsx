/**
 * GlobalSeo — Global SEO settings.
 *
 * Connected to: GET/PUT /api/v1/seo  (SEOSettings singleton — real backend)
 *
 * Fields supported by backend:
 *   meta_title, meta_description, meta_keywords, canonical_url, robots,
 *   og_title, og_description, og_image_id,
 *   twitter_card, twitter_title, twitter_description, twitter_image_id,
 *   schema_json
 */
import { useEffect, useState } from 'react';
import { AlertCircle, Check, Loader2, Save } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import MediaPicker from '@/components/media/MediaPicker';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import { buildMediaUrl } from '@/services/media.service';
import { useGlobalSeo, useUpdateGlobalSeo } from '@/hooks/use-seo';

const cn = (...c) => c.filter(Boolean).join(' ');

const ROBOTS_OPTIONS = [
  { value: 'index, follow', label: 'index, follow (default)' },
  { value: 'noindex, follow', label: 'noindex, follow' },
  { value: 'index, nofollow', label: 'index, nofollow' },
  { value: 'noindex, nofollow', label: 'noindex, nofollow' },
];

const TWITTER_CARD_OPTIONS = [
  { value: 'summary_large_image', label: 'Summary Large Image (recommended)' },
  { value: 'summary', label: 'Summary' },
];

const TITLE_MAX = 60;
const DESC_MAX = 160;

function CharCounter({ value, max }) {
  const len = (value ?? '').length;
  const colour = len > max ? 'text-destructive' : len > max * 0.85 ? 'text-warning' : 'text-muted-foreground';
  return <span className={colour}>{len}/{max}</span>;
}

export default function GlobalSeo() {
  const { toast } = useToast();
  const { data: seoData, isLoading, isError, error } = useGlobalSeo();
  const [form, setForm] = useState(null);
  const [ogPickerOpen, setOgPickerOpen] = useState(false);
  const [ogImageUrl, setOgImageUrl] = useState(null);
  const [twitterPickerOpen, setTwitterPickerOpen] = useState(false);
  const [twitterImageUrl, setTwitterImageUrl] = useState(null);

  useEffect(() => {
    if (seoData && !form) {
      setForm({
        meta_title: seoData.meta_title ?? '',
        meta_description: seoData.meta_description ?? '',
        meta_keywords: seoData.meta_keywords ?? '',
        canonical_url: seoData.canonical_url ?? '',
        robots: seoData.robots ?? 'index, follow',
        og_title: seoData.og_title ?? '',
        og_description: seoData.og_description ?? '',
        og_image_id: seoData.og_image_id ?? null,
        twitter_card: seoData.twitter_card ?? 'summary_large_image',
        twitter_title: seoData.twitter_title ?? '',
        twitter_description: seoData.twitter_description ?? '',
        twitter_image_id: seoData.twitter_image_id ?? null,
        schema_json: seoData.schema_json ?? '',
      });
    }
  }, [seoData, form]);

  const updateMutation = useUpdateGlobalSeo({
    onSuccess: () => toast({ title: 'Global SEO saved' }),
    onError: (err) => handleApiError(err, toast),
  });

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = () => {
    if (!form) return;
    const payload = {
      meta_title: form.meta_title?.trim() || null,
      meta_description: form.meta_description?.trim() || null,
      meta_keywords: form.meta_keywords?.trim() || null,
      canonical_url: form.canonical_url?.trim() || null,
      robots: form.robots || 'index, follow',
      og_title: form.og_title?.trim() || null,
      og_description: form.og_description?.trim() || null,
      og_image_id: form.og_image_id || null,
      twitter_card: form.twitter_card || 'summary_large_image',
      twitter_title: form.twitter_title?.trim() || null,
      twitter_description: form.twitter_description?.trim() || null,
      twitter_image_id: form.twitter_image_id || null,
      schema_json: form.schema_json?.trim() || null,
    };
    updateMutation.mutate(payload);
  };

  if (isLoading || !form) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive">
      <AlertCircle className="w-8 h-8" />
      <p className="text-sm">{error?.message || 'Failed to load SEO settings'}</p>
    </div>
  );

  const isSaving = updateMutation.isPending;

  return (
    <div>
      <PageHeader
        title="Global SEO"
        description="Default meta tags, Open Graph, Twitter cards and schema markup"
        searchPlaceholder="" onSearch={null} onAdd={null} filters={null}
        onFilter={null} activeFilter={null} onSort={null} onExport={null} onImport={null}
        actions={
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — form */}
        <div className="lg:col-span-2 space-y-6">

          {/* Meta Tags */}
          <div className="bg-white border border-border rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Default Meta Tags</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Applied to pages that don't override these defaults</p>
            </div>
            <DrawerField
              label="Default Meta Title"
              hint={<CharCounter value={form.meta_title} max={TITLE_MAX} />}
            >
              <DrawerInput
                value={form.meta_title}
                onChange={(e) => set('meta_title', e.target.value)}
                placeholder="Site Name — Tagline"
                maxLength={TITLE_MAX + 20}
              />
            </DrawerField>
            <DrawerField
              label="Default Meta Description"
              hint={<CharCounter value={form.meta_description} max={DESC_MAX} />}
            >
              <DrawerInput
                textarea
                value={form.meta_description}
                onChange={(e) => set('meta_description', e.target.value)}
                placeholder="A compelling description of your website..."
                maxLength={DESC_MAX + 20}
              />
            </DrawerField>
            <DrawerField label="Default Keywords" hint="Comma-separated">
              <DrawerInput
                value={form.meta_keywords}
                onChange={(e) => set('meta_keywords', e.target.value)}
                placeholder="luxury travel, bespoke holidays, private villas"
                maxLength={500}
              />
            </DrawerField>
            <div className="grid grid-cols-2 gap-4">
              <DrawerField label="Canonical URL" hint="Leave blank for automatic">
                <DrawerInput
                  value={form.canonical_url}
                  onChange={(e) => set('canonical_url', e.target.value)}
                  placeholder="https://yourdomain.com"
                  maxLength={1024}
                />
              </DrawerField>
              <DrawerField label="Default Robots">
                <DrawerSelect
                  value={form.robots}
                  onChange={(e) => set('robots', e.target.value)}
                  options={ROBOTS_OPTIONS}
                />
              </DrawerField>
            </div>
          </div>

          {/* Open Graph */}
          <div className="bg-white border border-border rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Open Graph</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Controls how pages appear when shared on Facebook, LinkedIn, WhatsApp</p>
            </div>
            <DrawerField label="OG Title" hint="Falls back to meta title if blank">
              <DrawerInput
                value={form.og_title}
                onChange={(e) => set('og_title', e.target.value)}
                placeholder="Site Name"
                maxLength={255}
              />
            </DrawerField>
            <DrawerField label="OG Description">
              <DrawerInput
                textarea
                value={form.og_description}
                onChange={(e) => set('og_description', e.target.value)}
                placeholder="Open Graph description..."
                maxLength={500}
              />
            </DrawerField>
            <DrawerField label="OG Image" hint="Recommended: 1200×630px · stored as media_id">
              <div className="space-y-2">
                {(ogImageUrl || form.og_image_id) && (
                  <div className="relative rounded-lg overflow-hidden border border-border aspect-[1.91/1] bg-muted">
                    {ogImageUrl
                      ? <img src={ogImageUrl} alt="OG" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Image ID: {form.og_image_id}</div>
                    }
                    <button
                      type="button"
                      onClick={() => { set('og_image_id', null); setOgImageUrl(null); }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-destructive transition-colors"
                    >✕</button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setOgPickerOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  {form.og_image_id ? 'Replace OG Image' : 'Select OG Image'}
                </button>
              </div>
            </DrawerField>
          </div>

          {/* Twitter Card */}
          <div className="bg-white border border-border rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Twitter / X Card</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Controls how pages appear when shared on Twitter / X</p>
            </div>
            <DrawerField label="Twitter Card Type">
              <DrawerSelect
                value={form.twitter_card}
                onChange={(e) => set('twitter_card', e.target.value)}
                options={TWITTER_CARD_OPTIONS}
              />
            </DrawerField>
            <DrawerField label="Twitter Title">
              <DrawerInput
                value={form.twitter_title}
                onChange={(e) => set('twitter_title', e.target.value)}
                placeholder="Falls back to OG title or meta title"
                maxLength={255}
              />
            </DrawerField>
            <DrawerField label="Twitter Description">
              <DrawerInput
                textarea
                value={form.twitter_description}
                onChange={(e) => set('twitter_description', e.target.value)}
                placeholder="Falls back to OG or meta description"
                maxLength={500}
              />
            </DrawerField>
            <DrawerField label="Twitter Image" hint="Recommended: 1200×628px · stored as media_id">
              <div className="space-y-2">
                {(twitterImageUrl || form.twitter_image_id) && (
                  <div className="relative rounded-lg overflow-hidden border border-border aspect-[1.91/1] bg-muted">
                    {twitterImageUrl
                      ? <img src={twitterImageUrl} alt="Twitter" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Image ID: {form.twitter_image_id}</div>
                    }
                    <button
                      type="button"
                      onClick={() => { set('twitter_image_id', null); setTwitterImageUrl(null); }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-destructive transition-colors"
                    >✕</button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setTwitterPickerOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  {form.twitter_image_id ? 'Replace Twitter Image' : 'Select Twitter Image'}
                </button>
              </div>
            </DrawerField>
          </div>

          {/* Schema JSON-LD */}
          <div className="bg-white border border-border rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Schema JSON-LD</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Structured data for rich search results — valid JSON-LD</p>
            </div>
            <DrawerField label="Schema JSON" hint='e.g. {"@context":"https://schema.org","@type":"Organization",...}'>
              <DrawerInput
                textarea
                value={form.schema_json}
                onChange={(e) => set('schema_json', e.target.value)}
                placeholder='{"@context": "https://schema.org", "@type": "TravelAgency", ...}'
                maxLength={10000}
              />
            </DrawerField>
          </div>
        </div>

        {/* Right — SERP preview */}
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-xl p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Google Search Preview
            </p>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground">G</div>
                <span className="text-xs text-muted-foreground">yourdomain.com</span>
              </div>
              <p className="text-base font-medium text-blue-700 leading-snug line-clamp-1">
                {form.meta_title?.trim() || 'Page title not set'}
              </p>
              <p className="text-sm text-muted-foreground leading-snug line-clamp-2 mt-0.5">
                {form.meta_description?.trim() || 'Add a meta description to see a preview here.'}
              </p>
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Social Share Preview
            </p>
            <div className="rounded-lg border border-border overflow-hidden">
              {ogImageUrl
                ? <img src={ogImageUrl} alt="OG preview" className="w-full aspect-[1.91/1] object-cover" />
                : <div className="w-full aspect-[1.91/1] bg-muted flex items-center justify-center text-xs text-muted-foreground">OG image not set</div>
              }
              <div className="p-3 bg-muted/30">
                <p className="text-[10px] text-muted-foreground uppercase">yourdomain.com</p>
                <p className="text-xs font-semibold text-foreground mt-0.5 line-clamp-1">
                  {form.og_title?.trim() || form.meta_title?.trim() || 'OG title not set'}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                  {form.og_description?.trim() || form.meta_description?.trim() || 'OG description not set'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-semibold mb-1">Connected to backend ✅</p>
            <p className="text-xs">Changes are saved to <code className="bg-amber-100 px-1 rounded">GET/PUT /api/v1/seo</code></p>
          </div>
        </div>
      </div>

      {/* OG image picker */}
      <MediaPicker
        open={ogPickerOpen}
        onClose={() => setOgPickerOpen(false)}
        folder="seo/og"
        accept="image/*"
        onSelect={(media) => {
          set('og_image_id', media.id);
          setOgImageUrl(media.full_url ?? buildMediaUrl(media.file_url));
          setOgPickerOpen(false);
        }}
      />
      {/* Twitter image picker */}
      <MediaPicker
        open={twitterPickerOpen}
        onClose={() => setTwitterPickerOpen(false)}
        folder="seo/twitter"
        accept="image/*"
        onSelect={(media) => {
          set('twitter_image_id', media.id);
          setTwitterImageUrl(media.full_url ?? buildMediaUrl(media.file_url));
          setTwitterPickerOpen(false);
        }}
      />
    </div>
  );
}
