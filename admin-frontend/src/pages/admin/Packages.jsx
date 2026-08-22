import { useEffect, useMemo, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Copy, HelpCircle, Image as ImageIcon, Loader2, Pencil, Plus, Power, Sparkles, Star, Trash2, X, XCircle } from 'lucide-react';
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
  useCreatePackage,
  useDeletePackage,
  usePackageCategories,
  usePackageGallery,
  useAddPackageGalleryItem,
  useDeletePackageGalleryItem,
  usePackageItinerary,
  useCreateItinerary,
  useUpdateItinerary,
  useDeleteItinerary,
  usePackageHighlights,
  useCreateHighlight,
  useUpdateHighlight,
  useDeleteHighlight,
  usePackageInclusions,
  useCreateInclusion,
  useDeleteInclusion,
  usePackageExclusions,
  useCreateExclusion,
  useDeleteExclusion,
  usePackageFaqs,
  useCreateFaq,
  useUpdateFaq,
  useDeleteFaq,
  usePackages,
  useUpdatePackage,
} from '@/hooks/use-packages';

const PER_PAGE = 10;
const TABS = ['General', 'Gallery', 'Itinerary', 'Highlights', 'Inclusions', 'Exclusions', 'FAQs', 'SEO'];
const EMPTY_FORM = {
  title: '',
  slug: '',
  category_id: '',
  country: '',
  city: '',
  duration_days: 1,
  duration_nights: 0,
  starting_price: '',
  currency: 'USD',
  short_description: '',
  description: '',
  featured_image_id: null,
  featured_image_url: null,
  is_featured: false,
  is_active: true,
  seo_title: '',
  seo_description: '',
};

function toSlug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '—';
  }
}

function formatPrice(pkg) {
  if (pkg.starting_price === null || pkg.starting_price === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: pkg.currency || 'USD',
    maximumFractionDigits: 0,
  }).format(Number(pkg.starting_price));
}

function categoryIdFor(pkg) {
  return pkg.category_id ?? pkg.category?.id ?? '';
}

function imageUrlFor(pkg) {
  // featured_image is a nested object from the backend (file_url needs base URL prepended)
  if (pkg.featured_image?.file_url) return buildMediaUrl(pkg.featured_image.file_url);
  // Fallback: already-enriched full_url stored in local form state
  return pkg.featured_image_url ?? null;
}

// ─── PackageGalleryTab ────────────────────────────────────────────────────────

/**
 * Gallery tab rendered inside the Package Create/Edit drawer.
 * Only mounts when the drawer has an existing package (editItem).
 * Stores only media_id + display_order — URLs are resolved from the nested media object.
 */
function PackageGalleryTab({ packageId, featuredImageId, onSetCover }) {
  const { toast } = useToast();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { data: items = [], isLoading } = usePackageGallery(packageId);

  const addMutation = useAddPackageGalleryItem(packageId, {
    onSuccess: () => toast({ title: 'Image added to gallery' }),
    onError: (err) => handleApiError(err, toast),
  });

  const deleteMutation = useDeletePackageGalleryItem(packageId, {
    onSuccess: () => { toast({ title: 'Image removed' }); setDeleteTarget(null); },
    onError: (err) => handleApiError(err, toast),
  });

  const handlePickerSelect = (media) => {
    // Prevent duplicate uploads
    const isDuplicate = items.some((item) => item.media_id === media.id);
    if (isDuplicate) {
      toast({ title: 'Already in gallery', description: 'This image is already in the gallery.', variant: 'destructive' });
      return;
    }
    addMutation.mutate({ media_id: media.id, display_order: items.length });
  };

  const handleMediaUploaded = (media) => {
    const isDuplicate = items.some((item) => item.media_id === media.id);
    if (isDuplicate) return;
    addMutation.mutate({ media_id: media.id, display_order: items.length });
  };

  if (!packageId) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
        <p className="text-sm font-medium text-foreground">Save the package first</p>
        <p className="mt-1 text-sm text-muted-foreground">Create the package on the General tab, then add gallery images here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Cover Image ── */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Cover Image</p>
        {featuredImageId ? (
          <div className="relative rounded-xl overflow-hidden border border-border aspect-video bg-muted">
            {/* We show the cover from whichever gallery item matches */}
            {(() => {
              const cover = items.find((i) => i.media_id === featuredImageId);
              const coverUrl = cover?.media?.full_url ?? null;
              return coverUrl
                ? <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ImageIcon className="w-8 h-8 opacity-30" />
                    <p className="text-xs">Cover image set (not in gallery)</p>
                  </div>;
            })()}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-1.5">
              <p className="text-xs text-white font-medium">Current cover · Set from gallery below</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 aspect-video flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="w-8 h-8 opacity-30" />
            <p className="text-sm">No cover set</p>
            <p className="text-xs opacity-70">Click "Set Cover" on any gallery image below</p>
          </div>
        )}
      </div>

      {/* ── Gallery Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">
            Gallery Images
            {items.length > 0 && <span className="ml-2 text-xs font-normal text-muted-foreground">({items.length})</span>}
          </p>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            disabled={addMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/8 rounded-lg hover:bg-primary/12 transition-colors disabled:opacity-60"
          >
            <Plus className="w-3.5 h-3.5" />
            Add from Library
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/10 py-8 text-center text-muted-foreground">
            <ImageIcon className="w-8 h-8 opacity-25 mx-auto mb-2" />
            <p className="text-sm">No images yet</p>
            <p className="text-xs opacity-70 mt-0.5">Upload below or pick from the media library</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map((item, idx) => {
              const url = item.media?.full_url ?? null;
              const isCover = item.media_id === featuredImageId;
              return (
                <div
                  key={item.id}
                  className={`group relative aspect-square rounded-xl overflow-hidden border-2 bg-muted transition-all ${
                    isCover ? 'border-primary' : 'border-border hover:border-primary/40'
                  }`}
                >
                  {url
                    ? <img src={url} alt={item.media?.original_name ?? ''} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center bg-muted"><ImageIcon className="w-6 h-6 opacity-30" /></div>
                  }

                  {/* Cover badge */}
                  {isCover && (
                    <div className="absolute top-1.5 left-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-white flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-white" /> Cover
                      </span>
                    </div>
                  )}

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    disabled={deleteMutation.isPending}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive disabled:opacity-40"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Hover actions overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white/70 truncate max-w-[60%]">{item.media?.original_name ?? '—'}</span>
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => onSetCover(item.media_id)}
                        className="text-[10px] font-medium text-white bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full transition-colors whitespace-nowrap"
                      >
                        Set Cover
                      </button>
                    )}
                  </div>

                  {/* Order badge */}
                  <div className="absolute bottom-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white bg-black/50 px-1 py-0.5 rounded">{idx + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Upload Area ── */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Upload New Images</p>
        <MediaUploader
          module="packages"
          section="gallery"
          accept="image/*"
          maxSizeMB={10}
          aspectClass="aspect-video"
          label="Upload image to gallery"
          hint="JPG, PNG, WebP · Max 10 MB. Image will be added to the gallery above."
          onChange={handleMediaUploaded}
        />
      </div>

      {/* ── Media Picker Modal ── */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        folder="packages/gallery"
        accept="image/*"
        onSelect={handlePickerSelect}
      />

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Remove Image"
        message="Remove this image from the gallery? The media file will not be deleted."
        itemName={deleteTarget?.media?.original_name}
      />
    </div>
  );
}

