/**
 * RedirectManager — URL redirect management.
 * Backend status: No redirects table. State managed in localStorage.
 */
import { useMemo, useRef, useState } from 'react';
import {
  AlertCircle, ArrowRight, Check, Download, Loader2,
  Pencil, Plus, Save, Trash2, Upload, X,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import Pagination from '@/components/admin/Pagination';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/ui/use-toast';

const cn = (...c) => c.filter(Boolean).join(' ');

const DRAFT_KEY = 'redirect_manager_draft';
const loadDraft = () => {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '[]'); }
  catch { return []; }
};
const saveDraft = (v) => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(v)); } catch { /**/ } };

const PER_PAGE = 15;
const TYPES = ['301 Permanent', '302 Temporary'];

function genId() {
  return `rd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function RedirectManager() {
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [items, setItems] = useState(loadDraft);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Inline add form
  const [addFrom, setAddFrom] = useState('');
  const [addTo, setAddTo] = useState('');
  const [addType, setAddType] = useState('301 Permanent');
  const [addError, setAddError] = useState('');

  // Edit state
  const [editId, setEditId] = useState(null);
  const [editFrom, setEditFrom] = useState('');
  const [editTo, setEditTo] = useState('');
  const [editType, setEditType] = useState('301 Permanent');

  const persist = (updated) => { setItems(updated); saveDraft(updated); };

  const filtered = useMemo(() => {
    let list = items;
    if (activeFilter === 'active') list = list.filter((r) => r.enabled);
    if (activeFilter === 'disabled') list = list.filter((r) => !r.enabled);
    if (activeFilter === '301') list = list.filter((r) => r.type === '301 Permanent');
    if (activeFilter === '302') list = list.filter((r) => r.type === '302 Temporary');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.from.toLowerCase().includes(q) || r.to.toLowerCase().includes(q));
    }
    return list;
  }, [items, search, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const activeCount = items.filter((r) => r.enabled).length;
  const p301Count = items.filter((r) => r.type === '301 Permanent').length;
  const p302Count = items.filter((r) => r.type === '302 Temporary').length;

  const filters = [
    { label: 'All', value: 'all', count: items.length },
    { label: 'Active', value: 'active', count: activeCount },
    { label: '301', value: '301', count: p301Count },
    { label: '302', value: '302', count: p302Count },
  ];

  const validateUrl = (url) => url.startsWith('/') || url.startsWith('http');

  const handleAdd = () => {
    setAddError('');
    if (!addFrom.trim() || !addTo.trim()) { setAddError('Both From and To URLs are required.'); return; }
    if (!validateUrl(addFrom)) { setAddError('From URL must start with / or http.'); return; }
    if (!validateUrl(addTo)) { setAddError('To URL must start with / or http.'); return; }
    if (items.some((r) => r.from === addFrom.trim())) {
      setAddError(`A redirect from "${addFrom}" already exists.`); return;
    }
    const updated = [
      { id: genId(), from: addFrom.trim(), to: addTo.trim(), type: addType, enabled: true, created_at: new Date().toISOString() },
      ...items,
    ];
    persist(updated);
    setAddFrom(''); setAddTo('');
    toast({ title: 'Redirect added' });
  };

  const handleToggle = (id) => {
    persist(items.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const startEdit = (r) => { setEditId(r.id); setEditFrom(r.from); setEditTo(r.to); setEditType(r.type); };

  const saveEdit = (id) => {
    if (!editFrom.trim() || !editTo.trim()) return;
    persist(items.map((r) => r.id === id ? { ...r, from: editFrom.trim(), to: editTo.trim(), type: editType } : r));
    setEditId(null);
    toast({ title: 'Redirect updated' });
  };

  const handleDelete = (id) => { persist(items.filter((r) => r.id !== id)); setDeleteTarget(null); };

  const handleExportCsv = () => {
    const rows = [['From URL', 'To URL', 'Type', 'Enabled'], ...items.map((r) => [r.from, r.to, r.type, r.enabled ? 'Yes' : 'No'])];
    const csv = rows.map((row) => row.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'redirects.csv'; a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Exported ${items.length} redirects` });
  };

  const handleImportCsv = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = (ev.target?.result ?? '').split('\n').filter(Boolean);
      const newItems = [];
      lines.slice(1).forEach((line) => {
        const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols[0] && cols[1]) {
          newItems.push({ id: genId(), from: cols[0], to: cols[1], type: cols[2] || '301 Permanent', enabled: cols[3] !== 'No', created_at: new Date().toISOString() });
        }
      });
      if (newItems.length === 0) { toast({ title: 'No valid rows found', variant: 'destructive' }); return; }
      persist([...newItems, ...items]);
      toast({ title: `Imported ${newItems.length} redirects` });
    };
    reader.readAsText(file);
  };

  function fmtDate(iso) {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return '—'; }
  }

  return (
    <div>
      <PageHeader
        title="Redirect Manager"
        description="Manage 301 and 302 URL redirects to preserve SEO rankings"
        searchPlaceholder="Search URLs..."
        onSearch={setSearch}
        filters={filters}
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
        onAdd={null} onSort={null} onImport={null}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <Upload className="w-4 h-4" /> Import CSV
            </button>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportCsv} />
          </div>
        }
      />

      <div className="flex items-start gap-3 mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <span className="shrink-0 font-bold mt-0.5">⚠</span>
        <span><strong>Saved locally.</strong> A redirects endpoint is needed to persist to the database.</span>
      </div>

      {/* ── Add redirect form ── */}
      <div className="bg-white border border-border rounded-xl p-4 mb-5">
        <p className="text-sm font-semibold text-foreground mb-3">Add Redirect</p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            value={addFrom}
            onChange={(e) => setAddFrom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="/old-url"
            className="flex-1 px-3 py-2 text-sm font-mono bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 hidden sm:block" />
          <input
            value={addTo}
            onChange={(e) => setAddTo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="/new-url"
            className="flex-1 px-3 py-2 text-sm font-mono bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          <select
            value={addType}
            onChange={(e) => setAddType(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 shrink-0"
          >
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft shrink-0"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        {addError && (
          <p className="mt-2 text-xs text-destructive flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> {addError}
          </p>
        )}
      </div>

      {/* ── Table ── */}
      {paginated.length === 0 ? (
        <div className="bg-white border border-border rounded-xl flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <ArrowRight className="w-8 h-8 opacity-25" />
          <p className="text-sm font-medium">{search ? `No results for "${search}"` : 'No redirects yet'}</p>
          <p className="text-xs opacity-70">Add your first redirect above to get started.</p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['From URL', 'To URL', 'Type', 'Status', 'Created', ''].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((r, i) => (
                <tr key={r.id} className={cn('border-b border-border last:border-0 transition-colors hover:bg-muted/20 group', i % 2 === 1 && 'bg-muted/10')}>
                  {editId === r.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input value={editFrom} onChange={(e) => setEditFrom(e.target.value)} className="w-full px-2 py-1 text-sm font-mono border border-primary rounded-lg outline-none" />
                      </td>
                      <td className="px-4 py-2">
                        <input value={editTo} onChange={(e) => setEditTo(e.target.value)} className="w-full px-2 py-1 text-sm font-mono border border-primary rounded-lg outline-none" />
                      </td>
                      <td className="px-4 py-2">
                        <select value={editType} onChange={(e) => setEditType(e.target.value)} className="text-xs border border-border rounded px-2 py-1 outline-none">
                          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td colSpan={2} />
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1">
                          <button onClick={() => saveEdit(r.id)} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditId(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-sm font-mono text-foreground">{r.from}</td>
                      <td className="px-4 py-3 text-sm font-mono text-foreground">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          {r.to}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-0.5 text-xs font-medium rounded-md', r.type.includes('301') ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning')}>
                          {r.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggle(r.id)} className="flex items-center gap-1.5">
                          <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', r.enabled ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>
                            <span className={cn('w-1.5 h-1.5 rounded-full', r.enabled ? 'bg-success' : 'bg-muted-foreground')} />
                            {r.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{fmtDate(r.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(r)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-lg hover:bg-destructive/5 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} total={filtered.length} perPage={PER_PAGE} onPageChange={setPage} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget.id)}
        title="Delete Redirect"
        message="Are you sure you want to delete this redirect?"
        itemName={deleteTarget?.from}
      />
    </div>
  );
}
