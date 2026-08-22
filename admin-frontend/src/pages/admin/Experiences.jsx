/**
 * Experiences — Experience Management CRUD page.
 *
 * Architecture:
 *   Component → React Query (useExperiences / useCreateExperience /
 *               useUpdateExperience / useDeleteExperience)
 *             → HomeService → home.api.js → /api/v1/home/experiences → Backend
 *
 * Backend field mapping (LuxuryExperienceResponse):
 *   title            → Experience title (required)
 *   slug             → URL slug (required, auto-generated on create)
 *   short_description → Description
 *   icon             → Icon name or emoji
 *   image_id         → Hero image (MediaUploader)
 *   button_text      → CTA button label
 *   button_url       → CTA button URL
 *   display_order    → Sort order
 *   is_active        → Published / Draft
 *
 * Fields in mock NOT in backend (removed):
 *   category, duration, price, destination → no backend columns
 */
import { useEffect, useState, useMemo } from 'react';
import {
  Star, Compass, Image as ImageIcon, Loader2, AlertCircle,
  Pencil, Trash2, Power, Plus, Save,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import Pagination from '@/components/admin/Pagination';
import Drawer, { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { TableSkeleton } from '@/components/admin/SkeletonTable';
import MediaUploader from '@/components/media/MediaUploader';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import {
  useExperiences,
  useCreateExperience,
  useUpdateExperience,
  useDeleteExperience,
} from '@/hooks/use-home';

const cn = (...c) => c.filter(Boolean).join(' ');
const PER_PAGE = 10;

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function fmtDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return '—'; }
}

const EMPTY_FORM = {
  title: '', slug: '', short_description: '', icon: '',
  image_id: null, image_url: null,
  button_text: '', button_url: '',
  display_order: 1, is_active: true,
};