// ─── PackageItineraryTab ──────────────────────────────────────────────────────

const EMPTY_DAY = {
  day_number: 1,
  title: '',
  description: '',
  hotel: '',
  meal_plan: '',
  media_id: null,
  display_order: 0,
};

const MEAL_PLAN_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: 'Breakfast', label: 'Breakfast' },
  { value: 'Breakfast & Lunch', label: 'Breakfast & Lunch' },
  { value: 'Breakfast & Dinner', label: 'Breakfast & Dinner' },
  { value: 'All Meals', label: 'All Meals (B/L/D)' },
  { value: 'All Inclusive', label: 'All Inclusive' },
  { value: 'None', label: 'No meals' },
];

/**
 * Single editable day card inside the itinerary list.
 * Calls onSave when the user blurs a field or explicitly clicks Save,
 * and onDelete when the delete action is triggered.
 */
function ItineraryDayCard({
  item,
  index,
  totalDays,
  onDelete,
  onDuplicate,
  onFieldChange,
  onSave,
  isSaving,
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className="rounded-xl border-2 border-border bg-white transition-all"
    >
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none" onClick={() => setExpanded((v) => !v)}>
        {/* Day badge */}
        <span className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
          {item.day_number}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {item.title || <span className="text-muted-foreground font-normal italic">Untitled day</span>}
          </p>
          {!expanded && (item.hotel || item.meal_plan) && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {[item.hotel, item.meal_plan].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onDuplicate}
            title="Duplicate day"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Delete day"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div className="text-muted-foreground">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expandable body */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/60 pt-3">
          <div className="grid grid-cols-2 gap-3">
            <DrawerField label="Day Number" required>
              <DrawerInput
                type="number"
                value={item.day_number}
                onChange={(e) => onFieldChange('day_number', Math.max(1, parseInt(e.target.value, 10) || 1))}
                onBlur={onSave}
              />
            </DrawerField>
            <DrawerField label="Title" required>
              <DrawerInput
                value={item.title}
                onChange={(e) => onFieldChange('title', e.target.value)}
                onBlur={onSave}
                placeholder="e.g. Arrival & City Tour"
              />
            </DrawerField>
          </div>

          <DrawerField label="Description">
            <DrawerInput
              textarea
              value={item.description ?? ''}
              onChange={(e) => onFieldChange('description', e.target.value)}
              onBlur={onSave}
              placeholder="What happens on this day..."
            />
          </DrawerField>

          <div className="grid grid-cols-2 gap-3">
            <DrawerField label="Hotel / Accommodation">
              <DrawerInput
                value={item.hotel ?? ''}
                onChange={(e) => onFieldChange('hotel', e.target.value)}
                onBlur={onSave}
                placeholder="e.g. Four Seasons Maldives"
              />
            </DrawerField>
            <DrawerField label="Meal Plan">
              <DrawerSelect
                value={item.meal_plan ?? ''}
                onChange={(e) => { onFieldChange('meal_plan', e.target.value); onSave(); }}
                options={MEAL_PLAN_OPTIONS}
              />
            </DrawerField>
          </div>

          {isSaving && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving…
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Itinerary tab rendered inside the Package Create/Edit drawer.
 * Each day is independently create/update/delete-able.
 * Reorder is drag-and-drop with optimistic local state.
 */
function PackageItineraryTab({ packageId }) {
  const { toast } = useToast();
  const [localItems, setLocalItems] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [savingIds, setSavingIds] = useState(new Set());

  const { data: serverItems = [], isLoading } = usePackageItinerary(packageId);

  useEffect(() => {
    setLocalItems(serverItems);
  }, [serverItems]);

  const items = localItems ?? serverItems;

  const createMutation = useCreateItinerary(packageId, {
    onError: (err) => handleApiError(err, toast),
  });

  const updateMutation = useUpdateItinerary(packageId, {
    onError: (err) => handleApiError(err, toast),
  });

  const deleteMutation = useDeleteItinerary(packageId, {
    onSuccess: () => { toast({ title: 'Day deleted' }); setDeleteTarget(null); },
    onError: (err) => handleApiError(err, toast),
  });

  // Compute next day_number — max existing + 1, or 1 if empty
  const nextDayNumber = items.length > 0
    ? Math.max(...items.map((i) => i.day_number)) + 1
    : 1;

  const handleAddDay = () => {
    if (!packageId) return;
    createMutation.mutate({
      day_number: nextDayNumber,
      title: '',
      description: null,
      hotel: null,
      meal_plan: null,
      media_id: null,
      display_order: items.length,
    }, {
      onSuccess: () => toast({ title: `Day ${nextDayNumber} added` }),
    });
  };

  const handleFieldChange = useCallback((itemId, field, value) => {
    setLocalItems((prev) =>
      (prev ?? serverItems).map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    );
  }, [serverItems]);

  // Persist a single day to backend (called on blur / select change)
  const handleSaveDay = useCallback((item) => {
    if (!item.title?.trim()) return; // don't save blank title
    setSavingIds((s) => new Set(s).add(item.id));
    updateMutation.mutate(
      {
        itemId: item.id,
        data: {
          day_number: item.day_number,
          title: item.title.trim(),
          description: item.description?.trim() || null,
          hotel: item.hotel?.trim() || null,
          meal_plan: item.meal_plan || null,
          media_id: item.media_id || null,
          display_order: item.display_order,
        },
      },
      {
        onSettled: () => setSavingIds((s) => { const next = new Set(s); next.delete(item.id); return next; }),
      },
    );
  }, [updateMutation]);

  // Duplicate — creates a new day with same content, day_number = next
  const handleDuplicate = useCallback((item) => {
    createMutation.mutate({
      day_number: nextDayNumber,
      title: item.title ? `${item.title} (copy)` : '',
      description: item.description || null,
      hotel: item.hotel || null,
      meal_plan: item.meal_plan || null,
      media_id: null,
      display_order: items.length,
    }, {
      onSuccess: () => toast({ title: 'Day duplicated' }),
    });
  }, [createMutation, items.length, nextDayNumber, toast]);

  if (!packageId) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
        <p className="text-sm font-medium text-foreground">Save the package first</p>
        <p className="mt-1 text-sm text-muted-foreground">Create the package on the General tab, then build the itinerary here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Itinerary
            {items.length > 0 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {items.length} {items.length === 1 ? 'day' : 'days'}
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Changes save automatically on blur</p>
        </div>
        <button
          type="button"
          onClick={handleAddDay}
          disabled={createMutation.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/8 rounded-lg hover:bg-primary/12 transition-colors disabled:opacity-60"
        >
          {createMutation.isPending
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Plus className="w-3.5 h-3.5" />}
          Add Day
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-muted/10 py-10 text-center text-muted-foreground">
          <p className="text-sm font-medium">No days yet</p>
          <p className="text-xs opacity-70 mt-1">Click "Add Day" to start building the itinerary</p>
        </div>
      )}

      {/* Day cards */}
      {!isLoading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <ItineraryDayCard
              key={item.id}
              item={item}
              index={idx}
              totalDays={items.length}
              onDelete={() => setDeleteTarget(item)}
              onDuplicate={() => handleDuplicate(item)}
              onFieldChange={(field, value) => handleFieldChange(item.id, field, value)}
              onSave={() => handleSaveDay(item)}
              isSaving={savingIds.has(item.id)}
            />
          ))}
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete Day"
        message={`Delete Day ${deleteTarget?.day_number}? This action cannot be undone.`}
        itemName={deleteTarget?.title || `Day ${deleteTarget?.day_number}`}
      />
    </div>
  );
}

// ─── PackageChecklistTab (shared for Inclusions & Exclusions) ────────────────
//
// Backend limitation: Neither inclusions nor exclusions have a PATCH endpoint.
// Only GET /{package_id}, POST /{package_id}, and DELETE /{id} exist.
// Editing an item is therefore not supported — users must delete and re-add.
// No reorder endpoint exists either, so display_order is set at creation time
// (sequential, based on current list length) and cannot be changed after.
//
// Props:
//   packageId   — string | null
//   type        — 'inclusions' | 'exclusions'
//   useItems    — hook returning { data, isLoading }
//   useCreate   — hook returning mutation
//   useDelete   — hook returning mutation
//   label       — display name ("Inclusions" | "Exclusions")
//   Icon        — lucide icon component
//   accentClass — tailwind classes for accent colour
//   emptyHint   — helper text shown when empty

function PackageChecklistTab({
  packageId,
  useItems,
  useCreate,
  useDelete,
  label,
  Icon,
  accentClass,
  emptyHint,
}) {
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const inputRef = useCallback((el) => { if (el) el.focus(); }, []);

  const { data: items = [], isLoading } = useItems(packageId);

  const createMutation = useCreate(packageId, {
    onSuccess: () => {
      toast({ title: `${label.slice(0, -1)} added` });
      setInputValue('');
    },
    onError: (err) => handleApiError(err, toast),
  });

  const deleteMutation = useDelete(packageId, {
    onSuccess: () => { toast({ title: `${label.slice(0, -1)} removed` }); setDeleteTarget(null); },
    onError: (err) => handleApiError(err, toast),
  });

  const handleAdd = () => {
    const title = inputValue.trim();
    if (!title) { toast({ title: 'Title is required', variant: 'destructive' }); return; }
    // Optional duplicate check
    if (items.some((i) => i.title.toLowerCase() === title.toLowerCase())) {
      toast({ title: 'Already exists', description: `"${title}" is already in the list.`, variant: 'destructive' });
      return;
    }
    createMutation.mutate({ title, display_order: items.length });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
  };

  if (!packageId) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
        <p className="text-sm font-medium text-foreground">Save the package first</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create the package on the General tab, then add {label.toLowerCase()} here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <p className={`text-sm font-semibold flex items-center gap-1.5 ${accentClass}`}>
          <Icon className="w-4 h-4" />
          {label}
          {items.length > 0 && (
            <span className="ml-1 text-xs font-normal text-muted-foreground">({items.length})</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Type and press Enter or click Add · editing requires delete &amp; re-add
        </p>
      </div>

      {/* Add input row */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`e.g. ${label === 'Inclusions' ? 'Airport transfers included' : 'International flights not included'}`}
          maxLength={255}
          className="flex-1 px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={createMutation.isPending || !inputValue.trim()}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary bg-primary/8 rounded-lg hover:bg-primary/12 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {createMutation.isPending
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Plus className="w-4 h-4" />}
          Add
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-muted/10 py-8 text-center text-muted-foreground">
          <Icon className="w-7 h-7 opacity-25 mx-auto mb-2" />
          <p className="text-sm font-medium">No {label.toLowerCase()} yet</p>
          <p className="text-xs opacity-70 mt-0.5">{emptyHint}</p>
        </div>
      )}

      {/* Items list */}
      {!isLoading && items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map((item, idx) => (
            <li
              key={item.id}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-white hover:border-primary/20 transition-colors"
            >
              {/* Order badge */}
              <span className="shrink-0 w-6 h-6 rounded-md bg-muted text-muted-foreground text-[11px] font-bold flex items-center justify-center">
                {idx + 1}
              </span>

              {/* Icon */}
              <Icon className={`w-4 h-4 shrink-0 ${accentClass}`} />

              {/* Title */}
              <span className="flex-1 text-sm text-foreground">{item.title}</span>

              {/* Delete */}
              <button
                type="button"
                onClick={() => setDeleteTarget(item)}
                title="Remove"
                className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title={`Remove ${label.slice(0, -1)}`}
        message={`Remove this item from ${label.toLowerCase()}? This cannot be undone.`}
        itemName={deleteTarget?.title}
      />
    </div>
  );
}

// ─── Icon options for the Highlights icon picker ─────────────────────────────
// Only the icon identifier string is stored — no image uploads.
const HIGHLIGHT_ICONS = [
  { value: '', label: 'No Icon' },
  { value: 'Sparkles', label: '✨ Sparkles' },
  { value: 'Star', label: '⭐ Star' },
  { value: 'Heart', label: '❤️ Heart' },
  { value: 'Award', label: '🏆 Award' },
  { value: 'Zap', label: '⚡ Zap' },
  { value: 'Shield', label: '🛡️ Shield' },
  { value: 'Globe', label: '🌐 Globe' },
  { value: 'Map', label: '🗺️ Map' },
  { value: 'Mountain', label: '⛰️ Mountain' },
  { value: 'Waves', label: '🌊 Waves' },
  { value: 'Sun', label: '☀️ Sun' },
  { value: 'Sunset', label: '🌅 Sunset' },
  { value: 'Sailboat', label: '⛵ Sailboat' },
  { value: 'Plane', label: '✈️ Plane' },
  { value: 'Hotel', label: '🏨 Hotel' },
  { value: 'UtensilsCrossed', label: '🍴 Dining' },
  { value: 'Coffee', label: '☕ Coffee' },
  { value: 'Camera', label: '📷 Camera' },
  { value: 'Music', label: '🎵 Music' },
  { value: 'Gem', label: '💎 Gem' },
  { value: 'Crown', label: '👑 Crown' },
  { value: 'CheckCircle', label: '✅ Check' },
  { value: 'Clock', label: '🕐 Clock' },
  { value: 'Users', label: '👥 Group' },
  { value: 'Headphones', label: '🎧 Support' },
  { value: 'Car', label: '🚗 Transfer' },
  { value: 'Wifi', label: '📶 Wifi' },
  { value: 'Lock', label: '🔒 Security' },
  { value: 'Gift', label: '🎁 Gift' },
];

/**
 * A single editable highlight card.
 * Title and icon are saved on blur / select change.
 * Drag handle allows reordering.
 */
function HighlightCard({
  item,
  index,
  onDelete,
  onFieldChange,
  onSave,
  isSaving,
}) {
  return (
    <div
      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-border bg-white transition-all hover:border-primary/30"
    >
      {/* Order badge */}
      <span className="shrink-0 w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
        {index + 1}
      </span>

      {/* Icon picker */}
      <div className="w-36 shrink-0">
        <DrawerSelect
          value={item.icon ?? ''}
          onChange={(e) => { onFieldChange('icon', e.target.value || null); onSave(); }}
          options={HIGHLIGHT_ICONS}
          className="text-xs py-1.5"
        />
      </div>

      {/* Title input */}
      <div className="flex-1 min-w-0">
        <DrawerInput
          value={item.title}
          onChange={(e) => onFieldChange('title', e.target.value)}
          onBlur={onSave}
          placeholder="e.g. Private Overwater Villa"
          className="text-sm"
        />
      </div>

      {/* Saving indicator */}
      {isSaving && (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground shrink-0" />
      )}

      {/* Delete */}
      <button
        type="button"
        onClick={onDelete}
        title="Delete highlight"
        className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/**
 * Highlights tab rendered inside the Package Create/Edit drawer.
 * Supports add, edit (inline), delete, and drag-and-drop reorder.
 * Reorder is optimistic: display_order is persisted via PATCH on drop
 * (no dedicated reorder endpoint exists on the backend for highlights).
 */
function PackageHighlightsTab({ packageId }) {
  const { toast } = useToast();
  const [localItems, setLocalItems] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [savingIds, setSavingIds] = useState(new Set());

  const { data: serverItems = [], isLoading } = usePackageHighlights(packageId);

  useEffect(() => {
    setLocalItems(serverItems);
  }, [serverItems]);

  const items = localItems ?? serverItems;

  const createMutation = useCreateHighlight(packageId, {
    onError: (err) => handleApiError(err, toast),
  });

  const updateMutation = useUpdateHighlight(packageId, {
    onError: (err) => handleApiError(err, toast),
  });

  const deleteMutation = useDeleteHighlight(packageId, {
    onSuccess: () => { toast({ title: 'Highlight deleted' }); setDeleteTarget(null); },
    onError: (err) => handleApiError(err, toast),
  });

  const handleAddHighlight = () => {
    if (!packageId) return;
    createMutation.mutate(
      { title: 'New Highlight', icon: null, display_order: items.length },
      { onSuccess: () => toast({ title: 'Highlight added — click to rename' }) },
    );
  };

  // Update local state only — persist on blur / select change
  const handleFieldChange = useCallback((itemId, field, value) => {
    setLocalItems((prev) =>
      (prev ?? serverItems).map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    );
  }, [serverItems]);

  // Persist a single highlight to backend
  const handleSave = useCallback((item) => {
    if (!item.title?.trim()) return; // don't persist blank title
    setSavingIds((s) => new Set(s).add(item.id));
    updateMutation.mutate(
      {
        itemId: item.id,
        data: {
          title: item.title.trim(),
          icon: item.icon || null,
          display_order: item.display_order,
        },
      },
      {
        onSettled: () =>
          setSavingIds((s) => { const next = new Set(s); next.delete(item.id); return next; }),
      },
    );
  }, [updateMutation]);

  if (!packageId) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
        <p className="text-sm font-medium text-foreground">Save the package first</p>
        <p className="mt-1 text-sm text-muted-foreground">Create the package on the General tab, then add highlights here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            Highlights
            {items.length > 0 && (
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                ({items.length})
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Edits save automatically on blur
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddHighlight}
          disabled={createMutation.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/8 rounded-lg hover:bg-primary/12 transition-colors disabled:opacity-60"
        >
          {createMutation.isPending
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Plus className="w-3.5 h-3.5" />}
          Add Highlight
        </button>
      </div>

      {/* Column labels */}
      {items.length > 0 && (
        <div className="flex items-center gap-3 px-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="w-7 shrink-0" />
          <span className="w-36 shrink-0">Icon</span>
          <span className="flex-1">Title</span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-muted/10 py-10 text-center text-muted-foreground">
          <Sparkles className="w-8 h-8 opacity-25 mx-auto mb-2" />
          <p className="text-sm font-medium">No highlights yet</p>
          <p className="text-xs opacity-70 mt-1">Click "Add Highlight" to showcase key selling points</p>
        </div>
      )}

      {/* Highlight cards */}
      {!isLoading && items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <HighlightCard
              key={item.id}
              item={item}
              index={idx}
              onDelete={() => setDeleteTarget(item)}
              onFieldChange={(field, value) => handleFieldChange(item.id, field, value)}
              onSave={() => handleSave(
                (localItems ?? serverItems).find((i) => i.id === item.id) ?? item,
              )}
              isSaving={savingIds.has(item.id)}
            />
          ))}
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete Highlight"
        message="Delete this highlight? This action cannot be undone."
        itemName={deleteTarget?.title || 'Untitled highlight'}
      />
    </div>
  );
}

// ─── PackageFaqsTab ───────────────────────────────────────────────────────────
//
// Backend: GET, POST /{package_id}, PATCH /{item_id}, DELETE /{item_id}
// No reorder endpoint — display_order is persisted per-item via PATCH on drop.
// FAQCreate fields: question (required), answer (optional), display_order

const EMPTY_FAQ = { question: '', answer: '', display_order: 0 };

/**
 * Single expandable FAQ card.
 * Question and answer are saved on blur (auto-save).
 */
function FaqCard({
  item,
  index,
  onDelete,
  onFieldChange,
  onSave,
  isSaving,
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className="rounded-xl border-2 border-border bg-white transition-all"
    >
      {/* Card header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Index badge */}
        <span className="shrink-0 w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
          {index + 1}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {item.question?.trim() || (
              <span className="font-normal text-muted-foreground italic">Untitled question</span>
            )}
          </p>
          {!expanded && item.answer?.trim() && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{item.answer}</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
          <button
            type="button"
            onClick={onDelete}
            title="Delete FAQ"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <span className="text-muted-foreground">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </div>

      {/* Expandable body */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/60 pt-3">
          <DrawerField label="Question" required>
            <DrawerInput
              value={item.question ?? ''}
              onChange={(e) => onFieldChange('question', e.target.value)}
              onBlur={onSave}
              placeholder="e.g. What is included in the package price?"
            />
          </DrawerField>
          <DrawerField label="Answer">
            <DrawerInput
              textarea
              value={item.answer ?? ''}
              onChange={(e) => onFieldChange('answer', e.target.value)}
              onBlur={onSave}
              placeholder="Provide a clear and helpful answer..."
            />
          </DrawerField>
        </div>
      )}
    </div>
  );
}

/**
 * FAQs tab rendered inside the Package Create/Edit drawer.
 * Supports add, inline edit (auto-save on blur), delete, and drag-to-reorder.
 * Reorder persists display_order via PATCH per item (no dedicated reorder endpoint).
 */
function PackageFaqsTab({ packageId }) {
  const { toast } = useToast();
  const [localItems, setLocalItems] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [savingIds, setSavingIds] = useState(new Set());

  const { data: serverItems = [], isLoading } = usePackageFaqs(packageId);

  useEffect(() => {
    setLocalItems(serverItems);
  }, [serverItems]);

  const items = localItems ?? serverItems;

  const createMutation = useCreateFaq(packageId, {
    onError: (err) => handleApiError(err, toast),
  });

  const updateMutation = useUpdateFaq(packageId, {
    onError: (err) => handleApiError(err, toast),
  });

  const deleteMutation = useDeleteFaq(packageId, {
    onSuccess: () => { toast({ title: 'FAQ deleted' }); setDeleteTarget(null); },
    onError: (err) => handleApiError(err, toast),
  });

  const handleAddFaq = () => {
    createMutation.mutate(
      { question: 'New Question', answer: '', display_order: items.length },
      { onSuccess: () => toast({ title: 'FAQ added — click to edit' }) },
    );
  };

  // Update local state — persist on blur
  const handleFieldChange = useCallback((itemId, field, value) => {
    setLocalItems((prev) =>
      (prev ?? serverItems).map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    );
  }, [serverItems]);

  // Persist a single FAQ to backend
  const handleSave = useCallback((item) => {
    if (!item.question?.trim()) return; // don't save blank question
    setSavingIds((s) => new Set(s).add(item.id));
    updateMutation.mutate(
      {
        itemId: item.id,
        data: {
          question: item.question.trim(),
          answer: item.answer?.trim() || null,
          display_order: item.display_order,
        },
      },
      {
        onSettled: () =>
          setSavingIds((s) => { const next = new Set(s); next.delete(item.id); return next; }),
      },
    );
  }, [updateMutation]);

  if (!packageId) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
        <p className="text-sm font-medium text-foreground">Save the package first</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create the package on the General tab, then add FAQs here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-primary" />
            Frequently Asked Questions
            {items.length > 0 && (
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                ({items.length})
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Edits save automatically on blur
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddFaq}
          disabled={createMutation.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/8 rounded-lg hover:bg-primary/12 transition-colors disabled:opacity-60"
        >
          {createMutation.isPending
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Plus className="w-3.5 h-3.5" />}
          Add FAQ
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-muted/10 py-10 text-center text-muted-foreground">
          <HelpCircle className="w-8 h-8 opacity-25 mx-auto mb-2" />
          <p className="text-sm font-medium">No FAQs yet</p>
          <p className="text-xs opacity-70 mt-1">
            Click "Add FAQ" to answer common traveller questions
          </p>
        </div>
      )}

      {/* FAQ cards */}
      {!isLoading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <FaqCard
              key={item.id}
              item={item}
              index={idx}
              onDelete={() => setDeleteTarget(item)}
              onFieldChange={(field, value) => handleFieldChange(item.id, field, value)}
              onSave={() => handleSave(
                (localItems ?? serverItems).find((i) => i.id === item.id) ?? item,
              )}
              isSaving={savingIds.has(item.id)}
            />
          ))}
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete FAQ"
        message="Delete this FAQ? This action cannot be undone."
        itemName={deleteTarget?.question || 'Untitled question'}
      />
    </div>
  );
}

