import React, { useEffect, useState } from 'react';
import { Save, Eye, Image as ImageIcon, History, Loader2, X } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import PreviewFrame from '@/components/admin/PreviewFrame';
import { DrawerField, DrawerInput } from '@/components/admin/Drawer';
import MediaPicker from '@/components/media/MediaPicker';
import { useAboutSection, useUpdateAboutSection } from '@/hooks/use-home';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&h=600&fit=crop';

export default function AboutSectionCms() {
  const { toast } = useToast();
  const { data, isLoading, isError } = useAboutSection();
  const [form, setForm] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const updateMutation = useUpdateAboutSection({
    onSuccess: () => toast({ title: 'Homepage About section saved' }),
    onError: (err) => handleApiError(err, toast),
  });

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = () => {
    if (!form?.heading?.trim()) {
      toast({ title: 'Section heading is required', variant: 'destructive' });
      return;
    }
    updateMutation.mutate(form);
  };

  if (isLoading || !form) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load homepage About section.
      </div>
    );
  }

  const imageUrl = form.image_url || FALLBACK_IMAGE;

  return (
    <div>
      <PageHeader
        title="About Section CMS"
        description="Manage the independent About preview displayed on the homepage"
        actions={
          <>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors">
              <History className="w-4 h-4" /> Versions
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60"
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-1">Section Content</h3>
            <p className="text-sm text-muted-foreground mb-5">Homepage preview content only; this does not edit the About page hero.</p>
            <div className="space-y-4">
              <DrawerField label="Eyebrow">
                <DrawerInput value={form.eyebrow} onChange={(e) => handleChange('eyebrow', e.target.value)} />
              </DrawerField>
              <DrawerField label="Section Heading" required>
                <DrawerInput value={form.heading} onChange={(e) => handleChange('heading', e.target.value)} />
              </DrawerField>
              <DrawerField label="Description">
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                />
              </DrawerField>
              <div className="grid grid-cols-2 gap-4">
                <DrawerField label="Button Text">
                  <DrawerInput value={form.button_text} onChange={(e) => handleChange('button_text', e.target.value)} />
                </DrawerField>
                <DrawerField label="Button Link">
                  <DrawerInput value={form.button_url} onChange={(e) => handleChange('button_url', e.target.value)} />
                </DrawerField>
              </div>
              <DrawerField label="Image Alt Text">
                <DrawerInput value={form.image_alt} onChange={(e) => handleChange('image_alt', e.target.value)} />
              </DrawerField>
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-1">Section Image</h3>
            <p className="text-sm text-muted-foreground mb-5">Image displayed alongside the homepage preview.</p>
            <DrawerField label="About Image">
              {form.image_url ? (
                <div className="relative overflow-hidden rounded-xl border border-border">
                  <img src={form.image_url} alt="" className="h-48 w-full object-cover" />
                  <div className="absolute right-3 top-3 flex gap-2">
                    <button onClick={() => setPickerOpen(true)} className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium shadow-soft">Change</button>
                    <button onClick={() => setForm((p) => ({ ...p, image_id: null, image_url: null }))} className="rounded-lg bg-white p-1.5 text-muted-foreground shadow-soft">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setPickerOpen(true)} className="w-full border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/40 transition-colors">
                  <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Select image</p>
                  <p className="text-xs text-muted-foreground mt-1">800x600 recommended</p>
                </button>
              )}
            </DrawerField>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Section Settings</h3>
            <label className="flex items-center justify-between py-2">
              <span className="text-sm text-foreground">Section Enabled</span>
              <button onClick={() => handleChange('is_active', !form.is_active)} className={`relative w-10 h-5 rounded-full transition-colors ${form.is_active ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-soft transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </label>
          </div>
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Live Preview</h3>
            </div>
            <PreviewFrame defaultDevice="desktop">
              <div className="h-full overflow-y-auto p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-[4/3] rounded-lg bg-muted overflow-hidden">
                    <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-primary uppercase tracking-wider">{form.eyebrow}</p>
                    <h2 className="text-lg font-bold text-foreground mt-1">{form.heading}</h2>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-4">{form.description}</p>
                    <button className="mt-3 px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg">{form.button_text}</button>
                  </div>
                </div>
              </div>
            </PreviewFrame>
          </div>
        </div>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        folder="home/about-section"
        onSelect={(media) => setForm((p) => ({ ...p, image_id: media.id, image_url: media.full_url }))}
      />
    </div>
  );
}
