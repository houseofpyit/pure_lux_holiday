import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, X, Star, Quote, ArrowRight } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import SectionDivider from '@/components/SectionDivider';
import { IMAGES } from '@/lib/images';
import { buildMediaUrl } from '@/lib/media';

const FALLBACK_IMAGES = [IMAGES.maldives, IMAGES.swiss, IMAGES.bali, IMAGES.dubai];
const EASE_LUX = [0.22, 1, 0.36, 1];

function formatTravelDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).getFullYear().toString();
  } catch {
    return null;
  }
}

export default function ClientTestimonials({ testimonials }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);

  // Nothing to render if no testimonials passed
  if (!testimonials || testimonials.length === 0) return null;

  const active = testimonials[activeIdx];

  const hasVideo = Boolean(active.video?.url);
  const videoUrl = hasVideo ? buildMediaUrl(active.video.url) : null;
  const videoPoster = active.videoThumbnail?.url
    ? buildMediaUrl(active.videoThumbnail.url)
    : active.backgroundImage?.url
      ? buildMediaUrl(active.backgroundImage.url)
      : null;

  const bgImage = active.backgroundImage?.url
    ? buildMediaUrl(active.backgroundImage.url)
    : FALLBACK_IMAGES[activeIdx % FALLBACK_IMAGES.length];

  const avatarUrl = (active.profileImage?.url || active.customerPhoto?.url)
    ? buildMediaUrl(active.profileImage?.url || active.customerPhoto.url)
    : null;

  const year = formatTravelDate(active.travelDate);
  const detail = active.customerDesignation || active.customerLocation || '';

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-4">
              Client Stories
            </p>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-emerald-dark">
              Voices of Our Travelers
            </h2>
            <SectionDivider className="mt-6" />
          </div>
        </ScrollReveal>

        {/* Main testimonial */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">

          {/* Left: image / video */}
          <ScrollReveal delay={0.1}>
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${active.id}-${videoPlaying ? 'video' : 'image'}`}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.8, ease: EASE_LUX }}
                  className="relative overflow-hidden rounded-3xl lux-shadow cursor-pointer group"
                  onClick={() => hasVideo && setVideoPlaying(!videoPlaying)}
                >
                  {!videoPlaying ? (
                    <>
                      <img
                        src={bgImage}
                        alt={detail || active.customerName}
                        className="w-full aspect-[4/3] object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/60 via-transparent to-transparent" />

                      {/* Play button — only show if uploaded video exists */}
                      {hasVideo && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center"
                          >
                            <Play className="w-7 h-7 text-white fill-white ml-1" />
                          </motion.div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="relative w-full aspect-[4/3]">
                      <video
                        src={videoUrl}
                        poster={videoPoster || undefined}
                        autoPlay
                        controls
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); setVideoPlaying(false); }}
                        className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/70 transition-colors"
                        aria-label="Close video"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {!videoPlaying && (
                    <div className="absolute bottom-6 left-6">
                      {detail && (
                        <p className="text-[0.6rem] tracking-widest-luxe text-champagne uppercase mb-1">{detail}</p>
                      )}
                      {year && (
                        <p className="font-heading text-white text-xl">{year}</p>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Floating avatar card */}
              {avatarUrl && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`avatar-${active.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, ease: EASE_LUX }}
                    className="absolute -bottom-6 -right-4 md:-right-8 bg-white rounded-2xl p-4 lux-shadow flex items-center gap-3"
                  >
                    <img
                      src={avatarUrl}
                      alt={active.customerName}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-champagne/30"
                    />
                    <div>
                      <p className="font-body text-xs font-semibold text-emerald-dark leading-tight">
                        {active.customerName}
                      </p>
                      <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: active.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 fill-champagne text-champagne" />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </ScrollReveal>

          {/* Right: quote */}
          <ScrollReveal delay={0.2}>
            <div>
              <Quote className="w-10 h-10 text-champagne/30 mb-6" />

              <div className="min-h-[180px]">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`quote-${active.id}`}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.7, ease: EASE_LUX }}
                    className="font-heading text-2xl md:text-3xl lg:text-4xl text-emerald-dark leading-snug italic mb-8"
                  >
                    "{active.review || active.title || ''}"
                  </motion.p>
                </AnimatePresence>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`meta-${active.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="w-10 h-px bg-champagne mb-4" />
                  <p className="font-body text-sm font-semibold text-emerald-dark">
                    {active.customerName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {[detail, year].filter(Boolean).join(' · ')}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Selector: avatar thumbnails or dots */}
              <div className="flex items-center gap-3 mt-10">
                {testimonials.map((t, i) => {
                  const thumbUrl = (t.profileImage?.url || t.customerPhoto?.url)
                    ? buildMediaUrl(t.profileImage?.url || t.customerPhoto.url)
                    : null;
                  return (
                    <button
                      key={t.id}
                      onClick={() => { setActiveIdx(i); setVideoPlaying(false); }}
                      className="group flex items-center gap-2 focus:outline-none"
                      aria-label={`View testimonial from ${t.customerName}`}
                    >
                      <motion.div
                        animate={i === activeIdx ? { scale: 1 } : { scale: 0.85 }}
                        transition={{ duration: 0.3 }}
                      >
                        {thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt={t.customerName}
                            className={`w-9 h-9 rounded-full object-cover transition-all duration-500 ${
                              i === activeIdx
                                ? 'border-2 border-champagne opacity-100'
                                : 'border border-champagne/20 opacity-50 group-hover:opacity-80'
                            }`}
                          />
                        ) : (
                          <div
                            className={`w-9 h-9 rounded-full bg-champagne/20 flex items-center justify-center transition-all duration-500 ${
                              i === activeIdx ? 'border-2 border-champagne' : 'border border-champagne/20 opacity-50'
                            }`}
                          >
                            <span className="text-[0.55rem] font-semibold text-champagne uppercase">
                              {t.customerName?.charAt(0) || '?'}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    </button>
                  );
                })}

                <Link
                  to="/testimonials"
                  className="ml-2 inline-flex items-center gap-1.5 text-[0.65rem] tracking-luxe uppercase text-muted-foreground hover:text-emerald-dark border-b border-transparent hover:border-champagne/40 pb-px transition-all duration-300"
                >
                  All Stories <ArrowRight className="w-2.5 h-2.5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>

      </div>
    </section>
  );
}
