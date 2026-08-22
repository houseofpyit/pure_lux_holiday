import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';
import { IMAGES } from '@/lib/images';
import { buildMediaUrl } from '@/lib/media';

const FALLBACK = {
  title: 'Ready to Begin Your\nExtraordinary Journey?',
  subtitle: 'Your Journey Awaits',
  buttonText: 'Plan My Journey',
  buttonUrl: '/plan-my-journey',
  description: "Let our travel specialists craft a bespoke itinerary tailored to your dreams. Because the world's most extraordinary experiences begin with a single conversation.",
};

function CtaButton({ href, children }) {
  const isExternal = /^https?:\/\//i.test(href || '');
  const className = 'inline-flex items-center px-10 py-4 rounded-full bg-gradient-to-r from-champagne to-gold text-emerald-dark text-xs font-semibold tracking-luxe uppercase hover:shadow-2xl hover:shadow-champagne/30 transition-all duration-500';

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link to={href || FALLBACK.buttonUrl} className={className}>
      {children}
    </Link>
  );
}

export default function ConciergeCTA({ cta }) {
  if (cta && cta.isActive === false) return null;

  const title = cta?.title || FALLBACK.title;
  const subtitle = cta?.subtitle || FALLBACK.subtitle;
  const buttonText = cta?.buttonText || FALLBACK.buttonText;
  const buttonUrl = cta?.buttonUrl || FALLBACK.buttonUrl;
  const bgImage = cta?.backgroundImage?.url
    ? buildMediaUrl(cta.backgroundImage.url)
    : IMAGES.cta;

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
      >
        <img src={bgImage} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-emerald-deep/70" />
      </motion.div>

      <div className="relative z-10 text-center px-6 max-w-3xl py-24">
        <ScrollReveal>
          {subtitle && (
            <p className="font-accent text-3xl md:text-4xl text-champagne mb-4">{subtitle}</p>
          )}
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-luxe leading-tight mb-6">
            {title.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </React.Fragment>
            ))}
          </h2>
          <p className="text-luxe/70 leading-relaxed mb-10 max-w-xl mx-auto">
            {FALLBACK.description}
          </p>
          <CtaButton href={buttonUrl}>{buttonText}</CtaButton>
        </ScrollReveal>
      </div>
    </section>
  );
}
