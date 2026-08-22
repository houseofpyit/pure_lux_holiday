import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  MapPin,
  Quote,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import SectionDivider from '@/components/SectionDivider';
import LuxuryButton from '@/components/LuxuryButton';
import ConciergeCTA from '@/components/home/ConciergeCTA';
import { ErrorState } from '@/components/state/ContentState';
import { Skeleton } from '@/components/ui/skeleton';
import { usePackageDetail, usePackageTestimonials } from '@/hooks/use-package-detail';
import { useAboutPageCta } from '@/hooks/use-about';
import { IMAGES } from '@/lib/images';
import { buildMediaUrl } from '@/lib/media';

const FALLBACK_IMAGES = [IMAGES.maldives, IMAGES.dubai, IMAGES.bali, IMAGES.swiss, IMAGES.about, IMAGES.hero];

function formatDuration(pkg) {
  if (pkg.durationNights > 0 && pkg.durationDays > 0) {
    return `${pkg.durationNights} nights · ${pkg.durationDays} days`;
  }
  if (pkg.durationNights > 0) return `${pkg.durationNights} nights`;
  if (pkg.durationDays > 0) return `${pkg.durationDays} days`;
  return 'Bespoke duration';
}

function formatLocation(pkg) {
  return [pkg.city, pkg.country].filter(Boolean).join(', ');
}

function formatPrice(pkg) {
  if (pkg.startingPrice == null) return null;
  try {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: pkg.currency || 'USD',
      maximumFractionDigits: 0,
    }).format(pkg.startingPrice);
    return formatted;
  } catch {
    return `${pkg.currency || 'USD'} ${pkg.startingPrice}`;
  }
}

function getHighlightIcon(iconName) {
  if (!iconName) return Sparkles;
  const IconComponent =
    LucideIcons[iconName] ||
    LucideIcons[iconName.charAt(0).toUpperCase() + iconName.slice(1)] ||
    Sparkles;
  return IconComponent;
}

function sortByOrder(items, orderKey = 'displayOrder', secondaryKey) {
  if (!items?.length) return [];
  return [...items].sort((a, b) => {
    const primary = (a[orderKey] ?? 0) - (b[orderKey] ?? 0);
    if (primary !== 0 || !secondaryKey) return primary;
    return (a[secondaryKey] ?? 0) - (b[secondaryKey] ?? 0);
  });
}

