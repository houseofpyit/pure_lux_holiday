import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, Download, Upload, Plus, Trash2, Archive, Copy, RotateCcw, Eye, Pencil, MoreHorizontal, HelpCircle, History, Star } from 'lucide-react';
import PageHeader from './PageHeader';
import DataTable from './DataTable';
import Pagination from './Pagination';
import Drawer from './Drawer';
import ConfirmDialog from './ConfirmDialog';
import EmptyState from './EmptyState';
import { TableSkeleton } from './SkeletonTable';

const cn = (...c) => c.filter(Boolean).join(' ');

export default function CrudModule({
  title,
  description,
  searchPlaceholder = 'Search...',
  filters,
  columns,
  data,
  tabs = ['General', 'Content', 'SEO', 'Settings', 'History'],
  renderTabContent,
  addLabel = 'Add New',
  drawerWidth = 'lg',
  totalCount,
  totalPages = 1,
  helpText,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  emptyActionLabel,
  onEmptyAction,
  searchKeys = ['name', 'title'],
  filterKey = 'status',
  sortOptions = ['Newest First', 'Oldest First', 'Name A-Z', 'Name Z-A'],
}) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [sortOpen, setSortOpen] = useState(false);
  const [activeSort, setActiveSort] = useState('Newest First');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabs[0]);

  // Simulate loading
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [search, activeFilter, activeSort]);

  const filtered = (data || []).filter(item => {
    const matchSearch = search === '' || searchKeys.some(key =>
      (item[key] || '').toLowerCase().includes(search.toLowerCase())
    );
    const matchFilter = activeFilter === 'all' || (filterKey === 'featured' ? item.featured : item[filterKey] === activeFilter);
    return matchSearch && matchFilter;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (activeSort === 'Name A-Z') return (a.name || a.title || '').localeCompare(b.name || b.title || '');
    if (activeSort === 'Name Z-A') return (b.name || b.title || '').localeCompare(a.name || a.title || '');
    if (activeSort === 'Oldest First') return 1;
    return -1;
  });

  const openCreate = () => { setEditItem(null); setActiveTab(tabs[0]); setDrawerOpen(true); };
  const openEdit = (item) => { setEditItem(item); setActiveTab(tabs[0]); setDrawerOpen(true); };
  const openDelete = (item) => { setDeleteItem(item); setDeleteDialog(true); };

  const handleDelete = () => {
    // In production, this would call the API
    setDeleteItem(null);
  };

  return (
    <div>
      {/* Bulk Actions Bar */}
      {selected.length > 0 && !loading && (
        <div className="flex items-center justify-between gap-4 mb-4 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl animate-slide-up">
          <span className="text-sm font-medium text-primary">{selected.length} items selected</span>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors">
              <Copy className="w-3.5 h-3.5" /> Duplicate
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors">
              <Archive className="w-3.5 h-3.5" /> Archive
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-destructive bg-white border border-border rounded-lg hover:bg-destructive/5 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      )}

      <PageHeader
        title={title}
        description={description}
        searchPlaceholder={searchPlaceholder}
        onSearch={setSearch}
        filters={filters}
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
        onExport={() => {}}
        onImport={() => {}}
        onAdd={openCreate}
        addLabel={addLabel}
        actions={
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-white border border-border rounded-lg hover:bg-muted hover:text-foreground transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" /> <span className="hidden sm:inline">{activeSort}</span>
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-border shadow-floating animate-scale-in overflow-hidden z-50">
                {sortOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setActiveSort(opt); setSortOpen(false); }}
                    className={cn("w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors", activeSort === opt ? "text-primary font-medium bg-primary/5" : "text-foreground")}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        }
      />

      {/* Help Section */}
      {helpText && (
        <div className="flex items-start gap-3 mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">{helpText}</p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <TableSkeleton rows={6} columns={columns.length} selectable />
      ) : sorted.length === 0 ? (
        <div className="bg-white border border-border rounded-xl">
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle || `No ${title.toLowerCase()} yet`}
            message={emptyMessage || `Get started by creating your first ${title.toLowerCase().replace(/s$/, '')}.`}
            actionLabel={emptyActionLabel || addLabel}
            onAction={onEmptyAction || openCreate}
          />
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={sorted}
            selectable
            selectedIds={selected}
            onSelectionChange={setSelected}
            onRowClick={openEdit}
            actions={(row) => (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg border border-border shadow-floating animate-scale-in overflow-hidden z-20">
                <button onClick={() => openEdit(row)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                  <Eye className="w-4 h-4 text-muted-foreground" /> View
                </button>
                <button onClick={() => openEdit(row)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                  <Pencil className="w-4 h-4 text-muted-foreground" /> Edit
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                  <Copy className="w-4 h-4 text-muted-foreground" /> Duplicate
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                  <Archive className="w-4 h-4 text-muted-foreground" /> Archive
                </button>
                <div className="h-px bg-border" />
                <button onClick={() => openDelete(row)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            total={totalCount || sorted.length}
            perPage={10}
            onPageChange={setPage}
            selectedCount={selected.length}
          />
        </>
      )}

      {/* Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editItem ? `Edit ${title.replace(/s$/, '')}` : `Create New ${title.replace(/s$/, '')}`}
        description={editItem ? (editItem.name || editItem.title || editItem.customer || editItem.question) : `Add a new ${title.toLowerCase().replace(/s$/, '')} to your catalog`}
        tabs={tabs}
        width={drawerWidth}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onDelete={editItem ? () => { setDrawerOpen(false); openDelete(editItem); } : undefined}
      >
        {(tab) => renderTabContent ? renderTabContent(tab, editItem) : (
          <div className="space-y-5">
            {tab === 'General' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
                  <input className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" placeholder="Enter name..." defaultValue={editItem?.name || editItem?.title} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Slug</label>
                  <input className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" placeholder="url-friendly-slug" defaultValue={editItem?.slug} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                  <select className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" defaultValue={editItem?.status}>
                    <option>Published</option><option>Draft</option><option>Archived</option>
                  </select>
                </div>
              </>
            )}
            {tab === 'Content' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <textarea rows={8} className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none" placeholder="Enter content..." />
              </div>
            )}
            {tab === 'SEO' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Meta Title</label>
                  <input className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" placeholder="Meta title..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Meta Description</label>
                  <textarea rows={4} className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none" placeholder="Meta description..." />
                </div>
              </>
            )}
            {tab === 'Settings' && (
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20" />
                  <span className="text-sm text-muted-foreground">Visible on website</span>
                </label>
              </div>
            )}
            {tab === 'History' && (
              <div className="space-y-3">
                {[
                  { user: 'Sarah Mitchell', action: 'Updated record', time: 'Jul 28, 2026 2:14 PM' },
                  { user: 'James Carter', action: 'Published', time: 'Jul 15, 2026 10:30 AM' },
                  { user: 'Sarah Mitchell', action: 'Created', time: 'Jun 15, 2026 3:45 PM' },
                ].map((h, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{h.user.charAt(0)}</div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground"><span className="font-medium">{h.user}</span> {h.action}</p>
                      <p className="text-xs text-muted-foreground">{h.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title={`Delete ${title.replace(/s$/, '')}`}
        message={`Are you sure you want to delete this ${title.toLowerCase().replace(/s$/, '')}? This action cannot be undone.`}
        itemName={deleteItem?.name || deleteItem?.title || deleteItem?.customer || deleteItem?.question}
        confirmLabel="Delete"
      />
    </div>
  );
}