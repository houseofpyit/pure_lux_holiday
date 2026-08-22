import React, { useMemo, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import SectionDivider from '@/components/SectionDivider';
import LuxuryButton from '@/components/LuxuryButton';
import ConciergeCTA from '@/components/home/ConciergeCTA';
import { LoadingState, ErrorState, EmptyState } from '@/components/state/ContentState';
import { useGallery, useGalleryPageCta } from '@/hooks/use-gallery';
import { useDestinations } from '@/hooks/use-destinations';
import { IMAGES } from '@/lib/images';
import { buildMediaUrl } from '@/lib/media';

const FALLBACK_DESTINATIONS = [
  { slug: 'all', name: 'All' },
  { slug: 'maldives', name: 'Maldives' },
  { slug: 'switzerland', name: 'Switzerland' },
  { slug: 'bali', name: 'Bali' },
  { slug: 'dubai', name: 'Dubai' },
  { slug: 'santorini', name: 'Santorini' },
];

const FALLBACK_IMAGES = [IMAGES.maldives, IMAGES.dubai, IMAGES.bali, IMAGES.swiss, IMAGES.about, IMAGES.hero];

const HERO_DEFAULT = {
  title: 'The Gallery',
  breadcrumb: 'Pure Luxe Holidays',
  subtitle: 'Every image is a world waiting to be entered. Browse by destination, or wander through the entire collection.',
  image: IMAGES.about,
};

function buildGridItems(galleryData) {
  const items = galleryData?.items || [];
  if (items.length > 0) {
    return items
      .map((item, index) => ({
        id: item.id,
        src: item.media?.url ? buildMediaUrl(item.media.url) : null,
        alt: item.media?.altText || item.description || item.title,
        title: item.title || item.albumTitle,
        destination: item.destination || item.collection || null,
        destinationName: item.categoryName || null,
        span: index % 3 === 0 ? 'tall' : '',
      }))
      .filter((item) => item.src);
  }

  const albums = galleryData?.albums || [];
  if (albums.length > 0) {
    return albums.flatMap((album, albumIndex) => {
      const destination = album.category?.slug || null;
      const cover = album.cover?.url ? buildMediaUrl(album.cover.url) : null;
      if (!cover) return [];
      return [{
        id: album.id,
        src: cover,
        alt: album.cover?.altText || album.description || album.title,
        title: album.title,
        destination,
        destinationName: album.category?.name || album.country,
        span: albumIndex % 3 === 0 ? 'tall' : '',
      }];
    });
  }

  return [];
}

function buildDestinationFilters(destinations, galleryItems) {
  const withImages = new Set(galleryItems.map((item) => item.destination).filter(Boolean));
  const list = [{ slug: 'all', name: 'All' }];

  if (destinations?.length) {
    for (const dest of destinations) {
      if (withImages.has(dest.slug) || withImages.size === 0) {
        list.push({ slug: dest.slug, name: dest.name });
      }
    }
    return list;
  }

  const seen = new Set(['all']);
  for (const item of galleryItems) {
    if (item.destination && !seen.has(item.destination)) {
      seen.add(item.destination);
      list.push({ slug: item.destination, name: item.destinationName || item.destination });
    }
  }

  if (list.length === 1) return FALLBACK_DESTINATIONS;
  return list;
}

function getDestinationImage(dest, index) {
  return dest?.image?.url ? buildMediaUrl(dest.image.url) : FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

function DestinationFilterBar({ filters, activeDestination, onSelect }) {
  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 py-5 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <p className="text-[0.65rem] tracking-luxe uppercase text-muted-foreground mb-3 text-center md:text-left">
          Browse by destination
        </p>
        <div className="flex flex-wrap gap-2.5 justify-center md:justify-start">
          {filters.map((dest) => (
            <button
              key={dest.slug}
              type="button"
              onClick={() => onSelect(dest.slug)}
              className={`px-5 py-2.5 rounded-full text-xs tracking-luxe uppercase transition-all duration-500 ${
                activeDestination === dest.slug
                  ? 'bg-emerald-dark text-luxe shadow-md'
                  : 'border border-border bg-white text-muted-foreground hover:border-champagne hover:text-emerald-dark'
              }`}
            >
              {dest.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function GalleryMasonry({ items, onOpenLightbox }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No images for this destination"
        message="Try another filter or browse all destinations."
      />
    );
  }

  return (
    <motion.div
      layout
      className="columns-1 sm:columns-2 lg:columns-3 gap-5 max-w-7xl mx-auto space-y-5"
    >
      <AnimatePresence>
        {items.map((img, i) => (
          <motion.div
            key={img.id}
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.6, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            className="break-inside-avoid mb-5 cursor-pointer"
            onClick={() => onOpenLightbox({ src: img.src, alt: img.alt, title: img.title })}
          >
            <div className="group relative overflow-hidden rounded-2xl lux-shadow">
              <motion.img
                src={img.src}
                alt={img.alt}
                className={`w-full object-cover ${img.span === 'tall' ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/80 via-emerald-deep/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-6">
                {img.destinationName && (
                  <p className="font-body text-[0.6rem] tracking-widest-luxe text-champagne uppercase mb-1">
                    {img.destinationName}
                  </p>
                )}
                <p className="font-heading text-2xl text-white">{img.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

function DestinationHero({ destination, imageCount, heroImage }) {
  return (
    <section className="relative min-h-[50vh] flex items-end overflow-hidden">
      <img src={heroImage} alt={destination.name} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep via-emerald-deep/60 to-emerald-deep/30" />
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 pb-14 pt-28">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-[0.65rem] tracking-luxe uppercase text-white/70 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Destinations
          </Link>
          <p className="text-[0.65rem] tracking-widest-luxe uppercase text-champagne mb-3">Destination</p>
          <h1 className="font-heading text-4xl md:text-6xl text-white leading-tight text-shadow-lux mb-4 max-w-3xl">
            {destination.name}
          </h1>
          {destination.shortDescription && (
            <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-2xl mb-4">
              {destination.shortDescription}
            </p>
          )}
          {imageCount > 0 && (
            <p className="text-white/60 text-sm">
              {imageCount} {imageCount === 1 ? 'image' : 'images'}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function PageHeroDefault({ image }) {
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

function DestinationSection({ destination, items, index, onViewAll }) {
  const imageUrl = getDestinationImage(destination, index);
  const preview = items.slice(0, 4);

  return (
    <ScrollReveal delay={index * 0.06}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div className={`lg:col-span-4 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
          <button
            type="button"
            onClick={() => onViewAll(destination.slug)}
            className="group block relative overflow-hidden rounded-3xl aspect-[4/5] w-full text-left lux-shadow"
          >
            <img
              src={imageUrl}
              alt={destination.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/90 via-emerald-deep/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="text-[0.6rem] tracking-widest-luxe uppercase text-champagne mb-2">Destination</p>
              <h3 className="font-heading text-3xl text-white mb-2">{destination.name}</h3>
              {destination.shortDescription && (
                <p className="text-sm text-white/75 leading-relaxed line-clamp-2">{destination.shortDescription}</p>
              )}
            </div>
          </button>
        </div>

        <div className={`lg:col-span-8 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
          <div className="mb-6">
            <p className="text-xs tracking-luxe uppercase text-muted-foreground mb-2">
              {items.length} {items.length === 1 ? 'image' : 'images'}
            </p>
            <h3 className="font-heading text-2xl md:text-3xl text-emerald-dark">{destination.name}</h3>
            <SectionDivider className="mt-4 max-w-[100px]" />
          </div>

          {preview.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {preview.map((img) => (
                <div key={img.id} className="relative overflow-hidden rounded-xl aspect-[3/4] lux-shadow">
                  <img src={img.src} alt={img.alt} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Images coming soon.</p>
          )}

          <button
            type="button"
            onClick={() => onViewAll(destination.slug)}
            className="inline-flex items-center gap-2 mt-6 text-xs tracking-luxe uppercase text-emerald-dark border-b border-champagne/40 pb-1 hover:border-champagne transition-colors"
          >
            View all {destination.name} images
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </ScrollReveal>
  );
}

export default function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeDestination = searchParams.get('destination') || 'all';
  const { data: galleryData, isLoading, isError, error } = useGallery();
  const { data: destinations } = useDestinations();
  const { data: cta } = useGalleryPageCta();
  const [lightbox, setLightbox] = useState(null);

  const galleryItems = useMemo(() => buildGridItems(galleryData), [galleryData]);

  const destinationFilters = useMemo(
    () => buildDestinationFilters(destinations, galleryItems),
    [destinations, galleryItems],
  );

  const itemsByDestination = useMemo(() => {
    const map = {};
    for (const item of galleryItems) {
      const slug = item.destination;
      if (!slug) continue;
      if (!map[slug]) map[slug] = [];
      map[slug].push(item);
    }
    return map;
  }, [galleryItems]);

  const filteredItems = useMemo(() => {
    if (activeDestination === 'all') return galleryItems;
    return galleryItems.filter((img) => img.destination === activeDestination);
  }, [activeDestination, galleryItems]);

  const activeDestMeta = useMemo(
    () => destinations?.find((d) => d.slug === activeDestination) || null,
    [destinations, activeDestination],
  );

  const activeDestName = destinationFilters.find((d) => d.slug === activeDestination)?.name;
  const isDestinationView = activeDestination !== 'all';

  const setActiveDestination = useCallback(
    (slug) => {
      const next = new URLSearchParams(searchParams);
      if (slug === 'all') next.delete('destination');
      else next.set('destination', slug);
      setSearchParams(next, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [searchParams, setSearchParams],
  );

  const orderedDestinations = useMemo(() => {
    if (!destinations?.length) {
      return Object.keys(itemsByDestination).map((slug) => ({
        slug,
        name: itemsByDestination[slug][0]?.destinationName || slug,
        shortDescription: '',
        image: null,
      }));
    }
    return [...destinations]
      .filter((d) => (itemsByDestination[d.slug]?.length ?? 0) > 0)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [destinations, itemsByDestination]);

  const heroImage = isDestinationView
    ? getDestinationImage(activeDestMeta, orderedDestinations.findIndex((d) => d.slug === activeDestination))
    : galleryItems[0]?.src || HERO_DEFAULT.image;

  return (
    <>
      {isDestinationView ? (
        <DestinationHero
          destination={activeDestMeta || { name: activeDestName, shortDescription: '' }}
          imageCount={filteredItems.length}
          heroImage={heroImage}
        />
      ) : (
        <PageHeroDefault image={heroImage} />
      )}

      {!isLoading && !isError && destinationFilters.length > 1 && (
        <DestinationFilterBar
          filters={destinationFilters}
          activeDestination={activeDestination}
          onSelect={setActiveDestination}
        />
      )}

      {isLoading && (
        <section className="px-6 md:px-12 lg:px-20 pb-32">
          <LoadingState lines={6} />
        </section>
      )}

      {isError && (
        <section className="px-6 md:px-12 lg:px-20 pb-32">
          <ErrorState message={error?.message} />
        </section>
      )}

      {!isLoading && !isError && isDestinationView && (
        <section className="py-16 md:py-24 px-6 md:px-12 lg:px-20 bg-background">
          <GalleryMasonry items={filteredItems} onOpenLightbox={setLightbox} />
        </section>
      )}

      {!isLoading && !isError && !isDestinationView && (
        <>
          <section className="py-16 md:py-20 px-6 md:px-12 lg:px-20 bg-background">
            <div className="max-w-3xl mx-auto text-center">
              <ScrollReveal>
                <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-4">All Destinations</p>
                <h2 className="font-heading text-4xl md:text-5xl text-emerald-dark mb-6">Every Frame, A Place</h2>
                <SectionDivider className="mb-6" />
                <p className="text-muted-foreground leading-relaxed">
                  From Maldivian lagoons to alpine villages — browse the full gallery below, or jump straight into a
                  destination.
                </p>
              </ScrollReveal>
            </div>
          </section>

          {galleryItems.length > 0 && (
            <section className="px-6 md:px-12 lg:px-20 pb-20 bg-background">
              <ScrollReveal>
                <GalleryMasonry items={galleryItems} onOpenLightbox={setLightbox} />
              </ScrollReveal>
            </section>
          )}

          {orderedDestinations.length > 0 && (
            <section className="pb-24 md:pb-32 px-6 md:px-12 lg:px-20 bg-background space-y-24 md:space-y-28">
              {orderedDestinations.map((dest, index) => (
                <DestinationSection
                  key={dest.slug || dest.id}
                  destination={dest}
                  items={itemsByDestination[dest.slug] || []}
                  index={index}
                  onViewAll={setActiveDestination}
                />
              ))}
            </section>
          )}
        </>
      )}

      {!isLoading && !isError && galleryItems.length > 0 && (
        <section className="py-20 md:py-28 px-6 md:px-12 lg:px-20 bg-emerald-deep text-luxe">
          <div className="max-w-3xl mx-auto text-center">
            <ScrollReveal>
              <p className="font-accent text-3xl md:text-4xl text-champagne mb-4">Your Next Story</p>
              <h2 className="font-heading text-4xl md:text-5xl leading-tight mb-6">
                {isDestinationView ? `Ready to visit ${activeDestName}?` : 'Inspired By What You See?'}
              </h2>
              <p className="text-luxe/65 leading-relaxed mb-10 max-w-xl mx-auto">
                Every image in this gallery is a destination we know intimately. When you are ready to step inside one
                of them, we are ready to plan every detail.
              </p>
              <LuxuryButton to="/plan-my-journey">Plan My Journey</LuxuryButton>
            </ScrollReveal>
          </div>
        </section>
      )}

      <ConciergeCTA cta={cta} />

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[100] bg-emerald-deep/95 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              className="relative max-w-5xl w-full"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightbox.src}
                alt={lightbox.alt}
                className="w-full max-h-[80vh] object-contain rounded-2xl"
              />
              <div className="flex items-center justify-between mt-4 px-1">
                <div>
                  <p className="font-body text-[0.6rem] tracking-widest-luxe text-champagne uppercase">{lightbox.alt}</p>
                  <p className="font-heading text-2xl text-luxe">{lightbox.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white/50 transition-colors"
                  aria-label="Close lightbox"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
