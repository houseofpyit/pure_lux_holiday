import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Ship,
  Plane,
  Mountain,
  Wine,
  Flower2,
  Landmark,
  Star,
  Compass,
  Utensils,
} from 'lucide-react';
import PageHero from '@/components/PageHero';
import ScrollReveal from '@/components/ScrollReveal';
import SectionDivider from '@/components/SectionDivider';
import LuxuryButton from '@/components/LuxuryButton';
import ConciergeCTA from '@/components/home/ConciergeCTA';
import { LoadingState, ErrorState } from '@/components/state/ContentState';
import { useExperiences, useExperiencesPageCta } from '@/hooks/use-experiences';
import { IMAGES } from '@/lib/images';
import { buildMediaUrl } from '@/lib/media';

const FALLBACK_IMAGES = [IMAGES.maldives, IMAGES.swiss, IMAGES.about, IMAGES.bali, IMAGES.dubai, IMAGES.hero];

const ICON_MAP = {
  Ship, Plane, Mountain, Wine, Flower2, Landmark, Star, Compass, Utensils,
  ship: Ship, plane: Plane, mountain: Mountain, wine: Wine,
  flower: Flower2, landmark: Landmark, star: Star, compass: Compass, utensils: Utensils,
};

const HERO_FALLBACK = {
  title: 'Signature Experiences',
  breadcrumb: 'Pure Luxe Holidays',
  subtitle: 'Moments crafted for those who understand that the rarest luxury is an experience that cannot be repeated.',
  image: IMAGES.about,
};

function getIcon(iconName) {
  if (!iconName) return Compass;
  return ICON_MAP[iconName] || ICON_MAP[iconName.toLowerCase()] || Compass;
}

function formatSlugLabel(slug) {
  if (!slug) return '';
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function sortExperiences(experiences) {
  return [...experiences].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

export default function Experiences() {
  const { data: experiences, isLoading, isError, error } = useExperiences();
  const { data: cta } = useExperiencesPageCta();

  const sorted = useMemo(
    () => sortExperiences(experiences || []),
    [experiences],
  );

  const heroImage = sorted[0]?.image?.url
    ? buildMediaUrl(sorted[0].image.url)
    : HERO_FALLBACK.image;

  return (
    <>
      <PageHero
        title={HERO_FALLBACK.title}
        breadcrumb={HERO_FALLBACK.breadcrumb}
        subtitle={HERO_FALLBACK.subtitle}
        image={heroImage}
      />

      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-5">The Collection</p>
            <h2 className="font-heading text-4xl md:text-5xl text-emerald-dark leading-tight mb-6">
              {sorted.length > 0 ? `${sorted.length} Pillars of Extraordinary` : 'Extraordinary Experiences'}
            </h2>
            <SectionDivider className="mb-8" />
            <p className="text-muted-foreground leading-relaxed text-base">
              Each experience is a world unto itself. Browse, dream, and when you are ready, we will design something that is entirely your own.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {isLoading && (
        <section className="py-12 px-6 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <LoadingState lines={8} />
          </div>
        </section>
      )}

      {isError && (
        <section className="py-12 px-6 md:px-12 lg:px-20">
          <div className="max-w-2xl mx-auto">
            <ErrorState message={error?.message || 'Please try again shortly.'} />
          </div>
        </section>
      )}

      {!isLoading && !isError && sorted.length === 0 && (
        <section className="py-12 px-6 md:px-12 lg:px-20">
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-heading text-3xl text-emerald-dark mb-3">No experiences available</p>
            <p className="text-muted-foreground">Check back soon for newly curated journeys.</p>
          </div>
        </section>
      )}

      {!isLoading && !isError && sorted.map((exp, i) => {
        const isEven = i % 2 === 0;
        const Icon = getIcon(exp.icon);
        const imageUrl = exp.image?.url
          ? buildMediaUrl(exp.image.url)
          : FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
        const href = exp.buttonUrl || '/plan-my-journey';
        const category = formatSlugLabel(exp.slug);

        return (
          <section
            key={exp.id}
            className={`py-16 md:py-24 px-6 md:px-12 lg:px-20 ${i % 4 === 2 ? 'bg-gradient-to-b from-transparent via-luxe/40 to-transparent' : ''}`}
          >
            <div
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-7xl mx-auto ${
                !isEven ? 'lg:grid-flow-dense' : ''
              }`}
            >
              <ScrollReveal delay={0.1} className={!isEven ? 'lg:col-start-2' : ''}>
                <div className="relative overflow-hidden rounded-3xl lux-shadow group">
                  <motion.img
                    src={imageUrl}
                    alt={exp.title}
                    className="w-full aspect-[4/3] object-cover"
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/40 via-transparent to-transparent" />
                  {category && (
                    <div className="absolute bottom-6 left-6">
                      <span className="text-[0.6rem] tracking-widest-luxe text-champagne uppercase">{category}</span>
                    </div>
                  )}
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.2} className={!isEven ? 'lg:col-start-1 lg:row-start-1' : ''}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full border border-champagne/30 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-champagne" strokeWidth={1.5} />
                  </div>
                  {category && (
                    <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase">{category}</p>
                  )}
                </div>
                <h2 className="font-heading text-4xl md:text-5xl text-emerald-dark mb-4 leading-tight">
                  {exp.title}
                </h2>
                <div className="w-12 h-px bg-champagne mb-6" />
                {exp.shortDescription && (
                  <p className="text-muted-foreground leading-relaxed mb-8 text-base">
                    {exp.shortDescription}
                  </p>
                )}
                <Link
                  to={href}
                  className="inline-flex items-center gap-2 text-xs tracking-luxe uppercase text-emerald-dark border-b border-champagne/40 pb-1 hover:border-champagne transition-colors group"
                >
                  {exp.buttonText || 'Enquire About This Experience'}
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </ScrollReveal>
            </div>
          </section>
        );
      })}

      {!isLoading && !isError && sorted.length > 0 && (
        <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-emerald-deep text-luxe">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal>
              <p className="font-accent text-4xl text-champagne mb-4">Something Unforgettable Awaits</p>
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-luxe leading-tight mb-6">
                Design Your Next<br />Extraordinary Experience
              </h2>
              <SectionDivider className="mb-8" />
              <p className="text-luxe/60 leading-relaxed mb-10 max-w-xl mx-auto">
                Every experience on this page is a starting point, not a fixed itinerary. Tell us what moves you and we will craft something that exists nowhere else.
              </p>
              <LuxuryButton to="/plan-my-journey">
                Begin Your Experience
              </LuxuryButton>
            </ScrollReveal>
          </div>
        </section>
      )}

      <ConciergeCTA cta={cta} />
    </>
  );
}
