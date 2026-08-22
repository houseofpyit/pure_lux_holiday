import React from 'react';
import { CalendarDays } from 'lucide-react';
import CrudModule from '@/components/admin/CrudModule';
import StatusBadge from '@/components/admin/StatusBadge';
import { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import { itineraryItems } from '@/lib/adminMockData';

const filters = [
  { label: 'All', value: 'all', count: 124 },
  { label: 'Published', value: 'Published', count: 108 },
  { label: 'Draft', value: 'Draft', count: 16 },
];

const columns = [
  { key: 'day', header: 'Day', render: (r) => <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{r.day}</span> },
  { key: 'title', header: 'Title', render: (r) => <span className="font-medium text-foreground">{r.title}</span> },
  { key: 'package', header: 'Package', render: (r) => <span className="text-muted-foreground text-xs line-clamp-1 max-w-xs">{r.package}</span> },
  { key: 'meals', header: 'Meals', render: (r) => <span className="text-muted-foreground">{r.meals}</span> },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

export default function Itinerary() {
  return (
    <CrudModule
      title="Package Itinerary"
      description="Manage day-by-day itinerary for travel packages"
      searchPlaceholder="Search itinerary items..."
      filters={filters}
      columns={columns}
      data={itineraryItems}
      searchKeys={['title', 'package']}
      totalCount={124}
      totalPages={13}
      addLabel="New Itinerary Item"
      emptyIcon={CalendarDays}
      tabs={['General', 'Content', 'Meals', 'Settings', 'History']}
      renderTabContent={(tab, editItem) => (
        <div className="space-y-5">
          {tab === 'General' && (
            <>
              <DrawerField label="Package" required><DrawerSelect options={['Maldives Overwater Villa Retreat', 'Santorini Luxury Caldera Escape', 'Bali Ubud Jungle Sanctuary', 'Swiss Alps Private Chalet Experience']} defaultValue={editItem?.package} /></DrawerField>
              <div className="grid grid-cols-2 gap-4">
                <DrawerField label="Day Number" required><DrawerInput type="number" placeholder="1" defaultValue={editItem?.day} /></DrawerField>
                <DrawerField label="Status"><DrawerSelect options={['Published', 'Draft']} defaultValue={editItem?.status} /></DrawerField>
              </div>
              <DrawerField label="Title" required><DrawerInput placeholder="e.g. Arrival & Welcome" defaultValue={editItem?.title} /></DrawerField>
            </>
          )}
          {tab === 'Content' && (
            <>
              <DrawerField label="Description" required><DrawerInput textarea placeholder="Detailed description of the day's activities..." defaultValue={editItem?.description} /></DrawerField>
              <DrawerField label="Activities" hint="List of activities for this day"><DrawerInput textarea placeholder="• Morning: Guided tour&#10;• Afternoon: Beach picnic&#10;• Evening: Sunset dinner" /></DrawerField>
            </>
          )}
          {tab === 'Meals' && (
            <>
              <div className="space-y-2">
                {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map(meal => (
                  <label key={meal} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-muted/50">
                    <input type="checkbox" defaultChecked={editItem?.meals?.includes(meal)} className="w-4 h-4 rounded border-border text-primary" />
                    <span className="text-sm text-foreground">{meal}</span>
                  </label>
                ))}
              </div>
              <DrawerField label="Special Dietary Notes"><DrawerInput textarea placeholder="Vegetarian options available..." /></DrawerField>
            </>
          )}
          {tab === 'Settings' && (
            <>
              <DrawerField label="Accommodation"><DrawerInput placeholder="Overwater Villa #12" /></DrawerField>
              <DrawerField label="Transport"><DrawerInput placeholder="Private speedboat" /></DrawerField>
            </>
          )}
        </div>
      )}
    />
  );
}