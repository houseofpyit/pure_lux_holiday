/**
 * AboutPageCms — About Page Sections landing page.
 *
 * Mirrors HomePageCms exactly: lists every About section as an individual
 * configurable module. Clicking "Configure" navigates to the dedicated
 * CMS page for that section only.
 *
 * Section registry is static — the About page structure does not change
 * at runtime. Each row shows: thumbnail · name · type · status · Configure.
 *
 * No mock data library dependency: section metadata is defined inline.
 */
import { useNavigate } from 'react-router-dom';
import {
  Settings2, Eye,
  Image as ImageIcon, BookOpen, Star, Users, Clock,
  Trophy, Handshake, Megaphone, Search, Heart,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';

const cn = (...c) => c.filter(Boolean).join(' ');

/**
 * Static About section registry.
 * Each entry maps to a dedicated CMS page at `path`.
 * `icon` is a Lucide component used as the thumbnail placeholder.
 * `type` is the display label shown in the Type column.
 */
const ABOUT_SECTIONS = [
  {
    id: 'hero',
    name: 'Hero Section',
    type: 'Banner',
    description: 'Top hero banner with heading, subtitle and background image',
    path: '/admin/website/about/hero',
    icon: ImageIcon,
    status: 'Published',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'story',
    name: 'Our Story',
    type: 'Content Block',
    description: 'Company story, mission and vision text',
    path: '/admin/website/about/story',
    icon: BookOpen,
    status: 'Published',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'mission-vision',
    name: 'Mission & Vision',
    type: 'Content Block',
    description: 'Dedicated mission and vision statements',
    path: '/admin/website/about/mission-vision',
    icon: Heart,
    status: 'Published',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    id: 'core-values',
    name: 'Core Values',
    type: 'Feature Grid',
    description: 'Company core values with icons and descriptions',
    path: '/admin/website/about/core-values',
    icon: Star,
    status: 'Published',
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    id: 'timeline',
    name: 'Journey Timeline',
    type: 'Timeline',
    description: 'Milestone events in company history',
    path: '/admin/website/about/timeline',
    icon: Clock,
    status: 'Published',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    id: 'leadership',
    name: 'Leadership Team',
    type: 'Team Grid',
    description: 'Team members with photos and designations',
    path: '/admin/website/about/leadership',
    icon: Users,
    status: 'Published',
    color: 'bg-sky-50 text-sky-600',
  },
  {
    id: 'awards',
    name: 'Awards',
    type: 'Awards Grid',
    description: 'Awards, accolades and certifications',
    path: '/admin/website/about/awards',
    icon: Trophy,
    status: 'Published',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    id: 'partners',
    name: 'Partners',
    type: 'Logo Grid',
    description: 'Partner and affiliation logos',
    path: '/admin/website/about/partners',
    icon: Handshake,
    status: 'Published',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    id: 'cta',
    name: 'CTA Section',
    type: 'Call to Action',
    description: 'Bottom call-to-action banner',
    path: '/admin/website/about/cta',
    icon: Megaphone,
    status: 'Published',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    id: 'seo',
    name: 'SEO',
    type: 'SEO Settings',
    description: 'Page title, meta description and Open Graph tags',
    path: '/admin/website/about/seo',
    icon: Search,
    status: 'Published',
    color: 'bg-slate-50 text-slate-600',
  },
];

export default function AboutPageCms() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="About Page Sections"
        description="Configure each section of the About page individually"
        actions={
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/8 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors"
            onClick={() => {}}
          >
            <Eye className="w-4 h-4" /> Preview Page
          </button>
        }
      />

      <div className="bg-white border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-sm text-muted-foreground">{ABOUT_SECTIONS.length} sections</span>
        </div>

        <div className="space-y-2">
          {ABOUT_SECTIONS.map((section, index) => {
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
