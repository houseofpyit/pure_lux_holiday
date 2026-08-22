/**
 * Leads — Contact Inquiry management.
 * Connects to GET/PATCH/DELETE /api/v1/crm/inquiries
 */
import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Mail, MessageSquare, Pencil, Phone, Trash2 } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import Pagination from '@/components/admin/Pagination';
import Drawer, { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { TableSkeleton } from '@/components/admin/SkeletonTable';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import { useInquiries, useUpdateInquiry, useDeleteInquiry } from '@/hooks/use-crm';

const PER_PAGE = 15;

const STATUS_OPTIONS = ['new', 'assigned', 'contacted', 'qualified', 'closed', 'spam'];
const ASSIGNED_OPTIONS = [
  { value: '', label: 'Unassigned' },
  { value: 'Sarah Mitchell', label: 'Sarah Mitchell' },
  { value: 'James Carter', label: 'James Carter' },
  { value: 'Emma Wilson', label: 'Emma Wilson' },
];

function fmtDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return '—'; }
}

function statusLabel(s) {
  const map = {
    new: 'New', assigned: 'In Progress', contacted: 'In Progress',
    qualified: 'In Progress', closed: 'Closed', spam: 'Closed',
  };
  return map[s] ?? s;
}

export default function Leads() {
  const { toast } = useToast();
  const { data: inquiries = [], isLoading, isError, error } = useInquiries();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm] = useState({ status: 'new', assigned_to: '', notes: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { setPage(1); }, [search, activeFilter]);

  useEffect(() => {
    if (drawerOpen && viewItem) {
      setForm({
        status: viewItem.status ?? 'new',
        assigned_to: viewItem.assigned_to ?? '',
        notes: viewItem.notes ?? '',
      });
    }
  }, [drawerOpen, viewItem]);

  const updateMutation = useUpdateInquiry({
    onSuccess: () => { toast({ title: 'Inquiry updated' }); setDrawerOpen(false); },
    onError: (err) => handleApiError(err, toast),
  });
  const deleteMutation = useDeleteInquiry({
    onSuccess: () => { toast({ title: 'Inquiry deleted' }); setDeleteTarget(null); setDrawerOpen(false); },
    onError: (err) => handleApiError(err, toast),
  });

  const filtered = useMemo(() => {
    let list = inquiries;
    if (activeFilter === 'new') list = list.filter((i) => i.status === 'new');
    if (activeFilter === 'active') list = list.filter((i) => ['assigned', 'contacted', 'qualified'].includes(i.status));
    if (activeFilter === 'closed') list = list.filter((i) => ['closed', 'spam'].includes(i.status));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) =>
        i.name?.toLowerCase().includes(q) ||
        i.email?.toLowerCase().includes(q) ||
        i.subject?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [inquiries, search, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const newCount = inquiries.filter((i) => i.status === 'new').length;
  const activeCount = inquiries.filter((i) => ['assigned', 'contacted', 'qualified'].includes(i.status)).length;
  const closedCount = inquiries.filter((i) => ['closed', 'spam'].includes(i.status)).length;

  const filters = [
    { label: 'All', value: 'all', count: inquiries.length },
    { label: 'New', value: 'new', count: newCount },
    { label: 'Active', value: 'active', count: activeCount },
    { label: 'Closed', value: 'closed', count: closedCount },
  ];

  const handleSave = () => {
    if (!viewItem) return;
    updateMutation.mutate({
      id: viewItem.id,
      data: {
        status: form.status,
        assigned_to: form.assigned_to || null,
        notes: form.notes?.trim() || null,
      },
    });
  };

  if (isLoading) return (
    <div>
      <PageHeader title="Contact Enquiries" description="Manage website contact form submissions" />
      <TableSkeleton rows={8} columns={5} selectable={false} />
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive">
      <AlertCircle className="w-8 h-8" />
      <p className="text-sm">{error?.message || 'Failed to load inquiries'}</p>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Contact Enquiries"
        description="Manage website contact form submissions"
        searchPlaceholder="Search by name or email..."
        onSearch={setSearch}
        filters={filters}
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
      />

      {paginated.length === 0 ? (
        <div className="bg-white border border-border rounded-xl">
          <EmptyState
            icon={MessageSquare}
            title={search ? `No results for "${search}"` : 'No contact enquiries yet'}
            message={search ? 'Try a different search term.' : 'Enquiries submitted via the contact form will appear here.'}
          />
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_8rem_8rem_7rem] gap-3 px-4 py-2.5 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span>Contact</span>
            <span>Subject</span>
            <span>Assigned</span>
            <span>Status</span>
            <span />
          </div>
          <div className="divide-y divide-border">
            {paginated.map((item) => (
              <div
                key={item.id}
                onClick={() => { setViewItem(item); setDrawerOpen(true); }}
                className="group grid grid-cols-[1fr_1fr_8rem_8rem_7rem] gap-3 items-center px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {item.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.email}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground truncate">{item.subject || '—'}</p>
                <p className="text-xs text-muted-foreground truncate">{item.assigned_to || 'Unassigned'}</p>
                <StatusBadge status={statusLabel(item.status)} />
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => { setViewItem(item); setDrawerOpen(true); }} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
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

      <Pagination page={page} totalPages={totalPages} total={filtered.length} perPage={PER_PAGE} onPageChange={setPage} />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Contact Enquiry"
        description={viewItem?.name}
        tabs={['Overview', 'Notes']}
        width="lg"
        onSave={handleSave}
        isSaving={updateMutation.isPending}
        onDelete={viewItem ? () => { setDrawerOpen(false); setDeleteTarget(viewItem); } : undefined}
      >
        {(tab) => (
          <div className="space-y-5">
            {tab === 'Overview' && viewItem && (
              <>
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                    {viewItem.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{viewItem.name}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {viewItem.email}</span>
                      {viewItem.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {viewItem.phone}</span>}
                    </div>
                  </div>
                </div>
                {viewItem.subject && (
                  <DrawerField label="Subject">
                    <div className="px-3 py-2 text-sm bg-muted/30 rounded-lg">{viewItem.subject}</div>
                  </DrawerField>
                )}
                {viewItem.message && (
                  <DrawerField label="Message">
                    <div className="px-3 py-2.5 text-sm bg-muted/30 rounded-lg border border-border whitespace-pre-wrap leading-relaxed">{viewItem.message}</div>
                  </DrawerField>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <DrawerField label="Status">
                    <DrawerSelect
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                      options={STATUS_OPTIONS.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
                    />
                  </DrawerField>
                  <DrawerField label="Assigned To">
                    <DrawerSelect
                      value={form.assigned_to}
                      onChange={(e) => setForm((f) => ({ ...f, assigned_to: e.target.value }))}
                      options={ASSIGNED_OPTIONS}
                    />
                  </DrawerField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <DrawerField label="Source">
                    <div className="px-3 py-2 text-sm bg-muted/30 rounded-lg">{viewItem.source || '—'}</div>
                  </DrawerField>
                  <DrawerField label="Received">
                    <div className="px-3 py-2 text-sm bg-muted/30 rounded-lg">{fmtDate(viewItem.created_at)}</div>
                  </DrawerField>
                </div>
              </>
            )}
            {tab === 'Notes' && (
              <DrawerField label="Internal Notes" hint="Only visible to staff — not sent to the customer">
                <DrawerInput
                  textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Add internal notes..."
                />
              </DrawerField>
            )}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete Enquiry"
        message="Are you sure you want to permanently delete this enquiry? This cannot be undone."
        itemName={deleteTarget?.name}
      />
    </div>
  );
}