export default function Experiences() {
  const { toast } = useToast();
  const { data: allExperiences = [], isLoading, isError, error } = useExperiences();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { setPage(1); }, [search, activeFilter]);

  useEffect(() => {
    if (!drawerOpen) return;
    if (editItem) {
      setForm({
        title: editItem.title ?? '', slug: editItem.slug ?? '',
        short_description: editItem.short_description ?? '', icon: editItem.icon ?? '',
        image_id: editItem.image_id ?? null, image_url: editItem.image_url ?? null,
        button_text: editItem.button_text ?? '', button_url: editItem.button_url ?? '',
        display_order: editItem.display_order ?? 1, is_active: editItem.is_active ?? true,
      });
    } else {
      setForm({ ...EMPTY_FORM, display_order: allExperiences.length + 1 });
    }
  }, [drawerOpen, editItem]); // eslint-disable-line react-hooks/exhaustive-deps

  const createMutation = useCreateExperience({
    onSuccess: () => { toast({ title: 'Experience created' }); setDrawerOpen(false); },
    onError: (err) => handleApiError(err, toast),
  });
  const updateMutation = useUpdateExperience({
    onSuccess: () => { toast({ title: 'Experience saved' }); setDrawerOpen(false); },
    onError: (err) => handleApiError(err, toast),
  });
  const deleteMutation = useDeleteExperience({
    onSuccess: () => { toast({ title: 'Experience deleted' }); setDeleteTarget(null); },
    onError: (err) => handleApiError(err, toast),
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const handleTitleChange = (value) => setForm((f) => ({
    ...f, title: value, slug: editItem ? f.slug : toSlug(value),
  }));

  const handleSave = () => {
    if (!form.title?.trim()) { toast({ title: 'Title is required', variant: 'destructive' }); return; }
    if (!form.slug?.trim()) { toast({ title: 'Slug is required', variant: 'destructive' }); return; }
    const { image_url: _url, ...payload } = form;
    if (editItem) { updateMutation.mutate({ id: editItem.id, formValues: payload }); }
    else { createMutation.mutate(payload); }
  };

  const openCreate = () => { setEditItem(null); setDrawerOpen(true); };
  const openEdit = (item) => { setEditItem(item); setDrawerOpen(true); };

  const handleToggleActive = (e, item) => {
    e.stopPropagation();
    updateMutation.mutate({ id: item.id, formValues: { is_active: !item.is_active } });
  };
  const handleDeleteClick = (e, item) => { e.stopPropagation(); setDeleteTarget(item); };

  const filtered = useMemo(() => {
    let list = allExperiences;
    if (activeFilter === 'Published') list = list.filter((e) => e.is_active);
    else if (activeFilter === 'Draft') list = list.filter((e) => !e.is_active);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) => e.title.toLowerCase().includes(q) || (e.slug ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [allExperiences, search, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const published = allExperiences.filter((e) => e.is_active).length;
  const drafts = allExperiences.filter((e) => !e.is_active).length;

  const filterTabs = [
    { label: 'All', value: 'all', count: allExperiences.length },
    { label: 'Published', value: 'Published', count: published },
    { label: 'Draft', value: 'Draft', count: drafts },
  ];

  if (isLoading) return (
    <div>
      <PageHeader title="Experiences" description="Manage curated travel experiences and activities"
        searchPlaceholder="Search experiences…" onSearch={setSearch} onAdd={openCreate}
        addLabel="New Experience" filters={filterTabs} activeFilter={activeFilter}
        onFilter={setActiveFilter} onExport={() => {}} onSort={null} onImport={null} actions={null} />
      <TableSkeleton rows={8} columns={5} selectable={false} />
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive">
      <AlertCircle className="w-8 h-8" />
      <p className="text-sm">{error?.message || 'Failed to load experiences'}</p>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Experiences" description="Manage curated travel experiences and activities"
        searchPlaceholder="Search experiences…" onSearch={setSearch}
        onAdd={openCreate} addLabel="New Experience"
        filters={filterTabs} activeFilter={activeFilter} onFilter={setActiveFilter}
        onExport={() => {}} onSort={null} onImport={null} actions={null}
      />

      {paginated.length === 0 ? (
        <div className="bg-white border border-border rounded-xl">
          <EmptyState icon={Compass}
            title={search ? `No results for "${search}"` : 'No experiences yet'}
            message={search ? 'Try a different search term.' : 'Add your first experience.'}
            actionLabel="New Experience" onAction={openCreate} action={null} />
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[3rem_1fr_14rem_6rem_7rem_5rem] gap-2 px-4 py-2.5 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span /><span>Experience</span><span>Description</span>
            <span>Icon</span><span>Status</span><span />
          </div>

          <div className="divide-y divide-border">
            {paginated.map((item) => {
              const isUpdating = updateMutation.isPending && updateMutation.variables?.id === item.id;
              return (
                <div key={item.id} onClick={() => openEdit(item)}
                  className="group grid grid-cols-[3rem_1fr_14rem_6rem_7rem_5rem] gap-2 items-center px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors">
                  {/* Thumbnail */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      : <Compass className="w-4 h-4 text-muted-foreground/40" />}
                  </div>
                  {/* Title + slug */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.slug}</p>
                  </div>
                  {/* Description */}
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.short_description || '—'}</p>
                  {/* Icon */}
                  <p className="text-sm text-muted-foreground truncate">{item.icon || '—'}</p>
                  {/* Status */}
                  <StatusBadge status={item.is_active ? 'Published' : 'Draft'} className="" />
                  {/* Row actions */}
                  <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mx-1" /> : (<>
                      <button onClick={(e) => { e.stopPropagation(); openEdit(item); }} title="Edit" className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={(e) => handleToggleActive(e, item)} title={item.is_active ? 'Set Draft' : 'Publish'} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Power className="w-3.5 h-3.5" /></button>
                      <button onClick={(e) => handleDeleteClick(e, item)} title="Delete" className="p-1.5 rounded-lg hover:bg-destructive/5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                    </>)}
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={openCreate} className="w-full flex items-center justify-center gap-2 py-3 border-t border-dashed border-border text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
            <Plus className="w-4 h-4" /> Add Experience
          </button>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} total={filtered.length} perPage={PER_PAGE} onPageChange={setPage} selectedCount={0} />

      {/* ── Drawer ── */}
      <Drawer
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title={editItem ? 'Edit Experience' : 'Create New Experience'}
        description={editItem ? editItem.title : 'Add a new experience to your catalog'}
        tabs={['General', 'Content', 'Media', 'Settings']}
        width="lg" onSave={handleSave} isSaving={isSaving}
        activeTab={undefined} onTabChange={undefined}
        onDelete={editItem ? () => { setDrawerOpen(false); setDeleteTarget(editItem); } : undefined}
      >
        {(tab) => (
          <div className="space-y-5">
            {tab === 'General' && (<>
              <DrawerField label="Title" hint="" required>
                <DrawerInput value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="e.g. Private Overwater Dining" maxLength={255} defaultValue="" textarea={false} disabled={false} />
              </DrawerField>
              <div className="grid grid-cols-2 gap-4">
                <DrawerField label="Slug" hint="Auto-generated from title" required={false}>
                  <DrawerInput value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} placeholder="private-overwater-dining" maxLength={255} defaultValue="" textarea={false} disabled={false} />
                </DrawerField>
                <DrawerField label="Icon" hint="Icon name or emoji (optional)" required={false}>
                  <DrawerInput value={form.icon} onChange={(e) => handleChange('icon', e.target.value)} placeholder="e.g. 🍽️ or dining" maxLength={50} defaultValue="" textarea={false} disabled={false} />
                </DrawerField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DrawerField label="Button Text" hint="" required={false}>
                  <DrawerInput value={form.button_text} onChange={(e) => handleChange('button_text', e.target.value)} placeholder="Book Experience" maxLength={255} defaultValue="" textarea={false} disabled={false} />
                </DrawerField>
                <DrawerField label="Button URL" hint="" required={false}>
                  <DrawerInput value={form.button_url} onChange={(e) => handleChange('button_url', e.target.value)} placeholder="/experiences/private-dining" defaultValue="" textarea={false} maxLength={500} disabled={false} />
                </DrawerField>
              </div>
              <DrawerField label="Display Order" hint="Lower numbers appear first" required={false}>
                <DrawerInput type="number" value={String(form.display_order)} onChange={(e) => handleChange('display_order', Number(e.target.value))} placeholder="1" defaultValue="1" textarea={false} disabled={false} maxLength={10} />
              </DrawerField>
            </>)}

            {tab === 'Content' && (
              <DrawerField label="Description" hint="Short description displayed on the experience card" required={false}>
                <DrawerInput textarea value={form.short_description} onChange={(e) => handleChange('short_description', e.target.value)} placeholder="Savour a private dining experience beneath the stars, surrounded by the warm waters of the Indian Ocean…" defaultValue="" maxLength={500} disabled={false} />
              </DrawerField>
            )}

            {tab === 'Media' && (
              <DrawerField label="Experience Image" hint="Recommended: 1200×800px · JPG or WebP · Max 10MB" required={false}>
                <MediaUploader
                  module="experiences" section="cards" accept="image/*" maxSizeMB={10}
                  value={form.image_url} mediaId={form.image_id} media={null}
                  onChange={(media) => setForm((f) => ({ ...f, image_id: media.id, image_url: media.full_url }))}
                  onClear={() => setForm((f) => ({ ...f, image_id: null, image_url: null }))}
                  label="Upload experience image" hint="Used as the card thumbnail"
                />
              </DrawerField>
            )}

            {tab === 'Settings' && (
              <DrawerField label="Visibility" hint="" required={false}>
                <DrawerSelect
                  options={[{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }]}
                  value={form.is_active ? 'published' : 'draft'}
                  onChange={(e) => handleChange('is_active', e.target.value === 'published')}
                  defaultValue={form.is_active ? 'published' : 'draft'} disabled={false}
                />
              </DrawerField>
            )}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Experience" message="Are you sure you want to delete this experience? This cannot be undone."
        itemName={deleteTarget?.title}
      />
    </div>
  );
}
