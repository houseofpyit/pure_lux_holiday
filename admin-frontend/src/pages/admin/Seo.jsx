import React, { useEffect, useState } from 'react';
import { Check, AlertCircle, Loader2, Save } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { DrawerField, DrawerInput } from '@/components/admin/Drawer';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import { useGlobalSeo, useUpdateGlobalSeo } from '@/hooks/use-seo';

export default function Seo() {
  const { toast } = useToast();
  const { data, isLoading, isError, error } = useGlobalSeo();
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const updateMutation = useUpdateGlobalSeo({
    onSuccess: () => toast({ title: 'Global SEO saved', description: 'Changes published successfully.' }),
    onError: (err) => handleApiError(err, toast),
  });

  const isSaving = updateMutation.isPending;

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = () => {
    if (!form || isSaving) return;
    updateMutation.mutate(form);
  };

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
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm">{error?.message || 'Failed to load SEO settings'}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Global SEO"
        description="Manage search engine optimization settings across your website"
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
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Global Meta */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-1">Global Meta Tags</h3>
            <p className="text-sm text-muted-foreground mb-5">Default meta tags applied across all pages</p>
            <div className="space-y-4">
              <DrawerField label="Site Name">
                <DrawerInput
                  value={form.site_name ?? ''}
                  onChange={(e) => handleChange('site_name', e.target.value)}
                  placeholder="Pure Luxe Holidays"
                />
              </DrawerField>
              <DrawerField label="Default Meta Title" hint="50-60 characters recommended">
                <DrawerInput
                  value={form.default_meta_title ?? ''}
                  onChange={(e) => handleChange('default_meta_title', e.target.value)}
                  placeholder="Pure Luxe Holidays — Luxury Travel Experiences"
                />
              </DrawerField>
              <DrawerField label="Default Meta Description" hint="150-160 characters recommended">
                <DrawerInput
                  textarea
                  value={form.default_meta_description ?? ''}
                  onChange={(e) => handleChange('default_meta_description', e.target.value)}
                  placeholder="Discover the world's most exclusive luxury travel experiences…"
                />
              </DrawerField>
              <DrawerField label="Default Keywords">
                <DrawerInput
                  value={form.default_keywords ?? ''}
                  onChange={(e) => handleChange('default_keywords', e.target.value)}
                  placeholder="luxury travel, bespoke holidays, private islands"
                />
              </DrawerField>
              <div className="grid grid-cols-2 gap-4">
                <DrawerField label="Website URL">
                  <DrawerInput
                    value={form.website_url ?? ''}
                    onChange={(e) => handleChange('website_url', e.target.value)}
                    placeholder="https://pureluxeholidays.com"
                  />
                </DrawerField>
                <DrawerField label="Canonical URL">
                  <DrawerInput
                    value={form.canonical_url ?? ''}
                    onChange={(e) => handleChange('canonical_url', e.target.value)}
                    placeholder="https://pureluxeholidays.com"
                  />
                </DrawerField>
              </div>
              <DrawerField label="Default Robots">
                <select
                  value={form.default_robots ?? 'index, follow'}
                  onChange={(e) => handleChange('default_robots', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="index, follow">index, follow</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="index, nofollow">index, nofollow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </select>
              </DrawerField>
            </div>
          </div>

          {/* Organization */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-1">Organization</h3>
            <p className="text-sm text-muted-foreground mb-5">Used in structured data / schema markup</p>
            <div className="space-y-4">
              <DrawerField label="Organization Name">
                <DrawerInput
                  value={form.organization_name ?? ''}
                  onChange={(e) => handleChange('organization_name', e.target.value)}
                  placeholder="Pure Luxe Holidays"
                />
              </DrawerField>
              <DrawerField label="Theme Color" hint="Hex color, e.g. #1a1a2e">
                <DrawerInput
                  value={form.theme_color ?? ''}
                  onChange={(e) => handleChange('theme_color', e.target.value)}
                  placeholder="#1a1a2e"
                  maxLength={7}
                />
              </DrawerField>
            </div>
          </div>

          {/* Social & Twitter */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-1">Social & Twitter</h3>
            <p className="text-sm text-muted-foreground mb-5">Open Graph and Twitter card defaults</p>
            <div className="space-y-4">
              <DrawerField label="Twitter Card Type">
                <select
                  value={form.twitter_card ?? 'summary_large_image'}
                  onChange={(e) => handleChange('twitter_card', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="summary_large_image">summary_large_image</option>
                  <option value="summary">summary</option>
                  <option value="player">player</option>
                </select>
              </DrawerField>
              <DrawerField label="Facebook App ID">
                <DrawerInput
                  value={form.facebook_app_id ?? ''}
                  onChange={(e) => handleChange('facebook_app_id', e.target.value)}
                  placeholder="123456789"
                />
              </DrawerField>
            </div>
          </div>

          {/* Site Verifications */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-1">Site Verifications</h3>
            <p className="text-sm text-muted-foreground mb-5">Verification codes for search consoles</p>
            <div className="space-y-4">
              <DrawerField label="Google Site Verification">
                <DrawerInput
                  value={form.google_site_verification ?? ''}
                  onChange={(e) => handleChange('google_site_verification', e.target.value)}
                  placeholder="google-site-verification=..."
                />
              </DrawerField>
              <DrawerField label="Bing Site Verification">
                <DrawerInput
                  value={form.bing_site_verification ?? ''}
                  onChange={(e) => handleChange('bing_site_verification', e.target.value)}
                  placeholder="msvalidate.01=..."
                />
              </DrawerField>
              <DrawerField label="Pinterest Verification">
                <DrawerInput
                  value={form.pinterest_verification ?? ''}
                  onChange={(e) => handleChange('pinterest_verification', e.target.value)}
                  placeholder="Pinterest verification code"
                />
              </DrawerField>
            </div>
          </div>

          {/* JSON-LD Schema */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-1">Structured Data (JSON-LD)</h3>
            <p className="text-sm text-muted-foreground mb-5">Global schema markup for search engines</p>
            <DrawerField label="Schema JSON">
              <textarea
                value={form.schema_json ?? ''}
                onChange={(e) => handleChange('schema_json', e.target.value)}
                rows={8}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-y"
                placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "Organization"\n}'}
              />
            </DrawerField>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Live Values */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Current Settings</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Site Name</p>
                <p className="font-medium text-foreground truncate">{form.site_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Default Robots</p>
                <p className="font-mono text-xs text-foreground">{form.default_robots || 'index, follow'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Twitter Card</p>
                <p className="font-mono text-xs text-foreground">{form.twitter_card || 'summary_large_image'}</p>
              </div>
            </div>
          </div>

          {/* Google Search Preview */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Google Search Preview</h3>
            <div className="space-y-1">
              <p className="text-[13px] text-success truncate">{form.website_url || 'https://pureluxeholidays.com'}</p>
              <p className="text-base text-primary font-medium leading-snug">
                {form.default_meta_title || form.site_name || 'Pure Luxe Holidays'}
              </p>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                {form.default_meta_description
                  ? form.default_meta_description.slice(0, 160)
                  : 'Discover the world\'s most exclusive luxury travel experiences…'}
              </p>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">SEO Checklist</h3>
            <div className="space-y-3">
              {[
                { label: 'Site name set', ok: !!form.site_name },
                { label: 'Default meta title', ok: !!form.default_meta_title },
                { label: 'Default meta description', ok: !!form.default_meta_description },
                { label: 'Website URL set', ok: !!form.website_url },
                { label: 'Google verification', ok: !!form.google_site_verification },
                { label: 'Twitter card configured', ok: !!form.twitter_card },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.ok ? 'bg-success/10' : 'bg-muted'}`}>
                    {item.ok
                      ? <Check className="w-3 h-3 text-success" strokeWidth={3} />
                      : <AlertCircle className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <p className={`text-sm ${item.ok ? 'text-foreground' : 'text-muted-foreground'}`}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
