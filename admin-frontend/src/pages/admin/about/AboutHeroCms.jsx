/**
 * AboutHeroCms — About Page › Hero Section
 *
 * Manages: hero_title, hero_subtitle, hero_image_id
 * Backend: PUT /api/v1/about  (AboutPage singleton)
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save, Loader2, AlertCircle, ChevronLeft,
  Image as ImageIcon, Upload, X,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { DrawerField, DrawerInput } from '@/components/admin/Drawer';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import { useUploadMedia } from '@/hooks/use-media';
import { useAboutPage, useUpdateAboutPage } from '@/hooks/use-about';

const cn = (...c) => c.filter(Boolean).join(' ');
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_MB = 10;

function ImageUploadZone({ value, folder, onChange, onClear, uploading }) {
  const inputRef = useRef(null);
  const { toast } = useToast();
  const uploadMutation = useUploadMedia({
    onSuccess: (media) => onChange(media),
    onError: (err) => handleApiError(err, toast),
  });
  const active = uploading || uploadMutation.isPending;

  const handleFile = (file) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) { toast({ title: 'Invalid file type', variant: 'destructive' }); return; }
    if (file.size > MAX_MB * 1024 * 1024) { toast({ title: `Max ${MAX_MB}MB`, variant: 'destructive' }); return; }
    uploadMutation.mutate({ file, folder });
  };

  return (
    <div className="space-y-2">
      <div
        onClick={() => !active && inputRef.current?.click()}
        className={cn(
          'relative aspect-video rounded-xl overflow-hidden border-2 border-dashed border-border hover:border-primary/40 transition-colors cursor-pointer',
          active && 'opacity-60 cursor-not-allowed',
        )}
      >
        {value ? (
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">Click to upload hero image</p>
            <p className="text-xs text-muted-foreground/70 mt-1">JPG, PNG, WebP · Max {MAX_MB}MB</p>
          </div>
        )}
        {active && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
        {value && onClear && !active && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => !active && inputRef.current?.click()}
        disabled={active}
        className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-medium text-primary bg-primary/8 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-60"
      >
        <Upload className="w-3.5 h-3.5" /> {value ? 'Replace Image' : 'Upload Image'}
      </button>
      <input
        ref={inputRef} type="file" accept={ACCEPTED.join(',')} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; handleFile(f); }}
      />
    </div>
  );
}

export default function AboutHeroCms() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: pageData, isLoading, isError } = useAboutPage();
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (pageData && !form) {
      setForm({
        hero_title: pageData.hero_title ?? '',
        hero_subtitle: pageData.hero_subtitle ?? '',
        hero_image_id: pageData.hero_image_id ?? null,
        hero_image_url: pageData.hero_image_url ?? null,
      });
    }
  }, [pageData]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateMutation = useUpdateAboutPage({
    onSuccess: () => toast({ title: 'Hero section saved' }),
    onError: (err) => handleApiError(err, toast),
  });

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = () => {
    if (!form?.hero_title?.trim()) {
      toast({ title: 'Hero title is required', variant: 'destructive' });
      return;
    }
    updateMutation.mutate(form);
  };

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm">Failed to load about page data</p>
      </div>
    );
  }

  const isSaving = updateMutation.isPending;

  return (
    <div>
      {/* Breadcrumb back link */}
      <button
        onClick={() => navigate('/admin/website/about')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> About Page Sections
      </button>

      <PageHeader
        title="Hero Section"
        description="Top banner of the About page — heading, subtitle and background image"
        searchPlaceholder=""
        onSearch={null}
        onAdd={null}
        filters={null}
        onFilter={null}
        activeFilter={null}
        onSort={null}
        onExport={null}
        onImport={null}
        actions={
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — fields */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-5">
          <DrawerField label="Heading" hint="Main hero heading displayed on the About page" required>
            <DrawerInput
              value={form.hero_title}
              onChange={(e) => handleChange('hero_title', e.target.value)}
              placeholder="e.g. Crafting Unforgettable Luxury Journeys"
              maxLength={255}
            />
          </DrawerField>
          <DrawerField label="Subheading" hint="Short tagline below the main heading">
            <DrawerInput
              textarea
              value={form.hero_subtitle}
              onChange={(e) => handleChange('hero_subtitle', e.target.value)}
              placeholder="A short compelling tagline…"
            />
          </DrawerField>
        </div>

        {/* Right — image */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Hero Background Image</h3>
          <p className="text-xs text-muted-foreground mb-4">Recommended: 1920×1080px · JPG or WebP · Max {MAX_MB}MB</p>
          <ImageUploadZone
            folder="about/hero"
            value={form.hero_image_url}
            onChange={(media) => handleChange('hero_image_id', media.id) || setForm((f) => ({ ...f, hero_image_id: media.id, hero_image_url: media.full_url }))}
            onClear={() => setForm((f) => ({ ...f, hero_image_id: null, hero_image_url: null }))}
          />
        </div>
      </div>
    </div>
  );
}
