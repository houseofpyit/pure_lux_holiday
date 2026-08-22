import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { IMAGES } from '@/lib/images';
import { ImageLogo } from '@/components/Logo';
import { buildMediaUrl } from '@/lib/media';

// Static fallback content — shown when API has no data or is loading
const FALLBACK = {
  title: 'Journey Beyond\nthe Ordinary',
  subtitle: 'Pure Luxe Holidays',
  description: 'Curated luxury travel experiences crafted exclusively for discerning travelers.',
  buttonText: 'Explore Experiences',
  buttonUrl: '/experiences',
  secondaryButtonText: 'Plan My Journey',
  secondaryButtonUrl: '/plan-my-journey',
};

export default function Hero({ hero }) {
  // hero is passed from Home page (from useHomepage). Null/undefined = use fallback.
  const isActive = !hero || hero.isActive !== false;
  if (!isActive) return null;

  const title = hero?.title || FALLBACK.title;
  const subtitle = hero?.subtitle || FALLBACK.subtitle;
  const description = hero?.description || FALLBACK.description;
  const buttonText = hero?.buttonText || FALLBACK.buttonText;
  const buttonUrl = hero?.buttonUrl || FALLBACK.buttonUrl;
  const secondaryButtonText = hero?.secondaryButtonText || FALLBACK.secondaryButtonText;
  const secondaryButtonUrl = hero?.secondaryButtonUrl || FALLBACK.secondaryButtonUrl;

  // Resolve background images: prefer API, fall back to static / cross-device fallback
  const desktopBgImage = hero?.backgroundImage?.url
    ? buildMediaUrl(hero.backgroundImage.url)
    : IMAGES.hero;

  const mobileBgImage = hero?.mobileBackgroundImage?.url
    ? buildMediaUrl(hero.mobileBackgroundImage.url)
    : desktopBgImage;

  const overlayOpacity = hero?.overlayOpacity ?? 0.15;

  return (
    <section className="relative h-screen min-h-[700px] w-full overflow-hidden">
      {/* Background image with cinematic composition */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src={desktopBgImage}
          alt={subtitle || 'Luxury travel hero'}
          className="hidden lg:block w-full h-full object-cover object-[center_30%]"
        />
        <img
          src={mobileBgImage}
          alt={subtitle || 'Luxury travel hero'}
          className="lg:hidden w-full h-full object-cover object-[center_30%]"
        />

        {/* Layer 1: Soft top gradient — dedicated to navbar/logo visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/35" />

        {/* Layer 2: CMS overlay opacity */}
        <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />

        {/* Layer 3: Subtle radial overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0)_40%,_rgba(0,0,0,0.25)_100%)]" />

        {/* Layer 4: Bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-emerald-deep/60" />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">

        {/* Mobile-only logo */}
        <motion.div
          className="lg:hidden mt-6 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
        >
          <ImageLogo height={64} className="mx-auto" />
        </motion.div>

        {subtitle && (
          <motion.p
            className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-6 drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            {subtitle}
          </motion.p>
        )}

        <motion.h1
          className="font-heading text-5xl md:text-7xl lg:text-[5.5rem] text-white leading-[1.05] max-w-4xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          {title.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </motion.h1>

        {description && (
          <motion.p
            className="font-body text-base md:text-lg text-white/85 mt-6 max-w-xl leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.3)]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1.4 }}
          >
            {description}
          </motion.p>
        )}

        <motion.div
          className="flex flex-col sm:flex-row gap-4 mt-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.7 }}
        >
          {buttonUrl && (
            <Link
              to={buttonUrl}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-champagne to-gold text-emerald-dark text-xs font-semibold tracking-luxe uppercase shadow-lg shadow-black/20 hover:shadow-lg hover:shadow-champagne/30 transition-all duration-500"
            >
              {buttonText}
            </Link>
          )}
          {secondaryButtonUrl && (
            <Link
              to={secondaryButtonUrl}
              className="px-8 py-3.5 rounded-full border border-white/50 text-white text-xs font-semibold tracking-luxe uppercase hover:bg-white/15 transition-all duration-500 backdrop-blur-[2px]"
            >
              {secondaryButtonText}
            </Link>
          )}
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        <span className="text-[0.6rem] tracking-widest-luxe text-white/60 uppercase mb-1">Scroll to Discover</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronDown className="w-5 h-5 text-champagne drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
