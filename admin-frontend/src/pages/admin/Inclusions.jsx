import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import CrudModule from '@/components/admin/CrudModule';
import StatusBadge from '@/components/admin/StatusBadge';
import { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import { inclusions } from '@/lib/adminMockData';

const columns = [
  { key: 'item', header: 'Inclusion', render: (r) => <span className="font-medium text-foreground">{r.item}</span> },
  { key: 'package', header: 'Package', render: (r) => <span className="text-muted-foreground text-xs line-clamp-1 max-w-xs">{r.package}</span> },
  { key: 'category', header: 'Category', render: (r) => <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-success/10 text-success">{r.category}</span> },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

export default function Inclusions() {
  return (
    <CrudModule
      title="Inclusions"
      description="Manage what's included in travel packages"
      searchPlaceholder="Search inclusions..."
      columns={columns}
      data={inclusions}
      searchKeys={['item', 'package']}
      totalCount={86}
      totalPages={9}
      addLabel="New Inclusion"
      emptyIcon={CheckCircle2}
      tabs={['General', 'Settings', 'History']}
      renderTabContent={(tab, editItem) => (
        <div className="space-y-5">
          {tab === 'General' && (
            <>
              <DrawerField label="Package" required><DrawerSelect options={['Maldives Overwater Villa Retreat', 'Santorini Luxury Caldera Escape', 'Bali Ubud Jungle Sanctuary']} defaultValue={editItem?.package} /></DrawerField>
              <DrawerField label="Inclusion Item" required><DrawerInput placeholder="e.g. 7 nights in Overwater Villa" defaultValue={editItem?.item} /></DrawerField>
              <div className="grid grid-cols-2 gap-4">
                <DrawerField label="Category"><DrawerSelect options={['Accommodation', 'Meals', 'Transfers', 'Experiences', 'Services', 'Other']} defaultValue={editItem?.category} /></DrawerField>
                <DrawerField label="Status"><DrawerSelect options={['Published', 'Draft']} defaultValue={editItem?.status} /></DrawerField>
              </div>
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