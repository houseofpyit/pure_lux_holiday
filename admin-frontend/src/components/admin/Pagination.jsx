import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const cn = (...c) => c.filter(Boolean).join(' ');

export default function Pagination({ page, totalPages, total, perPage, onPageChange, selectedCount }) {
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  const getPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          {total > 0 ? `Showing ${start}–${end} of ${total}` : 'No results'}
        </span>
        {selectedCount > 0 && (
          <span className="px-2 py-0.5 bg-primary/8 text-primary text-xs font-medium rounded-md">
            {selectedCount} selected
          </span>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {getPages().map((p, i) =>
            p === '...' ? (
              <span key={i} className="px-2 text-muted-foreground text-sm">…</span>
            ) : (
              <button
                key={i}
                onClick={() => onPageChange(p)}
                className={cn(
                  "min-w-[36px] h-9 px-2 text-sm font-medium rounded-lg transition-colors",
                  p === page
                    ? "bg-primary text-white shadow-soft"
                    : "text-muted-foreground hover:bg-muted border border-border"
                )}
              >
                {p}
              </button>
            )
          )}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}