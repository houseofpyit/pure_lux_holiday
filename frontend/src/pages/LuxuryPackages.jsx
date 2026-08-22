import React, { useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import LuxuryButton from '@/components/LuxuryButton';
import ConciergeCTA from '@/components/home/ConciergeCTA';
import { ErrorState, EmptyState } from '@/components/state/ContentState';
import { Skeleton } from '@/components/ui/skeleton';
import { usePackages, usePackagesPageCta, usePackagesCollections } from '@/hooks/use-packages';
import { IMAGES } from '@/lib/images';
import { buildMediaUrl } from '@/lib/media';

const FALLBACK_IMAGES = [IMAGES.maldives, IMAGES.dubai, IMAGES.bali, IMAGES.swiss, IMAGES.about, IMAGES.hero];

const CATEGORY_ORDER = ['signature-escapes', 'honeymoon', 'wellness-retreats', 'adventure-safaris'];

const PAGE_DEFAULTS = {
  title: 'Luxury Packages',
  breadcrumb: 'Curated Collections',
  subtitle:
    'Meticulously assembled journeys for the discerning traveller. Each one a masterpiece of planning, place, and timing.',
  image: IMAGES.dubai,
};

function formatDuration(pkg) {
  if (!pkg) return 'Bespoke';
  if (pkg.durationNights > 0) return `${pkg.durationNights} Nights`;
  if (pkg.durationDays > 0) return `${pkg.durationDays} Days`;
  return 'Bespoke';
}

function formatLocation(pkg) {
  if (!pkg) return '';
  const parts = [pkg.city, pkg.country].filter(Boolean);
  return parts.join(' · ');
}

function formatPrice(pkg) {
  if (!pkg || pkg.startingPrice == null) return null;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: pkg.currency || 'USD',
      maximumFractionDigits: 0,
    }).format(pkg.startingPrice);
  } catch {
    return `${pkg.currency || 'USD'} ${pkg.startingPrice}`;
  }
}

