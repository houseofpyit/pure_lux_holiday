import React from 'react';
import { MoreHorizontal, Eye, Pencil, Copy, Trash2, ExternalLink, Inbox } from 'lucide-react';
import EmptyState from './EmptyState';

const cn = (...c) => c.filter(Boolean).join(' ');

export default function DataTable({ columns, data, selectable, selectedIds = [], onSelectionChange, onRowClick, actions: actionsFn, emptyMessage, loading }) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? [] : data.map(d => d.id));
  };

  const toggleOne = (id) => {
    if (!onSelectionChange) return;
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter(i => i !== id)
        : [...selectedIds, id]
    );
  };

  if (loading) {
    return (
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="space-y-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-border last:border-0">
              <div className="w-4 h-4 rounded bg-muted animate-pulse" />
              <div className="w-12 h-9 rounded-lg bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
                <div className="h-2.5 w-1/4 rounded bg-muted animate-pulse" />
              </div>
              <div className="w-20 h-5 rounded-full bg-muted animate-pulse" />
              <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-border rounded-xl">
        <EmptyState message={emptyMessage || 'No records found'} />
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => el && (el.indeterminate = someSelected)}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                  />
                </th>
              )}
              {columns.map(col => (
                <th key={col.key} className={cn("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap", col.headerClassName)}>
                  {col.header}
                </th>
              ))}
              {actionsFn && <th className="w-12 px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {data.map((row, ri) => (
              <Row
                key={row.id}
                row={row}
                columns={columns}
 ri={ri}
                selectable={selectable}
                isSelected={selectedIds.includes(row.id)}
                onToggle={() => toggleOne(row.id)}
                onRowClick={onRowClick}
                actionsFn={actionsFn}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ row, columns, ri, selectable, isSelected, onToggle, onRowClick, actionsFn }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <tr
      onClick={() => onRowClick?.(row)}
      className={cn(
        "border-b border-border last:border-0 transition-colors group",
        onRowClick && "cursor-pointer",
        isSelected ? "bg-primary/5" : ri % 2 === 1 ? "bg-muted/20" : "bg-white",
        "hover:bg-primary/3"
      )}
    >
      {selectable && (
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
          />
        </td>
      )}
      {columns.map(col => (
        <td key={col.key} className={cn("px-4 py-3 text-sm text-foreground whitespace-nowrap", col.className)}>
          {col.render ? col.render(row) : row[col.key]}
        </td>
      ))}
      {actionsFn && (
        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
          <div className="relative inline-block" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg border border-border shadow-floating animate-scale-in overflow-hidden z-20">
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                  <Eye className="w-4 h-4 text-muted-foreground" /> View
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                  <Pencil className="w-4 h-4 text-muted-foreground" /> Edit
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                  <Copy className="w-4 h-4 text-muted-foreground" /> Duplicate
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" /> Preview
                </button>
                <div className="h-px bg-border" />
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}