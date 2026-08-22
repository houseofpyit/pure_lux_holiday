/**
 * ContactCms — Contact Page CMS.
 *
 * Architecture:
 *   Component → React Query (useContactSettings / useContactPageCms)
 *             → contact.api.js → Axios → Backend
 *
 * Two separate API calls:
 *   GET/PUT /api/v1/contact        → ContactSettings  (phone, email, address, hours)
 *   GET/PUT /api/v1/contact-page   → ContactPageCMS   (hero heading/label/desc/image, display toggles)
 *
 * UI is kept exactly as designed — only mock defaults replaced with backend data.
 *
 * Field mapping:
 *   ContactSettings:
 *     phone            → Phone Number
 *     email            → Email Address
 *     address          → Office Address
 *     working_hours    → Business Hours
 *     emergency_number → Emergency Contact
 *     google_map_url   → Map Embed URL
 *
 *   ContactPageCMS:
 *     hero_label              → Hero "label" (eyebrow)
 *     hero_heading            → Hero Heading
 *     hero_description        → Hero Subheading
 *     hero_background_image_id → Background Image
 *     hero_overlay_opacity    → not exposed in UI yet
 *     hero_is_published       → not exposed in UI yet
 *     show_office_locations   → display toggle
 *     show_business_hours     → display toggle
 *     show_google_map         → display toggle
 *     show_contact_form       → display toggle
 *     show_social_links       → display toggle
 *     enable_whatsapp_button  → display toggle
 *     enable_call_button      → display toggle
 *     enable_email_button     → display toggle
 */
