import React, { useEffect, useState } from 'react';
import { FileSearch, Globe, Eye, Loader2, AlertCircle, Save } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import Drawer, { DrawerField, DrawerInput } from '@/components/admin/Drawer';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import { usePageSeoList, useUpdatePageSeo } from '@/hooks/use-seo';

const cn = (...c) => c.filter(Boolean).join(' ');

const scoreColor = (score) =>
  score >= 85 ? 'text-success' : score >= 70 ? 'text-warning' : 'text-destructive';

const scoreBg = (score) =>
  score >= 85 ? 'bg-success/10' : score >= 70 ? 'bg-warning/10' : 'bg-destructive/10';

/** Derive a simple 0-100 score from available fields */
function deriveScore(page) {
  let score = 0;
  if (page.meta_title) score += 20;
  if (page.meta_description) score += 20;
  if (page.canonical_url) score += 10;
  if (page.og_title) score += 10;
  if (page.og_description) score += 10;
  if (page.og_image) score += 10;
  if (page.keywords) score += 10;
  if (page.robots) score += 10;
  return score;
}

export default function PageSeo() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(null);

  const { data: pages = [], isLoading, isError, error } = usePageSeoList();

  const updateMutation = useUpdatePageSeo({
    onSuccess: () => {
      toast({ title: 'Page SEO saved', description: `Changes for "${editItem?.page_key}" saved.` });
      setDrawerOpen(false);
    },
    onError: (err) => handleApiError(err, toast),
  });

  const isSaving = updateMutation.isPending;

  const filtered = pages.filter((p) =>
    p.page_key.toLowerCase().includes(search.toLowerCase()) ||
    (p.meta_title ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  const openEdit = (page) => {
    setEditItem(page);
    setForm({ ...page });
    setDrawerOpen(true);
  };

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = () => {
    if (!form || isSaving) return;
    const { id, page_key, created_at, updated_at, og_image, twitter_image, ...payload } = form;
    updateMutation.mutate({ pageKey: page_key, data: payload });
  };

  // Loading state
  if (isLoading) {
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
        <p className="text-sm">{error?.message || 'Failed to load page SEO records'}</p>
      </div>
    );
  }

  const optimized = filtered.filter((p) => deriveScore(p) >= 80).length;
  const avgScore = filtered.length
    ? Math.round(filtered.reduce((sum, p) => sum + deriveScore(p), 0) / filtered.length)
    : 0;

  return (
    <div>
      <PageHeader
        title="Page SEO"
        description="Manage SEO settings for individual pages"
        searchPlaceholder="Search pages…"
        onSearch={setSearch}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Page List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <p className="text-sm font-semibold text-foreground">{filtered.length} Pages</p>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileSearch className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">No pages found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {search ? 'Try a different search term.' : 'No page SEO records have been created yet.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((page) => {
                  const score = deriveScore(page);
                  return (
                    <div
                      key={page.id}
                      onClick={() => openEdit(page)}
                      className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/50 cursor-pointer transition-colors group"
                    >
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', scoreBg(score))}>
                        <FileSearch className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {page.page_key}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {page.slug || page.canonical_url || `/${page.page_key}`}
                        </p>
                      </div>
                      <div className="hidden sm:block max-w-xs truncate">
                        <p className="text-xs text-muted-foreground truncate">
                          {page.meta_title || <span className="italic">No title set</span>}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn('text-lg font-bold', scoreColor(score))}>{score}</p>
                        <p className="text-[10px] text-muted-foreground">SEO Score</p>
                      </div>
                      <span className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded-full',
                        page.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground',
                      )}>
                        {page.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">SEO Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Optimized Pages</span>
                <span className="text-lg font-bold text-success">{optimized}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Pages</span>
                <span className="text-lg font-bold text-foreground">{filtered.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Score</span>
                <span className="text-lg font-bold text-foreground">{avgScore}</span>
              </div>
            </div>
            {filtered.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success rounded-full"
                      style={{ width: `${(optimized / filtered.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round((optimized / filtered.length) * 100)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {optimized} of {filtered.length} pages optimized
                </p>
              </div>
            )}
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors">
                <Globe className="w-4 h-4 text-primary" /> View Sitemap Settings
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors">
                <Eye className="w-4 h-4 text-primary" /> Preview Search Results
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={`SEO: ${editItem?.page_key || ''}`}
        description={editItem?.slug || editItem?.canonical_url || ''}
        tabs={['Meta', 'OpenGraph', 'Twitter', 'Advanced']}
        width="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        }
      >
        {(tab) =>
          form && (
            <div className="space-y-5">
              {tab === 'Meta' && (
                <>
                  <DrawerField label="Meta Title" hint="50-60 characters recommended">
                    <DrawerInput
                      value={form.meta_title ?? ''}
                      onChange={(e) => handleChange('meta_title', e.target.value)}
                      placeholder="Page title for search engines"
                      maxLength={60}
                    />
                  </DrawerField>
                  <DrawerField label="Meta Description" hint="150-160 characters recommended">
                    <DrawerInput
                      textarea
                      value={form.meta_description ?? ''}
                      onChange={(e) => handleChange('meta_description', e.target.value)}
                      placeholder="Brief page description for search results…"
                    />
                  </DrawerField>
                  <DrawerField label="Keywords">
                    <DrawerInput
                      value={form.keywords ?? ''}
                      onChange={(e) => handleChange('keywords', e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </DrawerField>
                  <DrawerField label="Canonical URL">
                    <DrawerInput
                      value={form.canonical_url ?? ''}
                      onChange={(e) => handleChange('canonical_url', e.target.value)}
                      placeholder="https://pureluxeholidays.com/..."
                    />
                  </DrawerField>
                  <DrawerField label="Robots">
                    <select
                      value={form.robots ?? 'index, follow'}
                      onChange={(e) => handleChange('robots', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                      <option value="index, follow">index, follow</option>
                      <option value="noindex, follow">noindex, follow</option>
                      <option value="index, nofollow">index, nofollow</option>
                      <option value="noindex, nofollow">noindex, nofollow</option>
                    </select>
                  </DrawerField>
                  <DrawerField label="Active">
                    <button
                      type="button"
                      onClick={() => handleChange('is_active', !form.is_active)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${form.is_active ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-soft transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </DrawerField>
                </>
              )}
              {tab === 'OpenGraph' && (
                <>
                  <DrawerField label="OG Title">
                    <DrawerInput
                      value={form.og_title ?? ''}
                      onChange={(e) => handleChange('og_title', e.target.value)}
                      placeholder="Open Graph title…"
                    />
                  </DrawerField>
                  <DrawerField label="OG Description">
                    <DrawerInput
                      textarea
                      value={form.og_description ?? ''}
                      onChange={(e) => handleChange('og_description', e.target.value)}
                    />
                  </DrawerField>
                  {form.og_image && (
                    <DrawerField label="Current OG Image">
                      <img
                        src={form.og_image.full_url || form.og_image.file_url}
                        alt={form.og_image.alt_text || 'OG image'}
                        className="w-full max-h-40 object-cover rounded-lg border border-border"
                      />
                    </DrawerField>
                  )}
                </>
              )}
              {tab === 'Twitter' && (
                <>
                  <DrawerField label="Twitter Title">
                    <DrawerInput
                      value={form.twitter_title ?? ''}
                      onChange={(e) => handleChange('twitter_title', e.target.value)}
                      placeholder="Twitter card title…"
                    />
                  </DrawerField>
                  <DrawerField label="Twitter Description">
                    <DrawerInput
                      textarea
                      value={form.twitter_description ?? ''}
                      onChange={(e) => handleChange('twitter_description', e.target.value)}
                    />
                  </DrawerField>
                  {form.twitter_image && (
                    <DrawerField label="Current Twitter Image">
                      <img
                        src={form.twitter_image.full_url || form.twitter_image.file_url}
                        alt={form.twitter_image.alt_text || 'Twitter image'}
                        className="w-full max-h-40 object-cover rounded-lg border border-border"
                      />
                    </DrawerField>
                  )}
                </>
              )}
              {tab === 'Advanced' && (
                <>
                  <DrawerField label="Slug">
                    <DrawerInput
                      value={form.slug ?? ''}
                      onChange={(e) => handleChange('slug', e.target.value)}
                      placeholder="/page-slug"
                    />
                  </DrawerField>
                  <DrawerField label="Sitemap Priority" hint="0.0 – 1.0">
                    <DrawerInput
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={form.priority ?? ''}
                      onChange={(e) => handleChange('priority', e.target.value ? Number(e.target.value) : null)}
                      placeholder="0.5"
                    />
                  </DrawerField>
                  <DrawerField label="Change Frequency">
                    <select
                      value={form.change_frequency ?? 'weekly'}
                      onChange={(e) => handleChange('change_frequency', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                      <option value="always">always</option>
                      <option value="hourly">hourly</option>
                      <option value="daily">daily</option>
                      <option value="weekly">weekly</option>
                      <option value="monthly">monthly</option>
                      <option value="yearly">yearly</option>
                      <option value="never">never</option>
                    </select>
                  </DrawerField>
                  <DrawerField label="Include in Sitemap">
                    <button
                      type="button"
                      onClick={() => handleChange('include_in_sitemap', !form.include_in_sitemap)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${form.include_in_sitemap ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-soft transition-transform ${form.include_in_sitemap ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </DrawerField>
                  <DrawerField label="Schema JSON (JSON-LD)">
                    <textarea
                      value={form.schema_json ?? ''}
                      onChange={(e) => handleChange('schema_json', e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 text-sm font-mono bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-y"
                      placeholder={'{\n  "@context": "https://schema.org"\n}'}
                    />
                  </DrawerField>
                </>
              )}
            </div>
          )
        }
      </Drawer>
    </div>
  );
}
