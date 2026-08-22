import React, { useState } from 'react';
import { Menu, Plus, Pencil, Trash2, ExternalLink, ChevronRight } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { navigationItems } from '@/lib/adminMockData';


export default function NavigationManager() {
  const [items, setItems] = useState(navigationItems);
  const [deleteItem, setDeleteItem] = useState(null);

  return (
    <div>
      <PageHeader
        title="Navigation Manager"
        description="Manage website navigation menu items"
        onAdd={() => {}}
        addLabel="Add Menu Item"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Items */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
              <span>{items.length} menu item{items.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-3 p-3 bg-white border border-border rounded-xl transition-all hover:border-primary/30 hover:shadow-soft"
                >
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">{item.order}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{item.label}</span>
                      {item.children > 0 && <span className="flex items-center gap-0.5 text-xs text-muted-foreground"><ChevronRight className="w-3 h-3" /> {item.children} items</span>}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{item.url}</p>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-muted text-muted-foreground">{item.target}</span>
                  <StatusBadge status={item.status === 'Published' ? 'Published' : 'Draft'} />
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteItem(item)} className="p-1.5 rounded-lg hover:bg-destructive/5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-2 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
              <Plus className="w-4 h-4" /> Add Menu Item
            </button>
          </div>
        </div>

        {/* Preview & Settings */}
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Live Preview</h3>
            <div className="bg-gray-50 border border-border rounded-lg p-4">
              <div className="flex items-center gap-1 mb-3">
                <div className="w-4 h-4 rounded bg-primary/80" />
                <span className="text-sm font-bold text-foreground">Pure Luxe</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {items.filter(i => i.status === 'Published').map(item => (
                  <span key={item.id} className="text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors">{item.label}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Menu Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Menu Location</label>
                <select className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                  <option>Primary Navigation</option><option>Footer Menu</option><option>Mobile Menu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Menu Style</label>
                <select className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                  <option>Horizontal Bar</option><option>Dropdown</option><option>Mega Menu</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => setItems(items.filter(i => i.id !== deleteItem.id))}
        title="Delete Menu Item"
        message="Are you sure you want to remove this menu item from the navigation?"
        itemName={deleteItem?.label}
      />
    </div>
  );
}