import React from 'react';
import { XCircle } from 'lucide-react';
import CrudModule from '@/components/admin/CrudModule';
import StatusBadge from '@/components/admin/StatusBadge';
import { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import { exclusions } from '@/lib/adminMockData';

const columns = [
  { key: 'item', header: 'Exclusion', render: (r) => <span className="font-medium text-foreground">{r.item}</span> },
  { key: 'package', header: 'Package', render: (r) => <span className="text-muted-foreground text-xs line-clamp-1 max-w-xs">{r.package}</span> },
  { key: 'category', header: 'Category', render: (r) => <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-destructive/10 text-destructive">{r.category}</span> },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

export default function Exclusions() {
  return (
    <CrudModule
      title="Exclusions"
      description="Manage what's not included in travel packages"
      searchPlaceholder="Search exclusions..."
      columns={columns}
      data={exclusions}
      searchKeys={['item', 'package']}
      totalCount={42}
      totalPages={5}
      addLabel="New Exclusion"
      emptyIcon={XCircle}
      tabs={['General', 'Settings', 'History']}
      renderTabContent={(tab, editItem) => (
        <div className="space-y-5">
          {tab === 'General' && (
            <>
              <DrawerField label="Package" required><DrawerSelect options={['Maldives Overwater Villa Retreat', 'Santorini Luxury Caldera Escape', 'Bali Ubud Jungle Sanctuary']} defaultValue={editItem?.package} /></DrawerField>
              <DrawerField label="Exclusion Item" required><DrawerInput placeholder="e.g. International flights" defaultValue={editItem?.item} /></DrawerField>
              <div className="grid grid-cols-2 gap-4">
                <DrawerField label="Category"><DrawerSelect options={['Flights', 'Meals', 'Insurance', 'Visa', 'Documentation', 'Miscellaneous']} defaultValue={editItem?.category} /></DrawerField>
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