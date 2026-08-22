import React, { useMemo, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, ArrowLeft } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import SectionDivider from '@/components/SectionDivider';
import LuxuryButton from '@/components/LuxuryButton';
import ConciergeCTA from '@/components/home/ConciergeCTA';
import { LoadingState, ErrorState } from '@/components/state/ContentState';
import { useDestinations, useDestinationsPageCta } from '@/hooks/use-destinations';
import { IMAGES } from '@/lib/images';
import { buildMediaUrl } from '@/lib/media';
import { planJourneyUrl } from '@/lib/destinations';

const FALLBACK_IMAGES = [IMAGES.maldives, IMAGES.swiss, IMAGES.bali, IMAGES.dubai, IMAGES.hero, IMAGES.about];

const HERO_DEFAULT = {
  title: 'Destinations',
  breadcrumb: 'Explore the World',
  subtitle: "A curated atlas of the world's most extraordinary places, each chosen for its ability to inspire wonder.",
  image: IMAGES.maldives,
};

function sortDestinations(destinations) {
  return [...destinations].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
    return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
  });
}

function getDestinationImage(dest, index = 0) {
  if (dest?.image?.url) return buildMediaUrl(dest.image.url);
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

function DestinationFilterBar({ filters, activeSlug, onSelect }) {
  if (filters.length <= 1) return null;

  return (
    <section className="py-12 px-6 md:px-12 lg:px-20 border-b border-border/40">
      <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
        <span className="text-xs tracking-luxe uppercase text-muted-foreground mr-2">Browse:</span>
        {filters.map((item) => (
          <button
            key={item.slug}
            type="button"
            onClick={() => onSelect(item.slug)}
            className={`px-5 py-2 rounded-full text-xs tracking-luxe uppercase transition-all duration-500 ${
              activeSlug === item.slug
                ? 'bg-emerald-dark text-luxe'
                : 'border border-border text-muted-foreground hover:border-champagne hover:text-emerald-dark'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>
    </section>
  );
}

function AllDestinationsHero({ image }) {
  return (
    <section className="relative min-h-[50vh] flex items-end overflow-hidden">
      <img src={image} alt={HERO_DEFAULT.title} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep via-emerald-deep/55 to-emerald-deep/25" />
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 pb-14 pt-28 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-[0.65rem] tracking-widest-luxe uppercase text-champagne mb-4">{HERO_DEFAULT.breadcrumb}</p>
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl text-white leading-tight text-shadow-lux mb-5">
            {HERO_DEFAULT.title}
          </h1>
          <p className="text-white/80 text-base md:text-lg leading-relaxed">{HERO_DEFAULT.subtitle}</p>
        </div>
      </div>
    </section>
  );
}

function DestinationHero({ destination, heroImage, ctaHref }) {
  return (
    <section className="relative min-h-[55vh] flex items-end overflow-hidden">
      <img src={heroImage} alt={destination.name} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep via-emerald-deep/60 to-emerald-deep/30" />
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 pb-14 pt-28">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 text-[0.65rem] tracking-luxe uppercase text-white/70 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Destinations
          </Link>
          {destination.country && (
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-3.5 h-3.5 text-champagne" />
              <span className="text-[0.65rem] tracking-widest-luxe uppercase text-champagne">{destination.country}</span>
            </div>
          )}
          <h1 className="font-heading text-4xl md:text-6xl text-white leading-tight text-shadow-lux mb-4 max-w-3xl">
            {destination.name}
          </h1>
          {destination.shortDescription && (
            <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-2xl mb-8">
              {destination.shortDescription}
            </p>
          )}
          {ctaHref && (
            <LuxuryButton to={ctaHref} variant="light">
              {destination.buttonText || 'Explore Journeys'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </LuxuryButton>
          )}
        </div>
      </div>
    </section>
  );
}

function DestinationCard({ dest, index, onSelect }) {
  const imageUrl = getDestinationImage(dest, index);

  return (
    <ScrollReveal delay={index * 0.1}>
      <button
        type="button"
        onClick={() => onSelect(dest.slug)}
        className="group block relative overflow-hidden rounded-3xl aspect-[3/4] lux-shadow w-full text-left"
      >
        <img
          src={imageUrl}
          alt={dest.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/95 via-emerald-deep/30 to-transparent" />
        {dest.country && (
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-luxe/90 backdrop-blur-sm">
            <span className="text-[0.6rem] tracking-luxe uppercase text-emerald-dark font-semibold">{dest.country}</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-3 h-3 text-champagne" />
            <span className="text-[0.65rem] tracking-luxe uppercase text-champagne">{dest.country || 'Featured'}</span>
          </div>
          <h3 className="font-heading text-3xl text-white mb-2">{dest.name}</h3>
          {dest.shortDescription && (
            <p className="text-sm text-white/70 leading-relaxed mb-4 line-clamp-2">{dest.shortDescription}</p>
          )}
          <span className="inline-flex items-center gap-2 text-[0.65rem] tracking-luxe uppercase text-champagne group-hover:gap-3 transition-all duration-500">
            {dest.buttonText || 'Discover'} <ArrowRight className="w-3 h-3" />
          </span>
        </div>
        <div className="absolute inset-0 rounded-3xl border border-champagne/0 group-hover:border group-hover:border-champagne/30 transition-all duration-700" />
      </button>
    </ScrollReveal>
  );
}

function DestinationDetail({ destination, index }) {
  const imageUrl = getDestinationImage(destination, index);
  const ctaHref = destination.buttonUrl || planJourneyUrl(destination);

  return (
    <section className="py-20 md:py-28 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl aspect-[4/5] lux-shadow">
            <img src={imageUrl} alt={destination.name} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/30 to-transparent" />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-4">Featured Destination</p>
          <h2 className="font-heading text-4xl md:text-5xl text-emerald-dark mb-5">{destination.name}</h2>
          <SectionDivider className="mb-6" />
          {destination.shortDescription ? (
            <p className="text-muted-foreground leading-relaxed mb-8">{destination.shortDescription}</p>
          ) : (
            <p className="text-muted-foreground leading-relaxed mb-8">
              Discover curated luxury journeys crafted for {destination.name}
              {destination.country ? `, ${destination.country}` : ''}.
            </p>
          )}
          <div className="flex flex-wrap gap-4">
            <LuxuryButton to={ctaHref}>
              {destination.buttonText || 'View Packages'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </LuxuryButton>
            <LuxuryButton to={planJourneyUrl(destination)} variant="outline">
              Plan My Journey
            </LuxuryButton>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get('destination') || 'all';
  const { data: destinations, isLoading, isError, error } = useDestinations();
  const { data: cta } = useDestinationsPageCta();

  const sorted = useMemo(
    () => sortDestinations(destinations || []),
    [destinations],
  );

  const filters = useMemo(
    () => [{ slug: 'all', name: 'All' }, ...sorted.map((dest) => ({ slug: dest.slug, name: dest.name }))],
    [sorted],
  );

  const activeDestination = useMemo(
    () => sorted.find((dest) => dest.slug === activeSlug) || null,
    [sorted, activeSlug],
  );

  const isSingleView = activeSlug !== 'all' && !!activeDestination;

  const navigate = useNavigate();

  const goToPlanJourney = useCallback(
    (slug) => navigate(planJourneyUrl({ slug })),
    [navigate],
  );

  const setActiveDestination = useCallback(
    (slug) => {
      const next = new URLSearchParams(searchParams);
      if (slug === 'all') next.delete('destination');
      else next.set('destination', slug);
      setSearchParams(next, { replace: false });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [searchParams, setSearchParams],
  );

  const heroImage = isSingleView
    ? getDestinationImage(activeDestination, sorted.findIndex((d) => d.slug === activeSlug))
    : getDestinationImage(sorted[0], 0) || HERO_DEFAULT.image;

  const relatedDestinations = useMemo(
    () => sorted.filter((dest) => dest.slug !== activeSlug).slice(0, 3),
    [sorted, activeSlug],
  );

  return (
    <>
      {isSingleView ? (
        <DestinationHero
          destination={activeDestination}
          heroImage={heroImage}
          ctaHref={activeDestination.buttonUrl || planJourneyUrl(activeDestination)}
        />
      ) : (
        <AllDestinationsHero image={heroImage || HERO_DEFAULT.image} />
      )}

      {!isLoading && !isError && filters.length > 1 && (
        <DestinationFilterBar
          filters={filters}
          activeSlug={activeSlug}
          onSelect={setActiveDestination}
        />
      )}

      {isLoading && (
        <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <LoadingState lines={6} />
          </div>
        </section>
      )}

      {isError && (
        <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20">
          <div className="max-w-2xl mx-auto">
            <ErrorState message={error?.message || 'Please try again shortly.'} />
          </div>
        </section>
      )}

      {!isLoading && !isError && activeSlug !== 'all' && !activeDestination && (
        <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20">
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-heading text-3xl text-emerald-dark mb-3">Destination not found</p>
            <p className="text-muted-foreground mb-6">That destination may no longer be available.</p>
            <LuxuryButton to="/destinations">View All Destinations</LuxuryButton>
          </div>
        </section>
      )}

      {!isLoading && !isError && isSingleView && (
        <>
          <DestinationDetail destination={activeDestination} index={sorted.findIndex((d) => d.slug === activeSlug)} />
          {relatedDestinations.length > 0 && (
            <section className="pb-24 md:pb-32 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-transparent via-luxe/30 to-transparent">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {relatedDestinations.map((dest, i) => (
                  <DestinationCard key={dest.id} dest={dest} index={i} onSelect={goToPlanJourney} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {!isLoading && !isError && activeSlug === 'all' && sorted.length === 0 && (
        <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20">
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-heading text-3xl text-emerald-dark mb-3">No destinations available</p>
            <p className="text-muted-foreground">Check back soon for newly curated journeys.</p>
          </div>
        </section>
      )}

      {!isLoading && !isError && activeSlug === 'all' && sorted.length > 0 && (
        <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {sorted.map((dest, i) => (
              <DestinationCard key={dest.id} dest={dest} index={i} onSelect={goToPlanJourney} />
            ))}
          </div>
        </section>
      )}

      <ConciergeCTA cta={cta} />
    </>
  );
}
