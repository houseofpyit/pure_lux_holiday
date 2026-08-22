import React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  Published: 'bg-success/10 text-success border-success/20',
  Active: 'bg-success/10 text-success border-success/20',
  Responded: 'bg-success/10 text-success border-success/20',
  Subscribed: 'bg-success/10 text-success border-success/20',
  Draft: 'bg-muted text-muted-foreground border-border',
  Inactive: 'bg-muted text-muted-foreground border-border',
  Scheduled: 'bg-warning/10 text-warning border-warning/20',
  New: 'bg-primary/10 text-primary border-primary/20',
  'In Progress': 'bg-warning/10 text-warning border-warning/20',
  Closed: 'bg-muted text-muted-foreground border-border',
  Archived: 'bg-muted text-muted-foreground border-border',
  High: 'bg-destructive/10 text-destructive border-destructive/20',
  Medium: 'bg-warning/10 text-warning border-warning/20',
  Low: 'bg-muted text-muted-foreground border-border',
};

export default function StatusBadge({ status, className }) {
  const variant = variants[status] || 'bg-muted text-muted-foreground border-border';
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border whitespace-nowrap", variant, className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", {
        'bg-success': ['Published', 'Active', 'Responded', 'Subscribed'].includes(status),
        'bg-muted-foreground': ['Draft', 'Inactive', 'Closed', 'Archived', 'Low'].includes(status),
        'bg-warning': ['Scheduled', 'In Progress', 'Medium'].includes(status),
        'bg-primary': status === 'New',
        'bg-destructive': status === 'High',
      })} />
      {status}
    </span>
  );
}