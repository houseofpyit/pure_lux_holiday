import React from 'react';

export function TableSkeleton({ rows = 8, columns = 5, selectable = true }) {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      <div className="space-y-0">
        {/* Header skeleton */}
        <div className="flex items-center gap-4 px-4 py-3.5 border-b border-border bg-muted/30">
          {selectable && <div className="w-4 h-4 rounded bg-muted animate-pulse" />}
          {[...Array(columns)].map((_, i) => (
            <div key={i} className="h-3 rounded bg-muted animate-pulse" style={{ width: `${60 + (i * 10) % 80}px` }} />
          ))}
          <div className="w-8 h-8 rounded-lg bg-muted animate-pulse ml-auto" />
        </div>
        {/* Row skeletons */}
        {[...Array(rows)].map((_, ri) => (
          <div key={ri} className="flex items-center gap-4 px-4 py-4 border-b border-border last:border-0">
            {selectable && <div className="w-4 h-4 rounded bg-muted animate-pulse" />}
            <div className="w-10 h-10 rounded-lg bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
              <div className="h-2.5 w-1/4 rounded bg-muted animate-pulse" />
            </div>
            <div className="w-20 h-5 rounded-full bg-muted animate-pulse" />
            <div className="w-16 h-3 rounded bg-muted animate-pulse" />
            <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="aspect-video bg-muted animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="w-16 h-5 rounded-full bg-muted animate-pulse" />
              <div className="w-12 h-5 rounded-full bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-border rounded-xl p-6 space-y-4">
        <div className="h-6 w-48 rounded bg-muted animate-pulse" />
        <div className="h-4 w-72 rounded bg-muted animate-pulse" />
        <div className="grid grid-cols-2 gap-4 mt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 rounded bg-muted animate-pulse" />
              <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}