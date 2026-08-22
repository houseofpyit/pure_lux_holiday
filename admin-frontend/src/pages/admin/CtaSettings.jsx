import React, { useState } from 'react';
import { Megaphone, Eye, Save, Image as ImageIcon } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import PreviewFrame from '@/components/admin/PreviewFrame';
import { DrawerField, DrawerInput } from '@/components/admin/Drawer';

const cn = (...c) => c.filter(Boolean).join(' ');

export default function CtaSettings() {
  const [device, setDevice] = useState('desktop');

  return (
    <div>
      <PageHeader
        title="CTA Settings"
        description="Manage call-to-action sections across the website"
        actions={
          <button className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          {/* Main CTA */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-1">Primary CTA Section</h3>
            <p className="text-sm text-muted-foreground mb-5">Main call-to-action displayed on homepage</p>
            <div className="space-y-4">
              <DrawerField label="Heading" required><DrawerInput defaultValue="Ready for Your Dream Journey?" /></DrawerField>
              <DrawerField label="Subheading"><DrawerInput textarea defaultValue="Let our travel designers craft the perfect luxury experience tailored just for you." /></DrawerField>
              <div className="grid grid-cols-2 gap-4">
                <DrawerField label="Button Text"><DrawerInput defaultValue="Plan My Journey" /></DrawerField>
                <DrawerField label="Button Link"><DrawerInput defaultValue="/plan-journey" /></DrawerField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DrawerField label="Secondary Button"><DrawerInput defaultValue="Browse Packages" /></DrawerField>
                <DrawerField label="Secondary Link"><DrawerInput defaultValue="/packages" /></DrawerField>
              </div>
              <DrawerField label="Background Image">
                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/40 transition-colors cursor-pointer">
                  <ImageIcon className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Upload or enter URL</p>
                </div>
              </DrawerField>
            </div>
          </div>

          {/* Concierge CTA */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-1">Concierge CTA</h3>
            <p className="text-sm text-muted-foreground mb-5">24/7 concierge support call-to-action</p>
            <div className="space-y-4">
              <DrawerField label="Heading"><DrawerInput defaultValue="Need Help Planning?" /></DrawerField>
              <DrawerField label="Description"><DrawerInput textarea defaultValue="Our concierge team is available 24/7 to help you plan your perfect getaway." /></DrawerField>
              <div className="grid grid-cols-2 gap-4">
                <DrawerField label="Phone Number"><DrawerInput defaultValue="+1 (888) 555-0192" /></DrawerField>
                <DrawerField label="WhatsApp"><DrawerInput defaultValue="+1 (888) 555-0193" /></DrawerField>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Display Settings</h3>
            <div className="space-y-3">
              {['Show on Homepage', 'Show on Blog Pages', 'Show on Package Pages', 'Show on Destination Pages'].map(s => (
                <label key={s} className="flex items-center gap-3 cursor-pointer py-2 border-b border-border last:border-0">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border text-primary" />
                  <span className="text-sm text-foreground">{s}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Live Preview</h3>
            </div>
            <PreviewFrame defaultDevice="desktop">
              <div className="relative h-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-8 text-center">
                <div className="max-w-md">
                  <h2 className="text-2xl font-bold text-white mb-3">Ready for Your Dream Journey?</h2>
                  <p className="text-sm text-blue-100 mb-6">Let our travel designers craft the perfect luxury experience tailored just for you.</p>
                  <div className="flex items-center justify-center gap-3">
                    <button className="px-5 py-2.5 text-sm font-medium text-blue-900 bg-white rounded-lg hover:bg-blue-50 transition-colors">Plan My Journey</button>
                    <button className="px-5 py-2.5 text-sm font-medium text-white border border-white/40 rounded-lg hover:bg-white/10 transition-colors">Browse Packages</button>
                  </div>
                </div>
              </div>
            </PreviewFrame>
          </div>
        </div>
      </div>
    </div>
  );
}