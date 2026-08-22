import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import footerLogo from '@/assets/footer_logo.png';

const QUICK_LINKS = [
  { label: 'Destinations', to: '/destinations' },
  { label: 'Experiences', to: '/experiences' },
  { label: 'Luxury Packages', to: '/packages' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Travel Journal', to: '/journal' },
];

const COMPANY_LINKS = [
  { label: 'About Us', to: '/about' },
  { label: 'Testimonials', to: '/testimonials' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact', to: '/contact' },
  { label: 'Plan My Journey', to: '/plan-my-journey' },
];

const SUPPORT_LINKS = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms & Conditions', to: '/terms' },
];

export default function Footer() {
  return (
    <footer className="bg-emerald-deep text-luxe">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src={footerLogo} alt="Pure Luxe Holidays" className="w-16 h-16 object-contain" />
              <div>
                <p className="font-heading text-2xl">
                  <span className="text-luxe">Pure</span> <span className="text-champagne">Luxe</span>
                </p>
                <p className="text-[0.55rem] tracking-widest-luxe text-luxe/50">H O L I D A Y S</p>
              </div>
            </div>
            <p className="font-accent text-xl text-champagne mb-4">Luxury &amp; Beyond</p>
            <p className="text-sm text-luxe/60 leading-relaxed max-w-sm mb-6">
              Crafting unforgettable luxury journeys through personalized service, premium destinations, and timeless hospitality.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full border border-champagne/30 flex items-center justify-center text-champagne/70 hover:bg-champagne hover:text-emerald-dark transition-all duration-500"
                  aria-label="Social media"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg text-champagne mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-luxe/60 hover:text-champagne transition-colors duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading text-lg text-champagne mb-5">Company</h4>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-luxe/60 hover:text-champagne transition-colors duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div>
            <h4 className="font-heading text-lg text-champagne mb-5">Get in Touch</h4>
            <ul className="space-y-4 mb-6">
              <li className="flex items-center gap-3 text-sm text-luxe/60">
                <Phone className="w-4 h-4 text-champagne flex-shrink-0" />
                +971 4 123 4567
              </li>
              <li className="flex items-center gap-3 text-sm text-luxe/60">
                <Mail className="w-4 h-4 text-champagne flex-shrink-0" />
                concierge@pureluxeholidays.com
              </li>
              <li className="flex items-center gap-3 text-sm text-luxe/60">
                <Clock className="w-4 h-4 text-champagne flex-shrink-0" />
                Mon–Sat: 9AM–7PM
              </li>
            </ul>
            <form className="flex items-center gap-2 border-b border-champagne/30 pb-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email for luxury updates"
                className="bg-transparent text-sm text-luxe placeholder:text-luxe/40 outline-none flex-1 py-1"
              />
              <button type="submit" className="text-champagne hover:text-gold transition-colors" aria-label="Subscribe">
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-champagne/15 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-luxe/40 tracking-wide">
            © {new Date().getFullYear()} Pure Luxe Holidays. All rights reserved.
          </p>
          <div className="flex gap-6">
            {SUPPORT_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="text-xs text-luxe/40 hover:text-champagne transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
          <img src={footerLogo} alt="Pure Luxe Holidays" className="w-20 h-20 object-contain opacity-70" />
        </div>
      </div>
    </footer>
  );
}