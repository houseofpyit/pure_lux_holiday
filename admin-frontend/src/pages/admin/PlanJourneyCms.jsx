import React, { useState } from 'react';
import { Route, Save, Eye, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import PreviewFrame from '@/components/admin/PreviewFrame';
import { DrawerField, DrawerInput, DrawerSelect } from '@/components/admin/Drawer';

const cn = (...c) => c.filter(Boolean).join(' ');

export default function PlanJourneyCms() {
  const [steps, setSteps] = useState([
    { id: 1, title: 'Destination', description: 'Where would you like to go?', icon: 'MapPin' },
    { id: 2, title: 'Travel Dates', description: 'When are you planning to travel?', icon: 'Calendar' },
    { id: 3, title: 'Travelers', description: 'How many people?', icon: 'Users' },
    { id: 4, title: 'Budget', description: 'What is your budget range?', icon: 'DollarSign' },
    { id: 5, title: 'Preferences', description: 'Any special preferences?', icon: 'Sparkles' },
  ]);

  return (
    <div>
      <PageHeader
        title="Plan My Journey CMS"
        description="Manage the journey planning form and workflow"
        actions={
          <button className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Hero */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-1">Hero Section</h3>
            <p className="text-sm text-muted-foreground mb-5">Top banner of the Plan My Journey page</p>
            <div className="space-y-4">
              <DrawerField label="Heading" required><DrawerInput defaultValue="Plan Your Dream Journey" /></DrawerField>
              <DrawerField label="Subheading"><DrawerInput textarea defaultValue="Tell us about your dream trip, and our travel designers will craft a bespoke itinerary just for you." /></DrawerField>
              <DrawerField label="Background Image">
                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/40 transition-colors cursor-pointer">
                  <ImageIcon className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Upload background image</p>
                </div>
              </DrawerField>
            </div>
          </div>

          {/* Form Steps */}
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">Form Steps</h3>
                <p className="text-sm text-muted-foreground">Configure the multi-step form workflow</p>
              </div>
              <button onClick={() => setSteps([...steps, { id: steps.length + 1, title: '', description: '', icon: 'MapPin' }])} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/8 rounded-lg hover:bg-primary/10 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Step
              </button>
            </div>
            <div className="space-y-2">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{i + 1}</div>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input value={s.title} onChange={e => { const u = [...steps]; u[i] = { ...s, title: e.target.value }; setSteps(u); }} placeholder="Step title" className="px-2 py-1.5 text-sm bg-white border border-border rounded outline-none focus:border-primary" />
                    <input value={s.description} onChange={e => { const u = [...steps]; u[i] = { ...s, description: e.target.value }; setSteps(u); }} placeholder="Step description" className="px-2 py-1.5 text-sm bg-white border border-border rounded outline-none focus:border-primary" />
                  </div>
                  <button onClick={() => setSteps(steps.filter(x => x.id !== s.id))} className="p-1.5 rounded hover:bg-destructive/5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-1">Success Message</h3>
            <p className="text-sm text-muted-foreground mb-5">Shown after form submission</p>
            <div className="space-y-4">
              <DrawerField label="Title"><DrawerInput defaultValue="Thank You!" /></DrawerField>
              <DrawerField label="Message"><DrawerInput textarea defaultValue="Your journey request has been received. Our travel designers will contact you within 24 hours." /></DrawerField>
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
              <div className="h-full overflow-y-auto">
                <div className="h-32 bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-center p-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">Plan Your Dream Journey</h2>
                    <p className="text-xs text-blue-100 mt-1">Tell us about your dream trip...</p>
                  </div>
                </div>
                <div className="p-4">
                  {/* Progress Steps */}
                  <div className="flex items-center justify-between mb-4">
                    {steps.map((s, i) => (
                      <div key={s.id} className="flex items-center">
                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold", i === 0 ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>{i + 1}</div>
                        {i < steps.length - 1 && <div className="w-6 h-0.5 bg-border" />}
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-2">{steps[0]?.title}</p>
                    <p className="text-xs text-muted-foreground mb-3">{steps[0]?.description}</p>
                    <select className="w-full px-2 py-1.5 text-xs border border-border rounded outline-none bg-white">
                      <option>Select destination...</option>
                      <option>Maldives</option><option>Santorini</option><option>Bali</option>
                    </select>
                    <button className="w-full mt-2 py-1.5 text-xs font-medium text-white bg-primary rounded">Next Step</button>
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