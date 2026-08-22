import React from 'react';
import { Search, Filter, ArrowUpDown, Download, Upload, Plus } from 'lucide-react';

const cn = (...c) => c.filter(Boolean).join(' ');

export default function PageHeader({ title, description, searchPlaceholder, onSearch, onAdd, addLabel = 'Add New', filters, onFilter, activeFilter, onSort, onExport, onImport, actions }) {
  return (
    <div className="mb-6">
      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {onExport && (
            <button onClick={onExport} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors">
              <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span>
            </button>
          )}
          {onImport && (
            <button onClick={onImport} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors">
              <Upload className="w-4 h-4" /> <span className="hidden sm:inline">Import</span>
            </button>
          )}
          {onAdd && (
            <button onClick={onAdd} className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft">
              <Plus className="w-4 h-4" strokeWidth={2.5} /> {addLabel}
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {onSearch && (
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={searchPlaceholder || 'Search...'}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/70"
            />
          </div>
        )}

        {filters && (
          <div className="flex items-center gap-2 flex-wrap">
            {filters.map(f => (
              <button
                key={f.value}
                onClick={() => onFilter(f.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors",
                  activeFilter === f.value
                    ? "bg-primary/8 border-primary/20 text-primary"
                    : "bg-white border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {f.label}
                {f.count !== undefined && (
                  <span className={cn("px-1.5 py-0.5 text-[10px] font-bold rounded", activeFilter === f.value ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                    {f.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {onSort && (
          <button onClick={onSort} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-white border border-border rounded-lg hover:bg-muted hover:text-foreground transition-colors">
            <ArrowUpDown className="w-4 h-4" /> Sort
          </button>
        )}
      </div>
    </div>
  );
}