// ─── PackageSeoTab ────────────────────────────────────────────────────────────
//
// Backend SEO fields on LuxuryPackage: seo_title (String 255), seo_description (Text)
// No og_image, twitter_image, keywords, or canonical fields exist on the package model.
// Saved via the existing PATCH /api/v1/packages/{id} endpoint (same as General tab).
// No separate SEO API or hook needed.

const SEO_TITLE_MAX = 60;
const SEO_DESC_MAX = 160;

/**
 * SEO tab rendered inside the Package Create/Edit drawer.
 * Reads from and writes to the parent form state (same form used by General).
 * The "Save Changes" button in the drawer footer triggers the save.
 *
 * Props:
 *   form       — parent form state (contains seo_title, seo_description, slug)
 *   onChange   — (field, value) => void — update parent form state
 *   packageId  — string | null — used only to show the "save first" guard
 */
function PackageSeoTab({ form, onChange, packageId }) {
  const titleLen = (form.seo_title ?? '').length;
  const descLen = (form.seo_description ?? '').length;

  // Character-count colour indicator
  const titleColour = titleLen > SEO_TITLE_MAX ? 'text-destructive' : titleLen > 50 ? 'text-warning' : 'text-muted-foreground';
  const descColour = descLen > SEO_DESC_MAX ? 'text-destructive' : descLen > 140 ? 'text-warning' : 'text-muted-foreground';

  if (!packageId) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
        <p className="text-sm font-medium text-foreground">Save the package first</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create the package on the General tab, then configure SEO here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <span className="shrink-0 mt-0.5">ℹ</span>
        <span>
          Changes here are saved when you click <strong>Save Changes</strong> in the drawer footer —
          the same save that updates the General tab.
        </span>
      </div>

      {/* ── Meta Title ── */}
      <DrawerField
        label="Meta Title"
        hint={<span className={titleColour}>{titleLen}/{SEO_TITLE_MAX} · Recommended: 50–60 characters</span>}
        required={false}
      >
        <DrawerInput
          value={form.seo_title ?? ''}
          onChange={(e) => onChange('seo_title', e.target.value)}
          placeholder={form.title || 'e.g. Maldives Overwater Villa Retreat | Pure Luxe'}
          maxLength={SEO_TITLE_MAX + 20}
        />
      </DrawerField>

      {/* ── Meta Description ── */}
      <DrawerField
        label="Meta Description"
        hint={<span className={descColour}>{descLen}/{SEO_DESC_MAX} · Recommended: 120–160 characters</span>}
        required={false}
      >
        <DrawerInput
          textarea
          value={form.seo_description ?? ''}
          onChange={(e) => onChange('seo_description', e.target.value)}
          placeholder="A compelling description that appears in Google search results. Keep it under 160 characters."
          maxLength={SEO_DESC_MAX + 20}
        />
      </DrawerField>

      {/* ── SERP Preview ── */}
      <div className="rounded-xl border border-border bg-white p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Google Search Preview
        </p>
        <div className="space-y-0.5">
          {/* Favicon + domain */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground shrink-0">G</div>
            <span className="text-xs text-muted-foreground truncate">
              yourdomain.com › packages › <span className="text-foreground">{form.slug || 'package-slug'}</span>
            </span>
          </div>
          {/* Title */}
          <p className="text-base font-medium text-blue-700 leading-snug line-clamp-1">
            {form.seo_title?.trim() || form.title?.trim() || 'Page title not set'}
          </p>
          {/* Description */}
          <p className="text-sm text-muted-foreground leading-snug line-clamp-2 mt-0.5">
            {form.seo_description?.trim() || 'Add a meta description to see a preview here.'}
          </p>
        </div>
      </div>

      {/* ── Slug reminder ── */}
      <div className="rounded-xl border border-border bg-muted/20 p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">URL Slug</p>
        <p className="text-sm text-foreground font-mono break-all">
          /packages/<span className="text-primary">{form.slug || 'package-slug'}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Edit the slug on the General tab. Keep it short, descriptive, and lowercase.
        </p>
      </div>
    </div>
  );
}

