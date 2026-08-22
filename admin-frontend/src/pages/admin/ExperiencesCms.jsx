/**
 * ExperiencesCms — Home Experiences CMS page.
 *
 * Architecture (identical to Collections / FeaturedDestinations):
 *   Component → React Query (useExperiences / useCreateExperience /
 *               useUpdateExperience / useDeleteExperience / useReorderExperiences)
 *             → HomeService → home.api.js / media.api.js → Axios client
 *
 * Backend field mapping:
 *   title             → text (required, max 255)
 *   slug              → text (required, unique, auto-generated from title)
 *   short_description → textarea
 *   icon              → text (optional — emoji or icon name, e.g. "🍽️" or "dining")
 *   image_id          → media upload (stored as ID, resolved to URL for preview)
 *   button_text       → CTA label
 *   button_url        → CTA link
 *   display_order     → integer (auto-increments on create)
 *   is_active         → published / draft toggle
 *
 * Fields in original mock NOT in backend (removed):
 *   destination, category, duration, price — none are backend fields
 */
import { useEffect, useRef, useState } from 'react';
import {
  Plus,

  Pencil,
  Trash2,
  Eye,
  Power,
  Save,
  Image as ImageIcon,
  Upload,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { TableSkeleton } from '@/components/admin/SkeletonTable';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import {
  useExperiences,
  useCreateExperience,
  useUpdateExperience,
  useDeleteExperience,

  useUploadHeroMedia,
} from '@/hooks/use-home';

const cn = (...c) => c.filter(Boolean).join(' ');

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE_MB = 10;
const DRAWER_TABS = ['General', 'Media', 'Settings'];

function toSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const EMPTY_FORM = {
  title: '',
  slug: '',
  short_description: '',
  icon: '',
  image_id: null,
  image_url: null,
  button_text: '',
  button_url: '',
  display_order: 1,
  is_active: true,
};

export default function ExperiencesCms() {
  const { toast } = useToast();

  const { data: experiences = [], isLoading, isError, error } = useExperiences();

  const [search, setSearch] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(DRAWER_TABS[0]);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [imageUrl, setImageUrl] = useState(null);

  const imageFileRef = useRef(null);

  useEffect(() => {
    if (drawerOpen) {
      if (editItem) {
        setForm({ ...editItem });
        setImageUrl(editItem.image_url ?? null);
      } else {
        setForm({ ...EMPTY_FORM, display_order: experiences.length + 1 });
        setImageUrl(null);
      }
      setActiveTab(DRAWER_TABS[0]);
    }
  }, [drawerOpen, editItem]); // eslint-disable-line react-hooks/exhaustive-deps

  const createMutation = useCreateExperience({
    onSuccess: () => {
      toast({ title: 'Experience created', description: 'New experience added successfully.' });
      setDrawerOpen(false);
    },
    onError: (err) => handleApiError(err, toast),
  });

  const updateMutation = useUpdateExperience({
    onSuccess: () => {
      toast({ title: 'Experience saved', description: 'Changes published successfully.' });
      setDrawerOpen(false);
    },
    onError: (err) => handleApiError(err, toast),
  });

  const deleteMutation = useDeleteExperience({
    onSuccess: () => {
      toast({ title: 'Experience deleted' });
      setDeleteTarget(null);
    },
    onError: (err) => handleApiError(err, toast),
  });


  const uploadMutation = useUploadHeroMedia({
    onSuccess: (media) => {
      setForm((f) => ({ ...f, image_id: media.id }));
      setImageUrl(media.full_url);
      toast({ title: 'Image uploaded' });
    },
    onError: (err) => handleApiError(err, toast),
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleChange = (field, value) => {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === 'title' && (!f.slug || f.slug === toSlug(f.title))) {
        next.slug = toSlug(value);
      }
      return next;
    });
  };

  const handleSave = () => {
    if (isSaving) return;
    if (!form.title?.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }
    if (form.title.length > 255) {
      toast({ title: 'Title must be 255 characters or less', variant: 'destructive' });
      return;
    }
    if (!form.slug?.trim()) {
      toast({ title: 'Slug is required', variant: 'destructive' });
      return;
    }
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, formValues: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload JPG, PNG, WebP, or GIF.', variant: 'destructive' });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast({ title: 'File too large', description: `Maximum size is ${MAX_IMAGE_SIZE_MB}MB.`, variant: 'destructive' });
      return;
    }
    uploadMutation.mutate({ file, folder: 'home/experiences' });
  };

  const openCreate = () => { setEditItem(null); setDrawerOpen(true); };
  const openEdit = (item) => { setEditItem(item); setDrawerOpen(true); };

  const handleToggleActive = (item) => {
    updateMutation.mutate({ id: item.id, formValues: { ...item, is_active: !item.is_active } });
  };


  const filtered = experiences.filter(
    (item) =>
      search === '' ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.short_description ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Home Experiences" description="Manage experiences displayed on the homepage grid" />
        <TableSkeleton rows={4} columns={4} selectable={false} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm">{error?.message || 'Failed to load experiences'}</p>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={imageFileRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={handleFileChange}
      />

      <PageHeader
        title="Home Experiences"
        description="Manage experiences displayed on the homepage grid"
        searchPlaceholder="Search experiences..."
        onSearch={setSearch}
        onAdd={openCreate}
        addLabel="Add Experience"
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
          Experiences appear in a 3-column grid on the homepage. Show up to 6 items.
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
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No experiences to preview.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.filter((e) => e.is_active).slice(0, 6).map((e) => (
                <div key={e.id} className="bg-white border border-border rounded-lg overflow-hidden">
                  <div className="aspect-video overflow-hidden bg-muted">
                    {e.image_url ? (
                      <img src={e.image_url} alt={e.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {e.icon ? (
                          <span className="text-3xl">{e.icon}</span>
                        ) : (
                          <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-foreground">{e.title}</p>
                    {e.short_description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{e.short_description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Items list */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-xl">
          <EmptyState
            title="No experiences yet"
            message="Get started by adding your first experience."
            actionLabel="Add Experience"
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
                  'group flex items-center gap-3 p-3 bg-white border border-border rounded-xl transition-all hover:border-primary/30 hover:shadow-soft',
                  !item.is_active && 'opacity-50',
                )}
              >
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                  {index + 1}
                </div>

                {/* Thumbnail / icon */}
                <div className="w-14 h-10 rounded-lg overflow-hidden border border-border bg-muted shrink-0 flex items-center justify-center">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  ) : item.icon ? (
                    <span className="text-xl">{item.icon}</span>
                  ) : (
                    <ImageIcon className="w-4 h-4 text-muted-foreground/40" />
                  )}
                </div>

                {/* Title + description */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                  {item.short_description && (
                    <p className="text-xs text-muted-foreground truncate">{item.short_description}</p>
                  )}
                </div>

                {/* Slug */}
                <div className="hidden md:block min-w-0 max-w-[10rem] shrink-0">
                  <p className="text-xs font-mono text-muted-foreground truncate">{item.slug}</p>
                </div>

                {/* Status */}
                <div className="w-20">
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
            <Plus className="w-4 h-4" /> Add Experience
          </button>
        </div>
      )}

      {/* ── Drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <div className="relative ml-auto h-full w-full max-w-2xl bg-white shadow-floating flex flex-col">
            <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-border shrink-0">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-foreground tracking-tight">
                  {editItem ? 'Edit Experience' : 'Create New Experience'}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {editItem ? editItem.title : 'Add a new item to Experiences Section'}
                </p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-2 -mr-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground shrink-0">
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
                  <DrawerField label="Title" hint="" required>
                    <DrawerInput
                      value={form.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="e.g. Private Yacht Dining"
                      maxLength={255}
                    />
                  </DrawerField>

                  <DrawerField label="Slug" hint="Auto-generated from title. Must be unique.">
                    <DrawerInput
                      value={form.slug}
                      onChange={(e) => handleChange('slug', toSlug(e.target.value))}
                      placeholder="e.g. private-yacht-dining"
                      maxLength={255}
                    />
                  </DrawerField>

                  <DrawerField label="Short Description" hint="">
                    <DrawerInput
                      textarea
                      value={form.short_description}
                      onChange={(e) => handleChange('short_description', e.target.value)}
                      placeholder="Brief description shown on the card…"
                    />
                  </DrawerField>

                  <DrawerField label="Icon" hint="Emoji or icon name shown when no image is set (e.g. 🍽️).">
                    <DrawerInput
                      value={form.icon}
                      onChange={(e) => handleChange('icon', e.target.value)}
                      placeholder="e.g. 🍽️ or dining"
                      maxLength={100}
                    />
                  </DrawerField>

                  <div className="grid grid-cols-2 gap-4">
                    <DrawerField label="Button Text" hint="">
                      <DrawerInput
                        value={form.button_text}
                        onChange={(e) => handleChange('button_text', e.target.value)}
                        placeholder="Explore"
                        maxLength={255}
                      />
                    </DrawerField>
                    <DrawerField label="Button URL" hint="">
                      <DrawerInput
                        value={form.button_url}
                        onChange={(e) => handleChange('button_url', e.target.value)}
                        placeholder="/experiences/yacht-dining"
                      />
                    </DrawerField>
                  </div>
                </>
              )}

              {activeTab === 'Media' && (
                <DrawerField label="Experience Image" hint="Landscape (16:9) recommended. Max 10MB.">
                  <div className="space-y-3">
                    <div className="aspect-video rounded-lg overflow-hidden border border-border bg-muted relative">
                      {imageUrl ? (
                        <img src={imageUrl} alt="Experience" className="w-full h-full object-cover" />
                      ) : form.icon ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-5xl">{form.icon}</span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
                        </div>
                      )}
                      {uploadMutation.isPending && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => imageFileRef.current?.click()}
                      disabled={uploadMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary bg-primary/8 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-60"
                    >
                      <Upload className="w-4 h-4" />
                      {imageUrl ? 'Replace Image' : 'Upload Image'}
                    </button>
                  </div>
                </DrawerField>
              )}

              {activeTab === 'Settings' && (
                <>
                  <DrawerField label="Display Order" hint="Lower numbers appear first.">
                    <DrawerInput
                      type="number"
                      value={String(form.display_order)}
                      onChange={(e) => handleChange('display_order', Number(e.target.value))}
                      placeholder="1"
                    />
                  </DrawerField>

                  <DrawerField label="Visibility" hint="">
                    <DrawerSelect
                      options={[
                        { value: 'published', label: 'Published' },
                        { value: 'draft', label: 'Draft' },
                      ]}
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
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors"
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
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Experience"
        message="Are you sure you want to delete this experience? This action cannot be undone."
        itemName={deleteTarget?.title}
      />
    </div>
  );
}
