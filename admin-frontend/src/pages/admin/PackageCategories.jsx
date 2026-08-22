import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Folder, Pencil, Power, Trash2 } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import Pagination from '@/components/admin/Pagination';
import Drawer, { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { TableSkeleton } from '@/components/admin/SkeletonTable';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import {
  useCreatePackageCategory,
  useDeletePackageCategory,
  usePackageCategories,
  usePackages,
  useUpdatePackageCategory,
} from '@/hooks/use-packages';

const PER_PAGE = 10;
const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  display_order: 0,
  is_active: true,
};

function toSlug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function PackageCategories() {
  const { toast } = useToast();
  const { data: categories = [], isLoading, isError, error } = usePackageCategories();
  const { data: packages = [] } = usePackages();

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
        name: editItem.name ?? '',
        slug: editItem.slug ?? '',
        description: editItem.description ?? '',
        icon: editItem.icon ?? '',
        display_order: editItem.display_order ?? 0,
        is_active: editItem.is_active ?? true,
      });
    } else {
      setForm({ ...EMPTY_FORM, display_order: categories.length });
    }
  }, [drawerOpen, editItem, categories.length]);

  const createMutation = useCreatePackageCategory({
    onSuccess: () => { toast({ title: 'Package category created' }); setDrawerOpen(false); },
    onError: (err) => handleApiError(err, toast),
  });
  const updateMutation = useUpdatePackageCategory({
    onSuccess: () => { toast({ title: 'Package category saved' }); setDrawerOpen(false); },
    onError: (err) => handleApiError(err, toast),
  });
  const deleteMutation = useDeletePackageCategory({
    onSuccess: () => { toast({ title: 'Package category deleted' }); setDeleteTarget(null); },
    onError: (err) => handleApiError(err, toast),
  });

  const packageCountsByCategory = useMemo(() => {
    return packages.reduce((counts, pkg) => {
      const categoryId = pkg.category_id ?? pkg.category?.id;
      if (!categoryId) return counts;
      counts[categoryId] = (counts[categoryId] ?? 0) + 1;
      return counts;
    }, {});
  }, [packages]);

  const filtered = useMemo(() => {
    let list = categories;
    if (activeFilter === 'Published') list = list.filter((item) => item.is_active);
    if (activeFilter === 'Draft') list = list.filter((item) => !item.is_active);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((item) =>
        item.name?.toLowerCase().includes(q) || item.slug?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [categories, search, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const publishedCount = categories.filter((item) => item.is_active).length;
  const draftCount = categories.filter((item) => !item.is_active).length;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const filters = [
    { label: 'All', value: 'all', count: categories.length },
    { label: 'Published', value: 'Published', count: publishedCount },
    { label: 'Draft', value: 'Draft', count: draftCount },
  ];

  const handleChange = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const handleNameChange = (value) => setForm((current) => ({
    ...current,
    name: value,
    slug: editItem ? current.slug : toSlug(value),
  }));

  const handleSave = () => {
    if (!form.name.trim()) { toast({ title: 'Category name is required', variant: 'destructive' }); return; }
    if (!form.slug.trim()) { toast({ title: 'Slug is required', variant: 'destructive' }); return; }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description?.trim() || null,
      icon: form.icon || null,
      display_order: Number(form.display_order) || 0,
      is_active: Boolean(form.is_active),
    };

    if (editItem) updateMutation.mutate({ id: editItem.id, formValues: payload });
    else createMutation.mutate(payload);
  };

  const openCreate = () => { setEditItem(null); setDrawerOpen(true); };
  const openEdit = (item) => { setEditItem(item); setDrawerOpen(true); };

  const toggleActive = (event, item) => {
    event.stopPropagation();
    updateMutation.mutate({ id: item.id, formValues: { is_active: !item.is_active } });
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Package Categories" description="Organize travel packages into categories" />
        <TableSkeleton rows={6} columns={4} selectable={false} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm">{error?.message || 'Failed to load package categories'}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Package Categories"
        description="Organize travel packages into categories"
        searchPlaceholder="Search categories..."
        onSearch={setSearch}
        onAdd={openCreate}
        addLabel="New Category"
        filters={filters}
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
      />

      {paginated.length === 0 ? (
        <div className="bg-white border border-border rounded-xl">
          <EmptyState
            icon={Folder}
            title={search ? `No results for "${search}"` : 'No package categories yet'}
            message={search ? 'Try a different search term.' : 'Add your first package category.'}
            actionLabel="New Category"
            onAction={openCreate}
          />
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_8rem_8rem_7rem] gap-3 px-4 py-2.5 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span>Category</span>
            <span>Packages</span>
            <span>Status</span>
            <span />
          </div>
          <div className="divide-y divide-border">
            {paginated.map((item) => (
              <div
                key={item.id}
                onClick={() => openEdit(item)}
                className="group grid grid-cols-[1fr_8rem_8rem_7rem] gap-3 items-center px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                    <Folder className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.slug}</p>
                  </div>
                </div>
                <span className="font-semibold text-foreground">{packageCountsByCategory[item.id] ?? 0}</span>
                <StatusBadge status={item.is_active ? 'Published' : 'Draft'} />
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button onClick={(e) => toggleActive(e, item)} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Power className="w-4 h-4" />
                  </button>
                  <button onClick={() => openEdit(item)} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="p-2 rounded-lg text-destructive hover:bg-destructive/5">
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
        title={editItem ? 'Edit Package Category' : 'Create Package Category'}
        description={editItem ? editItem.name : 'Add a package category'}
        tabs={['General']}
        width="lg"
        onSave={handleSave}
        isSaving={isSaving}
        onDelete={editItem ? () => { setDrawerOpen(false); setDeleteTarget(editItem); } : undefined}
      >
        <div className="space-y-5">
          <DrawerField label="Category Name" required>
            <DrawerInput value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. Beach & Islands" />
          </DrawerField>
          <DrawerField label="Slug" required>
            <DrawerInput value={form.slug} onChange={(e) => handleChange('slug', toSlug(e.target.value))} placeholder="beach-islands" />
          </DrawerField>
          <div className="grid grid-cols-2 gap-4">
            <DrawerField label="Icon">
              <DrawerSelect
                value={form.icon}
                onChange={(e) => handleChange('icon', e.target.value)}
                options={[
                  { value: '', label: 'None' },
                  'Waves', 'Sparkles', 'Mountain', 'Building2', 'Trees', 'Landmark',
                ]}
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
          <DrawerField label="Display Order">
            <DrawerInput type="number" value={form.display_order} onChange={(e) => handleChange('display_order', e.target.value)} placeholder="0" />
          </DrawerField>
          <DrawerField label="Description">
            <DrawerInput textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Category description..." />
          </DrawerField>
        </div>
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete Package Category"
        message="Are you sure you want to delete this package category? This action cannot be undone."
        itemName={deleteTarget?.name}
      />
    </div>
  );
}
