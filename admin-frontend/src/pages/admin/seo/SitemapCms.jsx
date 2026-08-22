/**
 * SitemapCms — Sitemap configuration.
 * Backend status: No sitemap settings model. Saved to localStorage.
 */
import { useState } from 'react';
import { Check, Clock, Download, FileCode, Loader2, Network, RefreshCw, Save } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { useToast } from '@/components/ui/use-toast';

const cn = (...c) => c.filter(Boolean).join(' ');

const DRAFT_KEY = 'sitemap_cms_draft';
const loadDraft = () => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}'); } catch { return {}; } };
const saveDraft = (v) => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(v)); } catch { /**/ } };

const DEFAULTS = {
  enabled: true,
  auto_generate: 'daily',
  include_pages: true,
  include_blog: true,
  include_destinations: true,
  include_experiences: true,
  include_packages: true,
  include_gallery: false,
  default_priority: '0.8',
  default_frequency: 'weekly',
};

function Toggle({ checked, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn('relative w-10 h-5 rounded-full transition-colors shrink-0', checked ? 'bg-primary' : 'bg-muted-foreground/30')}
      >
        <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-soft transition-transform', checked ? 'translate-x-5' : 'translate-x-0.5')} />
      </button>
    </div>
  );
}

const PREVIEW_URLS = [
  { url: '/', priority: '1.0', frequency: 'daily' },
  { url: '/destinations', priority: '0.9', frequency: 'weekly' },
  { url: '/packages', priority: '0.9', frequency: 'weekly' },
  { url: '/experiences', priority: '0.8', frequency: 'weekly' },
  { url: '/blog', priority: '0.8', frequency: 'daily' },
  { url: '/gallery', priority: '0.6', frequency: 'monthly' },
  { url: '/about', priority: '0.5', frequency: 'monthly' },
  { url: '/contact', priority: '0.5', frequency: 'monthly' },
];

export default function SitemapCms() {
  const { toast } = useToast();
  const [form, setForm] = useState(() => ({ ...DEFAULTS, ...loadDraft() }));
  const [saving, setSaving] = useState(false);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = () => {
    setSaving(true);
    saveDraft(form);
    setTimeout(() => {
      setSaving(false);
      toast({ title: 'Sitemap settings saved' });
    }, 300);
  };

  const handleDownloadXml = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PREVIEW_URLS.map((u) => `  <url>
    <loc>https://yourdomain.com${u.url}</loc>
    <priority>${u.priority}</priority>
    <changefreq>${u.frequency}</changefreq>
  </url>`).join('\n')}
</urlset>`;
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'sitemap.xml downloaded' });
  };

  return (
    <div>
      <PageHeader
        title="Sitemap"
        description="Configure and manage your XML sitemap"
        onAdd={null} filters={null} onFilter={null} activeFilter={null}
        onSort={null} onExport={null} onImport={null} onSearch={null}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadXml}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <Download className="w-4 h-4" /> Download XML
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        }
      />

      <div className="flex items-start gap-3 mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <span className="shrink-0 font-bold mt-0.5">⚠</span>
        <span><strong>Saved locally.</strong> A sitemap settings endpoint is needed to persist to the database.</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total URLs', value: PREVIEW_URLS.length, icon: Network, colour: 'bg-primary/10 text-primary' },
          { label: 'Pages Included', value: Object.values({ a: form.include_pages, b: form.include_blog, c: form.include_destinations, d: form.include_experiences, e: form.include_packages }).filter(Boolean).length, icon: Check, colour: 'bg-success/10 text-success' },
          { label: 'Auto Generate', value: form.auto_generate, icon: Clock, colour: 'bg-warning/10 text-warning' },
          { label: 'Status', value: form.enabled ? 'Active' : 'Disabled', icon: FileCode, colour: 'bg-violet-100 text-violet-600' },
        ].map(({ label, value, icon: Icon, colour }) => (
          <div key={label} className="bg-white border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colour)}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground capitalize">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings column */}
        <div className="space-y-5">
          <div className="bg-white border border-border rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Sitemap Settings</h3>
            <Toggle label="Enable Sitemap" desc="Serve /sitemap.xml to crawlers" checked={form.enabled} onChange={(v) => set('enabled', v)} />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Auto-Regenerate</label>
              <select
                value={form.auto_generate}
                onChange={(e) => set('auto_generate', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="manual">Manual Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Default Priority</label>
              <select
                value={form.default_priority}
                onChange={(e) => set('default_priority', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                {['1.0', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3'].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Default Change Frequency</label>
              <select
                value={form.default_frequency}
                onChange={(e) => set('default_frequency', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                {['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].map((v) => (
                  <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Include in Sitemap</h3>
            <Toggle label="Static Pages" checked={form.include_pages} onChange={(v) => set('include_pages', v)} />
            <Toggle label="Blog Articles" checked={form.include_blog} onChange={(v) => set('include_blog', v)} />
            <Toggle label="Destinations" checked={form.include_destinations} onChange={(v) => set('include_destinations', v)} />
            <Toggle label="Experiences" checked={form.include_experiences} onChange={(v) => set('include_experiences', v)} />
            <Toggle label="Luxury Packages" checked={form.include_packages} onChange={(v) => set('include_packages', v)} />
            <Toggle label="Gallery" checked={form.include_gallery} onChange={(v) => set('include_gallery', v)} />
          </div>
        </div>

        {/* Preview column */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">sitemap.xml preview</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {['URL', 'Priority', 'Frequency', 'Status'].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PREVIEW_URLS.map((u, i) => (
                    <tr key={u.url} className={cn('border-b border-border last:border-0 hover:bg-muted/20 transition-colors', i % 2 === 1 && 'bg-muted/10')}>
                      <td className="px-4 py-3 text-sm font-mono text-foreground">{u.url}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{u.priority}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{u.frequency}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs text-success">
                          <Check className="w-3 h-3" /> Included
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
