import React from 'react';
import { Link } from 'react-router-dom';
import { Ship, Plane, Mountain, Wine, Flower2, Landmark, Star, Compass, ArrowRight } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import SectionDivider from '@/components/SectionDivider';

// Map icon names stored in backend to Lucide components
const ICON_MAP = {
  Ship, Plane, Mountain, Wine, Flower2, Landmark, Star, Compass,
  ship: Ship, plane: Plane, mountain: Mountain, wine: Wine,
  flower: Flower2, landmark: Landmark, star: Star, compass: Compass,
};

function getIcon(iconName) {
  if (!iconName) return Compass;
  return ICON_MAP[iconName] || ICON_MAP[iconName.toLowerCase()] || Compass;
}

function ExperienceCard({ exp, index }) {
  const Icon = getIcon(exp.icon);
  const href = exp.buttonUrl || '/experiences';

  return (
    <ScrollReveal delay={index * 0.08}>
      <Link to={href} className="group flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full border border-champagne/30 flex items-center justify-center mb-5 group-hover:border-champagne group-hover:bg-champagne/5 transition-all duration-500">
          <Icon className="w-7 h-7 text-champagne group-hover:scale-110 transition-transform duration-500" strokeWidth={1} />
        </div>
        <h3 className="font-heading text-lg text-emerald-dark mb-1">{exp.title}</h3>
        {exp.shortDescription && (
          <p className="text-xs text-muted-foreground leading-relaxed">{exp.shortDescription}</p>
        )}
      </Link>
    </ScrollReveal>
  );
}

export default function Experiences({ experiences }) {
  if (!experiences || experiences.length === 0) return null;

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <ScrollReveal>
          <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-4">Signature Experiences</p>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-emerald-dark">Experiences Beyond Imagination</h2>
          <SectionDivider className="mt-6" />
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-7xl mx-auto">
        {experiences.map((exp, i) => (
          <ExperienceCard key={exp.id} exp={exp} index={i} />
        ))}
      </div>

      <div className="text-center mt-14">
        <ScrollReveal>
          <Link
            to="/experiences"
            className="inline-flex items-center gap-2 text-xs tracking-luxe uppercase text-emerald-dark border-b border-champagne/40 pb-1 hover:border-champagne transition-colors"
          >
            View All Experiences <ArrowRight className="w-3 h-3" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
