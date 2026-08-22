/**
 * Destinations — FeaturedDestination CRUD (Phase 3.1 upgrade)
 *
 * Backend entity: FeaturedDestination (home module, /api/v1/home/destinations)
 * Tabs: General · Media · Content · Settings
 *
 * ─── Backend Compatibility Report ───────────────────────────────────────────
 * Available fields: name, slug, country, short_description, image_id,
 *                   button_text, button_url, display_order, is_featured, is_active
 *
 * Child resources requested vs available:
 *   Gallery          — ❌ No backend table (DestinationGallery does not exist)
 *   Highlights       — ❌ No backend table
 *   Things To Do     — ❌ No backend table
 *   Best Time        — ❌ No backend table
 *   Travel Tips      — ❌ No backend table
 *   Nearby Attractions — ❌ No backend table
 *   FAQs             — ❌ No backend table
 *   SEO fields       — ❌ No columns on FeaturedDestination model
 *
 * Only backend-supported fields and endpoints are implemented.
 * No APIs are invented.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Star, Image as ImageIcon, Loader2, AlertCircle,
  Pencil, Trash2, Power, Plus, X,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import Pagination from '@/components/admin/Pagination';
import Drawer, { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { TableSkeleton } from '@/components/admin/SkeletonTable';
import MediaUploader from '@/components/media/MediaUploader';
import MediaPicker from '@/components/media/MediaPicker';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import { buildMediaUrl } from '@/services/media.service';
import {
  useFeaturedDestinations,
  useCreateFeaturedDestination,
  useUpdateFeaturedDestination,
  useDeleteFeaturedDestination,
} from '@/hooks/use-home';

const cn = (...c) => c.filter(Boolean).join(' ');
const PER_PAGE = 10;

const TABS = ['General', 'Media', 'Content', 'Settings'];

const EMPTY_FORM = {
  name: '',
  slug: '',
  country: '',
  short_description: '',
  image_id: null,
  image_url: null,
  button_text: '',
  button_url: '',
  display_order: 0,
  is_featured: false,
  is_active: true,
};

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function defaultButtonUrl(slug) {
  return slug ? `/destinations?destination=${slug}` : '';
}

function isAutoButtonUrl(url, slug) {
  if (!url || !slug) return !url?.trim();
  const trimmed = url.trim();
  return (
    trimmed === `/destinations/${slug}` ||
    trimmed === `/destinations?destination=${slug}` ||
    trimmed === `/destinations?destination=${encodeURIComponent(slug)}`
  );
}

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch { return '—'; }
}

function imageUrl(item) {
  if (item?.image_url) return item.image_url;
  if (item?.image?.file_url) return buildMediaUrl(item.image.file_url);
  return null;
}

// ─── DestinationMediaTab ──────────────────────────────────────────────────────
// Hero image management using real MediaUploader + MediaPicker.
// Gallery is deferred until backend adds a DestinationGallery table.

function DestinationMediaTab({ form, onChange, editItem }) {
  const { toast } = useToast();
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleUploaderChange = (media) => {
    onChange('image_id', media.id);
    onChange('image_url', media.full_url);
  };

  const handlePickerSelect = (media) => {
    onChange('image_id', media.id);
    onChange('image_url', buildMediaUrl(media.file_url));
    setPickerOpen(false);
  };

  const handleClear = () => {
    onChange('image_id', null);
    onChange('image_url', null);
  };

  return (
    <div className="space-y-6">
      {/* ── Hero Image ── */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-1">Hero Image</p>
        <p className="text-xs text-muted-foreground mb-3">
          Main card image shown on the homepage and destination listing.
          Recommended: 1920×1080px · Max 10 MB.
        </p>

        {form.image_url ? (
          <div className="relative rounded-xl overflow-hidden border border-border aspect-video bg-muted">
            <img src={form.image_url} alt={form.name || 'Hero'} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-0 inset-x-0 bg-black/50 px-3 py-1.5">
              <p className="text-xs text-white font-medium">Hero image · click × to replace</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <MediaUploader
              module="destinations"
              section="hero"
              accept="image/*"
              maxSizeMB={10}
              value={null}
              mediaId={null}
              onChange={handleUploaderChange}
              onClear={() => {}}
              label="Upload hero image"
              hint="JPG, PNG, WebP · Max 10 MB"
            />
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground px-2">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
              Pick from Media Library
            </button>
          </div>
        )}
      </div>

      {/* ── Gallery — pending backend ── */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-800 mb-1">Gallery</p>
        <p className="text-xs text-amber-700">
          Multi-image gallery requires a <code className="bg-amber-100 px-1 rounded text-[11px]">destination_gallery</code> table
          on the backend. This tab will be enabled once the backend migration is deployed.
        </p>
      </div>

      {/* ── Media Picker Modal ── */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        folder="destinations/hero"
        accept="image/*"
        onSelect={handlePickerSelect}
      />
    </div>
  );
}

// ─── Main Destinations component ──────────────────────────────────────────────

