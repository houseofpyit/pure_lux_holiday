import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Plus, ChevronDown, Menu, LogOut, User, Settings, Command } from 'lucide-react';
import { notifications } from '@/lib/adminMockData';
import { useAuth } from '@/lib/AuthContext';

const cn = (...c) => c.filter(Boolean).join(' ');

const breadcrumbMap = {
  '/admin': ['Dashboard'],
  '/admin/website/home': ['Website', 'Home'],
  '/admin/website/about': ['Website', 'About'],
  '/admin/destinations': ['Website', 'Destinations'],
  '/admin/packages': ['Travel', 'Packages'],
  '/admin/media': ['Media', 'Media Library'],
  '/admin/blog': ['Content', 'Blog Articles'],
  '/admin/leads': ['Leads', 'Contact Enquiries'],
  '/admin/seo': ['SEO', 'Global SEO'],
  '/admin/settings': ['Settings', 'General'],
  '/admin/testimonials': ['Content', 'Testimonials'],
  '/admin/faqs': ['Content', 'FAQs'],
  '/admin/categories': ['Content', 'Blog Categories'],
  '/admin/tags': ['Content', 'Blog Tags'],
  '/admin/experiences': ['Website', 'Experiences'],
  '/admin/travel/categories': ['Travel', 'Package Categories'],
  '/admin/travel/itinerary': ['Travel', 'Package Itinerary'],
  '/admin/travel/highlights': ['Travel', 'Package Highlights'],
  '/admin/travel/inclusions': ['Travel', 'Inclusions'],
  '/admin/travel/exclusions': ['Travel', 'Exclusions'],
  '/admin/leads/journey': ['Leads', 'Journey Requests'],
  '/admin/leads/newsletter': ['Leads', 'Newsletter'],
  '/admin/seo/page': ['SEO', 'Page SEO'],
  '/admin/seo/sitemap': ['SEO', 'Sitemap'],
  '/admin/seo/robots': ['SEO', 'Robots.txt'],
  '/admin/seo/redirects': ['SEO', 'Redirect Manager'],
  '/admin/appearance/navigation': ['Appearance', 'Navigation'],
  '/admin/appearance/footer': ['Appearance', 'Footer'],
  '/admin/appearance/cta': ['Appearance', 'CTA Settings'],
  '/admin/website/home/hero': ['Website', 'Home', 'Hero Banner'],
  '/admin/website/home/collections': ['Website', 'Home', 'Collections'],
  '/admin/website/home/featured-destinations': ['Website', 'Home', 'Featured Destinations'],
  '/admin/website/home/experiences': ['Website', 'Home', 'Experiences'],
  '/admin/website/home/why-choose-us': ['Website', 'Home', 'Why Choose Us'],
  '/admin/website/home/about-section': ['Website', 'Home', 'About Section'],
  '/admin/website/home/statistics': ['Website', 'Home', 'Statistics'],
  '/admin/website/home/testimonials': ['Website', 'Home', 'Testimonials'],
  '/admin/website/home/travel-journal': ['Website', 'Home', 'Travel Journal'],
  '/admin/website/home/concierge-cta': ['Website', 'Home', 'Concierge CTA'],
  '/admin/website/about/hero': ['Website', 'About', 'Hero Section'],
  '/admin/website/about/story': ['Website', 'About', 'Our Story'],
  '/admin/website/about/mission-vision': ['Website', 'About', 'Mission & Vision'],
  '/admin/website/about/core-values': ['Website', 'About', 'Core Values'],
  '/admin/website/about/timeline': ['Website', 'About', 'Journey Timeline'],
  '/admin/website/about/leadership': ['Website', 'About', 'Leadership Team'],
  '/admin/website/about/awards': ['Website', 'About', 'Awards'],
  '/admin/website/about/partners': ['Website', 'About', 'Partners'],
  '/admin/website/about/cta': ['Website', 'About', 'CTA Section'],
  '/admin/website/about/seo': ['Website', 'About', 'SEO'],
  '/admin/users': ['Administration', 'Users'],
  '/admin/users/roles': ['Administration', 'Roles & Permissions'],
  '/admin/activity': ['Administration', 'Activity Logs'],
};

export default function Topbar({ onMenuClick, onQuickCreate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const crumbs = breadcrumbMap[location.pathname] || ['Dashboard'];
  const unreadCount = notifications.filter(n => n.unread).length;

  // Build initials from the user's name (e.g. "Sarah Mitchell" → "SM")
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-border flex items-center gap-3 px-4 lg:px-6">
      {/* Mobile menu */}
      <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Breadcrumb */}
      <div className="hidden md:flex items-center gap-1.5 text-sm">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          const parentPath = !isLast
            ? Object.entries(breadcrumbMap).find(
                ([, segs]) => segs.length === i + 1 && segs.every((s, j) => s === crumbs[j]),
              )?.[0]
            : null;

          return (
            <React.Fragment key={i}>
              {i > 0 && <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/50 -rotate-90" />}
              {parentPath ? (
                <button
                  onClick={() => navigate(parentPath)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {crumb}
                </button>
              ) : (
                <span className={isLast ? "font-semibold text-foreground" : "text-muted-foreground"}>{crumb}</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto lg:ml-8">
        <div className={cn(
          "relative flex items-center transition-all duration-200 rounded-lg border bg-muted/40",
          searchFocused ? "border-primary bg-white shadow-soft" : "border-border"
        )}>
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search packages, blogs, destinations..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full pl-9 pr-16 py-2 text-sm bg-transparent rounded-lg outline-none placeholder:text-muted-foreground/70"
          />
          <kbd className="absolute right-2.5 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-white border border-border rounded">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {/* Quick Create */}
        {/* <button
          onClick={onQuickCreate}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-soft"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span className="hidden md:inline">Quick Create</span>
        </button> */}

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-border shadow-floating animate-scale-in overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="font-semibold text-sm text-foreground">Notifications</p>
                <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {notifications.map(n => (
                  <div key={n.id} className={cn("flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border/50 last:border-0", n.unread && "bg-primary/3")}>
                    <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", n.unread ? "bg-primary" : "bg-transparent")} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                      <p className="text-[11px] text-muted-foreground/70 mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-border text-center">
                <button className="text-xs font-medium text-primary hover:underline">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 pr-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white text-xs font-bold">{initials}</div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-border shadow-floating animate-scale-in overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="font-semibold text-sm text-foreground">{user?.name ?? 'Admin'}</p>
                <p className="text-xs text-muted-foreground">{user?.email ?? ''}</p>
              </div>
              <div className="py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                  <User className="w-4 h-4 text-muted-foreground" /> My Profile
                </button>
                <button onClick={() => navigate('/admin/settings')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                  <Settings className="w-4 h-4 text-muted-foreground" /> Settings
                </button>
              </div>
              <div className="py-1 border-t border-border">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
