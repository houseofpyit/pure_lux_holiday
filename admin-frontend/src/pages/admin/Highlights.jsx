import React from 'react';
import { Sparkles } from 'lucide-react';
import CrudModule from '@/components/admin/CrudModule';
import StatusBadge from '@/components/admin/StatusBadge';
import { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import { highlights } from '@/lib/adminMockData';

const columns = [
  { key: 'title', header: 'Highlight', render: (r) => <span className="font-medium text-foreground">{r.title}</span> },
  { key: 'package', header: 'Package', render: (r) => <span className="text-muted-foreground text-xs line-clamp-1 max-w-xs">{r.package}</span> },
  { key: 'icon', header: 'Icon', render: (r) => <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-muted text-muted-foreground">{r.icon}</span> },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

export default function Highlights() {
  return (
    <CrudModule
      title="Package Highlights"
      description="Manage key highlights for travel packages"
      searchPlaceholder="Search highlights..."
      columns={columns}
      data={highlights}
      searchKeys={['title', 'package']}
      totalCount={48}
      totalPages={5}
      addLabel="New Highlight"
      emptyIcon={Sparkles}
      tabs={['General', 'Settings', 'History']}
      renderTabContent={(tab, editItem) => (
        <div className="space-y-5">
          {tab === 'General' && (
            <>
              <DrawerField label="Package" required><DrawerSelect options={['Maldives Overwater Villa Retreat', 'Santorini Luxury Caldera Escape', 'Bali Ubud Jungle Sanctuary']} defaultValue={editItem?.package} /></DrawerField>
              <DrawerField label="Highlight Title" required><DrawerInput placeholder="e.g. Private Overwater Villa" defaultValue={editItem?.title} /></DrawerField>
              <DrawerField label="Icon"><DrawerSelect options={['Home', 'UtensilsCrossed', 'Sparkles', 'Sailboat', 'Mountain', 'Waves', 'Award', 'Heart']} defaultValue={editItem?.icon} /></DrawerField>
              <DrawerField label="Description"><DrawerInput textarea placeholder="Brief description of this highlight..." /></DrawerField>
              <DrawerField label="Status"><DrawerSelect options={['Published', 'Draft']} defaultValue={editItem?.status} /></DrawerField>
            </>
          )}
          {tab === 'Settings' && (
            <DrawerField label="Display Order"><DrawerInput type="number" placeholder="1" /></DrawerField>
          )}
        </div>
      )}
    />
  );
}