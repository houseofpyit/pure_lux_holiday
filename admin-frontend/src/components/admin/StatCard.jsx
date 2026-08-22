import React from 'react';
import { TrendingUp, TrendingDown, Package, MapPin, Compass, FileText, Quote, Image, Mail, Eye } from 'lucide-react';

const cn = (...c) => c.filter(Boolean).join(' ');

const iconMap = { Package, MapPin, Compass, FileText, Quote, Image, Mail, Eye };

const colorMap = {
  primary: { bg: 'bg-primary/10', text: 'text-primary' },
  success: { bg: 'bg-success/10', text: 'text-success' },
  warning: { bg: 'bg-warning/10', text: 'text-warning' },
  destructive: { bg: 'bg-destructive/10', text: 'text-destructive' },
  'chart-4': { bg: 'bg-violet-100', text: 'text-violet-600' },
  'chart-5': { bg: 'bg-pink-100', text: 'text-pink-600' },
  muted: { bg: 'bg-muted', text: 'text-muted-foreground' },
};

export default function StatCard({ label, value, change, trend, icon, color, delay }) {
  const Icon = iconMap[icon] || Package;
  const colors = colorMap[color] || colorMap.primary;

  return (
    <div
      className="bg-white border border-border rounded-xl p-5 hover:shadow-card transition-shadow duration-300 animate-slide-up"
      style={{ animationDelay: delay || '0ms' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colors.bg)}>
          <Icon className={cn("w-5 h-5", colors.text)} strokeWidth={2} />
        </div>
        {change && (
          <div className={cn("flex items-center gap-0.5 text-xs font-semibold", trend === 'up' ? 'text-success' : 'text-destructive')}>
            {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {change}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}