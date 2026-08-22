import React, { useState } from 'react';
import { ScrollText, Search, Filter, Download, User, Monitor, FileText, Image, Mail } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import Pagination from '@/components/admin/Pagination';
import { activityLogs } from '@/lib/adminMockData';

const cn = (...c) => c.filter(Boolean).join(' ');

const typeConfig = {
  auth: { icon: User, color: 'bg-primary/10 text-primary', label: 'Authentication' },
  content: { icon: FileText, color: 'bg-success/10 text-success', label: 'Content' },
  lead: { icon: Mail, color: 'bg-warning/10 text-warning', label: 'Lead' },
  media: { icon: Image, color: 'bg-violet-100 text-violet-600', label: 'Media' },
  system: { icon: Monitor, color: 'bg-muted text-muted-foreground', label: 'System' },
};

const filters = [
  { label: 'All', value: 'all', count: 1248 },
  { label: 'Auth', value: 'auth', count: 342 },
  { label: 'Content', value: 'content', count: 486 },
  { label: 'Leads', value: 'lead', count: 218 },
  { label: 'Media', value: 'media', count: 156 },
];

export default function ActivityLogs() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);

  const filtered = activityLogs.filter(log => {
    const matchSearch = log.user.toLowerCase().includes(search.toLowerCase()) || log.detail.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'all' || log.type === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <PageHeader
        title="Activity Logs"
        description="Track all user activities and system events"
        searchPlaceholder="Search activity logs..."
        onSearch={setSearch}
        filters={filters}
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
        onExport={() => {}}
      />

      {/* Timeline */}
      <div className="bg-white border border-border rounded-xl p-6">
        <div className="space-y-1">
          {filtered.map((log, i) => {
            const config = typeConfig[log.type] || typeConfig.system;
            const Icon = config.icon;
            return (
              <div key={i} className="flex items-start gap-4 py-3 border-b border-border last:border-0 group hover:bg-muted/30 -mx-3 px-3 rounded-lg transition-colors">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", config.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{log.user}</span>
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground">{log.action}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{log.detail}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground/70">
                    <span>{log.time}</span>
                    <span>·</span>
                    <span className="font-mono">IP: {log.ip}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Pagination page={page} totalPages={125} total={1248} perPage={10} onPageChange={setPage} />
    </div>
  );
}