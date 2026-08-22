/**
 * PageSeo — Per-page SEO management.
 *
 * Backend status: No per-page SEO model exists. Settings saved to localStorage.
 * When a backend endpoint is added, replace the load/persist helpers with
 * useQuery / useMutation calls.
 */
import { useState, useMemo } from 'react';
import { Eye, EyeOff, FileSearch, Loader2, Save } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import Drawer, { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import { useToast } from '@/components/ui/use-toast';

const cn = (...c) => c.filter(Boolean).join(' ');

const DRAFT_KEY = 'page_seo_draft';
const loadDraft = () => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}'); } catch { return {}; } };
const saveDraft = (v) => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(v)); } catch { /**/ } };

const ROBOTS_OPTIONS = [
  { value: 'index, follow', label: 'index, follow' },
  { value: 'noindex, follow', label: 'noindex, follow' },
  { value: 'index, nofollow', label: 'index, nofollow' },
  { value: 'noindex, nofollow', label: 'noindex, nofollow' },
];

const TWITTER_OPTIONS = [
  { value: 'summary_large_image', label: 'Summary Large Image' },
  { value: 'summary', label: 'Summary' },
];

const PAGES = [
  { id: 'home', label: 'Home', url: '/' },
  { id: 'about', label: 'About', url: '/about' },
  { id: 'destinations', label: 'Destinations', url: '/destinations' },
  { id: 'experiences', label: 'Experiences', url: '/experiences' },
  { id: 'packages', label: 'Luxury Packages', url: '/packages' },
  { id: 'gallery', label: 'Gallery', url: '/gallery' },
  { id: 'blog', label: 'Blog', url: '/blog' },
  { id: 'contact', label: 'Contact', url: '/contact' },
  { id: 'plan-journey', label: 'Plan My Journey', url: '/plan-my-journey' },
  { id: 'privacy', label: 'Privacy Policy', url: '/privacy-policy' },
  { id: 'terms', label: 'Terms & Conditions', url: '/terms' },
];

const EMPTY_SEO = {
  meta_title: '', meta_description: '', meta_keywords: '',
  canonical_url: '', robots: 'index, follow',
  og_title: '', og_description: '',
  twitter_card: 'summary_large_image', twitter_title: '', twitter_description: '',
  schema_json: '',
};

const TITLE_MAX = 60;
const DESC_MAX = 160;

function scoreForPage(data) {
  if (!data) return 0;
  let s = 0;
  if (data.meta_title) s += 30;
  if (data.meta_description) s += 30;
  if (data.meta_keywords) s += 10;
  if (data.og_title || data.og_description) s += 15;
  if (data.schema_json) s += 15;
  return s;
}

function ScoreBadge({ score }) {
  if (score >= 85) return <span className="text-xs font-bold text-success">{score}</span>;
  if (score >= 60) return <span className="text-xs font-bold text-warning">{score}</span>;
  return <span className="text-xs font-bold text-destructive">{score}</span>;
}

