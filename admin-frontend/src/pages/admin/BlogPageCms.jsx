/**
 * BlogPageCms — Blog Page CMS landing page.
 *
 * Architecture mirrors PackagesPageCms / GalleryPageCms exactly:
 *   1. Page Sections — Hero, Listing Settings, Featured Articles, CTA, SEO (Configure buttons)
 *   2. Live blog stats — article / category / tag counts from real APIs
 *   3. Blog Management shortcuts — links to existing CRUD modules
 *
 * Backend status: No dedicated blog page CMS endpoints exist.
 * The sub-section pages store settings locally until backend models are added.
 */
import { useNavigate } from 'react-router-dom';
import {
  Settings2,
  Image as ImageIcon, LayoutGrid, Megaphone, Search,
  ExternalLink, BookOpen, Tag, FolderTree, Plus,
  Newspaper,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { useBlogArticles, useBlogCategories, useBlogTags } from '@/hooks/use-blog';

const cn = (...c) => c.filter(Boolean).join(' ');

const SECTIONS = [
  {
    id: 'hero', name: 'Hero Section', type: 'Banner',
    description: 'Background image, label, heading, description and overlay opacity',
    path: '/admin/website/blog/hero', icon: ImageIcon,
    status: 'Published', color: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'listing', name: 'Listing Settings', type: 'Display Config',
    description: 'Category filter, sort order, grid layout and card display toggles',
    path: '/admin/website/blog/listing', icon: LayoutGrid,
    status: 'Published', color: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'featured', name: 'Featured Articles', type: 'Featured Content',
    description: 'Configure which articles appear in the featured section',
    path: '/admin/website/blog/featured', icon: Newspaper,
    status: 'Published', color: 'bg-amber-50 text-amber-600',
  },
  {
    id: 'cta', name: 'CTA Section', type: 'Call to Action',
    description: 'Full-width call-to-action banner — reuses global CTA config',
    path: '/admin/website/blog/cta', icon: Megaphone,
    status: 'Published', color: 'bg-rose-50 text-rose-600',
  },
  {
    id: 'seo', name: 'SEO', type: 'SEO Settings',
    description: 'Page title, meta description, keywords, canonical URL and OG image',
    path: '/admin/website/blog/seo', icon: Search,
    status: 'Published', color: 'bg-slate-50 text-slate-600',
  },
];

const MGMT_LINKS = [
  { label: 'Articles', icon: BookOpen, path: '/admin/blog', desc: 'All blog articles' },
  { label: 'Categories', icon: FolderTree, path: '/admin/categories', desc: 'Blog categories' },
  { label: 'Tags', icon: Tag, path: '/admin/tags', desc: 'Blog tags' },
];

export default function BlogPageCms() {
  const navigate = useNavigate();
  const sections = SECTIONS;

  const { data: articles = [] } = useBlogArticles();
  const { data: categories = [] } = useBlogCategories();
  const { data: tags = [] } = useBlogTags();

  const publishedCount = articles.filter((a) => a.status === 'published').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog Page CMS"
        description="Configure page-level sections. Blog articles are managed separately."
        searchPlaceholder="" onSearch={null} onAdd={null} filters={null} onFilter={null}
        activeFilter={null} onSort={null} onExport={null} onImport={null}
        actions={
          <button
            onClick={() => navigate('/admin/blog')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/8 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Manage Articles
          </button>
        }
      />

      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <span className="shrink-0 mt-0.5">ℹ</span>
        <span>
          This page configures the <strong>Blog landing page layout</strong>.
          Articles, categories, and tags are managed in the{' '}
          <button onClick={() => navigate('/admin/blog')} className="font-semibold underline underline-offset-2">
            Blog Management
          </button>{' '}
          modules.
        </span>
      </div>

      {/* ── Page Sections ── */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-foreground">Page Sections</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure each layout section of the Blog page
          </p>
        </div>
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            <span>{sections.length} sections</span>
          </div>
          <div className="space-y-2">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.id}
                  className="group flex items-center gap-3 p-3 bg-white border rounded-xl transition-all border-border hover:border-primary/30 hover:shadow-soft"
                >
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                    {index + 1}
                  </div>
                  <div className={cn('w-16 h-12 rounded-lg flex items-center justify-center shrink-0', section.color)}>
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
      </section>

      {/* ── Blog Management shortcuts ── */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-foreground">Blog Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {publishedCount} published · {articles.length} total articles ·{' '}
            {categories.length} categories · {tags.length} tags
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {MGMT_LINKS.map(({ label, icon: Icon, path, desc }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-2 p-4 bg-white border border-border rounded-xl hover:border-primary/30 hover:shadow-soft transition-all text-center group"
            >
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

        <div className="bg-white border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Manage All Articles</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {publishedCount} published · {articles.length - publishedCount} draft
                {categories.length > 0 && ` · ${categories.length} categories`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/admin/blog')}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft"
            >
              <Plus className="w-4 h-4" /> New Article
            </button>
            <button
              onClick={() => navigate('/admin/blog')}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> View All
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
