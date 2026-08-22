import React, { useState } from 'react';
import { PanelBottom, Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { footerLinks } from '@/lib/adminMockData';

const cn = (...c) => c.filter(Boolean).join(' ');

const sections = ['Company', 'Destinations', 'Support', 'Legal'];

export default function FooterManager() {
  const [items, setItems] = useState(footerLinks);
  const [deleteItem, setDeleteItem] = useState(null);
  const [activeSection, setActiveSection] = useState('All');

  const filtered = activeSection === 'All' ? items : items.filter(i => i.section === activeSection);

  return (
    <div>
      <PageHeader
        title="Footer Manager"
        description="Manage footer link sections and content"
        onAdd={() => {}}
        addLabel="Add Footer Link"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Filter */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-border rounded-xl p-4 sticky top-20">
            <h3 className="text-sm font-semibold text-foreground mb-3">Sections</h3>
            <div className="space-y-1">
              <button onClick={() => setActiveSection('All')} className={cn("w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors", activeSection === 'All' ? 'bg-primary/8 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
                <span>All Sections</span><span className="text-xs">{items.length}</span>
              </button>
              {sections.map(s => (
                <button key={s} onClick={() => setActiveSection(s)} className={cn("w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors", activeSection === s ? 'bg-primary/8 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
                  <span>{s}</span><span className="text-xs">{items.filter(i => i.section === s).length}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Links List */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Label</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Section</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">URL</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="w-16 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => (
                    <tr key={item.id} className={cn("border-b border-border last:border-0 hover:bg-muted/30 transition-colors group", i % 2 === 1 && "bg-muted/20")}>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{item.label}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 text-xs font-medium rounded-md bg-muted text-muted-foreground">{item.section}</span></td>
                      <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{item.url}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{item.order}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status === 'Published' ? 'Published' : 'Draft'} /></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteItem(item)} className="p-1.5 rounded-lg hover:bg-destructive/5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Preview */}
          <div className="mt-6 bg-gray-900 rounded-xl p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {sections.map(s => (
                <div key={s}>
                  <p className="text-sm font-bold text-white mb-3">{s}</p>
                  <div className="space-y-2">
                    {items.filter(i => i.section === s).map(i => (
                      <p key={i.id} className="text-xs text-gray-400 hover:text-white cursor-pointer transition-colors">{i.label}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-700 flex items-center justify-between">
              <p className="text-xs text-gray-500">© 2026 Pure Luxe Holidays. All rights reserved.</p>
              <p className="text-xs text-gray-500">Crafted with care for luxury travelers</p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => setItems(items.filter(i => i.id !== deleteItem.id))}
        title="Delete Footer Link"
        message="Are you sure you want to remove this link from the footer?"
        itemName={deleteItem?.label}
      />
    </div>
  );
}