import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, Play, X, Compass } from 'lucide-react';
import PageHero from '@/components/PageHero';
import ScrollReveal from '@/components/ScrollReveal';
import SectionDivider from '@/components/SectionDivider';
import { LoadingState, ErrorState } from '@/components/state/ContentState';
import { useTestimonialsPage } from '@/hooks/use-testimonials-page';
import ConciergeCTA from '@/components/home/ConciergeCTA';
import { IMAGES } from '@/lib/images';
import { buildMediaUrl } from '@/lib/media';

const FALLBACK_IMAGES = [
  IMAGES.maldives,
  IMAGES.swiss,
  IMAGES.bali,
  IMAGES.dubai,
  IMAGES.about,
  IMAGES.hero
];

function formatTravelDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).getFullYear().toString();
  } catch {
    return null;
  }
}

export default function Testimonials() {
  const { data: testimonialsData, isLoading, isError, error } = useTestimonialsPage();
  const [playingVideoUrl, setPlayingVideoUrl] = useState(null);

  const testimonials = useMemo(() => {
    return testimonialsData?.all || [];
  }, [testimonialsData]);

  const featured = useMemo(() => {
    return testimonialsData?.featured?.length ? testimonialsData.featured : testimonials.slice(0, 1);
  }, [testimonialsData, testimonials]);

  const standard = useMemo(() => {
    const featuredIds = new Set(featured.map(t => t.id));
    return testimonials.filter(t => !featuredIds.has(t.id));
  }, [testimonials, featured]);

  const heroImage = useMemo(() => {
    if (featured[0]?.backgroundImage?.url) return buildMediaUrl(featured[0].backgroundImage.url);
    return IMAGES.hero;
  }, [featured]);

  return (
    <>
      <PageHero
        title="Travel Stories"
        breadcrumb="Voices of Pure Luxe"
        subtitle="Unfiltered feedback and personal journals from our distinguished guests around the globe."
        image={heroImage}
      />

      {/* Featured Testimonial Spotlight */}
      {!isLoading && !isError && featured.length > 0 && (
        <section className="py-24 px-6 md:px-12 lg:px-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-16">
                <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-4">Spotlight Story</p>
                <h2 className="font-heading text-4xl md:text-5xl text-emerald-dark">Featured Guest Review</h2>
                <SectionDivider className="mt-4" />
              </div>
            </ScrollReveal>

            {featured.map((t, idx) => {
              const bgImg = t.backgroundImage?.url ? buildMediaUrl(t.backgroundImage.url) : FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
              const avatar = (t.profileImage?.url || t.customerPhoto?.url) ? buildMediaUrl(t.profileImage?.url || t.customerPhoto.url) : null;
              const hasVideo = Boolean(t.video?.url);
              const detail = t.customerDesignation || t.customerLocation || 'Verified Guest';
              const year = formatTravelDate(t.travelDate);

              return (
                <ScrollReveal key={t.id} delay={0.1}>
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-3xl overflow-hidden shadow-lux lux-shadow-lg border border-champagne/10">
                    {/* Media Left */}
                    <div className="relative lg:col-span-3 min-h-[380px] bg-slate-900 group overflow-hidden">
                      <img
                        src={bgImg}
                        alt={t.customerName}
                        className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/90 via-emerald-deep/25 to-transparent" />

                      {hasVideo && (
                        <button
                          onClick={() => setPlayingVideoUrl(buildMediaUrl(t.video.url))}
                          className="absolute inset-0 flex items-center justify-center group focus:outline-none"
                          aria-label="Play testimonial video"
                        >
                          <motion.div
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-lg"
                          >
                            <Play className="w-6 h-6 text-white fill-white ml-1" />
                          </motion.div>
                        </button>
                      )}

                      <div className="absolute bottom-8 left-8">
                        <span className="text-[0.65rem] tracking-widest-luxe text-champagne uppercase font-semibold font-body">Featured Traveler</span>
                        <h3 className="font-heading text-white text-3xl mt-1">{t.customerName}</h3>
                        <p className="text-xs text-white/70 font-body mt-0.5">{detail}</p>
                      </div>
                    </div>

                    {/* Content Right */}
                    <div className="lg:col-span-2 bg-luxe/10 p-10 md:p-14 flex flex-col justify-center relative">
                      <Quote className="w-12 h-12 text-champagne/25 absolute top-10 left-10" />
                      <div className="relative z-10 space-y-6">
                        <div className="flex gap-0.5">
                          {Array.from({ length: t.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-champagne text-champagne" />
                          ))}
                        </div>
                        <h4 className="font-heading text-2xl text-emerald-dark leading-tight italic">
                          "{t.title || 'An Unforgettable Journey'}"
                        </h4>
                        <p className="text-muted-foreground leading-relaxed text-sm md:text-base font-body">
                          {t.review}
                        </p>
                        <div className="w-10 h-px bg-champagne pt-4" />
                        <div className="flex items-center gap-3">
                          {avatar && (
                            <img src={avatar} alt={t.customerName} className="w-10 h-10 rounded-full object-cover border border-champagne/30" />
                          )}
                          <div>
                            <span className="block font-heading text-xs uppercase text-emerald-dark tracking-wider leading-none">{t.customerName}</span>
                            {year && (
                              <span className="block text-[0.65rem] text-muted-foreground mt-0.5 font-body">Traveled in {year}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      )}

      {/* Testimonial Portfolio Grid */}
      <section className="py-20 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-white to-luxe/20 border-t border-champagne/10">
        <div className="max-w-7xl mx-auto">
          {isLoading && <LoadingState lines={10} />}
          {isError && <ErrorState message={error?.message || 'Failed to load guest reviews.'} />}

          {!isLoading && !isError && testimonials.length === 0 && (
            <div className="text-center py-12 max-w-xl mx-auto">
              <p className="font-heading text-2xl text-emerald-dark mb-2">No reviews available</p>
              <p className="text-muted-foreground">We will share stories from our guests here soon.</p>
            </div>
          )}

          {!isLoading && !isError && standard.length > 0 && (
            <>
              <ScrollReveal>
                <div className="text-center mb-16">
                  <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-4 font-semibold">Guest Ledger</p>
                  <h2 className="font-heading text-3xl md:text-4xl text-emerald-dark">More Stories of Wanderlust</h2>
                  <SectionDivider className="mt-4" />
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {standard.map((t, idx) => {
                  const bgImg = t.backgroundImage?.url ? buildMediaUrl(t.backgroundImage.url) : FALLBACK_IMAGES[(idx + featured.length) % FALLBACK_IMAGES.length];
                  const avatar = (t.profileImage?.url || t.customerPhoto?.url) ? buildMediaUrl(t.profileImage?.url || t.customerPhoto.url) : null;
                  const hasVideo = Boolean(t.video?.url);
                  const detail = t.customerDesignation || t.customerLocation || 'Verified Guest';
                  const year = formatTravelDate(t.travelDate);

                  return (
                    <ScrollReveal key={t.id} delay={idx * 0.05}>
                      <div className="group relative rounded-3xl overflow-hidden lux-shadow h-full flex flex-col justify-between bg-white border border-champagne/5">
                        {/* Image Header */}
                        <div className="h-56 relative overflow-hidden bg-slate-900 shrink-0">
                          <img
                            src={bgImg}
                            alt={t.customerName}
                            className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/80 via-emerald-deep/15 to-transparent" />

                          {hasVideo && (
                            <button
                              onClick={() => setPlayingVideoUrl(buildMediaUrl(t.video.url))}
                              className="absolute inset-0 flex items-center justify-center focus:outline-none"
                              aria-label="Play video"
                            >
                              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-md hover:scale-105 transition-all">
                                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                              </div>
                            </button>
                          )}

                          <div className="absolute bottom-4 left-6">
                            <span className="text-[0.55rem] tracking-widest-luxe text-champagne uppercase font-body font-semibold">Guest review</span>
                          </div>
                        </div>

                        {/* Review Content */}
                        <div className="p-8 flex-grow flex flex-col justify-between space-y-6">
                          <div className="space-y-4">
                            <div className="flex gap-0.5">
                              {Array.from({ length: t.rating || 5 }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-champagne text-champagne" />
                              ))}
                            </div>
                            <h3 className="font-heading text-lg text-emerald-dark leading-tight italic">
                              "{t.title || 'An Extraordinary Experience'}"
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed font-body line-clamp-4">
                              {t.review}
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="w-full h-px bg-champagne/10" />
                            <div className="flex items-center gap-3">
                              {avatar ? (
                                <img src={avatar} alt={t.customerName} className="w-9 h-9 rounded-full object-cover border border-champagne/30" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-champagne/10 border border-champagne/20 flex items-center justify-center font-heading text-xs text-champagne uppercase shrink-0">
                                  {t.customerName.charAt(0)}
                                </div>
                              )}
                              <div>
                                <span className="block font-heading text-xs uppercase text-emerald-dark tracking-wider leading-none">{t.customerName}</span>
                                <span className="block text-[0.6rem] text-muted-foreground mt-0.5 font-body">
                                  {[detail, year].filter(Boolean).join(' · ')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Video Lightbox Modal */}
      <AnimatePresence>
        {playingVideoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setPlayingVideoUrl(null)}
          >
            <button
              onClick={() => setPlayingVideoUrl(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-300"
              aria-label="Close video player"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
              <video
                src={playingVideoUrl}
                autoPlay
                controls
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConciergeCTA />
    </>
  );
}
