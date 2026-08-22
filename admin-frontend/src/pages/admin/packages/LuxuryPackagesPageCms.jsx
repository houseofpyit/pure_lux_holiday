/**
 * LuxuryPackagesPageCms — Luxury Packages Page CMS landing page.
 *
 * Three panels:
 *   1. Page Sections list  — Hero, Listing Settings, CTA, SEO (Configure buttons)
 *   2. Package Selection — toggle is_active on existing packages
 *      Reuses usePackagesList + useUpdatePackage from use-packages.js
 *      API: PATCH /api/v1/packages/:id { is_active: bool }
 *   3. Package Management shortcut — quick link to /admin/packages CRUD
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
import { usePackagesList, useUpdatePackage } from '@/hooks/use-packages';

const cn = (...c) => c.filter(Boolean).join(' ');

const SECTIONS = [
  {
    id: 'hero', name: 'Hero Section', type: 'Banner',
    description: 'Background image, label, heading, description and overlay opacity',
    path: '/admin/website/packages/hero', icon: ImageIcon,
    status: 'Published', color: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'listing', name: 'Listing Settings', type: 'Display Config',
    description: 'Category filter, sort order, cards per page and grid style',
    path: '/admin/website/packages/listing', icon: LayoutGrid,
    status: 'Published', color: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'cta', name: 'CTA Section', type: 'Call to Action',
    description: 'Full-width call-to-action banner — reuses global CTA config',
    path: '/admin/website/packages/cta', icon: Megaphone,
    status: 'Published', color: 'bg-rose-50 text-rose-600',
  },
  {
    id: 'seo', name: 'SEO', type: 'SEO Settings',
    description: 'Page title, meta description, keywords, canonical URL and OG image',
    path: '/admin/website/packages/seo', icon: Search,
    status: 'Published', color: 'bg-slate-50 text-slate-600',
  },
];

export default function LuxuryPackagesPageCms() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── Section list ───────────────────────────────────────────────────────────
  const sections = SECTIONS;

  // ── Package selection state ─────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'active' | 'inactive'

  const {
    data: packages = [],
    isLoading: pkgLoading,
    isError: pkgError,
    error: pkgErrorObj,
  } = usePackagesList();

  const updateMutation = useUpdatePackage({
    onSuccess: (updated) => {
      toast({
        title: updated.is_active ? 'Package published' : 'Package set to draft',
        description: updated.title || updated.name || 'Package updated',
      });
    },
    onError: (err) => handleApiError(err, toast),
  });

  const activePackages = useMemo(
    () => packages.filter((p) => p.is_active),
    [packages],
  );

  const filtered = useMemo(() => {
    let list = packages;
    if (filterMode === 'active') list = list.filter((p) => p.is_active);
    else if (filterMode === 'inactive') list = list.filter((p) => !p.is_active);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          (p.title || p.name || '').toLowerCase().includes(q) ||
          (p.slug ?? '').toLowerCase().includes(q) ||
          (p.short_description ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [packages, search, filterMode]);

  const handleToggleActive = (pkg) => {
    if (updateMutation.isPending) return;
    updateMutation.mutate({ id: pkg.id, formValues: { is_active: !pkg.is_active } });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Luxury Packages Page CMS"
        description="Configure page sections, select active packages and manage records."
        searchPlaceholder="" onSearch={null} onAdd={null} filters={null} onFilter={null}
        activeFilter={null} onSort={null} onExport={null} onImport={null}
        actions={
          <button onClick={() => navigate('/admin/packages')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/8 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
            <ExternalLink className="w-4 h-4" /> Manage Packages
          </button>
        }
      />

      {/* ── 1. Page Sections ─────────────────────────────────────────────────── */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-foreground">Page Sections</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Configure each layout section of the Luxury Packages page</p>
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

      {/* ── 2. Package Selection ───────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Package Selection</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Toggle which packages are Published on the Luxury Packages page</p>
          </div>
          {activePackages.length > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Star className="w-3.5 h-3.5" />
              {activePackages.length} active
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <Compass className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Toggle the circle to publish or draft any package. To edit details, use{' '}
            <button onClick={() => navigate('/admin/packages')} className="font-medium text-foreground underline underline-offset-2">
              Package Management
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
                {f.key === 'active' && activePackages.length > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold">{activePackages.length}</span>
                )}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-0 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input type="search" placeholder="Search packages…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground" />
          </div>
        </div>

        {pkgLoading ? (
          <TableSkeleton rows={4} columns={4} selectable={false} />
        ) : pkgError ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] gap-3 text-destructive bg-white border border-border rounded-xl">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm">{pkgErrorObj?.message || 'Failed to load packages'}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-border rounded-xl">
            <EmptyState icon={Compass}
              title={search ? 'No packages match your search' : 'No packages found'}
              message={search ? 'Try a different search term.' : 'Add packages in Package Management first.'}
              actionLabel="Add Package" onAction={() => navigate('/admin/packages')} action={null} />
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="hidden sm:grid grid-cols-[2.5rem_3.5rem_1fr_14rem_6rem_6rem] gap-3 px-4 py-2.5 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span /><span /><span>Package</span><span>Description</span><span>Status</span><span className="text-right">Edit</span>
            </div>
            <div className="divide-y divide-border">
              {filtered.map((pkg) => {
                const isToggling = updateMutation.isPending && updateMutation.variables?.id === pkg.id;
                return (
                  <div key={pkg.id} className={cn('group grid grid-cols-[2.5rem_3.5rem_1fr] sm:grid-cols-[2.5rem_3.5rem_1fr_14rem_6rem_6rem] gap-3 items-center px-4 py-3 transition-colors hover:bg-muted/20', pkg.is_active && 'bg-primary/[0.02]')}>
                    {/* Toggle */}
                    <button onClick={() => handleToggleActive(pkg)} disabled={isToggling}
                      title={pkg.is_active ? 'Set to Draft' : 'Publish'}
                      className="flex items-center justify-center shrink-0 transition-opacity disabled:opacity-50">
                      {isToggling ? <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        : pkg.is_active ? <CheckCircle2 className="w-4 h-4 text-primary" />
                        : <Circle className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />}
                    </button>
                    {/* Thumbnail */}
                    <div className="w-14 h-10 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                      {pkg.image_url ? <img src={pkg.image_url} alt={pkg.title || pkg.name} className="w-full h-full object-cover" />
                        : <Compass className="w-4 h-4 text-muted-foreground/40" />}
                    </div>
                    {/* Title + slug */}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{pkg.title || pkg.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{pkg.slug || '—'}</p>
                    </div>
                    {/* Description */}
                    <div className="hidden sm:block">
                      <p className="text-xs text-muted-foreground line-clamp-2">{pkg.short_description || '—'}</p>
                    </div>
                    {/* Status */}
                    <div className="hidden sm:block">
                      <StatusBadge status={pkg.is_active ? 'Published' : 'Draft'} className="" />
                    </div>
                    {/* Edit */}
                    <div className="hidden sm:flex justify-end">
                      <button onClick={() => navigate('/admin/packages')}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-all"
                        title="Edit in Package Management">
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
          {filtered.length} package{filtered.length !== 1 ? 's' : ''} shown{search ? ` matching "${search}"` : ''}
        </p>
      </section>

      {/* ── 3. Package Management shortcut ────────────────────────────────── */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-foreground">Package Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Add, edit or remove package records</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Compass className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Manage All Packages</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {packages.length} package{packages.length !== 1 ? 's' : ''} ·{' '}
                {activePackages.length} published
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => navigate('/admin/packages')}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft">
              <Plus className="w-4 h-4" /> Add Package
            </button>
            <button onClick={() => navigate('/admin/packages')}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors">
              <ExternalLink className="w-4 h-4" /> View All
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}