function getPackageImage(pkg, index = 0) {
  if (!pkg) return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  return pkg.featuredImage?.url
    ? buildMediaUrl(pkg.featuredImage.url)
    : FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

function getCollectionImage(collection, index) {
  return collection?.image?.url
    ? buildMediaUrl(collection.image.url)
    : FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

function getPackageTagline(pkg) {
  return (pkg.category?.name || 'Luxury Journey').toUpperCase();
}

function CollectionFilterBar({ categories, activeCategory, onSelect }) {
  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 py-5 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <p className="text-[0.65rem] tracking-luxe uppercase text-muted-foreground mb-3 text-center md:text-left">
          Browse by collection
        </p>
        <div className="flex flex-wrap gap-2.5 justify-center md:justify-start">
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => onSelect(c.slug)}
              className={`px-5 py-2.5 rounded-full text-xs tracking-luxe uppercase transition-all duration-500 ${
                activeCategory === c.slug
                  ? 'bg-emerald-dark text-luxe shadow-md'
                  : 'border border-border bg-white text-muted-foreground hover:border-champagne hover:text-emerald-dark'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PackageGridCard({ pkg, index }) {
  const imageUrl = getPackageImage(pkg, index);
  const price = formatPrice(pkg);
  const location = formatLocation(pkg);

  return (
    <Link
      to={`/packages/${pkg.slug}`}
      className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden lux-shadow border border-champagne/10 hover:border-champagne/35 transition-all duration-500"
    >
      <div className="relative aspect-[4/3] overflow-hidden shrink-0">
        <img
          src={imageUrl}
          alt={pkg.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
        />
        {pkg.isFeatured && (
          <span className="absolute top-4 left-4 text-[0.6rem] tracking-widest-luxe uppercase bg-luxe/95 text-emerald-dark px-3 py-1.5 rounded-full">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-6 md:p-7">
        <p className="text-[0.65rem] tracking-widest-luxe uppercase text-champagne mb-3">
          {getPackageTagline(pkg)}
        </p>

        <h3 className="font-heading text-2xl text-emerald-dark leading-tight mb-4 group-hover:text-primary transition-colors">
          {pkg.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-champagne shrink-0" strokeWidth={1.5} />
            {formatDuration(pkg)}
          </span>
          {location && (
            <>
              <span className="text-border hidden sm:inline">|</span>
              <span>{location}</span>
            </>
          )}
        </div>

        {price && (
          <p className="font-heading text-base text-emerald-dark mb-5 mt-auto">
            From {price} per couple
          </p>
        )}

        <span className="inline-flex items-center gap-2 text-[0.65rem] tracking-luxe uppercase text-emerald-dark border-b border-emerald-dark/25 pb-0.5 w-fit group-hover:border-champagne group-hover:text-champagne transition-colors">
          View Package
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

function CollectionHero({ collection, packageCount, heroImage }) {
  return (
    <section className="relative min-h-[50vh] flex items-end overflow-hidden">
      <img src={heroImage} alt={collection.title} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep via-emerald-deep/60 to-emerald-deep/30" />

      <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 pb-14 pt-28">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 text-[0.65rem] tracking-luxe uppercase text-white/70 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Packages
          </Link>
          <p className="text-[0.65rem] tracking-widest-luxe uppercase text-champagne mb-3">Collection</p>
          <h1 className="font-heading text-4xl md:text-6xl text-white leading-tight text-shadow-lux mb-4 max-w-3xl">
            {collection.title}
          </h1>
          {collection.shortDescription && (
            <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-2xl mb-6">
              {collection.shortDescription}
            </p>
          )}
          {packageCount > 0 && (
            <p className="text-white/60 text-sm">
              {packageCount} {packageCount === 1 ? 'package' : 'packages'}
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
      <img src={image} alt={PAGE_DEFAULTS.title} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep via-emerald-deep/55 to-emerald-deep/25" />
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 pb-14 pt-28 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-[0.65rem] tracking-widest-luxe uppercase text-champagne mb-4">{PAGE_DEFAULTS.breadcrumb}</p>
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl text-white leading-tight text-shadow-lux mb-5">
            {PAGE_DEFAULTS.title}
          </h1>
          <p className="text-white/80 text-base md:text-lg leading-relaxed">{PAGE_DEFAULTS.subtitle}</p>
        </div>
      </div>
    </section>
  );
}

function PackageGrid({ packages }) {
  if (packages.length === 0) {
    return (
      <EmptyState
        title="No packages available"
        message="Check back soon or speak to our concierge to design a bespoke journey."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {packages.map((pkg, i) => (
        <ScrollReveal key={pkg.id} delay={i * 0.04}>
          <PackageGridCard pkg={pkg} index={i} />
        </ScrollReveal>
      ))}
    </div>
  );
}

function PackagesLoadingSkeleton() {
  return (
    <div className="pb-24 bg-background">
      <Skeleton className="min-h-[50vh] rounded-none" />
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[480px] rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LuxuryPackages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('collection') || 'all';
  const { data, isLoading, isError, error } = usePackages();
  const { data: collections } = usePackagesCollections();
  const { data: cta } = usePackagesPageCta();

  const setActiveCategory = useCallback(
    (slug) => {
      const next = new URLSearchParams(searchParams);
      if (slug === 'all') next.delete('collection');
      else next.set('collection', slug);
      setSearchParams(next, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [searchParams, setSearchParams],
  );

  const categories = useMemo(() => {
    const list = [{ slug: 'all', name: 'All' }];
    const seen = new Set(['all']);

    for (const slug of CATEGORY_ORDER) {
      const fromCms = collections?.find((c) => c.slug === slug);
      const fromPkg = (data?.all || []).find((p) => p.category?.slug === slug)?.category;
      const item = fromCms
        ? { slug: fromCms.slug, name: fromCms.title }
        : fromPkg
          ? { slug: fromPkg.slug, name: fromPkg.name }
          : null;
      if (item && !seen.has(item.slug)) {
        seen.add(item.slug);
        list.push(item);
      }
    }

    for (const pkg of data?.all || []) {
      const cat = pkg.category;
      if (cat?.slug && cat?.name && !seen.has(cat.slug)) {
        seen.add(cat.slug);
        list.push({ slug: cat.slug, name: cat.name });
      }
    }

    return list;
  }, [collections, data?.all]);

  const allPackages = useMemo(() => data?.all || [], [data?.all]);

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return allPackages;
    return allPackages.filter((p) => p.category?.slug === activeCategory);
  }, [activeCategory, allPackages]);

  const activeCollection = useMemo(
    () => collections?.find((c) => c.slug === activeCategory) || null,
    [collections, activeCategory],
  );

  const activeCategoryName = categories.find((c) => c.slug === activeCategory)?.name;
  const isCollectionView = activeCategory !== 'all';

  const heroImage = isCollectionView
    ? getCollectionImage(activeCollection, Math.max(0, CATEGORY_ORDER.indexOf(activeCategory)))
    : getPackageImage(allPackages[0], 0);

  if (isLoading) return <PackagesLoadingSkeleton />;

  return (
    <>
      {isCollectionView ? (
        <CollectionHero
          collection={activeCollection || { title: activeCategoryName, shortDescription: '' }}
          packageCount={filtered.length}
          heroImage={heroImage}
        />
      ) : (
        <PageHeroDefault image={heroImage} />
      )}

      {!isError && categories.length > 1 && (
        <CollectionFilterBar
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      )}

      {isError && (
        <section className="px-6 md:px-12 lg:px-20 py-24 bg-background">
          <div className="max-w-2xl mx-auto">
            <ErrorState message={error?.message || 'Please try again shortly.'} />
          </div>
        </section>
      )}

      {!isError && (
        <section className="py-12 md:py-16 px-6 md:px-12 lg:px-20 bg-background">
          <div className="max-w-7xl mx-auto">
            {isCollectionView && filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-heading text-3xl text-emerald-dark mb-3">No packages in {activeCategoryName} yet</p>
                <p className="text-muted-foreground mb-8">Speak to our concierge — we can design one for you.</p>
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className="text-xs tracking-luxe uppercase text-emerald-dark border-b border-champagne/40 pb-1"
                >
                  Browse all packages
                </button>
              </div>
            ) : (
              <PackageGrid packages={filtered} />
            )}
          </div>
        </section>
      )}

      {!isError && filtered.length > 0 && (
        <section className="py-20 md:py-28 px-6 md:px-12 lg:px-20 bg-emerald-deep text-luxe">
          <div className="max-w-3xl mx-auto text-center">
            <ScrollReveal>
              <p className="font-accent text-3xl md:text-4xl text-champagne mb-4">Your Vision, Our Craft</p>
              <h2 className="font-heading text-4xl md:text-5xl leading-tight mb-6">
                {isCollectionView ? `Ready to refine a ${activeCategoryName} journey?` : 'None of These Quite Right?'}
              </h2>
              <p className="text-luxe/65 leading-relaxed mb-10 max-w-xl mx-auto">
                Every package can be modified, extended, or rebuilt. Tell us what matters and we will take it from there.
              </p>
              <LuxuryButton to="/plan-my-journey">Plan My Journey</LuxuryButton>
            </ScrollReveal>
          </div>
        </section>
      )}

      <ConciergeCTA cta={cta} />
    </>
  );
}
