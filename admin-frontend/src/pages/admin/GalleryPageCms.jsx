/**
 * GalleryPageCms — Gallery Page CMS landing page.
 *
 * Three panels:
 *   1. Page Sections  — Hero, Gallery Settings, CTA, SEO (Configure buttons)
 *   2. Live stats     — album + category counts from real backend
 *   3. Gallery Management shortcuts
 */
import { useNavigate } from 'react-router-dom';
import {
  Settings2,
  Image as ImageIcon, LayoutGrid, Megaphone, Search,
  ExternalLink, Images, FolderOpen, Plus, Film,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { useGalleryCategories, useGalleryAlbums } from '@/hooks/use-gallery';

const cn = (...c) => c.filter(Boolean).join(' ');

const SECTIONS = [
  {
    id: 'hero', name: 'Hero Section', type: 'Banner',
    description: 'Background image, label, heading, description and overlay opacity',
    path: '/admin/website/gallery/hero', icon: ImageIcon,
    status: 'Published', color: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'settings', name: 'Gallery Settings', type: 'Display Config',
    description: 'Layout, columns, filter, lightbox, sort and card display options',
    path: '/admin/website/gallery/settings', icon: LayoutGrid,
    status: 'Published', color: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'cta', name: 'CTA Section', type: 'Call to Action',
    description: 'Full-width call-to-action banner — reuses global CTA config',
    path: '/admin/website/gallery/cta', icon: Megaphone,
    status: 'Published', color: 'bg-rose-50 text-rose-600',
  },
  {
    id: 'seo', name: 'SEO', type: 'SEO Settings',
    description: 'Page title, meta description, keywords, canonical URL and OG image',
    path: '/admin/website/gallery/seo', icon: Search,
    status: 'Published', color: 'bg-slate-50 text-slate-600',
  },
];

const MGMT_LINKS = [
  { label: 'Albums', icon: Images, path: '/admin/media', desc: 'All gallery albums' },
  { label: 'Categories', icon: FolderOpen, path: '/admin/media', desc: 'Album categories' },
];

export default function GalleryPageCms() {
  const navigate = useNavigate();
  const sections = SECTIONS;

  const { data: categories = [] } = useGalleryCategories();
  const { data: albums = [] } = useGalleryAlbums();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gallery Page CMS"
        description="Configure page-level sections. Gallery albums and items are managed separately."
        searchPlaceholder="" onSearch={null} onAdd={null} filters={null} onFilter={null}
        activeFilter={null} onSort={null} onExport={null} onImport={null}
        actions={
          <button onClick={() => navigate('/admin/media')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/8 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
            <ExternalLink className="w-4 h-4" /> Manage Gallery
          </button>
        }
      />

      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <span className="shrink-0 mt-0.5">ℹ</span>
        <span>
          This page configures the <strong>Gallery landing page layout</strong>.
          Albums, items, categories, images and videos are managed in the{' '}
          <button onClick={() => navigate('/admin/media')} className="font-semibold underline underline-offset-2">Gallery Management</button> module.
        </span>
      </div>

      {/* ── Page Sections ── */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-foreground">Page Sections</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Configure each layout section of the Gallery page</p>
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

      {/* ── Gallery Management shortcuts ── */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-foreground">Gallery Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {albums.length} album{albums.length !== 1 ? 's' : ''} · {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} loaded from backend
          </p>
        </div>
        <div className="bg-white border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Images className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Manage All Gallery Content</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {albums.length} album{albums.length !== 1 ? 's' : ''} · {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} · Images & Videos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => navigate('/admin/media')} className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft">
              <Plus className="w-4 h-4" /> Add Album
            </button>
            <button onClick={() => navigate('/admin/media')} className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors">
              <ExternalLink className="w-4 h-4" /> View Gallery
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