function PackageHero({ pkg, heroImage }) {
  const collectionLink = pkg.category?.slug
    ? `/packages?collection=${pkg.category.slug}`
    : '/packages';

  return (
    <section className="relative min-h-[72vh] flex items-end overflow-hidden">
      <img src={heroImage} alt={pkg.title} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep via-emerald-deep/55 to-emerald-deep/25" />

      <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 pb-14 md:pb-20 pt-32">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 text-[0.65rem] tracking-luxe uppercase text-white/70 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Collections
          </Link>

          <div className="max-w-3xl">
            {pkg.category?.name && (
              <Link
                to={collectionLink}
                className="inline-block text-[0.65rem] tracking-widest-luxe uppercase text-champagne mb-4 hover:text-white transition-colors"
              >
                {pkg.category.name}
              </Link>
            )}
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl text-white leading-[1.05] text-shadow-lux mb-5">
              {pkg.title}
            </h1>
            {pkg.shortDescription && (
              <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-2xl">
                {pkg.shortDescription}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs tracking-wide">
              <Clock className="w-3.5 h-3.5 text-champagne" strokeWidth={1.5} />
              {formatDuration(pkg)}
            </span>
            {formatLocation(pkg) && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs tracking-wide">
                <MapPin className="w-3.5 h-3.5 text-champagne" strokeWidth={1.5} />
                {formatLocation(pkg)}
              </span>
            )}
            {formatPrice(pkg) && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-champagne" strokeWidth={1.5} />
                From {formatPrice(pkg)}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function BookingCard({ pkg }) {
  const price = formatPrice(pkg);
  const planState = {
    destination: pkg.country || pkg.city || '',
    packageTitle: pkg.title || '',
  };

  return (
    <div className="rounded-3xl border border-champagne/20 bg-white lux-shadow-lg p-8 md:p-9 space-y-6">
      <div>
        <p className="text-[0.65rem] tracking-widest-luxe uppercase text-champagne mb-2">Starting From</p>
        <p className="font-heading text-4xl text-emerald-dark">{price || 'Bespoke quote'}</p>
        {price && <p className="text-xs text-muted-foreground mt-1">Per person · excluding international flights</p>}
      </div>

      <div className="space-y-4 py-2 border-y border-border/60">
        <div className="flex items-start gap-3">
          <Clock className="w-4 h-4 text-champagne mt-0.5 shrink-0" strokeWidth={1.5} />
          <div>
            <p className="text-[0.6rem] tracking-luxe uppercase text-muted-foreground">Duration</p>
            <p className="text-sm text-emerald-dark font-medium">{formatDuration(pkg)}</p>
          </div>
        </div>
        {formatLocation(pkg) && (
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-champagne mt-0.5 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-[0.6rem] tracking-luxe uppercase text-muted-foreground">Destination</p>
              <p className="text-sm text-emerald-dark font-medium">{formatLocation(pkg)}</p>
            </div>
          </div>
        )}
        {pkg.category?.name && (
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-champagne mt-0.5 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-[0.6rem] tracking-luxe uppercase text-muted-foreground">Collection</p>
              <p className="text-sm text-emerald-dark font-medium">{pkg.category.name}</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <LuxuryButton to="/plan-my-journey" state={planState} className="w-full">
          Plan This Journey
        </LuxuryButton>
        <Link
          to="/contact"
          className="flex items-center justify-center w-full py-3.5 rounded-full border border-emerald-dark/20 text-xs tracking-luxe uppercase text-emerald-dark hover:border-champagne hover:bg-luxe/40 transition-all duration-500"
        >
          Speak to Concierge
        </Link>
      </div>

      <p className="text-[0.7rem] text-muted-foreground leading-relaxed text-center">
        Every itinerary is refined with you. Nothing is fixed until you approve it.
      </p>
    </div>
  );
}

function DetailLoading() {
  return (
    <div className="pb-24">
      <Skeleton className="min-h-[72vh] rounded-none" />
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    </div>
  );
}

export default function PackageDetail() {
  const { slug } = useParams();
  const { data: pkg, isLoading, isError, error } = usePackageDetail(slug);
  const { data: testimonials } = usePackageTestimonials(slug);
  const { data: cta } = useAboutPageCta();

  const [activeDay, setActiveDay] = useState(1);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  const sortedItinerary = useMemo(() => {
    if (!pkg?.itinerary) return [];
    return [...pkg.itinerary].sort(
      (a, b) => (a.dayNumber ?? 0) - (b.dayNumber ?? 0) || (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
    );
  }, [pkg]);
  const sortedGallery = useMemo(() => sortByOrder(pkg?.gallery), [pkg]);
  const sortedHighlights = useMemo(() => sortByOrder(pkg?.highlights), [pkg]);
  const sortedFaqs = useMemo(() => sortByOrder(pkg?.faqs), [pkg]);

  const heroImage = useMemo(() => {
    if (pkg?.bannerImage?.url) return buildMediaUrl(pkg.bannerImage.url);
    if (pkg?.featuredImage?.url) return buildMediaUrl(pkg.featuredImage.url);
    return FALLBACK_IMAGES[0];
  }, [pkg]);

  const activeDayData = sortedItinerary.find((d) => d.dayNumber === activeDay) || sortedItinerary[0];

  if (isLoading) return <DetailLoading />;

  if (isError || !pkg) {
    return (
      <div className="py-32 px-6 md:px-12 lg:px-20 max-w-2xl mx-auto text-center">
        <ErrorState message={error?.message || 'Package not found or failed to load.'} />
        <Link
          to="/packages"
          className="mt-8 inline-flex items-center gap-2 text-xs tracking-luxe uppercase text-emerald-dark border-b border-champagne/40 pb-1 hover:border-champagne transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to collections
        </Link>
      </div>
    );
  }

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === 0 ? sortedGallery.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === sortedGallery.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <PackageHero pkg={pkg} heroImage={heroImage} />

      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-20 bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-8 space-y-16 md:space-y-20">
            <ScrollReveal>
              <div className="space-y-5">
                <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase">About This Journey</p>
                <h2 className="font-heading text-3xl md:text-4xl text-emerald-dark leading-tight">
                  Crafted for travellers who expect more than a brochure
                </h2>
                <SectionDivider className="max-w-[120px]" />
                {pkg.description ? (
                  <div className="article-body" dangerouslySetInnerHTML={{ __html: pkg.description }} />
                ) : (
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {pkg.shortDescription ||
                      'A carefully structured itinerary designed around privacy, beauty, and time well spent.'}
                  </p>
                )}
              </div>
            </ScrollReveal>

            {sortedHighlights.length > 0 && (
              <ScrollReveal delay={0.05}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sortedHighlights.map((hl) => {
                    const Icon = getHighlightIcon(hl.icon);
                    return (
                      <div
                        key={hl.id}
                        className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-champagne/15 lux-shadow"
                      >
                        <div className="w-11 h-11 rounded-xl bg-luxe flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-champagne" strokeWidth={1.5} />
                        </div>
                        <p className="font-heading text-base text-emerald-dark leading-snug">{hl.title}</p>
                      </div>
                    );
                  })}
                </div>
              </ScrollReveal>
            )}

            {sortedItinerary.length > 0 && (
              <ScrollReveal delay={0.08}>
                <div className="space-y-8">
                  <div>
                    <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-3">Itinerary</p>
                    <h2 className="font-heading text-3xl md:text-4xl text-emerald-dark">Day by day</h2>
                    <SectionDivider className="mt-4 max-w-[120px]" />
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {sortedItinerary.map((day) => {
                      const isActive = activeDayData?.dayNumber === day.dayNumber;
                      return (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => setActiveDay(day.dayNumber)}
                          className={`shrink-0 px-5 py-3 rounded-full text-xs tracking-luxe uppercase transition-all duration-500 ${
                            isActive
                              ? 'bg-emerald-dark text-luxe shadow-md'
                              : 'bg-white border border-border text-muted-foreground hover:border-champagne hover:text-emerald-dark'
                          }`}
                        >
                          Day {day.dayNumber}
                        </button>
                      );
                    })}
                  </div>

                  <AnimatePresence mode="wait">
                    {activeDayData && (
                      <motion.div
                        key={activeDayData.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-3xl bg-white border border-champagne/15 lux-shadow p-8 md:p-10 space-y-5"
                      >
                        <div>
                          <p className="text-[0.65rem] tracking-widest-luxe uppercase text-champagne mb-2">
                            Day {activeDayData.dayNumber}
                          </p>
                          <h3 className="font-heading text-2xl md:text-3xl text-emerald-dark">{activeDayData.title}</h3>
                        </div>
                        {activeDayData.description && (
                          <p className="text-muted-foreground leading-relaxed">{activeDayData.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 pt-2">
                          {activeDayData.hotel && (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-luxe/60 text-xs text-emerald-dark">
                              <MapPin className="w-3.5 h-3.5 text-champagne" />
                              {activeDayData.hotel}
                            </span>
                          )}
                          {activeDayData.mealPlan && (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-luxe/60 text-xs text-emerald-dark">
                              <Sparkles className="w-3.5 h-3.5 text-champagne" />
                              {activeDayData.mealPlan}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            )}

            {((pkg.inclusions?.length ?? 0) > 0 || (pkg.exclusions?.length ?? 0) > 0) && (
              <ScrollReveal delay={0.1}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pkg.inclusions?.length > 0 && (
                    <div className="rounded-3xl bg-emerald-deep text-luxe p-8 md:p-9">
                      <h3 className="font-heading text-xl mb-6">Included</h3>
                      <ul className="space-y-3.5">
                        {pkg.inclusions.map((item) => (
                          <li key={item.id} className="flex gap-3 text-sm text-luxe/85">
                            <Check className="w-4 h-4 text-champagne shrink-0 mt-0.5" strokeWidth={2} />
                            <span>{item.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {pkg.exclusions?.length > 0 && (
                    <div className="rounded-3xl bg-white border border-border p-8 md:p-9">
                      <h3 className="font-heading text-xl text-emerald-dark mb-6">Not Included</h3>
                      <ul className="space-y-3.5">
                        {pkg.exclusions.map((item) => (
                          <li key={item.id} className="flex gap-3 text-sm text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-champagne/60 shrink-0 mt-2" />
                            <span>{item.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            )}
          </div>

          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28 space-y-6">
              <BookingCard pkg={pkg} />
            </div>
          </aside>
        </div>
      </section>

      {sortedGallery.length > 0 && (
        <section className="py-16 md:py-24 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-luxe/20 to-background">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-12">
                <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-3">Visual Story</p>
                <h2 className="font-heading text-3xl md:text-4xl text-emerald-dark">In pictures</h2>
                <SectionDivider className="mt-4" />
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
              {sortedGallery.map((item, index) => {
                const imageUrl = item.media?.url
                  ? buildMediaUrl(item.media.url)
                  : FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
                const isHero = index === 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    className={`group relative overflow-hidden rounded-3xl ${
                      isHero ? 'md:col-span-7 md:row-span-2 aspect-[4/3] md:aspect-auto md:min-h-[520px]' : 'md:col-span-5 aspect-[4/3]'
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={`${pkg.title} gallery ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-emerald-deep/0 group-hover:bg-emerald-deep/20 transition-colors duration-500" />
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {testimonials?.length > 0 && (
        <section className="py-16 md:py-24 px-6 md:px-12 lg:px-20 bg-background">
          <div className="max-w-3xl mx-auto text-center">
            <ScrollReveal>
              <Quote className="w-10 h-10 text-champagne/40 mx-auto mb-6" strokeWidth={1} />
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonialIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="font-heading text-2xl md:text-3xl text-emerald-dark italic leading-relaxed mb-6">
                    &ldquo;{testimonials[activeTestimonialIdx].review || testimonials[activeTestimonialIdx].title}&rdquo;
                  </p>
                  <div className="flex justify-center gap-0.5 mb-4">
                    {Array.from({ length: testimonials[activeTestimonialIdx].rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-champagne text-champagne" />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-emerald-dark">{testimonials[activeTestimonialIdx].customerName}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {testimonials[activeTestimonialIdx].customerLocation || 'Verified guest'}
                  </p>
                </motion.div>
              </AnimatePresence>
              {testimonials.length > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveTestimonialIdx(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === activeTestimonialIdx ? 'w-8 bg-champagne' : 'w-2 bg-champagne/30'
                      }`}
                      aria-label={`Show review ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </ScrollReveal>
          </div>
        </section>
      )}

      {sortedFaqs.length > 0 && (
        <section className="py-16 md:py-24 px-6 md:px-12 lg:px-20 bg-luxe/25">
          <div className="max-w-3xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-12">
                <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-3">Questions</p>
                <h2 className="font-heading text-3xl md:text-4xl text-emerald-dark">Before you enquire</h2>
                <SectionDivider className="mt-4" />
              </div>
            </ScrollReveal>

            <div className="space-y-3">
              {sortedFaqs.map((faq) => {
                const isOpen = expandedFaq === faq.id;
                return (
                  <div key={faq.id} className="rounded-2xl bg-white border border-champagne/10 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                      className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left font-heading text-emerald-dark hover:text-primary transition-colors"
                    >
                      <span className="text-base md:text-lg leading-snug">{faq.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-champagne shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 md:px-6 pb-5 md:pb-6 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 md:py-28 px-6 md:px-12 lg:px-20 bg-emerald-deep text-luxe">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <p className="font-accent text-3xl md:text-4xl text-champagne mb-4">Make it yours</p>
            <h2 className="font-heading text-4xl md:text-5xl leading-tight mb-6">
              This journey is a starting point — not a fixed product
            </h2>
            <p className="text-luxe/65 leading-relaxed mb-10 max-w-xl mx-auto">
              Tell us what matters: pace, privacy, rooms, dates. We will reshape this itinerary around how you actually
              travel.
            </p>
            <LuxuryButton
              to="/plan-my-journey"
              state={{ destination: pkg.country || '', packageTitle: pkg.title || '' }}
            >
              Begin Planning
            </LuxuryButton>
          </ScrollReveal>
        </div>
      </section>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-emerald-deep/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 text-white/80 hover:text-white p-2 rounded-full bg-white/10"
              aria-label="Close gallery"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handlePrevImage}
              className="absolute left-4 md:left-8 text-white/80 hover:text-white p-3 rounded-full bg-white/10"
              aria-label="Previous image"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img
              src={
                sortedGallery[lightboxIndex]?.media?.url
                  ? buildMediaUrl(sortedGallery[lightboxIndex].media.url)
                  : FALLBACK_IMAGES[lightboxIndex % FALLBACK_IMAGES.length]
              }
              alt="Gallery preview"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-4 md:right-8 text-white/80 hover:text-white p-3 rounded-full bg-white/10"
              aria-label="Next image"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="absolute bottom-6 text-xs tracking-luxe text-white/50">
              {lightboxIndex + 1} / {sortedGallery.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <ConciergeCTA cta={cta} />
    </>
  );
}
