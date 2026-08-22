import React from 'react';
import { Construction, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Placeholder({ title }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
        <Construction className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-foreground tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">
        This module is part of the Pure Luxe Holidays CMS design system. The full list view, data table, and right-drawer form will follow the same consistent pattern as the other modules.
      </p>
      <div className="flex items-center gap-3 mt-6">
        <button onClick={() => navigate('/admin')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors">
          Back to Dashboard
        </button>
        <button onClick={() => navigate('/admin/packages')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft">
          View Example Module <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}