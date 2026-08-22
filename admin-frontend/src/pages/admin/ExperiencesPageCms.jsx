/**
 * ExperiencesPageCms — Experiences Page CMS landing page.
 *
 * Three panels:
 *   1. Page Sections list  — Hero, Listing Settings, CTA, SEO (Configure buttons)
 *   2. Experience Selection — toggle is_active on existing experiences
 *      Reuses useExperiences + useUpdateExperience from use-home.js
 *      API: PATCH /api/v1/home/experiences/:id { is_active: bool }
 *   3. Experience Management shortcut — quick link to /admin/experiences CRUD
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings2,
  Image as ImageIcon, LayoutGrid, Megaphone, Search,
  ExternalLink, Compass, CheckCircle2, Circle,
  Loader2, AlertCircle, Star, Pencil, Plus,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import EmptyState from '@/components/admin/EmptyState';
import { TableSkeleton } from '@/components/admin/SkeletonTable';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import { useExperiences, useUpdateExperience } from '@/hooks/use-home';

const cn = (...c) => c.filter(Boolean).join(' ');

const SECTIONS = [
  {
    id: 'hero', name: 'Hero Section', type: 'Banner',
    description: 'Background image, label, heading, description and overlay opacity',
    path: '/admin/website/experiences/hero', icon: ImageIcon,
    status: 'Published', color: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'listing', name: 'Listing Settings', type: 'Display Config',
    description: 'Category filter, sort order, cards per page and grid style',
    path: '/admin/website/experiences/listing', icon: LayoutGrid,
    status: 'Published', color: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'cta', name: 'CTA Section', type: 'Call to Action',
    description: 'Full-width call-to-action banner — reuses global CTA config',
    path: '/admin/website/experiences/cta', icon: Megaphone,
    status: 'Published', color: 'bg-rose-50 text-rose-600',
  },
  {
    id: 'seo', name: 'SEO', type: 'SEO Settings',
    description: 'Page title, meta description, keywords, canonical URL and OG image',
    path: '/admin/website/experiences/seo', icon: Search,
    status: 'Published', color: 'bg-slate-50 text-slate-600',
  },
];

export default function ExperiencesPageCms() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── Section list ───────────────────────────────────────────────────────────
  const sections = SECTIONS;

  // ── Experience selection state ─────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'active' | 'inactive'

  const {
    data: experiences = [],
    isLoading: expLoading,
    isError: expError,
    error: expErrorObj,
  } = useExperiences();

  const updateMutation = useUpdateExperience({
    onSuccess: (updated) => {
      toast({
        title: updated.is_active ? 'Experience published' : 'Experience set to draft',
        description: updated.title,
      });
    },
    onError: (err) => handleApiError(err, toast),
  });

  const activeExperiences = useMemo(
    () => experiences.filter((e) => e.is_active),
    [experiences],
  );

  const filtered = useMemo(() => {
    let list = experiences;
    if (filterMode === 'active') list = list.filter((e) => e.is_active);
    else if (filterMode === 'inactive') list = list.filter((e) => !e.is_active);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.slug ?? '').toLowerCase().includes(q) ||
          (e.short_description ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [experiences, search, filterMode]);

  const handleToggleActive = (exp) => {
    if (updateMutation.isPending) return;
    updateMutation.mutate({ id: exp.id, formValues: { is_active: !exp.is_active } });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Experiences Page CMS"
        description="Configure page sections, select active experiences and manage records."
        searchPlaceholder="" onSearch={null} onAdd={null} filters={null} onFilter={null}
        activeFilter={null} onSort={null} onExport={null} onImport={null}
        actions={
          <button onClick={() => navigate('/admin/experiences')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/8 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
            <ExternalLink className="w-4 h-4" /> Manage Experiences
          </button>
        }
      />

      {/* ── 1. Page Sections ─────────────────────────────────────────────────── */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-foreground">Page Sections</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Configure each layout section of the Experiences page</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            <span>{sections.length} sections</span>
          </div>
          <div className="space-y-2">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div key={section.id}
                  className="group flex items-center gap-3 p-3 bg-white border rounded-xl transition-all border-border hover:border-primary/30 hover:shadow-soft">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">{index + 1}</div>
                  <div className={cn('w-16 h-12 rounded-lg flex items-center justify-center shrink-0', section.color)}><Icon className="w-5 h-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{section.name}</p>
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground whitespace-nowrap">{section.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{section.description}</p>
                  </div>
                  <StatusBadge status={section.status} className="" />
                  <button onClick={() => navigate(section.path)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary bg-primary/8 rounded-lg hover:bg-primary/10 transition-colors shrink-0">
                    <Settings2 className="w-3.5 h-3.5" /> Configure
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 2. Experience Selection ───────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Experience Selection</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Toggle which experiences are Published on the Experiences page</p>
          </div>
          {activeExperiences.length > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Star className="w-3.5 h-3.5" />
              {activeExperiences.length} active
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <Compass className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Toggle the circle to publish or draft any experience. To edit details, use{' '}
            <button onClick={() => navigate('/admin/experiences')} className="font-medium text-foreground underline underline-offset-2">
              Experience Management
            </button>.
          </p>
        </div>

        {/* Filter + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1 text-sm">
            {[{ key: 'all', label: 'All' }, { key: 'active', label: 'Published' }, { key: 'inactive', label: 'Draft' }].map((f) => (
              <button key={f.key} onClick={() => setFilterMode(f.key)}
                className={cn('px-3 py-1.5 rounded-md font-medium transition-colors', filterMode === f.key ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                {f.label}
                {f.key === 'active' && activeExperiences.length > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold">{activeExperiences.length}</span>
                )}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-0 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input type="search" placeholder="Search experiences…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground" />
          </div>
        </div>

        {expLoading ? (
          <TableSkeleton rows={4} columns={4} selectable={false} />
        ) : expError ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] gap-3 text-destructive bg-white border border-border rounded-xl">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm">{expErrorObj?.message || 'Failed to load experiences'}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-border rounded-xl">
            <EmptyState icon={Compass}
              title={search ? 'No experiences match your search' : 'No experiences found'}
              message={search ? 'Try a different search term.' : 'Add experiences in Experience Management first.'}
              actionLabel="Add Experience" onAction={() => navigate('/admin/experiences')} action={null} />
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="hidden sm:grid grid-cols-[2.5rem_3.5rem_1fr_14rem_6rem_6rem] gap-3 px-4 py-2.5 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span /><span /><span>Experience</span><span>Description</span><span>Status</span><span className="text-right">Edit</span>
            </div>
            <div className="divide-y divide-border">
              {filtered.map((exp) => {
                const isToggling = updateMutation.isPending && updateMutation.variables?.id === exp.id;
                return (
                  <div key={exp.id} className={cn('group grid grid-cols-[2.5rem_3.5rem_1fr] sm:grid-cols-[2.5rem_3.5rem_1fr_14rem_6rem_6rem] gap-3 items-center px-4 py-3 transition-colors hover:bg-muted/20', exp.is_active && 'bg-primary/[0.02]')}>
                    {/* Toggle */}
                    <button onClick={() => handleToggleActive(exp)} disabled={isToggling}
                      title={exp.is_active ? 'Set to Draft' : 'Publish'}
                      className="flex items-center justify-center shrink-0 transition-opacity disabled:opacity-50">
                      {isToggling ? <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        : exp.is_active ? <CheckCircle2 className="w-4 h-4 text-primary" />
                        : <Circle className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />}
                    </button>
                    {/* Thumbnail */}
                    <div className="w-14 h-10 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                      {exp.image_url ? <img src={exp.image_url} alt={exp.title} className="w-full h-full object-cover" />
                        : <Compass className="w-4 h-4 text-muted-foreground/40" />}
                    </div>
                    {/* Title + slug */}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{exp.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{exp.slug || '—'}</p>
                    </div>
                    {/* Description */}
                    <div className="hidden sm:block">
                      <p className="text-xs text-muted-foreground line-clamp-2">{exp.short_description || '—'}</p>
                    </div>
                    {/* Status */}
                    <div className="hidden sm:block">
                      <StatusBadge status={exp.is_active ? 'Published' : 'Draft'} className="" />
                    </div>
                    {/* Edit */}
                    <div className="hidden sm:flex justify-end">
                      <button onClick={() => navigate('/admin/experiences')}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-all"
                        title="Edit in Experience Management">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <p className="mt-2 text-xs text-muted-foreground text-right">
          {filtered.length} experience{filtered.length !== 1 ? 's' : ''} shown{search ? ` matching "${search}"` : ''}
        </p>
      </section>

      {/* ── 3. Experience Management shortcut ────────────────────────────────── */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-foreground">Experience Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Add, edit or remove experience records</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Compass className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Manage All Experiences</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {experiences.length} experience{experiences.length !== 1 ? 's' : ''} ·{' '}
                {activeExperiences.length} published
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => navigate('/admin/experiences')}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft">
              <Plus className="w-4 h-4" /> Add Experience
            </button>
            <button onClick={() => navigate('/admin/experiences')}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors">
              <ExternalLink className="w-4 h-4" /> View All
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
