import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import SectionDivider from '@/components/SectionDivider';
import { IMAGES } from '@/lib/images';
import { buildMediaUrl } from '@/lib/media';

const FALLBACK_IMAGES = [IMAGES.maldives, IMAGES.bali, IMAGES.hero, IMAGES.swiss];

function collectionHref(item) {
  const url = item.buttonUrl || '/packages';
  if (url.startsWith('/packages')) return url;
  return '/packages';
}

function CollectionCard({ item, index }) {
  const imageUrl = item.image?.url
    ? buildMediaUrl(item.image.url)
    : FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

  const href = collectionHref(item);

  return (
    <ScrollReveal delay={index * 0.12}>
      <Link
        to={href}
        className="group block relative overflow-hidden rounded-3xl aspect-[3/4] lux-shadow"
      >
        <img
          src={imageUrl}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/95 via-emerald-deep/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="font-heading text-2xl text-white mb-2">{item.title}</h3>
          {item.shortDescription && (
            <p className="text-sm text-white/70 leading-relaxed mb-3 line-clamp-2">{item.shortDescription}</p>
          )}
          <span className="inline-flex items-center gap-2 text-[0.65rem] tracking-luxe uppercase text-champagne group-hover:gap-3 transition-all duration-500">
            {item.buttonText || 'Discover'} <ArrowRight className="w-3 h-3" />
          </span>
        </div>
        <div className="absolute inset-0 rounded-3xl border border-champagne/0 group-hover:border group-hover:border-champagne/30 transition-all duration-700" />
      </Link>
    </ScrollReveal>
  );
}

export default function Collections({ collections }) {
  if (!collections) return null;
  if (collections.length === 0) return null;

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <ScrollReveal>
          <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-4">Signature Collections</p>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-emerald-dark">Curated Luxury Collections</h2>
          <SectionDivider className="mt-6" />
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {collections.map((item, i) => (
          <CollectionCard key={item.id || item.slug} item={item} index={i} />
        ))}
      </div>

      <div className="text-center mt-12">
        <ScrollReveal>
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 text-xs tracking-luxe uppercase text-emerald-dark border-b border-champagne/40 pb-1 hover:border-champagne transition-colors"
          >
            Explore All Collections <ArrowRight className="w-3 h-3" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
