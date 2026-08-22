import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';

const cn = (...c) => c.filter(Boolean).join(' ');

const deviceConfig = {
  desktop: { width: '100%', maxWidth: '900px', icon: Monitor, label: 'Desktop', aspect: '16/9' },
  tablet: { width: '768px', maxWidth: '768px', icon: Tablet, label: 'Tablet', aspect: '4/3' },
  mobile: { width: '375px', maxWidth: '375px', icon: Smartphone, label: 'Mobile', aspect: '9/16' },
};

export default function PreviewFrame({ children, defaultDevice = 'desktop', showDeviceToggle = true, className }) {
  const [device, setDevice] = useState(defaultDevice);
  const config = deviceConfig[device];

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {showDeviceToggle && (
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg mb-4">
          {Object.entries(deviceConfig).map(([key, val]) => {
            const Icon = val.icon;
            return (
              <button
                key={key}
                onClick={() => setDevice(key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  device === key ? "bg-white shadow-soft text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {val.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Preview Frame */}
      <div
        className="bg-white border border-border rounded-xl overflow-hidden shadow-card transition-all duration-300"
        style={{ width: config.width, maxWidth: config.maxWidth }}
      >
        {/* Browser Chrome */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-2">
            <div className="px-2 py-1 text-[10px] text-muted-foreground bg-white rounded border border-border truncate">
              https://pureluxeholidays.com
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ aspectRatio: config.aspect }} className="overflow-y-auto scrollbar-thin bg-gray-50">
          {children}
        </div>
      </div>
    </div>
  );
}