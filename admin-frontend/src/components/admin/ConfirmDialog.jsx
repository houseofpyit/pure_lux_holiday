import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const cn = (...c) => c.filter(Boolean).join(' ');

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Delete Confirmation',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'destructive',
  itemName,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-floating max-w-md w-full animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-4 p-6">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            variant === 'destructive' ? "bg-destructive/10" : "bg-warning/10"
          )}>
            <AlertTriangle className={cn("w-6 h-6", variant === 'destructive' ? "text-destructive" : "text-warning")} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground tracking-tight">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{message}</p>
            {itemName && (
              <div className="mt-3 px-3 py-2 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm font-medium text-foreground">{itemName}</p>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground -mt-1 -mr-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/30 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={cn(
              "px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-soft",
              variant === 'destructive' ? "bg-destructive hover:bg-destructive/90" : "bg-warning hover:bg-warning/90"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}