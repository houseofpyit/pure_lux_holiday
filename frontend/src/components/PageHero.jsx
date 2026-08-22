  import React from 'react';
  import { motion } from 'framer-motion';
  import ScrollReveal from '@/components/ScrollReveal';
  import { ImageLogo } from '@/components/Logo';

  // Mobile-only logo shown below the hero title on every page.
  // Hidden on desktop (lg+) since the fixed nav logo already covers that.
  export default function PageHero({ title, subtitle, image, breadcrumb, isHome = false }) {
    return (
      <section className="relative h-[55vh] min-h-[380px] flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-emerald-deep/60" />
        </motion.div>
        <div className="relative z-10 text-center px-6">

          {/* Mobile-only logo. Hidden on desktop (lg+), visible on mobile. */}
          <motion.div
            className="lg:hidden mt-6 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            <ImageLogo height={64} className="mx-auto" />
          </motion.div>

          
          {breadcrumb && (
            <motion.p
              className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              {breadcrumb}
            </motion.p>
          )}
          <motion.h1
            className="font-heading text-5xl md:text-7xl lg:text-8xl text-white text-shadow-lux leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              className="text-white/80 mt-5 max-w-xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              {subtitle}
            </motion.p>
          )}

          
        </div>
      </section>
    );
  }