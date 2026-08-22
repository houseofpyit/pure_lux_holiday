/**
 * Newsletter — Subscriber management.
 * Connects to GET/PATCH/DELETE /api/v1/crm/newsletter
 */
import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Download, Mail, Pencil, Send, Trash2 } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import Pagination from '@/components/admin/Pagination';
import Drawer, { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { TableSkeleton } from '@/components/admin/SkeletonTable';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import { useSubscribers, useUpdateSubscriber, useDeleteSubscriber } from '@/hooks/use-crm';

const PER_PAGE = 20;

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch { return '—'; }
}

export default function Newsletter() {
  const { toast } = useToast();
  const { data: subscribers = [], isLoading, isError, error } = useSubscribers();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm] = useState({ name: '', is_active: true });
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { setPage(1); }, [search, activeFilter]);

  useEffect(() => {
    if (drawerOpen && viewItem) {
      setForm({
        name: viewItem.name ?? '',
        is_active: viewItem.is_active ?? true,
      });
    }
  }, [drawerOpen, viewItem]);

  const updateMutation = useUpdateSubscriber({
    onSuccess: () => { toast({ title: 'Subscriber updated' }); setDrawerOpen(false); },
    onError: (err) => handleApiError(err, toast),
  });
  const deleteMutation = useDeleteSubscriber({
    onSuccess: () => {
      toast({ title: 'Subscriber removed' });
      setDeleteTarget(null);
      setDrawerOpen(false);
    },
    onError: (err) => handleApiError(err, toast),
  });

  const filtered = useMemo(() => {
    let list = subscribers;
    if (activeFilter === 'Subscribed') list = list.filter((s) => s.is_active);
    if (activeFilter === 'Unsubscribed') list = list.filter((s) => !s.is_active);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) =>
        s.email?.toLowerCase().includes(q) ||
        s.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [subscribers, search, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const activeCount = subscribers.filter((s) => s.is_active).length;
  const inactiveCount = subscribers.filter((s) => !s.is_active).length;

  const filters = [
    { label: 'All', value: 'all', count: subscribers.length },
    { label: 'Subscribed', value: 'Subscribed', count: activeCount },
    { label: 'Unsubscribed', value: 'Unsubscribed', count: inactiveCount },
  ];

  const handleSave = () => {
    if (!viewItem) return;
    updateMutation.mutate({
      id: viewItem.id,
      data: {
        name: form.name?.trim() || null,
        is_active: form.is_active,
      },
    });
  };

  const handleExportCsv = () => {
    const active = subscribers.filter((s) => s.is_active);
    const rows = [
      ['Name', 'Email', 'Source', 'Subscribed On'],
      ...active.map((s) => [s.name ?? '', s.email, s.source ?? '', fmtDate(s.created_at)]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Exported ${active.length} subscribers` });
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Newsletter Subscribers" description="Manage email newsletter subscribers" />
        <TableSkeleton rows={8} columns={4} selectable={false} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm">{error?.message || 'Failed to load subscribers'}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Newsletter Subscribers"
        description="Manage email newsletter subscribers"
        searchPlaceholder="Search by name or email..."
        onSearch={setSearch}
        filters={filters}
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
        actions={
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{subscribers.length.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Subscribers</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Send className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeCount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Active Subscribers</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Mail className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{inactiveCount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Unsubscribed</p>
            </div>
          </div>
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="bg-white border border-border rounded-xl">
          <EmptyState
            icon={Mail}
            title={search ? `No results for "${search}"` : 'No subscribers yet'}
            message={search ? 'Try a different search term.' : 'Newsletter signups from the website will appear here.'}
          />
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_8rem_8rem_8rem_6rem] gap-3 px-4 py-2.5 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span>Subscriber</span>
            <span>Source</span>
            <span>Status</span>
            <span>Subscribed</span>
            <span />
          </div>
          <div className="divide-y divide-border">
            {paginated.map((item) => (
              <div
                key={item.id}
                onClick={() => { setViewItem(item); setDrawerOpen(true); }}
                className="group grid grid-cols-[1fr_8rem_8rem_8rem_6rem] gap-3 items-center px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {(item.name || item.email)?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{item.name || item.email}</p>
                    {item.name && (
                      <p className="text-xs text-muted-foreground truncate">{item.email}</p>
                    )}
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground truncate w-fit">
                  {item.source || 'website'}
                </span>
                <StatusBadge status={item.is_active ? 'Subscribed' : 'Inactive'} />
                <span className="text-xs text-muted-foreground">{fmtDate(item.created_at)}</span>
                <div
                  className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => { setViewItem(item); setDrawerOpen(true); }}
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

      {/* Subscriber detail drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Subscriber Details"
        description={viewItem?.email}
        tabs={['Details']}
        width="md"
        onSave={handleSave}
        isSaving={updateMutation.isPending}
        onDelete={viewItem ? () => { setDrawerOpen(false); setDeleteTarget(viewItem); } : undefined}
      >
        <div className="space-y-5">
          {viewItem && (
            <>
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                  {(viewItem.name || viewItem.email)?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
                <div>
                  {viewItem.name && (
                    <p className="font-semibold text-foreground">{viewItem.name}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{viewItem.email}</p>
                </div>
              </div>
              <DrawerField label="Name">
                <DrawerInput
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Subscriber name"
                  maxLength={255}
                />
              </DrawerField>
              <DrawerField label="Status">
                <DrawerSelect
                  value={form.is_active ? 'Subscribed' : 'Unsubscribed'}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value === 'Subscribed' }))}
                  options={['Subscribed', 'Unsubscribed']}
                />
              </DrawerField>
              <div className="grid grid-cols-2 gap-4">
                <DrawerField label="Source">
                  <div className="px-3 py-2 text-sm bg-muted/30 rounded-lg">{viewItem.source || '—'}</div>
                </DrawerField>
                <DrawerField label="Subscribed On">
                  <div className="px-3 py-2 text-sm bg-muted/30 rounded-lg">{fmtDate(viewItem.created_at)}</div>
                </DrawerField>
              </div>
            </>
          )}
        </div>
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Remove Subscriber"
        message="Are you sure you want to remove this subscriber from the newsletter list?"
        itemName={deleteTarget?.email}
      />
    </div>
  );
}