export default function Destinations() {
  const { toast } = useToast();
  const {
    data: destinations = [],
    isLoading,
    isError,
    error,
  } = useFeaturedDestinations();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [activeTab, setActiveTab] = useState('General');
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { setPage(1); }, [search, activeFilter]);

  useEffect(() => {
    if (!drawerOpen) return;
    if (editItem) {
      setForm({
        name: editItem.name ?? '',
        slug: editItem.slug ?? '',
        country: editItem.country ?? '',
        short_description: editItem.short_description ?? '',
        image_id: editItem.image_id ?? null,
        image_url: imageUrl(editItem),
        button_text: editItem.button_text ?? '',
        button_url: editItem.button_url ?? '',
        display_order: editItem.display_order ?? 0,
        is_featured: editItem.is_featured ?? false,
        is_active: editItem.is_active ?? true,
      });
    } else {
      setForm({ ...EMPTY_FORM, display_order: destinations.length });
    }
  }, [drawerOpen, editItem, destinations.length]);

  const createMutation = useCreateFeaturedDestination({
    onSuccess: (created) => {
      toast({ title: 'Destination created' });
      setEditItem(created);
      setActiveTab('General');
    },
    onError: (err) => handleApiError(err, toast),
  });

  const updateMutation = useUpdateFeaturedDestination({
    onSuccess: () => toast({ title: 'Destination saved' }),
    onError: (err) => handleApiError(err, toast),
  });

  const deleteMutation = useDeleteFeaturedDestination({
    onSuccess: () => {
      toast({ title: 'Destination deleted' });
      setDeleteTarget(null);
      setDrawerOpen(false);
    },
    onError: (err) => handleApiError(err, toast),
  });

  const filtered = useMemo(() => {
    let list = destinations;
    if (activeFilter === 'Published') list = list.filter((d) => d.is_active);
    if (activeFilter === 'Draft') list = list.filter((d) => !d.is_active);
    if (activeFilter === 'Featured') list = list.filter((d) => d.is_featured);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((d) =>
        d.name?.toLowerCase().includes(q) ||
        d.slug?.toLowerCase().includes(q) ||
        d.country?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [destinations, search, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const publishedCount = destinations.filter((d) => d.is_active).length;
  const draftCount = destinations.filter((d) => !d.is_active).length;
  const featuredCount = destinations.filter((d) => d.is_featured).length;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const filters = [
    { label: 'All', value: 'all', count: destinations.length },
    { label: 'Published', value: 'Published', count: publishedCount },
    { label: 'Draft', value: 'Draft', count: draftCount },
    { label: 'Featured', value: 'Featured', count: featuredCount },
  ];

  const handleChange = useCallback((field, value) => {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === 'slug') {
        const slug = toSlug(value);
        next.slug = slug;
        if (isAutoButtonUrl(f.button_url, f.slug)) {
          next.button_url = defaultButtonUrl(slug);
        }
      }
      return next;
    });
  }, []);

  const handleNameChange = (value) => setForm((f) => {
    const next = {
      ...f,
      name: value,
      slug: editItem ? f.slug : toSlug(value),
    };
    if (!editItem && isAutoButtonUrl(f.button_url, f.slug)) {
      next.button_url = defaultButtonUrl(next.slug);
    }
    return next;
  });

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: 'Destination name is required', variant: 'destructive' });
      return;
    }
    if (!form.slug.trim()) {
      toast({ title: 'Slug is required', variant: 'destructive' });
      return;
    }
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      country: form.country?.trim() || null,
      short_description: form.short_description?.trim() || null,
      image_id: form.image_id || null,
      button_text: form.button_text?.trim() || null,
      button_url: form.button_url?.trim() || null,
      display_order: Number(form.display_order) || 0,
      is_featured: Boolean(form.is_featured),
      is_active: Boolean(form.is_active),
    };
    if (editItem) updateMutation.mutate({ id: editItem.id, formValues: payload });
    else createMutation.mutate(payload);
  };

  const openCreate = () => { setEditItem(null); setActiveTab('General'); setDrawerOpen(true); };
  const openEdit = (item) => { setEditItem(item); setActiveTab('General'); setDrawerOpen(true); };

  const toggleActive = (e, item) => {
    e.stopPropagation();
    updateMutation.mutate({ id: item.id, formValues: { is_active: !item.is_active } });
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Destinations" description="Manage featured travel destinations" />
        <TableSkeleton rows={7} columns={5} selectable={false} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm">{error?.message || 'Failed to load destinations'}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Destinations"
        description="Manage featured travel destinations"
        searchPlaceholder="Search destinations..."
        onSearch={setSearch}
        filters={filters}
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
        onAdd={openCreate}
        addLabel="New Destination"
      />

      {paginated.length === 0 ? (
        <div className="bg-white border border-border rounded-xl">
          <EmptyState
            icon={ImageIcon}
            title={search ? `No results for "${search}"` : 'No destinations yet'}
            message={search ? 'Try a different search term.' : 'Add your first featured destination.'}
            actionLabel="New Destination"
            onAction={openCreate}
          />
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[minmax(14rem,1.5fr)_9rem_9rem_8rem_7rem] gap-3 px-4 py-2.5 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span>Destination</span>
            <span>Country</span>
            <span>Order</span>
            <span>Status</span>
            <span />
          </div>
          <div className="divide-y divide-border">
            {paginated.map((item) => {
              const img = imageUrl(item);
              return (
                <div
                  key={item.id}
                  onClick={() => openEdit(item)}
                  className="group grid grid-cols-[minmax(14rem,1.5fr)_9rem_9rem_8rem_7rem] gap-3 items-center px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                      {img
                        ? <img src={img} alt={item.name} className="w-full h-full object-cover" />
                        : <ImageIcon className="w-4 h-4 text-muted-foreground/50" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="font-medium text-foreground truncate">{item.name}</p>
                        {item.is_featured && <Star className="w-3.5 h-3.5 text-warning fill-warning shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{item.slug}</p>
                    </div>
                  </div>
                  <span className="text-muted-foreground truncate text-sm">{item.country || '—'}</span>
                  <span className="text-muted-foreground text-sm">{item.display_order}</span>
                  <StatusBadge status={item.is_active ? 'Published' : 'Draft'} />
                  <div
                    className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => toggleActive(e, item)}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                      title={item.is_active ? 'Unpublish' : 'Publish'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="p-2 rounded-lg text-destructive hover:bg-destructive/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        total={filtered.length}
        perPage={PER_PAGE}
        onPageChange={setPage}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editItem ? 'Edit Destination' : 'Create Destination'}
        description={editItem ? `${editItem.name} · ${fmtDate(editItem.updated_at ?? editItem.created_at)}` : 'Add a new featured destination'}
        tabs={TABS}
        width="xl"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSave={activeTab === 'General' || activeTab === 'Content' || activeTab === 'Settings' ? handleSave : undefined}
        isSaving={isSaving}
        onDelete={editItem ? () => { setDrawerOpen(false); setDeleteTarget(editItem); } : undefined}
      >
        {(tab) => (
          <div className="space-y-5">
            {tab === 'General' && (
              <>
                <DrawerField label="Destination Name" required>
                  <DrawerInput
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Maldives"
                    maxLength={255}
                  />
                </DrawerField>
                <DrawerField label="Slug" required hint="Internal identifier. Used for the card link only when Button URL is empty.">
                  <DrawerInput
                    value={form.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    placeholder="maldives"
                    maxLength={255}
                  />
                </DrawerField>
                <DrawerField label="Country">
                  <DrawerInput
                    value={form.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    placeholder="e.g. Maldives"
                    maxLength={255}
                  />
                </DrawerField>
                <div className="grid grid-cols-2 gap-4">
                  <DrawerField label="Display Order">
                    <DrawerInput
                      type="number"
                      value={form.display_order}
                      onChange={(e) => handleChange('display_order', e.target.value)}
                      placeholder="0"
                    />
                  </DrawerField>
                  <DrawerField label="Status">
                    <DrawerSelect
                      value={form.is_active ? 'Published' : 'Draft'}
                      onChange={(e) => handleChange('is_active', e.target.value === 'Published')}
                      options={['Published', 'Draft']}
                    />
                  </DrawerField>
                </div>
              </>
            )}
            {tab === 'Media' && (
              <DestinationMediaTab form={form} onChange={handleChange} editItem={editItem} />
            )}
            {tab === 'Content' && (
              <>
                <DrawerField label="Short Description">
                  <DrawerInput
                    textarea
                    value={form.short_description}
                    onChange={(e) => handleChange('short_description', e.target.value)}
                    placeholder="A brief description of this destination..."
                  />
                </DrawerField>
                <div className="grid grid-cols-2 gap-4">
                  <DrawerField label="Button Text">
                    <DrawerInput
                      value={form.button_text}
                      onChange={(e) => handleChange('button_text', e.target.value)}
                      placeholder="Explore Maldives"
                      maxLength={100}
                    />
                  </DrawerField>
                  <DrawerField label="Button URL" hint="Where the homepage card links. Change this to update the click destination.">
                    <DrawerInput
                      value={form.button_url}
                      onChange={(e) => handleChange('button_url', e.target.value)}
                      placeholder="/destinations?destination=maldives"
                      maxLength={500}
                    />
                  </DrawerField>
                </div>
              </>
            )}
            {tab === 'Settings' && (
              <DrawerField label="Featured Destination">
                <label className="flex items-center gap-3 h-10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => handleChange('is_featured', e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm text-muted-foreground">
                    Show in featured destinations section
                  </span>
                </label>
              </DrawerField>
            )}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete Destination"
        message="Are you sure you want to delete this destination? This action cannot be undone."
        itemName={deleteTarget?.name}
      />
    </div>
  );
}
