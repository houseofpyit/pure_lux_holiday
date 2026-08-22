import React, { useState, useEffect } from 'react';
import { Plus, GripVertical, Pencil, Trash2, Eye, Power, Copy, Save, Calendar, History, ArrowUp, ArrowDown } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import Drawer, { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import StatusBadge from '@/components/admin/StatusBadge';
import EmptyState from '@/components/admin/EmptyState';
import { TableSkeleton } from '@/components/admin/SkeletonTable';

const cn = (...c) => c.filter(Boolean).join(' ');

export default function HomeSectionList({
  title,
  description,
  sectionName,
  data,
  columns,
  renderTabContent,
  renderPreview,
  tabs = ['General', 'Content', 'Media', 'Settings', 'History'],
  addLabel = 'Add Item',
  searchKeys = ['title', 'name'],
  helpText,
}) {
  const [items, setItems] = useState(data);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sectionEnabled, setSectionEnabled] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = items.filter(item => search === '' || searchKeys.some(k => (item[k] || '').toLowerCase().includes(search.toLowerCase())));

  const moveItem = (from, to) => {
    const u = [...items];
    const [m] = u.splice(from, 1);
    u.splice(to, 0, m);
    setItems(u);
  };

  const toggleItem = (id) => setItems(items.map(i => i.id === id ? { ...i, _disabled: !i._disabled } : i));

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        searchPlaceholder="Search items..."
        onSearch={setSearch}
        onAdd={() => { setEditItem(null); setDrawerOpen(true); }}
        addLabel={addLabel}
        actions={
          <>
            <button onClick={() => setPreviewOpen(!previewOpen)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/8 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
              <Eye className="w-4 h-4" /> Preview
            </button>
          </>
        }
      />

      {/* Section Status Bar */}
      <div className="flex items-center justify-between gap-4 mb-4 px-4 py-3 bg-white border border-border rounded-xl">
        <div className="flex items-center gap-3">
          <div className={cn("w-2.5 h-2.5 rounded-full", sectionEnabled ? "bg-success" : "bg-muted-foreground/30")} />
          <span className="text-sm font-medium text-foreground">{sectionName}</span>
          <StatusBadge status={sectionEnabled ? 'Published' : 'Draft'} />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Calendar className="w-3.5 h-3.5" /> Schedule
          </button>
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <History className="w-3.5 h-3.5" /> Versions
          </button>
          <button onClick={() => setSectionEnabled(!sectionEnabled)} className={cn("relative w-10 h-5 rounded-full transition-colors", sectionEnabled ? "bg-primary" : "bg-muted")}>
            <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-soft transition-transform", sectionEnabled ? "translate-x-5" : "translate-x-0.5")} />
          </button>
        </div>
      </div>

      {helpText && (
        <div className="flex items-start gap-3 mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <Eye className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">{helpText}</p>
        </div>
      )}

      {/* Preview Panel */}
      {previewOpen && renderPreview && (
        <div className="mb-6 bg-white border border-border rounded-xl p-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-primary" />
            <h3 className="text-base font-semibold text-foreground">Section Preview</h3>
          </div>
          {renderPreview(items)}
        </div>
      )}

      {/* Items List */}
      {loading ? (
        <TableSkeleton rows={4} columns={columns.length} selectable={false} />
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-xl">
          <EmptyState title={`No ${title.toLowerCase()} yet`} message={`Get started by adding your first item.`} actionLabel={addLabel} onAction={() => { setEditItem(null); setDrawerOpen(true); }} />
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            <GripVertical className="w-4 h-4" />
            <span>Drag to reorder · {filtered.length} items</span>
          </div>
          <div className="space-y-2">
            {filtered.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDraggedIndex(index)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => { if (draggedIndex !== null && draggedIndex !== index) { moveItem(draggedIndex, index); setDraggedIndex(null); } }}
                className={cn("group flex items-center gap-3 p-3 bg-white border rounded-xl transition-all hover:border-primary/30 hover:shadow-soft", draggedIndex === index ? "border-primary opacity-50" : "border-border", item._disabled && "opacity-50")}
              >
                <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground cursor-grab active:cursor-grabbing"><GripVertical className="w-4 h-4" /></button>
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">{index + 1}</div>
                {columns.map(col => (
                  <div key={col.key} className={cn("min-w-0", col.className)}>
                    {col.render ? col.render(item) : item[col.key]}
                  </div>
                ))}
                <div className="flex items-center gap-0.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleItem(item.id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" title="Enable/Disable"><Power className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { setEditItem(item); setDrawerOpen(true); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Copy className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteItem(item)} className="p-1.5 rounded-lg hover:bg-destructive/5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => { setEditItem(null); setDrawerOpen(true); }} className="w-full mt-2 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
            <Plus className="w-4 h-4" /> {addLabel}
          </button>
        </div>
      )}

      {/* Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editItem ? 'Edit Item' : 'Create New Item'}
        description={editItem ? (editItem.title || editItem.name || editItem.label) : `Add a new item to ${sectionName}`}
        tabs={tabs}
        width="lg"
        onDelete={editItem ? () => { setDrawerOpen(false); setDeleteItem(editItem); } : undefined}
      >
        {(tab) => renderTabContent ? renderTabContent(tab, editItem) : null}
      </Drawer>

      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => setItems(items.filter(i => i.id !== deleteItem.id))}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        itemName={deleteItem?.title || deleteItem?.name || deleteItem?.label}
      />
    </div>
  );
}