export default function PageSeo() {
  const { toast } = useToast();
  const [allData, setAllData] = useState(() => loadDraft());
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editPage, setEditPage] = useState(null);
  const [form, setForm] = useState(EMPTY_SEO);
  const [previewOpen, setPreviewOpen] = useState(true);

  const filtered = useMemo(() => {
    if (!search.trim()) return PAGES;
    const q = search.toLowerCase();
    return PAGES.filter((p) => p.label.toLowerCase().includes(q) || p.url.includes(q));
  }, [search]);

  const openEdit = (page) => {
    setEditPage(page);
    setForm({ ...EMPTY_SEO, ...(allData[page.id] ?? {}) });
    setDrawerOpen(true);
  };

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = () => {
    const updated = { ...allData, [editPage.id]: form };
    setAllData(updated);
    saveDraft(updated);
    toast({ title: `SEO saved for ${editPage.label}` });
    setDrawerOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Page SEO"
        description="Manage SEO settings for individual pages"
        searchPlaceholder="Search pages..."
        onSearch={setSearch}
        onAdd={null} filters={null} onFilter={null} activeFilter={null}
        onSort={null} onExport={null} onImport={null}
      />

      <div className="flex items-start gap-3 mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <span className="shrink-0 font-bold mt-0.5">⚠</span>
        <span>
          <strong>Saved locally.</strong> A per-page SEO endpoint is needed to persist to the database.
          Settings are stored in <code className="bg-amber-100 px-1 rounded text-xs">localStorage</code> until then.
        </span>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_10rem_6rem_6rem] gap-3 px-4 py-2.5 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>Page</span>
          <span>Meta Title</span>
          <span>Score</span>
          <span />
        </div>
        <div className="divide-y divide-border">
          {filtered.map((page) => {
            const data = allData[page.id];
            const score = scoreForPage(data);
            return (
              <div
                key={page.id}
                onClick={() => openEdit(page)}
                className="group grid grid-cols-[1fr_10rem_6rem_6rem] gap-3 items-center px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <FileSearch className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{page.label}</p>
                    <p className="text-xs text-muted-foreground font-mono">{page.url}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground truncate">{data?.meta_title || '—'}</p>
                <ScoreBadge score={score} />
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(page); }}
                    className="px-2.5 py-1.5 text-xs font-medium text-primary bg-primary/8 rounded-lg hover:bg-primary/12 transition-colors"
                  >
                    Edit SEO
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={`SEO: ${editPage?.label}`}
        description={editPage?.url}
        tabs={['Meta', 'Open Graph', 'Twitter', 'Schema', 'Preview']}
        width="xl"
        onSave={handleSave}
        isSaving={false}
      >
        {(tab) => (
          <div className="space-y-5">
            {tab === 'Meta' && (
              <>
                <DrawerField
                  label="Meta Title"
                  hint={`${(form.meta_title ?? '').length}/${TITLE_MAX} · Recommended: 50–60`}
                >
                  <DrawerInput value={form.meta_title} onChange={(e) => set('meta_title', e.target.value)} placeholder="Page title for search engines" maxLength={TITLE_MAX + 20} />
                </DrawerField>
                <DrawerField
                  label="Meta Description"
                  hint={`${(form.meta_description ?? '').length}/${DESC_MAX} · Recommended: 120–160`}
                >
                  <DrawerInput textarea value={form.meta_description} onChange={(e) => set('meta_description', e.target.value)} placeholder="Brief page description..." maxLength={DESC_MAX + 20} />
                </DrawerField>
                <DrawerField label="Keywords" hint="Comma-separated">
                  <DrawerInput value={form.meta_keywords} onChange={(e) => set('meta_keywords', e.target.value)} placeholder="keyword1, keyword2, keyword3" maxLength={500} />
                </DrawerField>
                <div className="grid grid-cols-2 gap-4">
                  <DrawerField label="Canonical URL">
                    <DrawerInput value={form.canonical_url} onChange={(e) => set('canonical_url', e.target.value)} placeholder={`https://yourdomain.com${editPage?.url}`} maxLength={1024} />
                  </DrawerField>
                  <DrawerField label="Robots">
                    <DrawerSelect value={form.robots} onChange={(e) => set('robots', e.target.value)} options={ROBOTS_OPTIONS} />
                  </DrawerField>
                </div>
              </>
            )}
            {tab === 'Open Graph' && (
              <>
                <DrawerField label="OG Title">
                  <DrawerInput value={form.og_title} onChange={(e) => set('og_title', e.target.value)} placeholder="Falls back to meta title" maxLength={255} />
                </DrawerField>
                <DrawerField label="OG Description">
                  <DrawerInput textarea value={form.og_description} onChange={(e) => set('og_description', e.target.value)} placeholder="Falls back to meta description" maxLength={500} />
                </DrawerField>
              </>
            )}
            {tab === 'Twitter' && (
              <>
                <DrawerField label="Twitter Card Type">
                  <DrawerSelect value={form.twitter_card} onChange={(e) => set('twitter_card', e.target.value)} options={TWITTER_OPTIONS} />
                </DrawerField>
                <DrawerField label="Twitter Title">
                  <DrawerInput value={form.twitter_title} onChange={(e) => set('twitter_title', e.target.value)} placeholder="Falls back to OG / meta title" maxLength={255} />
                </DrawerField>
                <DrawerField label="Twitter Description">
                  <DrawerInput textarea value={form.twitter_description} onChange={(e) => set('twitter_description', e.target.value)} placeholder="Falls back to OG / meta description" maxLength={500} />
                </DrawerField>
              </>
            )}
            {tab === 'Schema' && (
              <DrawerField label="Schema JSON-LD" hint='Valid JSON-LD e.g. {"@context":"https://schema.org",...}'>
                <DrawerInput textarea value={form.schema_json} onChange={(e) => set('schema_json', e.target.value)} placeholder='{"@context": "https://schema.org", "@type": "WebPage", ...}' maxLength={10000} />
              </DrawerField>
            )}
            {tab === 'Preview' && (
              <div className="space-y-5">
                <div className="bg-white border border-border rounded-xl p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Google Search Preview</p>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground">G</div>
                    <span className="text-xs text-muted-foreground">yourdomain.com{editPage?.url}</span>
                  </div>
                  <p className="text-base font-medium text-blue-700 leading-snug line-clamp-1">
                    {form.meta_title?.trim() || <span className="text-muted-foreground italic font-normal text-sm">No title set</span>}
                  </p>
                  <p className="text-sm text-muted-foreground leading-snug line-clamp-2 mt-0.5">
                    {form.meta_description?.trim() || 'Add a meta description to see a preview.'}
                  </p>
                </div>
                <div className="rounded-xl border border-border overflow-hidden max-w-sm">
                  <div className="aspect-[1.91/1] bg-muted flex items-center justify-center text-xs text-muted-foreground">OG image (set via Global SEO)</div>
                  <div className="p-3 bg-muted/30">
                    <p className="text-[10px] text-muted-foreground uppercase">yourdomain.com</p>
                    <p className="text-xs font-semibold text-foreground mt-0.5 line-clamp-1">
                      {form.og_title?.trim() || form.meta_title?.trim() || 'OG title not set'}
                    </p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                      {form.og_description?.trim() || form.meta_description?.trim() || 'OG description not set'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
