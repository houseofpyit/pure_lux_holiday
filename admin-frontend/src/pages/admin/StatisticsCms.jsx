/**
 * StatisticsCms — Home Statistics CMS page.
 *
 * Architecture (identical to Collections / Experiences / WhyChooseUs):
 *   Component → React Query (useStatistics / useCreateStatistic /
 *               useUpdateStatistic / useDeleteStatistic / useReorderStatistics)
 *             → HomeService → home.api.js → Axios client
 *
 * Backend field mapping:
 *   title         → UI "Label" (required, max 255)
 *   value         → the numeric/text value shown (required, max 255)
 *   suffix        → optional suffix after value (e.g. "+", "K", "%")
 *   icon          → optional emoji / icon name
 *   display_order → integer (auto-increments on create)
 *   is_active     → published / draft toggle
 *
 * No slug, no image — simplest Home CMS module.
 *
 * Fields in original mock NOT in backend (removed):
 *   label    → replaced by backend field "title"
 *   status   → replaced by is_active boolean
 *   animation duration / count-up → UI-only, not stored
 */
import { useEffect, useState } from 'react';
import {
  Plus, Pencil, Trash2, Eye, Power, Save,
  Loader2, AlertCircle, X,
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
  useStatistics,
  useCreateStatistic,
  useUpdateStatistic,
  useDeleteStatistic,
  useReorderStatistics,
} from '@/hooks/use-home';

const cn = (...c) => c.filter(Boolean).join(' ');
const DRAWER_TABS = ['General', 'Settings'];

const EMPTY_FORM = {
  title: '',
  value: '',
  suffix: '',
  icon: '',
  display_order: 1,
  is_active: true,
};

export default function StatisticsCms() {
  const { toast } = useToast();

  const { data: statistics = [], isLoading, isError, error } = useStatistics();

  const [search, setSearch] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(DRAWER_TABS[0]);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (drawerOpen) {
      setForm(editItem ? { ...editItem } : { ...EMPTY_FORM, display_order: statistics.length + 1 });
      setActiveTab(DRAWER_TABS[0]);
    }
  }, [drawerOpen, editItem]); // eslint-disable-line react-hooks/exhaustive-deps

  const createMutation = useCreateStatistic({
    onSuccess: () => {
      toast({ title: 'Statistic created' });
      setDrawerOpen(false);
    },
    onError: (err) => handleApiError(err, toast),
  });

  const updateMutation = useUpdateStatistic({
    onSuccess: () => {
      toast({ title: 'Statistic saved' });
      setDrawerOpen(false);
    },
    onError: (err) => handleApiError(err, toast),
  });

  const deleteMutation = useDeleteStatistic({
    onSuccess: () => {
      toast({ title: 'Statistic deleted' });
      setDeleteTarget(null);
    },
    onError: (err) => handleApiError(err, toast),
  });

  const reorderMutation = useReorderStatistics({
    onError: (err) => handleApiError(err, toast),
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = () => {
    if (isSaving) return;
    if (!form.title?.trim()) {
      toast({ title: 'Label is required', variant: 'destructive' });
      return;
    }
    if (!form.value?.trim()) {
      toast({ title: 'Value is required', variant: 'destructive' });
      return;
    }
    if (form.title.length > 255) {
      toast({ title: 'Label must be 255 characters or less', variant: 'destructive' });
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

  const filtered = statistics.filter(
    (item) =>
      search === '' ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.value.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Statistics" description="Manage the homepage statistics counter section" />
        <TableSkeleton rows={4} columns={4} selectable={false} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm">{error?.message || 'Failed to load statistics'}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Statistics"
        description="Manage the homepage statistics counter section"
        searchPlaceholder="Search statistics..."
        onSearch={setSearch}
        onAdd={openCreate}
        addLabel="Add Statistic"
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
          Statistics animate from 0 to the target value when scrolled into view. Display up to 4 items.
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
            <p className="text-sm text-muted-foreground text-center py-8">No statistics to preview.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl">
              {filtered.filter((s) => s.is_active).map((s) => (
                <div key={s.id} className="text-center">
                  <p className="text-3xl font-bold text-white">
                    {s.icon && <span className="mr-1">{s.icon}</span>}
                    {s.value}{s.suffix}
                  </p>
                  <p className="text-xs text-blue-200 mt-1">{s.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-xl">
          <EmptyState
            title="No statistics yet"
            message="Get started by adding your first statistic."
            actionLabel="Add Statistic"
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

                {/* Icon badge */}
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  {item.icon ? (
                    <span className="text-base">{item.icon}</span>
                  ) : (
                    <span className="text-xs font-bold text-primary">{item.title.charAt(0)}</span>
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                </div>

                {/* Value */}
                <div className="w-24 shrink-0">
                  <span className="text-lg font-bold text-primary">{item.value}{item.suffix}</span>
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
            <Plus className="w-4 h-4" /> Add Statistic
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
                  {editItem ? 'Edit Statistic' : 'Create New Statistic'}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {editItem ? editItem.title : 'Add a new item to Statistics Section'}
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
                  <DrawerField label="Label" hint="Descriptive label shown below the value (e.g. Years of Excellence)" required>
                    <DrawerInput
                      value={form.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="e.g. Years of Excellence"
                      maxLength={255}
                    />
                  </DrawerField>

                  <div className="grid grid-cols-2 gap-4">
                    <DrawerField label="Value" hint="The number or text (e.g. 15, 10000)" required>
                      <DrawerInput
                        value={form.value}
                        onChange={(e) => handleChange('value', e.target.value)}
                        placeholder="e.g. 15"
                        maxLength={255}
                      />
                    </DrawerField>
                    <DrawerField label="Suffix" hint="Optional. e.g. +, K, %">
                      <DrawerInput
                        value={form.suffix}
                        onChange={(e) => handleChange('suffix', e.target.value)}
                        placeholder="e.g. +"
                        maxLength={50}
                      />
                    </DrawerField>
                  </div>

                  <DrawerField label="Icon" hint="Optional. Emoji or icon name shown alongside the value.">
                    <DrawerInput
                      value={form.icon}
                      onChange={(e) => handleChange('icon', e.target.value)}
                      placeholder="e.g. ⭐ or Trophy"
                      maxLength={100}
                    />
                  </DrawerField>
                </>
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
        title="Delete Statistic"
        message="Are you sure you want to delete this statistic? This action cannot be undone."
        itemName={deleteTarget?.title}
      />
    </div>
  );
}
