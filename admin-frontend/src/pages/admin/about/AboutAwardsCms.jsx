/**
 * AboutAwardsCms — About Page › Awards & Recognition
 *
 * List-based section. Each award: title, organization, award_date, description, display_order, is_active.
 * Backend: /api/v1/about/awards
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Plus, Pencil, Trash2,
  Loader2, AlertCircle, Save, X,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { TableSkeleton } from '@/components/admin/SkeletonTable';
import { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import { useAwards, useCreateAward, useUpdateAward, useDeleteAward, useReorderAwards } from '@/hooks/use-about';

const cn = (...c) => c.filter(Boolean).join(' ');
const EMPTY_FORM = { title: '', organization: '', award_date: '', description: '', image_id: null, display_order: 1, is_active: true };

export default function AboutAwardsCms() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: awards = [], isLoading, isError, error } = useAwards();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const createMutation = useCreateAward({ onSuccess: () => { toast({ title: 'Award added' }); setDrawerOpen(false); }, onError: (err) => handleApiError(err, toast) });
  const updateMutation = useUpdateAward({ onSuccess: () => { toast({ title: 'Award saved' }); setDrawerOpen(false); }, onError: (err) => handleApiError(err, toast) });
  const deleteMutation = useDeleteAward({ onSuccess: () => { toast({ title: 'Award deleted' }); setDeleteTarget(null); }, onError: (err) => handleApiError(err, toast) });
  const reorderMutation = useReorderAwards({ onError: (err) => handleApiError(err, toast) });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const openCreate = () => { setEditItem(null); setForm({ ...EMPTY_FORM, display_order: awards.length + 1 }); setDrawerOpen(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ title: item.title ?? '', organization: item.organization ?? '', award_date: item.award_date ?? '', description: item.description ?? '', image_id: item.image_id ?? null, display_order: item.display_order ?? 1, is_active: item.is_active ?? true }); setDrawerOpen(true); };

  const handleSave = () => {
    if (!form.title?.trim()) { toast({ title: 'Title is required', variant: 'destructive' }); return; }
    if (editItem) { updateMutation.mutate({ id: editItem.id, form }); } else { createMutation.mutate(form); }
  };

  if (isLoading) return (<div><button onClick={() => navigate('/admin/website/about')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"><ChevronLeft className="w-4 h-4" /> About Page Sections</button><PageHeader title="Awards" description="Awards and recognition" searchPlaceholder="" onSearch={null} onAdd={null} filters={null} onFilter={null} activeFilter={null} onSort={null} onExport={null} onImport={null} actions={null} /><TableSkeleton rows={4} columns={3} selectable={false} /></div>);
  if (isError) return (<div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive"><AlertCircle className="w-8 h-8" /><p className="text-sm">{error?.message || 'Failed to load awards'}</p></div>);

  return (
    <div>
      <button onClick={() => navigate('/admin/website/about')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ChevronLeft className="w-4 h-4" /> About Page Sections
      </button>
      <PageHeader title="Awards & Recognition" description="Awards, accolades and certifications" searchPlaceholder="" onSearch={null} onAdd={openCreate} addLabel="Add Award" filters={null} onFilter={null} activeFilter={null} onSort={null} onExport={null} onImport={null} actions={null} />

      {awards.length === 0 ? (
        <div className="bg-white border border-border rounded-xl"><EmptyState icon={null} title="No awards yet" message="Add your first award or recognition." actionLabel="Add Award" onAction={openCreate} action={null} /></div>
      ) : (
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground"><span>{awards.length} awards</span></div>
          <div className="space-y-2">
            {awards.map((item, index) => (
              <div key={item.id} className={cn('group flex items-center gap-3 p-3 bg-white border rounded-xl transition-all hover:border-primary/30 hover:shadow-soft', 'border-border', !item.is_active && 'opacity-60')}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                  {item.organization && <p className="text-xs text-muted-foreground truncate">{item.organization}{item.award_date ? ` · ${item.award_date}` : ''}</p>}
                </div>
                <StatusBadge status={item.is_active ? 'Published' : 'Draft'} className="" />
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg hover:bg-destructive/5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={openCreate} className="w-full mt-2 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"><Plus className="w-4 h-4" /> Add Award</button>
        </div>
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <div className="relative ml-auto h-full w-full max-w-lg bg-white shadow-floating flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h2 className="text-lg font-bold text-foreground">{editItem ? 'Edit Award' : 'Add Award'}</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <DrawerField label="Award Title" hint="" required><DrawerInput value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Best Luxury Travel Agency" maxLength={255} /></DrawerField>
              <DrawerField label="Awarding Organisation" hint=""><DrawerInput value={form.organization} onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))} placeholder="e.g. World Travel Awards" maxLength={255} /></DrawerField>
              <DrawerField label="Award Date" hint="e.g. 2023 or May 2023"><DrawerInput value={form.award_date} onChange={(e) => setForm((f) => ({ ...f, award_date: e.target.value }))} placeholder="2023" maxLength={50} /></DrawerField>
              <DrawerField label="Description" hint=""><DrawerInput textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description of this award…" /></DrawerField>
              <DrawerField label="Display Order" hint="Lower numbers appear first"><DrawerInput type="number" value={String(form.display_order)} onChange={(e) => setForm((f) => ({ ...f, display_order: Number(e.target.value) }))} placeholder="1" /></DrawerField>
              <DrawerField label="Visibility" hint=""><DrawerSelect options={[{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }]} value={form.is_active ? 'published' : 'draft'} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value === 'published' }))} defaultValue={form.is_active ? 'published' : 'draft'} disabled={false} /></DrawerField>
            </div>
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border bg-muted/30 shrink-0">
              <div>{editItem && <button onClick={() => { setDrawerOpen(false); setDeleteTarget(editItem); }} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /> Delete</button>}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setDrawerOpen(false)} className="px-4 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{isSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} title="Delete Award" message="Are you sure you want to delete this award?" itemName={deleteTarget?.title} />
    </div>
  );
}
