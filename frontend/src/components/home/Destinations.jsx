import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import SectionDivider from '@/components/SectionDivider';
import { IMAGES } from '@/lib/images';
import { buildMediaUrl } from '@/lib/media';

const FALLBACK_IMAGES = [IMAGES.maldives, IMAGES.swiss, IMAGES.bali, IMAGES.dubai];

function destinationHref(dest) {
  if (dest.slug) return `/destinations?destination=${encodeURIComponent(dest.slug)}`;
  return '/destinations';
}

function DestinationCard({ dest, index, isLarge }) {
  const imageUrl = dest.image?.url
    ? buildMediaUrl(dest.image.url)
    : FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

  const href = destinationHref(dest);

  return (
    <ScrollReveal
      delay={index * 0.12}
      className={isLarge ? 'lg:col-span-2 lg:row-span-2' : ''}
    >
      <Link
        to={href}
        className={`group block relative overflow-hidden rounded-3xl lux-shadow ${
          isLarge ? 'aspect-[4/5] lg:aspect-[3/4]' : 'aspect-[3/4]'
        }`}
      >
        <img
          src={imageUrl}
          alt={dest.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/90 via-emerald-deep/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          {dest.country && (
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-3 h-3 text-champagne" />
              <span className="text-[0.65rem] tracking-luxe uppercase text-champagne">{dest.country}</span>
            </div>
          )}
          <h3 className={`font-heading text-white mb-1 ${isLarge ? 'text-4xl md:text-5xl' : 'text-2xl'}`}>
            {dest.name}
          </h3>
          {dest.shortDescription && (
            <p className="text-sm text-white/70 mb-3">{dest.shortDescription}</p>
          )}
          <span className="inline-flex items-center gap-2 text-[0.65rem] tracking-luxe uppercase text-white/80 group-hover:gap-3 group-hover:text-champagne transition-all duration-500">
            {dest.buttonText || 'Discover'} <ArrowRight className="w-3 h-3" />
          </span>
        </div>
        <div className="absolute inset-0 rounded-3xl border border-champagne/0 group-hover:border group-hover:border-champagne/30 transition-all duration-700" />
      </Link>
    </ScrollReveal>
  );
}

export default function Destinations({ destinations }) {
  if (!destinations || destinations.length === 0) return null;

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-transparent via-luxe/50 to-transparent">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <ScrollReveal>
          <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-4">Featured Destinations</p>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-emerald-dark">Where Will You Wander?</h2>
          <SectionDivider className="mt-6" />
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {destinations.map((dest, i) => (
          <DestinationCard
            key={dest.id}
            dest={dest}
            index={i}
            isLarge={i === 0 && destinations.length >= 3}
          />
        ))}
      </div>

      <div className="text-center mt-12">
        <ScrollReveal>
          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 text-xs tracking-luxe uppercase text-emerald-dark border-b border-champagne/40 pb-1 hover:border-champagne transition-colors"
          >
            View All Destinations <ArrowRight className="w-3 h-3" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
