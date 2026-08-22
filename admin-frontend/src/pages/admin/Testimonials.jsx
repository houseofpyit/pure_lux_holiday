import React, { useMemo } from 'react';
import { Star, Quote } from 'lucide-react';
import CrudModule from '@/components/admin/CrudModule';
import StatusBadge from '@/components/admin/StatusBadge';
import { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';
import { useTestimonials } from '@/hooks/use-home';

const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop';

function mapTestimonialRow(item) {
  return {
    id: item.id,
    customer: item.customer_name,
    photo: item.customer_photo_url || item.image_url || FALLBACK_PHOTO,
    location: item.customer_location || '—',
    review: item.review,
    rating: item.rating ?? 5,
    trip: item.title || '—',
    category: item.customer_designation || 'General',
    status: item.is_active ? 'Published' : 'Draft',
    featured: item.homepage_featured,
    date: item.travel_date || '—',
  };
}

const columns = [
  {
    key: 'customer', header: 'Customer',
    render: (r) => (
      <div className="flex items-center gap-3">
        <img src={r.photo} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
        <div>
          <p className="font-medium text-foreground">{r.customer}</p>
          <p className="text-xs text-muted-foreground">{r.location}</p>
        </div>
      </div>
    )
  },
  { key: 'review', header: 'Review', render: (r) => <span className="text-muted-foreground line-clamp-1 max-w-xs">{r.review}</span> },
  { key: 'rating', header: 'Rating', render: (r) => <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className={i < r.rating ? "w-3.5 h-3.5 text-warning fill-warning" : "w-3.5 h-3.5 text-muted/30"} />)}</div> },
  { key: 'trip', header: 'Trip', render: (r) => <span className="text-muted-foreground text-xs">{r.trip}</span> },
  { key: 'category', header: 'Category', render: (r) => <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-muted text-muted-foreground">{r.category}</span> },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'date', header: 'Date', render: (r) => <span className="text-muted-foreground text-xs">{r.date}</span> },
];

export default function Testimonials() {
  const { data: testimonials = [] } = useTestimonials();

  const rows = useMemo(() => testimonials.map(mapTestimonialRow), [testimonials]);

  const filters = useMemo(() => ([
    { label: 'All', value: 'all', count: rows.length },
    { label: 'Published', value: 'Published', count: rows.filter((r) => r.status === 'Published').length },
    { label: 'Draft', value: 'Draft', count: rows.filter((r) => r.status === 'Draft').length },
    { label: 'Featured', value: 'featured', count: rows.filter((r) => r.featured).length },
  ]), [rows]);

  return (
    <CrudModule
      title="Testimonials"
      description="Manage customer reviews and testimonials"
      searchPlaceholder="Search by customer or review..."
      filters={filters}
      columns={columns}
      data={rows}
      searchKeys={['customer', 'review', 'location']}
      totalCount={rows.length}
      totalPages={Math.max(1, Math.ceil(rows.length / 10))}
      addLabel="New Testimonial"
      helpText="Testimonials with a 5-star rating and featured status appear on the homepage slider."
      tabs={['General', 'Content', 'Media', 'SEO', 'Settings', 'History']}
      renderTabContent={(tab, editItem) => (
        <div className="space-y-5">
          {tab === 'General' && (
            <>
              <DrawerField label="Customer Name" required>
                <DrawerInput placeholder="e.g. Emily & James Parker" defaultValue={editItem?.customer} />
              </DrawerField>
              <div className="grid grid-cols-2 gap-4">
                <DrawerField label="Location"><DrawerInput placeholder="New York, USA" defaultValue={editItem?.location} /></DrawerField>
                <DrawerField label="Trip / Package"><DrawerInput placeholder="Maldives Overwater Villa Retreat" defaultValue={editItem?.trip} /></DrawerField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DrawerField label="Category"><DrawerSelect options={['Honeymoon', 'Couples', 'Family', 'Wellness', 'Luxury', 'Adventure']} defaultValue={editItem?.category} /></DrawerField>
                <DrawerField label="Rating" required>
                  <div className="flex items-center gap-1 px-3 py-2 border border-border rounded-lg">
                    {[1,2,3,4,5].map(n => <Star key={n} className={n <= (editItem?.rating || 5) ? "w-5 h-5 text-warning fill-warning cursor-pointer" : "w-5 h-5 text-muted/30 cursor-pointer"} />)}
                  </div>
                </DrawerField>
              </div>
              <DrawerField label="Featured">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked={editItem?.featured} className="w-4 h-4 rounded border-border text-primary" />
                  <span className="text-sm text-muted-foreground">Display in homepage testimonial slider</span>
                </label>
              </DrawerField>
              <DrawerField label="Status"><DrawerSelect options={['Published', 'Draft']} defaultValue={editItem?.status} /></DrawerField>
            </>
          )}
          {tab === 'Content' && (
            <>
              <DrawerField label="Review Title"><DrawerInput placeholder="Short headline for the review" defaultValue={editItem?.trip} /></DrawerField>
              <DrawerField label="Review" required>
                <textarea rows={6} defaultValue={editItem?.review} placeholder="Customer review text..." className="w-full px-3 py-2.5 text-sm border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </DrawerField>
            </>
          )}
          {tab === 'Media' && (
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <Quote className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Upload customer photo in the homepage Testimonials CMS for full media management.</p>
            </div>
          )}
        </div>
      )}
    />
  );
}
