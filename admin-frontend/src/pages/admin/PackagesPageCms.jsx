/**
 * PackagesPageCms — Luxury Packages Page CMS landing page.
 *
 * Three panels:
 *   1. Page Sections  — Hero, Listing Settings, CTA, SEO (Configure buttons)
 *   2. Package count  — quick stats from real API data
 *   3. Package Management shortcut — links to existing CRUD modules
 */
import { useNavigate } from 'react-router-dom';
import {
  Settings2,
  Image as ImageIcon, LayoutGrid, Megaphone, Search,
  ExternalLink, Briefcase, Plus, FolderTree,
  CalendarDays, Sparkles, CheckCircle2, XCircle,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { usePackageCategories } from '@/hooks/use-packages';

const cn = (...c) => c.filter(Boolean).join(' ');

const SECTIONS = [
  {
    id: 'hero', name: 'Hero Section', type: 'Banner',
    description: 'Background image, label, heading, description and overlay opacity',
    path: '/admin/website/packages/hero', icon: ImageIcon,
    status: 'Published', color: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'listing', name: 'Listing Settings', type: 'Display Config',
    description: 'Category filter, sort, cards per page, price/duration display toggles',
    path: '/admin/website/packages/listing', icon: LayoutGrid,
    status: 'Published', color: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'cta', name: 'CTA Section', type: 'Call to Action',
    description: 'Full-width call-to-action banner — reuses global CTA config',
    path: '/admin/website/packages/cta', icon: Megaphone,
    status: 'Published', color: 'bg-rose-50 text-rose-600',
  },
  {
    id: 'seo', name: 'SEO', type: 'SEO Settings',
    description: 'Page title, meta description, keywords, canonical URL and OG image',
    path: '/admin/website/packages/seo', icon: Search,
    status: 'Published', color: 'bg-slate-50 text-slate-600',
  },
];

const MGMT_LINKS = [
  { label: 'Packages', icon: Briefcase, path: '/admin/packages', desc: 'All package records' },
  { label: 'Categories', icon: FolderTree, path: '/admin/travel/categories', desc: 'Package categories' },
  { label: 'Itinerary', icon: CalendarDays, path: '/admin/travel/itinerary', desc: 'Day-by-day plans' },
  { label: 'Highlights', icon: Sparkles, path: '/admin/travel/highlights', desc: 'Key selling points' },
  { label: 'Inclusions', icon: CheckCircle2, path: '/admin/travel/inclusions', desc: "What's included" },
  { label: 'Exclusions', icon: XCircle, path: '/admin/travel/exclusions', desc: "What's excluded" },
];

export default function PackagesPageCms() {
  const navigate = useNavigate();
  const sections = SECTIONS;
  const { data: categories = [] } = usePackageCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Luxury Packages Page CMS"
        description="Configure page-level sections. Package records are managed separately."
        searchPlaceholder="" onSearch={null} onAdd={null} filters={null} onFilter={null}
        activeFilter={null} onSort={null} onExport={null} onImport={null}
        actions={
          <button onClick={() => navigate('/admin/packages')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/8 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
            <ExternalLink className="w-4 h-4" /> Manage Packages
          </button>
        }
      />

      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <span className="shrink-0 mt-0.5">ℹ</span>
        <span>
          This page configures the <strong>Luxury Packages landing page layout</strong>.
          Package records, categories, itineraries, highlights, inclusions, and exclusions
          are managed in the <button onClick={() => navigate('/admin/packages')} className="font-semibold underline underline-offset-2">Package Management</button> modules.
        </span>
      </div>

      {/* ── Page Sections ── */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-foreground">Page Sections</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Configure each layout section of the Luxury Packages page</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            <span>{sections.length} sections</span>
          </div>
          <div className="space-y-2">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div key={section.id}
                  className="group flex items-center gap-3 p-3 bg-white border rounded-xl transition-all border-border hover:border-primary/30 hover:shadow-soft">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">{index + 1}</div>
                  <div className={cn('w-16 h-12 rounded-lg flex items-center justify-center shrink-0', section.color)}><Icon className="w-5 h-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{section.name}</p>
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground whitespace-nowrap">{section.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{section.description}</p>
                  </div>
                  <StatusBadge status={section.status} className="" />
                  <button onClick={() => navigate(section.path)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary bg-primary/8 rounded-lg hover:bg-primary/10 transition-colors shrink-0">
                    <Settings2 className="w-3.5 h-3.5" /> Configure
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Package Management shortcuts ── */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-foreground">Package Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quick access to all package business data modules ·{' '}
            {categories.length > 0 && <span>{categories.length} categories loaded from backend</span>}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {MGMT_LINKS.map(({ label, icon: Icon, path, desc }) => (
            <button key={path} onClick={() => navigate(path)}
              className="flex flex-col items-center gap-2 p-4 bg-white border border-border rounded-xl hover:border-primary/30 hover:shadow-soft transition-all text-center group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-3 bg-white border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Manage All Packages</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} available
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => navigate('/admin/packages')} className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft">
              <Plus className="w-4 h-4" /> New Package
            </button>
            <button onClick={() => navigate('/admin/packages')} className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors">
              <ExternalLink className="w-4 h-4" /> View All
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
