/**
 * AboutSeoCms — About Page › SEO Settings
 *
 * Manages: seo_title, seo_description, og_image_id (Open Graph)
 * Backend: PUT /api/v1/about  (AboutPage singleton)
 *
 * Fields are saved directly on the AboutPage singleton.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2, AlertCircle, ChevronLeft } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { DrawerField, DrawerInput } from '@/components/admin/Drawer';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import { useAboutPage, useUpdateAboutPage } from '@/hooks/use-about';

const TITLE_MAX = 60;
const DESC_MAX = 160;

export default function AboutSeoCms() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: pageData, isLoading, isError } = useAboutPage();
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (pageData && !form) {
      setForm({
        seo_title: pageData.seo_title ?? '',
        seo_description: pageData.seo_description ?? '',
        og_image_id: pageData.og_image_id ?? null,
      });
    }
  }, [pageData]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateMutation = useUpdateAboutPage({
    onSuccess: () => toast({ title: 'SEO settings saved' }),
    onError: (err) => handleApiError(err, toast),
  });

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const handleSave = () => updateMutation.mutate(form);

  if (isLoading || !form) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive">
      <AlertCircle className="w-8 h-8" />
      <p className="text-sm">Failed to load about page data</p>
    </div>
  );

  const isSaving = updateMutation.isPending;
  const titleLen = (form.seo_title ?? '').length;
  const descLen = (form.seo_description ?? '').length;

  return (
    <div>
      <button onClick={() => navigate('/admin/website/about')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ChevronLeft className="w-4 h-4" /> About Page Sections
      </button>

      <PageHeader
        title="SEO Settings"
        description="Page title and meta description for the About page"
        searchPlaceholder="" onSearch={null} onAdd={null} filters={null} onFilter={null}
        activeFilter={null} onSort={null} onExport={null} onImport={null}
        actions={
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        }
      />

      <div className="bg-white border border-border rounded-xl p-6 space-y-5 max-w-2xl">
        <DrawerField
          label="SEO Title"
          hint={`${titleLen}/${TITLE_MAX} characters · Recommended: 50–60`}
        >
          <DrawerInput
            value={form.seo_title}
            onChange={(e) => handleChange('seo_title', e.target.value)}
            placeholder="e.g. About Us — Pure Luxe Holidays"
            maxLength={TITLE_MAX}
          />
        </DrawerField>

        <DrawerField
          label="Meta Description"
          hint={`${descLen}/${DESC_MAX} characters · Recommended: 120–160`}
        >
          <DrawerInput
            textarea
            value={form.seo_description}
            onChange={(e) => handleChange('seo_description', e.target.value)}
            placeholder="A compelling description of the About page for search results…"
            maxLength={DESC_MAX}
          />
        </DrawerField>

        {/* SERP preview */}
        <div className="rounded-xl border border-border p-4 bg-muted/20">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Search Result Preview</p>
          <p className="text-base font-medium text-blue-700 truncate">{form.seo_title || 'About Us — Pure Luxe Holidays'}</p>
          <p className="text-xs text-green-700 mt-0.5">yourdomain.com/about</p>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{form.seo_description || 'Add a meta description to see a preview here.'}</p>
        </div>
      </div>
    </div>
  );
}
