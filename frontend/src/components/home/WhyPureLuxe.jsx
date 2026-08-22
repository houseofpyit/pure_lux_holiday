import React from 'react';
import { Compass, BedDouble, Lock, Clock, Plane, Award, Star, Leaf, Globe, Heart } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import SectionDivider from '@/components/SectionDivider';

// Map icon names from backend to Lucide components
const ICON_MAP = {
  Compass, BedDouble, Lock, Clock, Plane, Award, Star, Leaf, Globe, Heart,
  compass: Compass, bed: BedDouble, lock: Lock, clock: Clock, plane: Plane,
  award: Award, star: Star, leaf: Leaf, globe: Globe, heart: Heart,
};

// Cycle through these if there are more items than icons defined in ICON_MAP
const FALLBACK_ICONS = [Compass, BedDouble, Lock, Clock, Plane, Award];

function getIcon(iconName, index) {
  if (iconName) {
    const found = ICON_MAP[iconName] || ICON_MAP[iconName.toLowerCase()];
    if (found) return found;
  }
  return FALLBACK_ICONS[index % FALLBACK_ICONS.length];
}

function WhyCard({ item, index }) {
  const Icon = getIcon(item.icon, index);

  return (
    <ScrollReveal delay={index * 0.1}>
      <div className="group text-center md:text-left">
        <div className="w-16 h-16 rounded-full border border-champagne/30 flex items-center justify-center mb-6 group-hover:border-champagne group-hover:bg-champagne/5 transition-all duration-500 mx-auto md:mx-0">
          <Icon className="w-6 h-6 text-champagne" strokeWidth={1} />
        </div>
        <h3 className="font-heading text-2xl text-luxe mb-3">{item.title}</h3>
        {item.description && (
          <p className="text-sm text-luxe/60 leading-relaxed">{item.description}</p>
        )}
      </div>
    </ScrollReveal>
  );
}

export default function WhyPureLuxe({ whyChooseUs }) {
  if (!whyChooseUs || whyChooseUs.length === 0) return null;

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-emerald-deep text-luxe">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <ScrollReveal>
          <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-4">Why Pure Luxe Holidays</p>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-luxe">The Art of Effortless Travel</h2>
          <SectionDivider className="mt-6" />
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {whyChooseUs.map((item, i) => (
          <WhyCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}
