import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  Plus, FileText, Upload, MapPin, ArrowUpRight, Package,
} from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import StatusBadge from '@/components/admin/StatusBadge';
import { useDashboardOverview } from '@/hooks/use-dashboard';
import {
  dashboardStats as fallbackDashboardStats,
  trafficChartData as fallbackTrafficChartData,
  leadChartData as fallbackLeadChartData,
  popularPackages as fallbackPopularPackages,
  topDestinations as fallbackTopDestinations,
  recentActivities as fallbackRecentActivities,
  recentBlogPosts as fallbackRecentBlogPosts,
  recentInquiries as fallbackRecentInquiries,
} from '@/lib/adminMockData';

const cn = (...c) => c.filter(Boolean).join(' ');

const avatarColors = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  'chart-4': 'bg-violet-100 text-violet-600',
  'chart-5': 'bg-pink-100 text-pink-600',
  muted: 'bg-muted text-muted-foreground',
};

const quickActions = [
  { label: 'New Package', icon: Package, color: 'primary' },
  { label: 'New Blog', icon: FileText, color: 'success' },
  { label: 'Upload Media', icon: Upload, color: 'warning' },
  { label: 'New Destination', icon: MapPin, color: 'chart-4' },
];

export default function Dashboard() {
  const { data } = useDashboardOverview();

  const dashboardStats = data?.dashboardStats ?? fallbackDashboardStats;
  const trafficChartData = data?.trafficChartData ?? fallbackTrafficChartData;
  const leadChartData = data?.leadChartData ?? fallbackLeadChartData;
  const popularPackages = data?.popularPackages?.length ? data.popularPackages : fallbackPopularPackages;
  const topDestinations = data?.topDestinations?.length ? data.topDestinations : fallbackTopDestinations;
  const recentActivities = data?.recentActivities?.length ? data.recentActivities : fallbackRecentActivities;
  const recentBlogPosts = data?.recentBlogPosts?.length ? data.recentBlogPosts : fallbackRecentBlogPosts;
  const recentInquiries = data?.recentInquiries?.length ? data.recentInquiries : fallbackRecentInquiries;
  const newInquiryCount = data?.newInquiryCount ?? recentInquiries.filter((inq) => inq.status === 'New').length;
  const liveVisitors = data?.liveVisitors ?? 0;
  const pageviewsToday = data?.pageviewsToday ?? 0;

  const trafficSubtitle = liveVisitors > 0
    ? `${liveVisitors} live now · ${pageviewsToday.toLocaleString()} views today`
    : pageviewsToday > 0
      ? `${pageviewsToday.toLocaleString()} views today`
      : 'Visitor and pageview trends';

  return (
    <div className="space-y-6">
      {/* Hero Welcome */}
      <div className="bg-white border border-border rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up">
        {/* <div>
          <p className="text-sm text-muted-foreground">Wednesday, July 29, 2026</p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">Good Morning, Sarah 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">You have <span className="font-semibold text-primary">24 pending leads</span> and <span className="font-semibold text-warning">3 draft articles</span> to review.</p>
        </div> */}
        <div className="flex items-center gap-2">
          {quickActions.map(a => (
            <button key={a.label} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted hover:border-primary/20 transition-all">
              <a.icon className="w-4 h-4 text-primary" />
              <span className="hidden lg:inline">{a.label}</span>
            </button>
          ))}
          <button className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft">
            <Plus className="w-4 h-4" strokeWidth={2.5} /> <span className="hidden lg:inline">Quick Create</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dashboardStats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} delay={`${i * 40}ms`} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Chart */}
        <div className="lg:col-span-2 bg-white border border-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-foreground">Traffic Overview</h3>
              <p className="text-sm text-muted-foreground">{trafficSubtitle}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Visitors</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success" /> Pageviews</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trafficChartData} margin={{ left: -20, right: 0, top: 5 }}>
              <defs>
                <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pageviewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : v)} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 13 }} />
              <Area type="monotone" dataKey="pageviews" stroke="#22C55E" strokeWidth={2} fill="url(#pageviewsGrad)" />
              <Area type="monotone" dataKey="visitors" stroke="#2563EB" strokeWidth={2} fill="url(#visitorsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Packages */}
        <div className="bg-white border border-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Popular Packages</h3>
            <button className="text-xs text-primary font-medium hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {popularPackages.map((pkg, i) => (
              <div key={i} className="flex items-center gap-3 group cursor-pointer">
                <div className="relative shrink-0">
                  <img src={pkg.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-white border border-border text-[10px] font-bold flex items-center justify-center text-muted-foreground">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{pkg.name}</p>
                  <p className="text-xs text-muted-foreground">{pkg.bookings} bookings · {pkg.revenue}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Chart + Top Destinations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-foreground">Lead Generation</h3>
              <p className="text-sm text-muted-foreground">Enquiries, journey requests & newsletter signups</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Enquiries</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning" /> Journey</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success" /> Newsletter</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={leadChartData} margin={{ left: -20, right: 0, top: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 13 }} cursor={{ fill: '#F8FAFC' }} />
              <Bar dataKey="enquiries" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="journey" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="newsletter" fill="#22C55E" radius={[4, 4, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Top Destinations</h3>
            <button className="text-xs text-primary font-medium hover:underline">View all</button>
          </div>
          <div className="space-y-4">
            {topDestinations.map((dest, i) => (
              <div key={i} className="flex items-center gap-3">
                <img src={dest.image} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground truncate">{dest.name}</p>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">{dest.visits}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${dest.percentage}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities + Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.slice(0, 5).map((act, i) => (
              <div key={i} className="flex gap-3">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0", avatarColors[act.color])}>
                  {act.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{act.user}</span>
                    <span className="text-muted-foreground"> {act.action} </span>
                    <span className="font-medium">{act.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Recent Inquiries</h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-destructive/10 text-destructive rounded-md">
              {newInquiryCount > 0 ? `${newInquiryCount} New` : 'Up to date'}
            </span>
          </div>
          <div className="space-y-3">
            {recentInquiries.map((inq, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {inq.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{inq.name}</p>
                  <p className="text-xs text-muted-foreground">{inq.type} · {inq.time}</p>
                </div>
                <StatusBadge status={inq.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Blog Posts */}
      <div className="bg-white border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">Recent Blog Posts</h3>
          <button className="text-xs text-primary font-medium hover:underline">View all</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recentBlogPosts.map((post, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-lg mb-3 aspect-[16/10]">
                <img src={post.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <p className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{post.title}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-muted-foreground">{post.author}</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                <span className="text-xs text-muted-foreground">{post.date}</span>
                <StatusBadge status={post.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}