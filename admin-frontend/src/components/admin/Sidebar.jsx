import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Home, Info, MapPin, Compass, Briefcase, Image as ImageIcon,
  Phone, Route, FolderTree, Package, CalendarDays, Sparkles, FileText, Folder,
  Tag, Quote, HelpCircle, Mail, Plane, Send, Globe, FileSearch, Network, Bot,
  Repeat, Menu, PanelBottom, Megaphone, Settings, Settings2, Users, ShieldCheck,
  ScrollText, AtSign, BarChart3, Lock, ChevronLeft, CheckCircle2, XCircle
} from 'lucide-react';
import broserLogo from '@/assets/images/brouser_logo.png';

const cn = (...c) => c.filter(Boolean).join(' ');

const navSections = [
  { items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/admin', end: true }] },
  {
    title: 'Website',
    items: [
      { label: 'Home', icon: Home, path: '/admin/website/home' },
      { label: 'About', icon: Info, path: '/admin/website/about' },
      { label: 'Destinations', icon: MapPin, path: '/admin/website/destinations' },
      { label: 'Experiences', icon: Compass, path: '/admin/website/experiences' },
      { label: 'Luxury Packages', icon: Briefcase, path: '/admin/website/packages' },
      { label: 'Gallery', icon: ImageIcon, path: '/admin/website/gallery' },
      { label: 'Contact', icon: Phone, path: '/admin/website/contact' },
      { label: 'Plan My Journey', icon: Route, path: '/admin/website/plan-journey' },
    ]
  },
  {
    title: 'Travel',
    items: [
      { label: 'Package Categories', icon: FolderTree, path: '/admin/travel/categories' },
      { label: 'Packages', icon: Package, path: '/admin/packages' },
      // { label: 'Package Itinerary', icon: CalendarDays, path: '/admin/travel/itinerary' },
      // { label: 'Package Highlights', icon: Sparkles, path: '/admin/travel/highlights' },
      // { label: 'Inclusions', icon: CheckCircle2, path: '/admin/travel/inclusions' },
      // { label: 'Exclusions', icon: XCircle, path: '/admin/travel/exclusions' },
    ]
  },
  {
    title: 'Content',
    items: [
      { label: 'Blog Articles', icon: FileText, path: '/admin/blog' },
      { label: 'Categories', icon: Folder, path: '/admin/categories' },
      { label: 'Tags', icon: Tag, path: '/admin/tags' },
      { label: 'Testimonials', icon: Quote, path: '/admin/testimonials' },
      { label: 'FAQs', icon: HelpCircle, path: '/admin/faqs' },
    ]
  },
  {
    title: 'Leads',
    items: [
      { label: 'Contact Enquiries', icon: Mail, path: '/admin/leads', badge: '12' },
      { label: 'Journey Requests', icon: Plane, path: '/admin/leads/journey', badge: '8' },
      { label: 'Newsletter', icon: Send, path: '/admin/leads/newsletter' },
    ]
  },
  {
    title: 'Media',
    items: [{ label: 'Media Library', icon: ImageIcon, path: '/admin/media' }]
  },
  {
    title: 'SEO',
    items: [
      { label: 'Global SEO', icon: Globe, path: '/admin/seo' },
      { label: 'Page SEO', icon: FileSearch, path: '/admin/seo/page' },
      { label: 'Sitemap', icon: Network, path: '/admin/seo/sitemap' },
      { label: 'Robots.txt', icon: Bot, path: '/admin/seo/robots' },
      { label: 'Redirect Manager', icon: Repeat, path: '/admin/seo/redirects' },
    ]
  },
  // {
  //   title: 'Appearance',
  //   items: [
  //     { label: 'Navigation', icon: Menu, path: '/admin/appearance/navigation' },
  //     { label: 'Footer', icon: PanelBottom, path: '/admin/appearance/footer' },
  //     { label: 'CTA Settings', icon: Megaphone, path: '/admin/appearance/cta' },
  //     { label: 'Site Settings', icon: Settings, path: '/admin/settings' },
  //   ]
  // },
  // {
  //   title: 'Administration',
  //   items: [
  //     { label: 'Users', icon: Users, path: '/admin/users' },
  //     { label: 'Roles & Permissions', icon: ShieldCheck, path: '/admin/users/roles' },
  //     { label: 'Activity Logs', icon: ScrollText, path: '/admin/activity' },
  //   ]
  // },
  {
    title: 'Settings',
    items: [
      { label: 'General', icon: Settings2, path: '/admin/settings/general' },
      { label: 'Contact', icon: Phone, path: '/admin/settings/contact' },
      { label: 'Email', icon: AtSign, path: '/admin/settings/email' },
      { label: 'Analytics', icon: BarChart3, path: '/admin/settings/analytics' },
      { label: 'Security', icon: Lock, path: '/admin/settings/security' },
    ]
  },
];

export default function Sidebar({ collapsed, onToggle, mobile, onClose }) {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col bg-white border-r border-border">
      {/* Logo */}
      <div className={cn("flex items-center h-16 border-b border-border shrink-0", collapsed ? "justify-center px-2" : "px-5 justify-between")}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-soft">
            <img src={broserLogo} alt="Pure Luxe Holidays" className="w-full h-full object-cover" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-bold text-[15px] text-foreground leading-tight tracking-tight">Pure Luxe</p>
              <p className="text-[11px] text-muted-foreground leading-tight">Holidays CMS</p>
            </div>
          )}
        </div>
        {!collapsed && !mobile && (
          <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-3 space-y-0.5">
        {collapsed && !mobile && (
          <button onClick={onToggle} className="w-full flex items-center justify-center p-2.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground mb-2">
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </button>
        )}
        {navSections.map((section, si) => (
          <div key={si} className="mb-1">
            {!collapsed && section.title && (
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">{section.title}</p>
            )}
            {collapsed && section.title && <div className="h-px bg-border mx-3 my-2" />}
            {section.items.map((item) => {
              const isActive = item.end ? location.pathname === item.path : location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={mobile && onClose}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    collapsed && "justify-center",
                    isActive
                      ? "bg-primary/8 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary" />}
                  <Icon className={cn("w-[18px] h-[18px] shrink-0 transition-transform duration-200", isActive && "scale-105")} strokeWidth={isActive ? 2.5 : 2} />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className={cn("px-1.5 py-0.5 text-[10px] font-bold rounded-md", isActive ? "bg-primary text-white" : "bg-destructive/10 text-destructive")}>
                      {item.badge}
                    </span>
                  )}
                  {collapsed && item.badge && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={cn("border-t border-border p-3 shrink-0", collapsed && "flex justify-center")}>
        {!collapsed ? (
          <div className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-muted transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">SM</div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate">Sarah Mitchell</p>
              <p className="text-[11px] text-muted-foreground truncate">Super Admin</p>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white text-xs font-bold">SM</div>
        )}
      </div>
    </div>
  );
}