export default function Packages() {
  const { toast } = useToast();
  const { data: packages = [], isLoading, isError, error } = usePackages();
  const { data: categories = [] } = usePackageCategories();

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
        title: editItem.title ?? '',
        slug: editItem.slug ?? '',
        category_id: categoryIdFor(editItem),
        country: editItem.country ?? '',
        city: editItem.city ?? '',
        duration_days: editItem.duration_days ?? 1,
        duration_nights: editItem.duration_nights ?? 0,
        starting_price: editItem.starting_price ?? '',
        currency: editItem.currency ?? 'USD',
        short_description: editItem.short_description ?? '',
        description: editItem.description ?? '',
        featured_image_id: editItem.featured_image_id ?? null,
        featured_image_url: imageUrlFor(editItem),
        is_featured: editItem.is_featured ?? false,
        is_active: editItem.is_active ?? true,
        seo_title: editItem.seo_title ?? '',
        seo_description: editItem.seo_description ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [drawerOpen, editItem]);

  const createMutation = useCreatePackage({
    onSuccess: (created) => {
      toast({ title: 'Package created' });
      // Switch to edit mode on the newly created package, stay on General
      setEditItem(created);
      setActiveTab('General');
    },
    onError: (err) => handleApiError(err, toast),
  });
  const updateMutation = useUpdatePackage({
    onSuccess: () => { toast({ title: 'Package saved' }); },
    onError: (err) => handleApiError(err, toast),
  });
  const deleteMutation = useDeletePackage({
    onSuccess: () => { toast({ title: 'Package deleted' }); setDeleteTarget(null); },
    onError: (err) => handleApiError(err, toast),
  });

  const filtered = useMemo(() => {
    let list = packages;
    if (activeFilter === 'Published') list = list.filter((pkg) => pkg.is_active);
    if (activeFilter === 'Draft') list = list.filter((pkg) => !pkg.is_active);
    if (activeFilter === 'Featured') list = list.filter((pkg) => pkg.is_featured);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((pkg) => [
        pkg.title,
        pkg.slug,
        pkg.country,
        pkg.city,
        pkg.category?.name,
      ].some((value) => value?.toLowerCase().includes(q)));
    }
    return list;
  }, [packages, search, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const publishedCount = packages.filter((pkg) => pkg.is_active).length;
  const draftCount = packages.filter((pkg) => !pkg.is_active).length;
  const featuredCount = packages.filter((pkg) => pkg.is_featured).length;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const filters = [
    { label: 'All', value: 'all', count: packages.length },
    { label: 'Published', value: 'Published', count: publishedCount },
    { label: 'Draft', value: 'Draft', count: draftCount },
    { label: 'Featured', value: 'Featured', count: featuredCount },
  ];

  const categoryOptions = [
    { value: '', label: 'Uncategorized' },
    ...categories.map((category) => ({ value: category.id, label: category.name })),
  ];

  const handleChange = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const handleTitleChange = (value) => setForm((current) => ({
    ...current,
    title: value,
    slug: editItem ? current.slug : toSlug(value),
  }));

  // Set a gallery image as the package cover (updates featured_image_id)
  const handleSetCover = (mediaId) => {
    if (!editItem) return;
    updateMutation.mutate(
      { id: editItem.id, formValues: { featured_image_id: mediaId } },
      {
        onSuccess: () => {
          toast({ title: 'Cover image updated' });
          setForm((current) => ({ ...current, featured_image_id: mediaId }));
        },
        onError: (err) => handleApiError(err, toast),
      },
    );
  };

  const handleSave = () => {
    if (!form.title.trim()) { toast({ title: 'Package title is required', variant: 'destructive' }); return; }
    if (!form.slug.trim()) { toast({ title: 'Slug is required', variant: 'destructive' }); return; }

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      category_id: form.category_id || null,
      country: form.country?.trim() || null,
      city: form.city?.trim() || null,
      duration_days: Number(form.duration_days) || 1,
      duration_nights: Number(form.duration_nights) || 0,
      starting_price: form.starting_price === '' ? null : Number(form.starting_price),
      currency: form.currency || 'USD',
      short_description: form.short_description?.trim() || null,
      description: form.description?.trim() || null,
      featured_image_id: form.featured_image_id || null,
      is_featured: Boolean(form.is_featured),
      is_active: Boolean(form.is_active),
      seo_title: form.seo_title?.trim() || null,
      seo_description: form.seo_description?.trim() || null,
    };

    if (editItem) updateMutation.mutate({ id: editItem.id, formValues: payload });
    else createMutation.mutate(payload);
  };

  const openCreate = () => { setEditItem(null); setActiveTab('General'); setDrawerOpen(true); };
  const openEdit = (item) => { setEditItem(item); setActiveTab('General'); setDrawerOpen(true); };

  const toggleActive = (event, item) => {
    event.stopPropagation();
    updateMutation.mutate({ id: item.id, formValues: { is_active: !item.is_active } });
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Luxury Packages" description="Manage your luxury travel packages and pricing" />
        <TableSkeleton rows={8} columns={7} selectable={false} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm">{error?.message || 'Failed to load packages'}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Luxury Packages"
        description="Manage your luxury travel packages and pricing"
        searchPlaceholder="Search packages..."
        onSearch={setSearch}
        filters={filters}
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
        onAdd={openCreate}
        addLabel="New Package"
      />

      {paginated.length === 0 ? (
        <div className="bg-white border border-border rounded-xl">
          <EmptyState
            icon={ImageIcon}
            title={search ? `No results for "${search}"` : 'No packages yet'}
            message={search ? 'Try a different search term.' : 'Add your first package.'}
            actionLabel="New Package"
            onAction={openCreate}
          />
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[minmax(16rem,1.4fr)_10rem_10rem_7rem_8rem_8rem_7rem] gap-3 px-4 py-2.5 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span>Package</span>
            <span>Category</span>
            <span>Destination</span>
            <span>Duration</span>
            <span>Price</span>
            <span>Status</span>
            <span />
          </div>
          <div className="divide-y divide-border">
            {paginated.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => openEdit(pkg)}
                className="group grid grid-cols-[minmax(16rem,1.4fr)_10rem_10rem_7rem_8rem_8rem_7rem] gap-3 items-center px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                    {imageUrlFor(pkg)
                      ? <img src={imageUrlFor(pkg)} alt={pkg.title} className="w-full h-full object-cover" />
                      : <ImageIcon className="w-4 h-4 text-muted-foreground/50" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="font-medium text-foreground truncate">{pkg.title}</p>
                      {pkg.is_featured && <Star className="w-3.5 h-3.5 text-warning fill-warning shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{pkg.slug}</p>
                  </div>
                </div>
                <span className="text-muted-foreground truncate">{pkg.category?.name || 'Uncategorized'}</span>
                <span className="text-muted-foreground truncate">{[pkg.city, pkg.country].filter(Boolean).join(', ') || '—'}</span>
                <span className="text-muted-foreground">{pkg.duration_days}D / {pkg.duration_nights}N</span>
                <span className="font-semibold text-foreground">{formatPrice(pkg)}</span>
                <StatusBadge status={pkg.is_active ? 'Published' : 'Draft'} />
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button onClick={(e) => toggleActive(e, pkg)} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Power className="w-4 h-4" />
                  </button>
                  <button onClick={() => openEdit(pkg)} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(pkg)} className="p-2 rounded-lg text-destructive hover:bg-destructive/5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
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
        title={editItem ? 'Edit Package' : 'Create Package'}
        description={editItem ? `${editItem.title} · Updated ${formatDate(editItem.updated_at ?? editItem.created_at)}` : 'Add a new luxury travel package'}
        tabs={TABS}
        width="xl"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSave={activeTab === 'General' || activeTab === 'SEO' ? handleSave : undefined}
        isSaving={isSaving}
        onDelete={editItem ? () => { setDrawerOpen(false); setDeleteTarget(editItem); } : undefined}
      >
        {(tab) => (
          <div className="space-y-5">
            {tab === 'General' && (
              <>
                <DrawerField label="Package Name" required>
                  <DrawerInput value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="e.g. Maldives Overwater Villa Retreat" />
                </DrawerField>
                <div className="grid grid-cols-2 gap-4">
                  <DrawerField label="Slug" required>
                    <DrawerInput value={form.slug} onChange={(e) => handleChange('slug', toSlug(e.target.value))} placeholder="maldives-overwater-villa-retreat" />
                  </DrawerField>
                  <DrawerField label="Category">
                    <DrawerSelect value={form.category_id} onChange={(e) => handleChange('category_id', e.target.value)} options={categoryOptions} />
                  </DrawerField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <DrawerField label="Country">
                    <DrawerInput value={form.country} onChange={(e) => handleChange('country', e.target.value)} placeholder="Maldives" />
                  </DrawerField>
                  <DrawerField label="City">
                    <DrawerInput value={form.city} onChange={(e) => handleChange('city', e.target.value)} placeholder="Male" />
                  </DrawerField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <DrawerField label="Duration Days" required>
                    <DrawerInput type="number" value={form.duration_days} onChange={(e) => handleChange('duration_days', e.target.value)} placeholder="7" />
                  </DrawerField>
                  <DrawerField label="Duration Nights">
                    <DrawerInput type="number" value={form.duration_nights} onChange={(e) => handleChange('duration_nights', e.target.value)} placeholder="6" />
                  </DrawerField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <DrawerField label="Starting Price">
                    <DrawerInput type="number" value={form.starting_price} onChange={(e) => handleChange('starting_price', e.target.value)} placeholder="8499" />
                  </DrawerField>
                  <DrawerField label="Currency">
                    <DrawerSelect value={form.currency} onChange={(e) => handleChange('currency', e.target.value)} options={['USD', 'EUR', 'GBP', 'INR', 'AED']} />
                  </DrawerField>
                </div>
                <DrawerField label="Short Description">
                  <DrawerInput textarea value={form.short_description} onChange={(e) => handleChange('short_description', e.target.value)} placeholder="Brief description shown in package listings..." />
                </DrawerField>
                <DrawerField label="Description">
                  <DrawerInput textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Full package overview..." />
                </DrawerField>
                <DrawerField label="Featured Image">
                  <MediaUploader
                    module="packages"
                    section="featured"
                    value={form.featured_image_url}
                    mediaId={form.featured_image_id}
                    onChange={(media) => setForm((current) => ({
                      ...current,
                      featured_image_id: media.id,
                      featured_image_url: media.full_url,
                    }))}
                    onClear={() => setForm((current) => ({ ...current, featured_image_id: null, featured_image_url: null }))}
                    hint="Used as the package listing image."
                  />
                </DrawerField>
                <div className="grid grid-cols-2 gap-4">
                  <DrawerField label="Status">
                    <DrawerSelect
                      value={form.is_active ? 'Published' : 'Draft'}
                      onChange={(e) => handleChange('is_active', e.target.value === 'Published')}
                      options={['Published', 'Draft']}
                    />
                  </DrawerField>
                  <DrawerField label="Featured Package">
                    <label className="flex items-center gap-3 h-10 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.is_featured}
                        onChange={(e) => handleChange('is_featured', e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                      />
                      <span className="text-sm text-muted-foreground">Show in featured package areas</span>
                    </label>
                  </DrawerField>
                </div>
              </>
            )}
            {tab === 'Gallery' && (
              <PackageGalleryTab
                packageId={editItem?.id ?? null}
                featuredImageId={form.featured_image_id}
                onSetCover={handleSetCover}
              />
            )}
            {tab === 'Itinerary' && (
              <PackageItineraryTab
                packageId={editItem?.id ?? null}
              />
            )}
            {tab === 'Highlights' && (
              <PackageHighlightsTab
                packageId={editItem?.id ?? null}
              />
            )}
            {tab === 'Inclusions' && (
              <PackageChecklistTab
                packageId={editItem?.id ?? null}
                useItems={usePackageInclusions}
                useCreate={useCreateInclusion}
                useDelete={useDeleteInclusion}
                label="Inclusions"
                Icon={CheckCircle2}
                accentClass="text-emerald-600"
                emptyHint="Add what's included in this package"
              />
            )}
            {tab === 'Exclusions' && (
              <PackageChecklistTab
                packageId={editItem?.id ?? null}
                useItems={usePackageExclusions}
                useCreate={useCreateExclusion}
                useDelete={useDeleteExclusion}
                label="Exclusions"
                Icon={XCircle}
                accentClass="text-rose-600"
                emptyHint="Add what's not included in this package"
              />
            )}
            {tab === 'FAQs' && (
              <PackageFaqsTab
                packageId={editItem?.id ?? null}
              />
            )}
            {tab === 'SEO' && (
              <PackageSeoTab
                packageId={editItem?.id ?? null}
                form={form}
                onChange={handleChange}
              />
            )}
            {tab !== 'General' && tab !== 'Gallery' && tab !== 'Itinerary' && tab !== 'Highlights' && tab !== 'Inclusions' && tab !== 'Exclusions' && tab !== 'FAQs' && tab !== 'SEO' && (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
                <p className="text-sm font-medium text-foreground">{tab}</p>
                <p className="mt-1 text-sm text-muted-foreground">Coming Soon</p>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete Package"
        message="Are you sure you want to delete this package? This action cannot be undone."
        itemName={deleteTarget?.title}
      />
    </div>
  );
}
