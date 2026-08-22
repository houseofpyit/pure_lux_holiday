import React, { useState } from 'react';
import { Save, Upload, Globe, Phone, Mail, BarChart3, Lock, Building2 } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { DrawerField, DrawerInput } from '@/components/admin/Drawer';

const cn = (...c) => c.filter(Boolean).join(' ');

const tabs = [
  { label: 'General', icon: Building2 },
  { label: 'Contact', icon: Phone },
  { label: 'Email', icon: Mail },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Security', icon: Lock },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('General');

  return (
    <div>
      <PageHeader title="Settings" description="Manage your site configuration and preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Nav */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-border rounded-xl p-2 sticky top-20">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", activeTab === tab.label ? "bg-primary/8 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-border rounded-xl p-6">
            {activeTab === 'General' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">General Settings</h3>
                  <p className="text-sm text-muted-foreground">Basic site information and branding</p>
                </div>

                {/* Logo & Favicon */}
                <div className="grid grid-cols-2 gap-4">
                  <DrawerField label="Site Logo">
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/40 transition-colors cursor-pointer">
                      <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs font-medium text-foreground">Upload logo</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">PNG/SVG · Max 2MB</p>
                    </div>
                  </DrawerField>
                  <DrawerField label="Favicon">
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/40 transition-colors cursor-pointer">
                      <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs font-medium text-foreground">Upload favicon</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">32×32 ICO/PNG</p>
                    </div>
                  </DrawerField>
                </div>

                <DrawerField label="Brand Name" required>
                  <DrawerInput defaultValue="Pure Luxe Holidays" />
                </DrawerField>
                <DrawerField label="Tagline">
                  <DrawerInput defaultValue="Curated Luxury Travel Experiences" />
                </DrawerField>
                <div className="grid grid-cols-2 gap-4">
                  <DrawerField label="Timezone">
                    <select className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                      <option>UTC</option><option>EST (UTC-5)</option><option>PST (UTC-8)</option><option>GMT (UTC+0)</option><option>IST (UTC+5:30)</option>
                    </select>
                  </DrawerField>
                  <DrawerField label="Date Format">
                    <select className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                      <option>MMM DD, YYYY</option><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option>
                    </select>
                  </DrawerField>
                </div>
                <DrawerField label="Language">
                  <select className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                    <option>English</option><option>French</option><option>Spanish</option><option>German</option><option>Arabic</option>
                  </select>
                </DrawerField>
              </div>
            )}

            {activeTab === 'Contact' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Contact Details</h3>
                  <p className="text-sm text-muted-foreground">Office address and contact information</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <DrawerField label="Email Address" required>
                    <DrawerInput type="email" defaultValue="hello@pureluxeholidays.com" />
                  </DrawerField>
                  <DrawerField label="Phone Number" required>
                    <DrawerInput defaultValue="+1 (888) 555-0192" />
                  </DrawerField>
                </div>
                <DrawerField label="Office Address" required>
                  <DrawerInput textarea defaultValue="120 Luxury Avenue, Suite 2500&#10;Beverly Hills, CA 90210&#10;United States" />
                </DrawerField>
                <div className="grid grid-cols-2 gap-4">
                  <DrawerField label="Business Hours">
                    <DrawerInput defaultValue="Mon - Fri: 9:00 AM - 6:00 PM" />
                  </DrawerField>
                  <DrawerField label="Emergency Contact">
                    <DrawerInput defaultValue="+1 (888) 555-0193" />
                  </DrawerField>
                </div>
                <DrawerField label="Google Maps Embed URL">
                  <DrawerInput placeholder="https://maps.google.com/..." />
                </DrawerField>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Social Media</label>
                  <div className="space-y-3">
                    {['Facebook', 'Instagram', 'Twitter', 'YouTube', 'LinkedIn'].map(social => (
                      <div key={social} className="flex items-center gap-3">
                        <span className="w-24 text-sm text-muted-foreground shrink-0">{social}</span>
                        <input type="text" placeholder={`https://${social.toLowerCase()}.com/pureluxeholidays`} className="flex-1 px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Email' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Email Configuration</h3>
                  <p className="text-sm text-muted-foreground">SMTP settings for outgoing emails</p>
                </div>
                <DrawerField label="SMTP Host" required>
                  <DrawerInput defaultValue="smtp.pureluxeholidays.com" />
                </DrawerField>
                <div className="grid grid-cols-2 gap-4">
                  <DrawerField label="SMTP Port" required>
                    <DrawerInput type="number" defaultValue="587" />
                  </DrawerField>
                  <DrawerField label="Encryption">
                    <select className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                      <option>TLS</option><option>SSL</option><option>None</option>
                    </select>
                  </DrawerField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <DrawerField label="Username" required>
                    <DrawerInput defaultValue="noreply@pureluxeholidays.com" />
                  </DrawerField>
                  <DrawerField label="Password" required>
                    <DrawerInput type="password" defaultValue="••••••••••" />
                  </DrawerField>
                </div>
                <DrawerField label="From Name">
                  <DrawerInput defaultValue="Pure Luxe Holidays" />
                </DrawerField>
                <DrawerField label="From Email">
                  <DrawerInput type="email" defaultValue="noreply@pureluxeholidays.com" />
                </DrawerField>
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <button className="px-4 py-2 text-sm font-medium text-primary bg-white border border-border rounded-lg hover:bg-muted transition-colors">Send Test Email</button>
                  <span className="text-xs text-muted-foreground">Test email will be sent to your registered address</span>
                </div>
              </div>
            )}

            {activeTab === 'Analytics' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Analytics & Tracking</h3>
                  <p className="text-sm text-muted-foreground">Configure tracking IDs and analytics tools</p>
                </div>
                <DrawerField label="Google Analytics 4 Measurement ID">
                  <DrawerInput defaultValue="G-XXXXXXXXXX" />
                </DrawerField>
                <DrawerField label="Google Tag Manager Container ID">
                  <DrawerInput defaultValue="GTM-XXXXXXX" />
                </DrawerField>
                <DrawerField label="Google Search Console Verification">
                  <DrawerInput defaultValue="google-site-verification=xxxxx" />
                </DrawerField>
                <DrawerField label="Facebook Pixel ID">
                  <DrawerInput placeholder="XXXXXXXXXXXXXXX" />
                </DrawerField>
                <DrawerField label="Hotjar Tracking ID">
                  <DrawerInput placeholder="XXXXXXX" />
                </DrawerField>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Tracking Status</p>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-sm text-success"><Globe className="w-3.5 h-3.5" /> GA4 Connected</span>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Globe className="w-3.5 h-3.5" /> GTM Not Connected</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Security Settings</h3>
                  <p className="text-sm text-muted-foreground">Authentication and access control</p>
                </div>
                {[
                  { label: 'Two-Factor Authentication', desc: 'Require 2FA for all admin users', enabled: true },
                  { label: 'Force Password Reset', desc: 'Require password reset every 90 days', enabled: true },
                  { label: 'IP Whitelist', desc: 'Restrict admin access to specific IPs', enabled: false },
                  { label: 'Session Timeout', desc: 'Auto logout after 30 minutes of inactivity', enabled: true },
                  { label: 'Login Attempt Limit', desc: 'Lock account after 5 failed attempts', enabled: true },
                  { label: 'Audit Log Retention', desc: 'Keep activity logs for 12 months', enabled: true },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                    </div>
                    <button className={cn("relative w-10 h-5 rounded-full transition-colors shrink-0", s.enabled ? "bg-primary" : "bg-muted")}>
                      <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-soft transition-transform", s.enabled ? "translate-x-5" : "translate-x-0.5")} />
                    </button>
                  </div>
                ))}
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <p className="text-sm font-medium text-destructive">Danger Zone</p>
                  <p className="text-xs text-muted-foreground mt-1">Once you delete your account, there is no going back. Please be certain.</p>
                  <button className="mt-3 px-3 py-1.5 text-sm font-medium text-destructive bg-white border border-destructive/30 rounded-lg hover:bg-destructive/5 transition-colors">Delete Account</button>
                </div>
              </div>
            )}

            {/* Save Bar */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-border">
              <button className="px-4 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}