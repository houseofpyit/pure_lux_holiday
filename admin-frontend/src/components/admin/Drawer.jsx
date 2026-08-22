import React, { useState } from 'react';
import { X, Save, Trash2, Archive, Send } from 'lucide-react';

const cn = (...c) => c.filter(Boolean).join(' ');

const widthMap = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-3xl' };

export default function Drawer({ open, onClose, title, description, tabs = ['General'], children, width = 'lg', onDelete, onSave, isSaving = false, activeTab: controlledTab, onTabChange }) {
  const [internalTab, setInternalTab] = useState(tabs[0]);
  const activeTab = controlledTab || internalTab;
  const setActiveTab = onTabChange || setInternalTab;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/30 animate-fade-in" onClick={onClose} />
      <div className={cn("relative ml-auto h-full w-full bg-white shadow-floating animate-slide-in flex flex-col", widthMap[width])}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-border shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-foreground tracking-tight">{title}</h2>
            {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
          </div>
          <button onClick={onClose} className="p-2 -mr-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        {tabs.length > 1 && (
          <div className="flex items-center gap-1 px-6 border-b border-border overflow-x-auto scrollbar-thin shrink-0">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5">
          {typeof children === 'function' ? children(activeTab) : children}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border bg-muted/30 shrink-0">
          <div>
            {onDelete && (
              <button onClick={onDelete} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors">
              Cancel
            </button>
            {onSave && (
              <button
                onClick={onSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? <><Save className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DrawerField({ label, children, hint, required }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function DrawerInput({ placeholder, value, defaultValue, onChange, onBlur, type = 'text', textarea, maxLength, disabled }) {
  const baseClass = "w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60 disabled:opacity-60 disabled:cursor-not-allowed";
  // Use controlled mode when onChange is provided, uncontrolled otherwise.
  const controlled = onChange !== undefined;
  const sharedProps = {
    placeholder,
    maxLength,
    disabled,
    onBlur,
    className: baseClass,
    ...(controlled
      ? { value: value ?? '', onChange }
      : { defaultValue: defaultValue ?? value }),
  };
  if (textarea) {
    return <textarea rows={4} {...sharedProps} className={cn(baseClass, "resize-none")} />;
  }
  return <input type={type} {...sharedProps} />;
}

export function DrawerSelect({ options, value, defaultValue, onChange, disabled }) {
  const controlled = onChange !== undefined;
  return (
    <select
      disabled={disabled}
      className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      {...(controlled
        ? { value: value ?? '', onChange }
        : { defaultValue: defaultValue })}
    >
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>
          {o.label ?? o}
        </option>
      ))}
    </select>
  );
}