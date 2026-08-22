import React, { useMemo } from 'react';
import { HelpCircle } from 'lucide-react';
import CrudModule from '@/components/admin/CrudModule';
import StatusBadge from '@/components/admin/StatusBadge';
import { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import { useAboutFaqs } from '@/hooks/use-about';

function mapFaqRow(item) {
  return {
    id: item.id,
    question: item.question,
    answer: item.answer,
    category: 'General',
    order: item.display_order ?? 0,
    status: item.is_active ? 'Published' : 'Draft',
  };
}

const columns = [
  { key: 'question', header: 'Question', render: (r) => <span className="font-medium text-foreground line-clamp-1 max-w-md">{r.question}</span> },
  { key: 'category', header: 'Category', render: (r) => <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-muted text-muted-foreground">{r.category}</span> },
  { key: 'answer', header: 'Answer', render: (r) => <span className="text-muted-foreground line-clamp-1 max-w-xs">{r.answer}</span> },
  { key: 'order', header: 'Order', render: (r) => <span className="text-muted-foreground">{r.order}</span> },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

export default function Faqs() {
  const { data: faqs = [] } = useAboutFaqs();

  const rows = useMemo(() => faqs.map(mapFaqRow), [faqs]);

  const filters = useMemo(() => ([
    { label: 'All', value: 'all', count: rows.length },
    { label: 'Published', value: 'Published', count: rows.filter((r) => r.status === 'Published').length },
    { label: 'Draft', value: 'Draft', count: rows.filter((r) => r.status === 'Draft').length },
  ]), [rows]);

  return (
    <CrudModule
      title="FAQs"
      description="Manage frequently asked questions"
      searchPlaceholder="Search questions..."
      filters={filters}
      columns={columns}
      data={rows}
      searchKeys={['question', 'answer']}
      totalCount={rows.length}
      totalPages={Math.max(1, Math.ceil(rows.length / 10))}
      addLabel="New FAQ"
      emptyIcon={HelpCircle}
      helpText="FAQs are displayed on the website in the order specified. Use categories to group related questions."
      tabs={['General', 'Answer', 'Settings', 'History']}
      renderTabContent={(tab, editItem) => (
        <div className="space-y-5">
          {tab === 'General' && (
            <>
              <DrawerField label="Question" required>
                <DrawerInput placeholder="e.g. What is included in your luxury travel packages?" defaultValue={editItem?.question} />
              </DrawerField>
              <div className="grid grid-cols-2 gap-4">
                <DrawerField label="Category"><DrawerSelect options={['General', 'Booking', 'Payments', 'Travel Insurance', 'Customization']} defaultValue={editItem?.category} /></DrawerField>
                <DrawerField label="Display Order"><DrawerInput type="number" placeholder="1" defaultValue={editItem?.order} /></DrawerField>
              </div>
              <DrawerField label="Status"><DrawerSelect options={['Published', 'Draft']} defaultValue={editItem?.status} /></DrawerField>
            </>
          )}
          {tab === 'Answer' && (
            <DrawerField label="Answer" required hint="Supports basic formatting">
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-muted/30">
                  {['B', 'I', 'U', '•', '🔗'].map(b => <button key={b} className="px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted rounded">{b}</button>)}
                </div>
                <textarea rows={8} defaultValue={editItem?.answer} placeholder="Enter the answer..." className="w-full px-3 py-3 text-sm outline-none resize-none" />
              </div>
            </DrawerField>
          )}
          {tab === 'Settings' && (
            <>
              <DrawerField label="Visibility">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border text-primary" />
                  <span className="text-sm text-muted-foreground">Show on FAQ page</span>
                </label>
              </DrawerField>
              <DrawerField label="Show on Homepage">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border text-primary" />
                  <span className="text-sm text-muted-foreground">Display in homepage FAQ section</span>
                </label>
              </DrawerField>
            </>
          )}
        </div>
      )}
    />
  );
}
