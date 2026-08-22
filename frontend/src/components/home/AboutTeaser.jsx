import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { IMAGES } from '@/lib/images';
import { buildApiMediaUrl } from '@/api/home.api';

const fallbackSection = {
  eyebrow: 'Our Story',
  heading: 'Crafting Journeys That Stay With You',
  description: 'For over fifteen years, Pure Luxe Holidays has been the trusted name in bespoke luxury travel. We believe that true luxury is not about where you go, but how the journey transforms you. Every itinerary is a collaboration, every experience a memory in the making.',
  button_text: 'Know Our Story',
  button_url: '/about',
  image_alt: 'A traveler overlooking a Mediterranean caldera at golden hour',
};

export default function AboutTeaser({ section }) {
  if (section === null || section?.is_active === false) return null;

  const content = { ...fallbackSection, ...(section || {}) };

  const image = buildApiMediaUrl(content.image_url)
    || buildApiMediaUrl(content.image?.file_url)
    || IMAGES.about;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
      {/* Left: Dark Emerald Panel */}
      <div className="bg-emerald-deep text-luxe flex items-center px-6 md:px-12 lg:px-20 py-20 lg:py-32 relative overflow-hidden">
        <div className="max-w-lg">
          <ScrollReveal>
            <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-4">{content.eyebrow}</p>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-luxe leading-tight mb-6">
              {content.heading}
            </h2>
            <div className="w-16 h-px bg-champagne mb-6" />
            <p className="text-luxe/60 leading-relaxed mb-8">
              {content.description}
            </p>
            <Link to={content.button_url || '/about'} className="inline-flex items-center gap-2 text-xs tracking-luxe uppercase text-champagne border-b border-champagne/40 pb-1 hover:border-champagne transition-colors group">
              {content.button_text} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </ScrollReveal>
        </div>
      </div>

      {/* Right: Image */}
      <div className="relative min-h-[400px] lg:min-h-full overflow-hidden">
        <motion.img
          src={image}
          alt={content.image_alt || fallbackSection.image_alt}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.2 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/30 to-transparent lg:bg-none" />
      </div>
    </section>
  );
}
