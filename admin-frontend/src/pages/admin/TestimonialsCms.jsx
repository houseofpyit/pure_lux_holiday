/**
 * TestimonialsCms — Home Testimonials CMS page.
 *
 * Architecture (identical to Collections / Experiences / WhyChooseUs):
 *   Component → React Query (useTestimonials / useCreateTestimonial / …)
 *             → HomeService → home.api.js → /api/v1/testimonials → Backend
 *
 * Backend field mapping:
 *   customer_name        → Customer Name (required)
 *   customer_location    → Location
 *   customer_designation → Designation / Title
 *   title                → Review Title
 *   review               → Review text
 *   rating               → 1–5 stars
 *   customer_photo_id    → profile photo (media upload)
 *   background_image_id  → large testimonial image (media upload)
 *   video_id             → optional testimonial video (media upload)
 *   video_thumbnail_id   → video poster image (media upload)
 *   travel_date          → Trip date (YYYY-MM-DD string)
 *   homepage_featured    → shown on homepage slider
 *   is_active            → published / draft
 *   display_order        → ordering
 *
 * Fields in original mock NOT in backend (removed):
 *   trip (free text) → replaced by travel_date
 *   featured (bool)  → mapped to homepage_featured
 */
import { useEffect, useState } from 'react';
import {
  Plus, Pencil, Trash2, Eye, Power, Save,
  Image as ImageIcon, Loader2, AlertCircle, X, PlayCircle, FileVideo,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { TableSkeleton } from '@/components/admin/SkeletonTable';
import MediaUploader from '@/components/media/MediaUploader';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import {
  useTestimonials,
  useCreateTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
  useReorderTestimonials,
} from '@/hooks/use-home';

const cn = (...c) => c.filter(Boolean).join(' ');
const DRAWER_TABS = ['General', 'Content', 'Media', 'Settings'];

const EMPTY_FORM = {
  customer_name: '',
  customer_location: '',
  customer_designation: '',
  title: '',
  review: '',
  rating: 5,
  customer_photo_id: null,
  background_image_id: null,
  video_id: null,
  video_thumbnail_id: null,
  travel_date: '',
  homepage_featured: true,
  is_featured: false,
  is_active: true,
  display_order: 1,
};

const EMPTY_MEDIA_PREVIEW = {
  customerPhoto: null,
  backgroundImage: null,
  video: null,
  videoThumbnail: null,
};

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={cn('text-2xl transition-colors', star <= value ? 'text-yellow-400' : 'text-muted-foreground/30')}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function testimonialToForm(item, displayOrder) {
  if (!item) return { ...EMPTY_FORM, display_order: displayOrder };
  return {
    customer_name: item.customer_name ?? '',
    customer_location: item.customer_location ?? '',
    customer_designation: item.customer_designation ?? '',
    title: item.title ?? '',
    review: item.review ?? '',
    rating: item.rating ?? 5,
    customer_photo_id: item.customer_photo_id ?? item.profile_image_id ?? null,
    background_image_id: item.background_image_id ?? null,
    video_id: item.video_id ?? null,
    video_thumbnail_id: item.video_thumbnail_id ?? null,
    travel_date: item.travel_date ?? '',
    homepage_featured: item.homepage_featured ?? true,
    is_featured: item.is_featured ?? false,
    is_active: item.is_active ?? true,
    display_order: item.display_order ?? displayOrder,
  };
}

function testimonialToMediaPreview(item) {
  if (!item) return EMPTY_MEDIA_PREVIEW;
  return {
    customerPhoto: item.customer_photo_media ?? null,
    backgroundImage: item.background_image_media ?? null,
    video: item.video_media ?? null,
    videoThumbnail: item.video_thumbnail_media ?? null,
  };
}

function formatBytes(bytes) {
  if (!bytes) return null;
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function formatDuration(seconds) {
  if (!seconds) return null;
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, '0')}`;
}

export default function TestimonialsCms() {
  const { toast } = useToast();

  const { data: testimonials = [], isLoading, isError, error } = useTestimonials();

  const [search, setSearch] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(DRAWER_TABS[0]);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [mediaPreview, setMediaPreview] = useState(EMPTY_MEDIA_PREVIEW);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (drawerOpen) {
      if (editItem) {
        setForm(testimonialToForm(editItem, testimonials.length + 1));
        setMediaPreview(testimonialToMediaPreview(editItem));
      } else {
        setForm(testimonialToForm(null, testimonials.length + 1));
        setMediaPreview(EMPTY_MEDIA_PREVIEW);
      }
      setActiveTab(DRAWER_TABS[0]);
    }
  }, [drawerOpen, editItem]); // eslint-disable-line react-hooks/exhaustive-deps

  const createMutation = useCreateTestimonial({
    onSuccess: () => { toast({ title: 'Testimonial created' }); setDrawerOpen(false); },
    onError: (err) => handleApiError(err, toast),
  });

  const updateMutation = useUpdateTestimonial({
    onSuccess: () => { toast({ title: 'Testimonial saved' }); setDrawerOpen(false); },
    onError: (err) => handleApiError(err, toast),
  });

  const deleteMutation = useDeleteTestimonial({
    onSuccess: () => { toast({ title: 'Testimonial deleted' }); setDeleteTarget(null); },
    onError: (err) => handleApiError(err, toast),
  });

  const reorderMutation = useReorderTestimonials({
    onError: (err) => handleApiError(err, toast),
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleMediaChange = (field, previewKey) => (media) => {
    setForm((f) => ({ ...f, [field]: media.id }));
    setMediaPreview((current) => ({ ...current, [previewKey]: media }));
  };

  const handleMediaClear = (field, previewKey) => () => {
    setForm((f) => ({ ...f, [field]: null }));
    setMediaPreview((current) => ({ ...current, [previewKey]: null }));
  };

  const handleSave = () => {
    if (isSaving) return;
    if (!form.customer_name?.trim()) {
      toast({ title: 'Customer name is required', variant: 'destructive' });
      return;
    }
    if (!form.review?.trim()) {
      toast({ title: 'Review text is required', variant: 'destructive' });
      return;
    }
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, formValues: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const openCreate = () => { setEditItem(null); setDrawerOpen(true); };
  const openEdit = (item) => { setEditItem(item); setDrawerOpen(true); };

  const handleToggleActive = (item) => {
    updateMutation.mutate({ id: item.id, formValues: { ...item, is_active: !item.is_active } });
  };

  const filtered = testimonials.filter(
    (item) =>
      search === '' ||
      item.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      (item.review ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Home Testimonials" description="Manage testimonials displayed in the homepage slider" />
        <TableSkeleton rows={4} columns={4} selectable={false} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm">{error?.message || 'Failed to load testimonials'}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Home Testimonials"
        description="Manage testimonials displayed in the homepage slider"
        searchPlaceholder="Search testimonials..."
        onSearch={setSearch}
        onAdd={openCreate}
        addLabel="Add Testimonial"
        actions={
          <button
            onClick={() => setPreviewOpen(!previewOpen)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/8 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
        }
      />

      <div className="flex items-start gap-3 mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
        <Eye className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Featured testimonials appear in a slider on the homepage. Only 5-star reviews are recommended.
        </p>
      </div>

      {/* Preview */}
      {previewOpen && (
        <div className="mb-6 bg-white border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Section Preview</h3>
            </div>
            <button onClick={() => setPreviewOpen(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          {filtered.filter((t) => t.is_active).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No testimonials to preview.</p>
          ) : (() => {
            const t = filtered.filter((t) => t.is_active)[0];
            return (
              <div className="bg-muted/30 rounded-xl p-6 max-w-lg mx-auto text-center">
                <div className="flex justify-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={cn('text-lg', i < t.rating ? 'text-yellow-400' : 'text-muted-foreground/20')}>★</span>
                  ))}
                </div>
                {t.review && <p className="text-sm text-foreground italic">"{t.review}"</p>}
                <div className="flex items-center justify-center gap-2 mt-4">
                  {t.image_url ? (
                    <img src={t.image_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{t.customer_name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{t.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{t.customer_location}</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-xl">
          <EmptyState
            title="No testimonials yet"
            message="Get started by adding your first testimonial."
            actionLabel="Add Testimonial"
            onAction={openCreate}
          />
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            <span>{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-2">
            {filtered.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  'group flex items-center gap-3 p-3 bg-white border rounded-xl transition-all hover:border-primary/30 hover:shadow-soft',
                  'border-border',
                  !item.is_active && 'opacity-50',
                )}
              >
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                  {index + 1}
                </div>

                {/* Profile photo */}
                <div className="w-9 h-9 rounded-full overflow-hidden border border-border bg-muted shrink-0 flex items-center justify-center">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.customer_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-primary">{item.customer_name.charAt(0)}</span>
                  )}
                </div>

                {/* Name + review snippet */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.customer_name}</p>
                  {item.review && <p className="text-xs text-muted-foreground truncate">{item.review}</p>}
                </div>

                {/* Star rating */}
                <div className="hidden md:flex gap-0.5 shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={cn('text-xs', i < item.rating ? 'text-yellow-400' : 'text-muted-foreground/20')}>★</span>
                  ))}
                </div>

                {/* Status */}
                <div className="w-20 shrink-0">
                  <StatusBadge status={item.is_active ? 'Published' : 'Draft'} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleToggleActive(item)}
                    disabled={updateMutation.isPending}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                    title={item.is_active ? 'Disable' : 'Enable'}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="p-1.5 rounded-lg hover:bg-destructive/5 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={openCreate}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Testimonial
          </button>
        </div>
      )}

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <div className="relative ml-auto h-full w-full max-w-2xl bg-white shadow-floating flex flex-col">
            <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-border shrink-0">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-foreground tracking-tight">
                  {editItem ? 'Edit Testimonial' : 'Add Testimonial'}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {editItem ? editItem.customer_name : 'Add a testimonial to the homepage slider'}
                </p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-2 -mr-2 rounded-lg hover:bg-muted text-muted-foreground shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-1 px-6 border-b border-border shrink-0">
              {DRAWER_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-3 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                    activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {activeTab === 'General' && (
                <>
                  <DrawerField label="Customer Name" hint="" required>
                    <DrawerInput value={form.customer_name} onChange={(e) => handleChange('customer_name', e.target.value)} placeholder="e.g. Sarah Mitchell" maxLength={255} />
                  </DrawerField>
                  <div className="grid grid-cols-2 gap-4">
                    <DrawerField label="Location" hint="">
                      <DrawerInput value={form.customer_location} onChange={(e) => handleChange('customer_location', e.target.value)} placeholder="e.g. London, UK" maxLength={255} />
                    </DrawerField>
                    <DrawerField label="Designation" hint="">
                      <DrawerInput value={form.customer_designation} onChange={(e) => handleChange('customer_designation', e.target.value)} placeholder="e.g. CEO, Acme Corp" maxLength={255} />
                    </DrawerField>
                  </div>
                  <DrawerField label="Review Title" hint="">
                    <DrawerInput value={form.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="e.g. An unforgettable journey" maxLength={255} />
                  </DrawerField>
                  <DrawerField label="Travel Date" hint="Optional. YYYY-MM-DD format.">
                    <DrawerInput type="date" value={form.travel_date} onChange={(e) => handleChange('travel_date', e.target.value)} />
                  </DrawerField>
                  <DrawerField label="Rating" hint="1–5 stars">
                    <StarRating value={form.rating} onChange={(v) => handleChange('rating', v)} />
                  </DrawerField>
                </>
              )}

              {activeTab === 'Content' && (
                <DrawerField label="Review" hint="" required>
                  <DrawerInput textarea value={form.review} onChange={(e) => handleChange('review', e.target.value)} placeholder="What the customer said…" />
                </DrawerField>
              )}

              {activeTab === 'Media' && (
                <>
                  <div className="rounded-xl border border-border overflow-hidden bg-white">
                    <div className="relative min-h-[260px] bg-slate-100">
                      {mediaPreview.backgroundImage?.full_url ? (
                        <img
                          src={mediaPreview.backgroundImage.full_url}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="w-9 h-9 opacity-35" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/35" />
                      {mediaPreview.videoThumbnail?.full_url && (
                        <img
                          src={mediaPreview.videoThumbnail.full_url}
                          alt=""
                          className="absolute right-4 top-4 w-28 h-16 object-cover rounded-lg border border-white/50 shadow-soft"
                        />
                      )}
                      {form.video_id && (
                        <div className="absolute right-4 bottom-4 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 text-xs font-medium text-foreground shadow-soft">
                          <PlayCircle className="w-4 h-4 text-primary" />
                          Video attached
                        </div>
                      )}
                      <div className="relative z-10 h-full min-h-[260px] flex flex-col justify-end p-5 text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/80 bg-white/20 flex items-center justify-center shrink-0">
                            {mediaPreview.customerPhoto?.full_url ? (
                              <img src={mediaPreview.customerPhoto.full_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg font-bold">{form.customer_name?.charAt(0) || '?'}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{form.customer_name || 'Customer Name'}</p>
                            <p className="text-xs text-white/75 truncate">{form.customer_location || 'Location'}</p>
                          </div>
                        </div>
                        {form.review && <p className="mt-4 text-sm leading-6 line-clamp-3">"{form.review}"</p>}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <DrawerField label="Customer Profile Photo" hint="Image only. Recommended 400 x 400. Max 5MB.">
                      <MediaUploader
                        module="home"
                        section="testimonials/profile"
                        accept="image/*"
                        maxSizeMB={5}
                        value={mediaPreview.customerPhoto?.full_url}
                        mediaId={form.customer_photo_id}
                        media={mediaPreview.customerPhoto}
                        onChange={handleMediaChange('customer_photo_id', 'customerPhoto')}
                        onClear={handleMediaClear('customer_photo_id', 'customerPhoto')}
                        aspectClass="aspect-square rounded-full"
                        label="Upload profile photo"
                        hint="Used as the small circular testimonial avatar."
                      />
                    </DrawerField>

                    <DrawerField label="Testimonial Background Image" hint="Image only. Recommended 1600 x 900. Max 10MB.">
                      <MediaUploader
                        module="home"
                        section="testimonials/background"
                        accept="image/*"
                        maxSizeMB={10}
                        value={mediaPreview.backgroundImage?.full_url}
                        mediaId={form.background_image_id}
                        media={mediaPreview.backgroundImage}
                        onChange={handleMediaChange('background_image_id', 'backgroundImage')}
                        onClear={handleMediaClear('background_image_id', 'backgroundImage')}
                        label="Upload background image"
                        hint="Large image shown beside the testimonial text."
                      />
                    </DrawerField>

                    <DrawerField label="Testimonial Video" hint="Optional. MP4, MOV, or WebM. Max 200MB.">
                      <MediaUploader
                        module="home"
                        section="testimonials/video"
                        accept="video/mp4,video/quicktime,video/webm"
                        maxSizeMB={200}
                        value={mediaPreview.video?.full_url}
                        mediaId={form.video_id}
                        media={mediaPreview.video}
                        onChange={handleMediaChange('video_id', 'video')}
                        onClear={handleMediaClear('video_id', 'video')}
                        label="Upload video"
                        hint="Played when the visitor clicks Play."
                      />
                      {mediaPreview.video && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <FileVideo className="w-3.5 h-3.5" />
                          <span className="truncate">{mediaPreview.video.original_name || mediaPreview.video.filename}</span>
                          <span className="shrink-0">{[formatBytes(mediaPreview.video.size), formatDuration(mediaPreview.video.duration)].filter(Boolean).join(' · ')}</span>
                        </div>
                      )}
                    </DrawerField>

                    <DrawerField label="Video Thumbnail" hint="Image only. Poster image before video playback.">
                      <MediaUploader
                        module="home"
                        section="testimonials/video-thumbnail"
                        accept="image/*"
                        maxSizeMB={10}
                        value={mediaPreview.videoThumbnail?.full_url}
                        mediaId={form.video_thumbnail_id}
                        media={mediaPreview.videoThumbnail}
                        onChange={handleMediaChange('video_thumbnail_id', 'videoThumbnail')}
                        onClear={handleMediaClear('video_thumbnail_id', 'videoThumbnail')}
                        label="Upload video thumbnail"
                        hint="Displayed as the poster image before playback."
                      />
                    </DrawerField>
                  </div>
                </>
              )}

              {activeTab === 'Settings' && (
                <>
                  <DrawerField label="Display Order" hint="Lower numbers appear first.">
                    <DrawerInput type="number" value={String(form.display_order)} onChange={(e) => handleChange('display_order', Number(e.target.value))} placeholder="1" />
                  </DrawerField>
                  <DrawerField label="Homepage Featured" hint="Show in the homepage testimonials slider.">
                    <DrawerSelect
                      options={[{ value: 'yes', label: 'Featured on Homepage' }, { value: 'no', label: 'Not Featured' }]}
                      value={form.homepage_featured ? 'yes' : 'no'}
                      onChange={(e) => handleChange('homepage_featured', e.target.value === 'yes')}
                    />
                  </DrawerField>
                  <DrawerField label="Visibility" hint="">
                    <DrawerSelect
                      options={[{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }]}
                      value={form.is_active ? 'published' : 'draft'}
                      onChange={(e) => handleChange('is_active', e.target.value === 'published')}
                    />
                  </DrawerField>
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border bg-muted/30 shrink-0">
              <div>
                {editItem && (
                  <button
                    onClick={() => { setDrawerOpen(false); setDeleteTarget(editItem); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setDrawerOpen(false)} className="px-4 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors">
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
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Testimonial"
        message="Are you sure you want to delete this testimonial? This action cannot be undone."
        itemName={deleteTarget?.customer_name}
      />
    </div>
  );
}
