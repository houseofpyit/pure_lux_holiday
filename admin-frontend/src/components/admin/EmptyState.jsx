import React from 'react';
import { Inbox, Plus } from 'lucide-react';

export default function EmptyState({ icon: Icon, title, message, action, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
        {Icon ? <Icon className="w-7 h-7 text-muted-foreground" /> : <Inbox className="w-7 h-7 text-muted-foreground" />}
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title || 'Nothing here yet'}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
      {(action || (actionLabel && onAction)) && (
        <div className="mt-4">
          {action || (
            <button onClick={onAction} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft">
              <Plus className="w-4 h-4" strokeWidth={2.5} /> {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}