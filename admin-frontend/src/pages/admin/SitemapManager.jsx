import React, { useEffect, useState } from 'react';
import { Network, Check, Clock, FileCode, Loader2, AlertCircle, Save } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import { useSitemapSettings, useUpdateSitemapSettings } from '@/hooks/use-seo';

const cn = (...c) => c.filter(Boolean).join(' ');

const INCLUDE_OPTIONS = [
  { key: 'include_pages', label: 'Pages' },
  { key: 'include_blog', label: 'Blog Articles' },
  { key: 'include_destinations', label: 'Destinations' },
  { key: 'include_experiences', label: 'Experiences' },
  { key: 'include_packages', label: 'Packages' },
  { key: 'include_gallery', label: 'Gallery' },
];

const FREQUENCIES = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];

export default function SitemapManager() {
  const { toast } = useToast();
  const { data, isLoading, isError, error } = useSitemapSettings();
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const updateMutation = useUpdateSitemapSettings({
    onSuccess: () => toast({ title: 'Sitemap settings saved', description: 'Changes published successfully.' }),
    onError: (err) => handleApiError(err, toast),
  });

  const isSaving = updateMutation.isPending;

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const handleToggle = (key) => setForm((f) => ({ ...f, [key]: !f[key] }));

  const handleSave = () => {
    if (!form || isSaving) return;
    const { id, created_at, updated_at, ...payload } = form;
    updateMutation.mutate(payload);
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
        <p className="text-sm">{error?.message || 'Failed to load sitemap settings'}</p>
      </div>
    );
  }

  const includedCount = INCLUDE_OPTIONS.filter((o) => form[o.key]).length;

  return (
    <div>
      <PageHeader
        title="Sitemap Manager"
        description="Manage your XML sitemap configuration"
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Content Types', value: String(includedCount), icon: Network, color: 'primary' },
          { label: 'Sitemap Enabled', value: form.enabled ? 'Yes' : 'No', icon: Check, color: form.enabled ? 'success' : 'warning' },
          { label: 'Default Priority', value: String(form.default_priority), icon: Clock, color: 'warning' },
          { label: 'Change Frequency', value: form.default_change_frequency, icon: FileCode, color: 'chart-4' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white border border-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', {
                  'bg-primary/10 text-primary': s.color === 'primary',
                  'bg-success/10 text-success': s.color === 'success',
                  'bg-warning/10 text-warning': s.color === 'warning',
                  'bg-violet-100 text-violet-600': s.color === 'chart-4',
                })}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enable / Disable */}
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">Sitemap Generation</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Enable or disable XML sitemap generation</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('enabled')}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.enabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-soft transition-transform ${form.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Include Content Types */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-1">Include in Sitemap</h3>
            <p className="text-sm text-muted-foreground mb-5">Choose which content types appear in the XML sitemap</p>
            <div className="space-y-3">
              {INCLUDE_OPTIONS.map((option) => (
                <div key={option.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-foreground">{option.label}</span>
                  <button
                    type="button"
                    onClick={() => handleToggle(option.key)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form[option.key] ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-soft transition-transform ${form[option.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Defaults */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-1">Default Values</h3>
            <p className="text-sm text-muted-foreground mb-5">Applied when page-level settings are not specified</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Default Priority</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={form.default_priority}
                  onChange={(e) => handleChange('default_priority', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Default Change Frequency</label>
                <select
                  value={form.default_change_frequency}
                  onChange={(e) => handleChange('default_change_frequency', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Sitemap URL</h3>
            <div className="px-3 py-2 text-sm font-mono text-foreground bg-muted/30 rounded-lg border border-border">
              /sitemap.xml
            </div>
            <p className="text-xs text-muted-foreground mt-2">Submit this URL to Google Search Console and Bing Webmaster Tools.</p>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Content Summary</h3>
            <div className="space-y-2">
              {INCLUDE_OPTIONS.map((option) => (
                <div key={option.key} className="flex items-center justify-between py-1">
                  <span className="text-sm text-foreground">{option.label}</span>
                  <span className={cn('text-xs font-medium', form[option.key] ? 'text-success' : 'text-muted-foreground')}>
                    {form[option.key] ? <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Included</span> : 'Excluded'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
