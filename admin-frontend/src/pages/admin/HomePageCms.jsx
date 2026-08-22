import { useNavigate } from 'react-router-dom';
import {
  Settings2, Eye,
  Image as ImageIcon, Layers, MapPin, Compass,
  Shield, BookOpen, BarChart3, Quote, Newspaper, Megaphone, Search,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';

const cn = (...c) => c.filter(Boolean).join(' ');

const HOME_SECTIONS = [
  {
    id: 'hero',
    name: 'Hero Banner',
    type: 'Hero',
    description: 'Full-width hero with heading, subtitle and background media',
    path: '/admin/website/home/hero',
    icon: ImageIcon,
    status: 'Published',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'collections',
    name: 'Collections',
    type: 'Collection Grid',
    description: 'Luxury travel collections displayed as clickable cards',
    path: '/admin/website/home/collections',
    icon: Layers,
    status: 'Published',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    id: 'destinations',
    name: 'Featured Destinations',
    type: 'Destination Carousel',
    description: 'Highlighted destinations in an interactive carousel',
    path: '/admin/website/home/featured-destinations',
    icon: MapPin,
    status: 'Published',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'experiences',
    name: 'Experiences',
    type: 'Experience Grid',
    description: 'Curated luxury experiences with icons and imagery',
    path: '/admin/website/home/experiences',
    icon: Compass,
    status: 'Published',
    color: 'bg-sky-50 text-sky-600',
  },
  {
    id: 'why-choose-us',
    name: 'Why Choose Us',
    type: 'Feature Block',
    description: 'Key differentiators and value propositions',
    path: '/admin/website/home/why-choose-us',
    icon: Shield,
    status: 'Published',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    id: 'about-section',
    name: 'About Section',
    type: 'Content Block',
    description: 'Brief company introduction with image and CTA',
    path: '/admin/website/home/about-section',
    icon: BookOpen,
    status: 'Published',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    id: 'statistics',
    name: 'Statistics',
    type: 'Stats Counter',
    description: 'Animated counters showcasing key numbers',
    path: '/admin/website/home/statistics',
    icon: BarChart3,
    status: 'Published',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    type: 'Testimonial Slider',
    description: 'Client reviews in a rotating carousel',
    path: '/admin/website/home/testimonials',
    icon: Quote,
    status: 'Published',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    id: 'travel-journal',
    name: 'Travel Journal',
    type: 'Blog Preview',
    description: 'Featured blog articles from the journal',
    path: '/admin/website/home/travel-journal',
    icon: Newspaper,
    status: 'Published',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    id: 'cta',
    name: 'CTA Section',
    type: 'Call to Action',
    description: 'Bottom call-to-action banner with background image',
    path: '/admin/website/home/concierge-cta',
    icon: Megaphone,
    status: 'Published',
    color: 'bg-orange-50 text-orange-600',
  },
];

export default function HomePageCms() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Home Page Sections"
        description="Configure each section of the homepage individually"
        actions={
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/8 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
            <Eye className="w-4 h-4" /> Preview Page
          </button>
        }
      />

      <div className="bg-white border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-sm text-muted-foreground">{HOME_SECTIONS.length} sections</span>
        </div>

        <div className="space-y-2">
          {HOME_SECTIONS.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                className="group flex items-center gap-3 p-3 bg-white border border-border rounded-xl transition-all hover:border-primary/30 hover:shadow-soft"
              >
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                  {index + 1}
                </div>

                <div className={cn('w-12 h-10 rounded-lg flex items-center justify-center shrink-0', section.color)}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{section.name}</p>
                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground whitespace-nowrap">
                      {section.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{section.description}</p>
                </div>

                <StatusBadge status={section.status} />

                <button
                  onClick={() => navigate(section.path)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary bg-primary/8 rounded-lg hover:bg-primary/10 transition-colors shrink-0"
                >
                  <Settings2 className="w-3.5 h-3.5" /> Configure
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
