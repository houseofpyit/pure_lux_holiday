import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Pencil, Tag, Trash2 } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import Pagination from '@/components/admin/Pagination';
import Drawer, { DrawerField, DrawerInput } from '@/components/admin/Drawer';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { TableSkeleton } from '@/components/admin/SkeletonTable';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import {
  useBlogTags,
  useCreateBlogTag,
  useUpdateBlogTag,
  useDeleteBlogTag,
} from '@/hooks/use-blog';

const PER_PAGE = 20;

const EMPTY_FORM = {
  name: '',
  slug: '',
};

function toSlug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function BlogTags() {
  const { toast } = useToast();
  const { data: tags = [], isLoading, isError, error } = useBlogTags();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { setPage(1); }, [search]);

  useEffect(() => {
    if (!drawerOpen) return;
    if (editItem) {
      setForm({
        name: editItem.name ?? '',
        slug: editItem.slug ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [drawerOpen, editItem]);

  const createMutation = useCreateBlogTag({
    onSuccess: () => { toast({ title: 'Blog tag created' }); setDrawerOpen(false); },
    onError: (err) => handleApiError(err, toast),
  });
  const updateMutation = useUpdateBlogTag({
    onSuccess: () => { toast({ title: 'Blog tag saved' }); setDrawerOpen(false); },
    onError: (err) => handleApiError(err, toast),
  });
  const deleteMutation = useDeleteBlogTag({
    onSuccess: () => { toast({ title: 'Blog tag deleted' }); setDeleteTarget(null); },
    onError: (err) => handleApiError(err, toast),
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return tags;
    const q = search.toLowerCase();
    return tags.filter((item) =>
      item.name?.toLowerCase().includes(q) || item.slug?.toLowerCase().includes(q)
    );
  }, [tags, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleChange = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleNameChange = (value) => setForm((current) => ({
    ...current,
    name: value,
    slug: editItem ? current.slug : toSlug(value),
  }));

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: 'Tag name is required', variant: 'destructive' });
      return;
    }
    if (!form.slug.trim()) {
      toast({ title: 'Slug is required', variant: 'destructive' });
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
    };

    if (editItem) updateMutation.mutate({ id: editItem.id, formValues: payload });
    else createMutation.mutate(payload);
  };

  const openCreate = () => { setEditItem(null); setDrawerOpen(true); };
  const openEdit = (item) => { setEditItem(item); setDrawerOpen(true); };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Blog Tags" description="Manage tags for blog articles" />
        <TableSkeleton rows={6} columns={3} selectable={false} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm">{error?.message || 'Failed to load blog tags'}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Blog Tags"
        description="Manage tags for blog articles"
        searchPlaceholder="Search tags..."
        onSearch={setSearch}
        onAdd={openCreate}
        addLabel="New Tag"
      />

      {paginated.length === 0 ? (
        <div className="bg-white border border-border rounded-xl">
          <EmptyState
            icon={Tag}
            title={search ? `No results for "${search}"` : 'No blog tags yet'}
            message={search ? 'Try a different search term.' : 'Add your first blog tag.'}
            actionLabel="New Tag"
            onAction={openCreate}
          />
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_6rem] gap-3 px-4 py-2.5 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span>Tag</span>
            <span>Slug</span>
            <span />
          </div>
          <div className="divide-y divide-border">
            {paginated.map((item) => (
              <div
                key={item.id}
                onClick={() => openEdit(item)}
                className="group grid grid-cols-[1fr_1fr_6rem] gap-3 items-center px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0 px-2.5 py-1 text-xs font-medium rounded-md bg-primary/8 text-primary whitespace-nowrap">
                    #{item.name}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground font-mono truncate">{item.slug}</span>
                <div
                  className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="p-2 rounded-lg text-destructive hover:bg-destructive/5"
                    title="Delete"
                  >
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
        title={editItem ? 'Edit Blog Tag' : 'Create Blog Tag'}
        description={editItem ? `#${editItem.name}` : 'Add a blog tag'}
        tabs={['General']}
        width="lg"
        onSave={handleSave}
        isSaving={isSaving}
        onDelete={editItem ? () => { setDrawerOpen(false); setDeleteTarget(editItem); } : undefined}
      >
        <div className="space-y-5">
          <DrawerField label="Tag Name" required>
            <DrawerInput
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. honeymoon"
              maxLength={255}
            />
          </DrawerField>
          <DrawerField label="Slug" required hint="URL-friendly identifier — auto-generated from name">
            <DrawerInput
              value={form.slug}
              onChange={(e) => handleChange('slug', toSlug(e.target.value))}
              placeholder="honeymoon"
              maxLength={255}
            />
          </DrawerField>
        </div>
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete Blog Tag"
        message="Are you sure you want to delete this tag? Articles using it will lose this tag."
        itemName={deleteTarget?.name}
      />
    </div>
  );
}
