/**
 * DestinationsPageCms — Destinations Page CMS landing page.
 *
 * Three panels on one page:
 *
 *   1. Page Sections list — Hero, Listing Settings, CTA, SEO (Configure buttons)
 *   2. Destination Selection — toggle is_featured on existing destinations
 *      (same pattern as TravelJournalCms). Reuses useFeaturedDestinations +
 *      useUpdateFeaturedDestination from use-home.js.
 *   3. Destination Management shortcut — quick link to the CRUD module.
 *
 * Architecture:
 *   Component → useFeaturedDestinations / useUpdateFeaturedDestination
 *             → HomeService → home.api.js → /api/v1/home/destinations → Backend
 *
 * Featured toggle writes: PATCH /api/v1/home/destinations/:id { is_featured: bool }
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings2,
  Image as ImageIcon, LayoutGrid, Megaphone, Search,
  ExternalLink, MapPin, CheckCircle2, Circle, Loader2,
  AlertCircle, Star, Pencil, Plus,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import EmptyState from '@/components/admin/EmptyState';
import { TableSkeleton } from '@/components/admin/SkeletonTable';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import {
  useFeaturedDestinations,
  useUpdateFeaturedDestination,
} from '@/hooks/use-home';

const cn = (...c) => c.filter(Boolean).join(' ');

// ─── Section Registry ─────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 'hero',
    name: 'Hero Section',
    type: 'Banner',
    description: 'Background image, label, heading, description and overlay opacity',
    path: '/admin/website/destinations/hero',
    icon: ImageIcon,
    status: 'Published',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'listing',
    name: 'Listing Settings',
    type: 'Display Config',
    description: 'Category filter, sort order, cards per page and display style',
    path: '/admin/website/destinations/listing',
    icon: LayoutGrid,
    status: 'Published',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'cta',
    name: 'CTA Section',
    type: 'Call to Action',
    description: 'Full-width call-to-action banner — reuses global CTA config',
    path: '/admin/website/destinations/cta',
    icon: Megaphone,
    status: 'Published',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    id: 'seo',
    name: 'SEO',
    type: 'SEO Settings',
    description: 'Page title, meta description and Open Graph tags',
    path: '/admin/website/destinations/seo',
    icon: Search,
    status: 'Published',
    color: 'bg-slate-50 text-slate-600',
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DestinationsPageCms() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── Section list ─────────────────────────────────────────────────────────
  const sections = SECTIONS;

  // ── Destination selection state ──────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'featured' | 'published'

  const {
    data: destinations = [],
    isLoading: destLoading,
    isError: destError,
    error: destErrorObj,
  } = useFeaturedDestinations();

  const updateMutation = useUpdateFeaturedDestination({
    onSuccess: (updated) => {
      toast({
        title: updated.is_featured ? 'Added to Featured' : 'Removed from Featured',
        description: updated.name,
      });
    },
    onError: (err) => handleApiError(err, toast),
  });

  const featuredDestinations = useMemo(
    () => destinations.filter((d) => d.is_featured),
    [destinations],
  );

  const filtered = useMemo(() => {
    let list = destinations;
    if (filterMode === 'featured') list = list.filter((d) => d.is_featured);
    else if (filterMode === 'published') list = list.filter((d) => d.is_active);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.country ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [destinations, search, filterMode]);

  const handleToggleFeatured = (dest) => {
    if (updateMutation.isPending) return;
    updateMutation.mutate({ id: dest.id, formValues: { is_featured: !dest.is_featured } });
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader
        title="Destinations Page CMS"
        description="Configure page sections, select featured destinations and manage records."
        searchPlaceholder=""
        onSearch={null}
        onAdd={null}
        filters={null}
        onFilter={null}
        activeFilter={null}
        onSort={null}
        onExport={null}
        onImport={null}
        actions={
          <button
            onClick={() => navigate('/admin/destinations')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/8 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Manage Destinations
          </button>
        }
      />

      {/* ── 1. Page Sections ──────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Page Sections</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Configure each layout section of the Destinations page</p>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            <span>{sections.length} sections</span>
          </div>

          <div className="space-y-2">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.id}
                  className="group flex items-center gap-3 p-3 bg-white border rounded-xl transition-all border-border hover:border-primary/30 hover:shadow-soft"
                >

                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                    {index + 1}
                  </div>

                  <div className={cn('w-16 h-12 rounded-lg flex items-center justify-center shrink-0', section.color)}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{section.name}</p>
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground whitespace-nowrap">
                        {section.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{section.description}</p>
                  </div>

                  <StatusBadge status={section.status} className="" />

                  <button
                    onClick={() => navigate(section.path)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary bg-primary/8 rounded-lg hover:bg-primary/10 transition-colors shrink-0"
                  >
                    <Settings2 className="w-3.5 h-3.5" /> Configure
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 2. Destination Selection ──────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Destination Selection</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Toggle which destinations are marked as Featured on the Destinations page
            </p>
          </div>
          {featuredDestinations.length > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Star className="w-3.5 h-3.5" />
              {featuredDestinations.length} featured
            </div>
          )}
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Toggle the star on any destination to mark it as featured. To edit destination details (name, image, country), use{' '}
            <button
              onClick={() => navigate('/admin/destinations')}
              className="font-medium text-foreground underline underline-offset-2"
            >
              Destination Management
            </button>.
          </p>
        </div>

        {/* Filter + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1 text-sm">
            {[
              { key: 'all', label: 'All' },
              { key: 'featured', label: 'Featured' },
              { key: 'published', label: 'Published' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterMode(f.key)}
                className={cn(
                  'px-3 py-1.5 rounded-md font-medium transition-colors',
                  filterMode === f.key
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {f.label}
                {f.key === 'featured' && featuredDestinations.length > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold">
                    {featuredDestinations.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative flex-1 min-w-0 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              placeholder="Search destinations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Destination list */}
        {destLoading ? (
          <TableSkeleton rows={4} columns={4} selectable={false} />
        ) : destError ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] gap-3 text-destructive bg-white border border-border rounded-xl">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm">{destErrorObj?.message || 'Failed to load destinations'}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-border rounded-xl">
            <EmptyState
              icon={MapPin}
              title={search ? 'No destinations match your search' : 'No destinations found'}
              message={
                search
                  ? 'Try a different search term.'
                  : 'Add destinations in Destination Management first.'
              }
              actionLabel="Add Destination"
              onAction={() => navigate('/admin/destinations')}
              action={null}
            />
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-[2.5rem_3.5rem_1fr_8rem_6rem_6rem] gap-3 px-4 py-2.5 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span />
              <span />
              <span>Destination</span>
              <span>Country</span>
              <span>Visibility</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y divide-border">
              {filtered.map((dest) => {
                const isToggling =
                  updateMutation.isPending &&
                  updateMutation.variables?.id === dest.id;

                return (
                  <div
                    key={dest.id}
                    className={cn(
                      'group grid grid-cols-[2.5rem_3.5rem_1fr] sm:grid-cols-[2.5rem_3.5rem_1fr_8rem_6rem_6rem] gap-3 items-center px-4 py-3 transition-colors hover:bg-muted/20',
                      dest.is_featured && 'bg-amber-50/40',
                    )}
                  >
                    {/* Feature toggle */}
                    <button
                      onClick={() => handleToggleFeatured(dest)}
                      disabled={isToggling}
                      title={dest.is_featured ? 'Remove from featured' : 'Mark as featured'}
                      className="flex items-center justify-center shrink-0 transition-opacity disabled:opacity-50"
                    >
                      {isToggling ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      ) : dest.is_featured ? (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                      )}
                    </button>

                    {/* Thumbnail */}
                    <div className="w-14 h-10 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                      {dest.image_url ? (
                        <img src={dest.image_url} alt={dest.name} className="w-full h-full object-cover" />
                      ) : (
                        <MapPin className="w-4 h-4 text-muted-foreground/40" />
                      )}
                    </div>

                    {/* Name + slug */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-foreground truncate">{dest.name}</p>
                        {dest.is_featured && (
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{dest.slug || '—'}</p>
                    </div>

                    {/* Country */}
                    <div className="hidden sm:block">
                      {dest.country ? (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-md bg-muted text-muted-foreground truncate max-w-[7.5rem]">
                          {dest.country}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">—</span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="hidden sm:block">
                      <StatusBadge
                        status={dest.is_active ? 'Published' : 'Draft'}
                        className=""
                      />
                    </div>

                    {/* Edit shortcut */}
                    <div className="hidden sm:flex justify-end">
                      <button
                        onClick={() => navigate('/admin/destinations')}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-all"
                        title="Edit in Destination Management"
                      >
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
          {filtered.length} destination{filtered.length !== 1 ? 's' : ''} shown
          {search ? ` matching "${search}"` : ''}
        </p>
      </section>

      {/* ── 3. Destination Management shortcut ───────────────────────────── */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-foreground">Destination Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add, edit or remove destination records
          </p>
        </div>

        <div className="bg-white border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Manage All Destinations</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {destinations.length} destination{destinations.length !== 1 ? 's' : ''} ·{' '}
                {featuredDestinations.length} featured
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/admin/destinations')}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft"
            >
              <Plus className="w-4 h-4" /> Add Destination
            </button>
            <button
              onClick={() => navigate('/admin/destinations')}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> View All
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
