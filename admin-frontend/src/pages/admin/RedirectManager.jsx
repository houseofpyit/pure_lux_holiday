import React, { useState } from 'react';
import { ArrowRight, Plus, Trash2, Pencil, Loader2, AlertCircle, Save, X } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import {
  useRedirects,
  useCreateRedirect,
  useUpdateRedirect,
  useDeleteRedirect,
} from '@/hooks/use-seo';

const cn = (...c) => c.filter(Boolean).join(' ');

const EMPTY_FORM = { source_path: '', destination_path: '', redirect_type: 301, is_active: true };

export default function RedirectManager() {
  const { toast } = useToast();
  const { data: redirects = [], isLoading, isError, error } = useRedirects();

  // Add / Edit form state
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null); // null = creating new

  // Confirm delete
  const [deleteItem, setDeleteItem] = useState(null);

  const createMutation = useCreateRedirect({
    onSuccess: () => {
      toast({ title: 'Redirect created', description: `${form.source_path} → ${form.destination_path}` });
      setForm(EMPTY_FORM);
    },
    onError: (err) => handleApiError(err, toast),
  });

  const updateMutation = useUpdateRedirect({
    onSuccess: () => {
      toast({ title: 'Redirect updated' });
      setEditingId(null);
      setForm(EMPTY_FORM);
    },
    onError: (err) => handleApiError(err, toast),
  });

  const deleteMutation = useDeleteRedirect({
    onSuccess: () => toast({ title: 'Redirect deleted' }),
    onError: (err) => handleApiError(err, toast),
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (!form.source_path.trim() || !form.destination_path.trim()) {
      toast({ title: 'Source and destination paths are required', variant: 'destructive' });
      return;
    }
    if (editingId) {
      const { source_path, destination_path, redirect_type, is_active } = form;
      updateMutation.mutate({ id: editingId, data: { source_path, destination_path, redirect_type, is_active } });
    } else {
      createMutation.mutate(form);
    }
  };

  const startEdit = (redirect) => {
    setEditingId(redirect.id);
    setForm({
      source_path: redirect.source_path,
      destination_path: redirect.destination_path,
      redirect_type: redirect.redirect_type,
      is_active: redirect.is_active,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm">{error?.message || 'Failed to load redirects'}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Redirect Manager"
        description="Manage URL redirects to preserve SEO rankings"
      />

      {/* Add / Edit Form */}
      <div className="bg-white border border-border rounded-xl p-4 mb-6">
        <p className="text-sm font-medium text-foreground mb-3">
          {editingId ? 'Edit Redirect' : 'Add New Redirect'}
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            value={form.source_path}
            onChange={(e) => setForm((f) => ({ ...f, source_path: e.target.value }))}
            placeholder="/old-url"
            className="flex-1 px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 hidden sm:block" />
          <input
            value={form.destination_path}
            onChange={(e) => setForm((f) => ({ ...f, destination_path: e.target.value }))}
            placeholder="/new-url"
            className="flex-1 px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          <select
            value={form.redirect_type}
            onChange={(e) => setForm((f) => ({ ...f, redirect_type: Number(e.target.value) }))}
            className="px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          >
            <option value={301}>301 Permanent</option>
            <option value={302}>302 Temporary</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
            >
              {isSaving
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingId ? 'Update' : 'Add'}
            </button>
            {editingId && (
              <button
                onClick={cancelEdit}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Redirect List */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        {redirects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ArrowRight className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">No redirects yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add your first URL redirect above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">From URL</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">To URL</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hits</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="w-20 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {redirects.map((r, i) => (
                  <tr
                    key={r.id}
                    className={cn(
                      'border-b border-border last:border-0 hover:bg-muted/30 transition-colors group',
                      i % 2 === 1 && 'bg-muted/20',
                      editingId === r.id && 'ring-2 ring-primary/20 ring-inset',
                    )}
                  >
                    <td className="px-4 py-3 text-sm font-mono text-foreground">{r.source_path}</td>
                    <td className="px-4 py-3 text-sm font-mono text-foreground">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        {r.destination_path}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded-md',
                        r.redirect_type === 301 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
                      )}>
                        {r.redirect_type} {r.redirect_type === 301 ? 'Permanent' : 'Temporary'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{r.hit_count}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.is_active ? 'Published' : 'Draft'} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(r)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteItem(r)}
                          className="p-1.5 rounded-lg hover:bg-destructive/5 text-muted-foreground hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => {
          deleteMutation.mutate(deleteItem.id);
          setDeleteItem(null);
        }}
        title="Delete Redirect"
        message="Are you sure you want to delete this redirect? This action cannot be undone."
        itemName={deleteItem?.source_path}
      />
    </div>
  );
}