import { useEffect, useRef, useState } from 'react';
import {
  Phone, Save, Eye, MapPin, Mail, Clock,
  Image as ImageIcon, Loader2, AlertCircle, Upload, X,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import PreviewFrame from '@/components/admin/PreviewFrame';
import { DrawerField, DrawerInput } from '@/components/admin/Drawer';
import MediaUploader from '@/components/media/MediaUploader';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import {
  useContactSettings, useUpdateContactSettings,
  useContactPageCms, useUpdateContactPageCms,
} from '@/hooks/use-contact';

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function SectionSkeleton() {
  return (
    <div className="bg-white border border-border rounded-xl p-6 space-y-4 animate-pulse">
      <div className="h-4 w-32 bg-muted rounded" />
      <div className="h-3 w-48 bg-muted rounded" />
      <div className="space-y-3 mt-5">
        <div className="h-9 bg-muted rounded-lg" />
        <div className="h-9 bg-muted rounded-lg" />
        <div className="h-20 bg-muted rounded-lg" />
      </div>
    </div>
  );
}

export default function ContactCms() {
  const { toast } = useToast();

  // ── Data fetching ────────────────────────────────────────────────────────────
  const { data: settingsData, isLoading: settingsLoading, isError: settingsError } = useContactSettings();
  const { data: pageData, isLoading: pageLoading, isError: pageError } = useContactPageCms();

  // ── Local form state ─────────────────────────────────────────────────────────
  const [settings, setSettings] = useState(null);
  const [page, setPage] = useState(null);
  // Track whether we've initialized form state from the API response already
  const settingsInitialized = useRef(false);
  const pageInitialized = useRef(false);

  useEffect(() => {
    if (settingsData && !settingsInitialized.current) {
      settingsInitialized.current = true;
      setSettings(settingsData);
    }
  }, [settingsData]);

  useEffect(() => {
    if (pageData && !pageInitialized.current) {
      pageInitialized.current = true;
      setPage(pageData);
    }
  }, [pageData]);

  // ── Mutations ────────────────────────────────────────────────────────────────
  const updatePageMutation = useUpdateContactPageCms({
    onSuccess: () => toast({ title: 'Contact page saved' }),
    onError: (err) => handleApiError(err, toast),
  });
  const updateSettingsMutation = useUpdateContactSettings({
    onSuccess: () => {
      // Chain: after settings save succeeds, save page settings
      if (!settings || !page) return;
      updatePageMutation.mutate({
        hero_label: page.hero_label || null,
        hero_heading: page.hero_heading || null,
        hero_description: page.hero_description || null,
        hero_background_image_id: page.hero_background_image_id || null,
        // Pass the enriched URL so the hook can preserve it in the cache
        hero_background_image_url: page.hero_background_image_url || null,
        show_office_locations: page.show_office_locations,
        show_business_hours: page.show_business_hours,
        show_google_map: page.show_google_map,
        show_contact_form: page.show_contact_form,
        show_social_links: page.show_social_links,
        enable_whatsapp_button: page.enable_whatsapp_button,
        enable_call_button: page.enable_call_button,
        enable_email_button: page.enable_email_button,
      });
    },
    onError: (err) => handleApiError(err, toast),
  });

  const isSaving = updateSettingsMutation.isPending || updatePageMutation.isPending;

  const handleSave = () => {
    if (!settings || !page) return;
    // Fire settings mutation first; page mutation is chained in its onSuccess
    updateSettingsMutation.mutate({
      phone: settings.phone || null,
      email: settings.email || null,
      address: settings.address || null,
      working_hours: settings.working_hours || null,
      emergency_number: settings.emergency_number || null,
      whatsapp: settings.whatsapp || null,
      google_map_url: settings.google_map_url || null,
    });
  };

  const setS = (field, value) => setSettings((s) => ({ ...s, [field]: value }));
  const setP = (field, value) => setPage((p) => ({ ...p, [field]: value }));

  const isLoading = settingsLoading || pageLoading;
  const isError = settingsError || pageError;

  // ── Error state ───────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm">Failed to load contact data. Please refresh.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Contact Page CMS"
        description="Manage content for the Contact page"
        searchPlaceholder=""
        onSearch={null} onAdd={null} filters={null} onFilter={null}
        activeFilter={null} onSort={null} onExport={null} onImport={null}
        actions={
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading || !settings || !page}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">

          {/* ── Hero Section ── */}
          {isLoading || !page ? <SectionSkeleton /> : (
            <div className="bg-white border border-border rounded-xl p-6">
              <h3 className="text-base font-semibold text-foreground mb-1">Hero Section</h3>
              <p className="text-sm text-muted-foreground mb-5">Top banner of the Contact page</p>
              <div className="space-y-4">
                <DrawerField label="Label" hint='Small eyebrow text (e.g. "Get in Touch")' required={false}>
                  <DrawerInput
                    value={page.hero_label ?? ''}
                    onChange={(e) => setP('hero_label', e.target.value)}
                    placeholder="Get in Touch"
                    maxLength={100}
                    defaultValue="" textarea={false} disabled={false}
                  />
                </DrawerField>
                <DrawerField label="Heading" hint="" required={false}>
                  <DrawerInput
                    value={page.hero_heading ?? ''}
                    onChange={(e) => setP('hero_heading', e.target.value)}
                    placeholder="Contact Us"
                    maxLength={255}
                    defaultValue="" textarea={false} disabled={false}
                  />
                </DrawerField>
                <DrawerField label="Subheading" hint="" required={false}>
                  <DrawerInput
                    textarea
                    value={page.hero_description ?? ''}
                    onChange={(e) => setP('hero_description', e.target.value)}
                    placeholder="Have questions? Our team is here to help you plan your perfect luxury getaway."
                    defaultValue="" maxLength={500} disabled={false}
                  />
                </DrawerField>
                <DrawerField label="Background Image" hint="Recommended: 1920×800px · Max 10MB" required={false}>
                  <MediaUploader
                    module="contact"
                    section="hero"
                    accept="image/*"
                    maxSizeMB={10}
                    value={page.hero_background_image_url ?? null}
                    mediaId={page.hero_background_image_id ?? null}
                    media={null}
                    onChange={(media) => setPage((p) => ({
                      ...p,
                      hero_background_image_id: media.id,
                      hero_background_image_url: media.full_url,
                    }))}
                    onClear={() => setPage((p) => ({
                      ...p,
                      hero_background_image_id: null,
                      hero_background_image_url: null,
                    }))}
                    label="Upload background image"
                    hint="Wide landscape photo works best"
                  />
                </DrawerField>
              </div>
            </div>
          )}

          {/* ── Contact Information ── */}
          {isLoading || !settings ? <SectionSkeleton /> : (
            <div className="bg-white border border-border rounded-xl p-6">
              <h3 className="text-base font-semibold text-foreground mb-1">Contact Information</h3>
              <p className="text-sm text-muted-foreground mb-5">Display contact details on the page</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <DrawerField label="Phone Number" hint="" required={false}>
                    <DrawerInput
                      value={settings.phone ?? ''}
                      onChange={(e) => setS('phone', e.target.value)}
                      placeholder="+1 (888) 555-0192"
                      maxLength={50} defaultValue="" textarea={false} disabled={false}
                    />
                  </DrawerField>
                  <DrawerField label="Email Address" hint="" required={false}>
                    <DrawerInput
                      value={settings.email ?? ''}
                      onChange={(e) => setS('email', e.target.value)}
                      placeholder="hello@pureluxeholidays.com"
                      maxLength={255} defaultValue="" textarea={false} disabled={false}
                    />
                  </DrawerField>
                </div>
                <DrawerField label="Office Address" hint="" required={false}>
                  <DrawerInput
                    textarea
                    value={settings.address ?? ''}
                    onChange={(e) => setS('address', e.target.value)}
                    placeholder="120 Luxury Avenue, Suite 2500&#10;Beverly Hills, CA 90210"
                    defaultValue="" maxLength={500} disabled={false}
                  />
                </DrawerField>
                <div className="grid grid-cols-2 gap-4">
                  <DrawerField label="Business Hours" hint="" required={false}>
                    <DrawerInput
                      value={settings.working_hours ?? ''}
                      onChange={(e) => setS('working_hours', e.target.value)}
                      placeholder="Mon - Fri: 9:00 AM - 6:00 PM"
                      maxLength={500} defaultValue="" textarea={false} disabled={false}
                    />
                  </DrawerField>
                  <DrawerField label="Emergency Contact" hint="" required={false}>
                    <DrawerInput
                      value={settings.emergency_number ?? ''}
                      onChange={(e) => setS('emergency_number', e.target.value)}
                      placeholder="+1 (888) 555-0193"
                      maxLength={50} defaultValue="" textarea={false} disabled={false}
                    />
                  </DrawerField>
                </div>
                <DrawerField label="WhatsApp Number" hint="" required={false}>
                  <DrawerInput
                    value={settings.whatsapp ?? ''}
                    onChange={(e) => setS('whatsapp', e.target.value)}
                    placeholder="+1 (888) 555-0192"
                    maxLength={50} defaultValue="" textarea={false} disabled={false}
                  />
                </DrawerField>
              </div>
            </div>
          )}

          {/* ── Display Settings (page toggles) ── */}
          {isLoading || !page ? <SectionSkeleton /> : (
            <div className="bg-white border border-border rounded-xl p-6">
              <h3 className="text-base font-semibold text-foreground mb-1">Display Settings</h3>
              <p className="text-sm text-muted-foreground mb-5">Control which sections appear on the contact page</p>
              <div className="space-y-1">
                {[
                  { key: 'show_office_locations', label: 'Office Locations' },
                  { key: 'show_business_hours', label: 'Business Hours' },
                  { key: 'show_google_map', label: 'Google Map' },
                  { key: 'show_contact_form', label: 'Contact Form' },
                  { key: 'show_social_links', label: 'Social Links' },
                  { key: 'enable_whatsapp_button', label: 'WhatsApp Button' },
                  { key: 'enable_call_button', label: 'Call Button' },
                  { key: 'enable_email_button', label: 'Email Button' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between py-2.5 border-b border-border last:border-0 cursor-pointer">
                    <span className="text-sm text-foreground">{label}</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!page[key]}
                          onChange={(e) => setP(key, e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-border text-primary accent-primary"
                        />
                        <span className="text-xs text-muted-foreground">Active</span>
                      </label>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ── Map Settings ── */}
          {isLoading || !settings ? <SectionSkeleton /> : (
            <div className="bg-white border border-border rounded-xl p-6">
              <h3 className="text-base font-semibold text-foreground mb-1">Map Settings</h3>
              <p className="text-sm text-muted-foreground mb-5">Google Maps embed configuration</p>
              <div className="space-y-4">
                <DrawerField label="Map Embed URL / Google Maps URL" hint="" required={false}>
                  <DrawerInput
                    value={settings.google_map_url ?? ''}
                    onChange={(e) => setS('google_map_url', e.target.value)}
                    placeholder="https://maps.google.com/..."
                    defaultValue="" textarea={false} maxLength={1024} disabled={false}
                  />
                </DrawerField>
              </div>
            </div>
          )}

        </div>

        {/* ── Live Preview ── */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Live Preview</h3>
            </div>
            <PreviewFrame defaultDevice="desktop">
              <div className="h-full overflow-y-auto">
                {/* Hero preview */}
                <div
                  className="h-32 flex items-center justify-center text-center p-4 relative overflow-hidden"
                  style={{
                    background: page?.hero_background_image_url
                      ? `url(${page.hero_background_image_url}) center/cover no-repeat`
                      : 'linear-gradient(to bottom right, #1e3a5f, #1a4080)',
                  }}
                >
                  <div className="absolute inset-0 bg-blue-950/60" />
                  <div className="relative z-10">
                    {page?.hero_label && (
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-amber-400/80 mb-1">
                        {page.hero_label}
                      </p>
                    )}
                    <h2 className="text-lg font-bold text-white">
                      {page?.hero_heading || 'Contact Us'}
                    </h2>
                    <p className="text-xs text-blue-100 mt-1 max-w-[200px] mx-auto line-clamp-2">
                      {page?.hero_description || 'Have questions? Our team is here to help.'}
                    </p>
                  </div>
                </div>

                {/* Contact info preview */}
                <div className="p-4 space-y-3">
                  {settings?.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                      {settings.phone}
                    </div>
                  )}
                  {settings?.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                      {settings.email}
                    </div>
                  )}
                  {settings?.address && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{settings.address}</span>
                    </div>
                  )}
                  {settings?.working_hours && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                      {settings.working_hours}
                    </div>
                  )}

                  {/* Contact form preview */}
                  {page?.show_contact_form && (
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg space-y-2">
                      <input
                        placeholder="Your Name"
                        readOnly
                        className="w-full px-2 py-1.5 text-xs border border-border rounded outline-none bg-white"
                      />
                      <input
                        placeholder="Your Email"
                        readOnly
                        className="w-full px-2 py-1.5 text-xs border border-border rounded outline-none bg-white"
                      />
                      <textarea
                        placeholder="Message"
                        readOnly
                        rows={3}
                        className="w-full px-2 py-1.5 text-xs border border-border rounded outline-none resize-none bg-white"
                      />
                      <button className="w-full py-1.5 text-xs font-medium text-white bg-primary rounded">
                        Send Message
                      </button>
                    </div>
                  )}

                  {/* No data state */}
                  {!settings?.phone && !settings?.email && !settings?.address && (
                    <p className="text-xs text-muted-foreground text-center py-4 italic">
                      Fill in contact details to see preview
                    </p>
                  )}
                </div>
              </div>
            </PreviewFrame>
          </div>
        </div>

      </div>
    </div>
  );
}
