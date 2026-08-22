import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, BookOpen } from 'lucide-react';
import PageHero from '@/components/PageHero';
import ScrollReveal from '@/components/ScrollReveal';
import SectionDivider from '@/components/SectionDivider';
import ConciergeCTA from '@/components/home/ConciergeCTA';
import { ErrorState } from '@/components/state/ContentState';
import { Skeleton } from '@/components/ui/skeleton';
import { useBlog } from '@/hooks/use-blog';
import { useAboutPageCta } from '@/hooks/use-about';
import { IMAGES } from '@/lib/images';
import { buildMediaUrl } from '@/lib/media';

const JOURNAL_HERO = {
  title: 'Travel Journal',
  breadcrumb: 'Stories From The World',
  subtitle:
    'Dispatches from our curators — places, rituals, and the quiet details that turn a journey into a memory.',
  image: IMAGES.journal,
};

const FALLBACK_IMAGES = [IMAGES.maldives, IMAGES.swiss, IMAGES.dubai, IMAGES.bali, IMAGES.about, IMAGES.hero];

function formatArticleDate(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function articleHref(article) {
  return article?.slug ? `/journal/${article.slug}` : '/journal';
}

function articleImage(article, index) {
  return article?.featuredImage?.url
    ? buildMediaUrl(article.featuredImage.url)
    : FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

function JournalCard({ article, index, variant = 'grid' }) {
  const imageUrl = articleImage(article, index);
  const dateLabel = formatArticleDate(article.publishedAt);

  if (variant === 'featured') {
    return (
      <Link
        to={articleHref(article)}
        className="group grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-3xl overflow-hidden lux-shadow-lg border border-champagne/10 bg-white"
      >
        <div className="relative lg:col-span-3 min-h-[380px] md:min-h-[440px] overflow-hidden">
          <img
            src={imageUrl}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-deep/50 via-emerald-deep/20 to-transparent" />
          {article.category && (
            <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-luxe/95 backdrop-blur-sm">
              <span className="text-[0.6rem] tracking-luxe uppercase text-emerald-dark font-semibold">
                {article.category}
              </span>
            </div>
          )}
        </div>
        <div className="lg:col-span-2 bg-luxe/20 p-10 md:p-14 flex flex-col justify-center">
          <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-4">Editor&apos;s Pick</p>
          <h3 className="font-heading text-3xl md:text-4xl lg:text-[2.75rem] text-emerald-dark mb-5 leading-tight group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <div className="w-12 h-px bg-champagne mb-6" />
          {article.excerpt && (
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-8 line-clamp-4">
              {article.excerpt}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
            {dateLabel && (
              <span className="inline-flex items-center gap-2 text-[0.65rem] tracking-luxe uppercase text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 text-champagne" />
                {dateLabel}
              </span>
            )}
            <span className="inline-flex items-center gap-2 text-[0.65rem] tracking-luxe uppercase text-emerald-dark font-medium">
              Read Story
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={articleHref(article)} className="group block h-full">
      <div className="relative overflow-hidden rounded-3xl aspect-[4/5] mb-5 lux-shadow border border-champagne/5">
        <img
          src={imageUrl}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/70 via-emerald-deep/10 to-transparent" />
        {article.category && (
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-luxe/90 backdrop-blur-sm">
            <span className="text-[0.6rem] tracking-luxe uppercase text-emerald-dark font-semibold">
              {article.category}
            </span>
          </div>
        )}
      </div>
      {dateLabel && (
        <div className="flex items-center gap-2 mb-2.5">
          <Calendar className="w-3 h-3 text-champagne shrink-0" />
          <span className="text-[0.65rem] tracking-luxe uppercase text-muted-foreground">{dateLabel}</span>
        </div>
      )}
      <h3 className="font-heading text-2xl text-emerald-dark mb-2.5 group-hover:text-primary transition-colors leading-snug">
        {article.title}
      </h3>
      {article.excerpt && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">{article.excerpt}</p>
      )}
      <span className="inline-flex items-center gap-2 text-[0.65rem] tracking-luxe uppercase text-champagne group-hover:gap-3 transition-all duration-500">
        Read Article <ArrowRight className="w-3 h-3" />
      </span>
    </Link>
  );
}

function JournalLoadingSkeleton() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-background">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-3xl overflow-hidden border border-border/60">
          <Skeleton className="lg:col-span-3 min-h-[400px] rounded-none" />
          <div className="lg:col-span-2 p-10 space-y-4 bg-white">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-px w-12 my-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[4/5] rounded-3xl mb-5" />
              <Skeleton className="h-3 w-28 mb-3" />
              <Skeleton className="h-7 w-full mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function JournalEmptyState() {
  return (
    <section className="py-28 md:py-40 px-6 bg-background">
      <div className="max-w-lg mx-auto text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-luxe/80 border border-champagne/20 mb-8">
          <BookOpen className="w-6 h-6 text-champagne" strokeWidth={1.5} />
        </div>
        <h2 className="font-heading text-3xl md:text-4xl text-emerald-dark mb-4">Stories are on the way</h2>
        <SectionDivider className="mx-auto mb-5 max-w-[120px]" />
        <p className="text-muted-foreground leading-relaxed">
          Our travel journal will be published here soon.
        </p>
      </div>
    </section>
  );
}

export default function Journal() {
  const { data, isLoading, isError, error } = useBlog();
  const { data: cta } = useAboutPageCta();
  const [filter, setFilter] = useState('All');

  const articles = data?.all || [];

  const featured = useMemo(() => {
    if (data?.featured?.length) return [data.featured[0]];
    const flagged = articles.find((a) => a.isFeatured);
    return flagged ? [flagged] : articles.slice(0, 1);
  }, [data, articles]);

  const featuredIds = useMemo(() => new Set(featured.map((a) => a.id)), [featured]);

  const categories = useMemo(() => {
    const names = Array.from(new Set(articles.map((a) => a.category).filter(Boolean)));
    return ['All', ...names];
  }, [articles]);

  const rest = useMemo(() => {
    const list = articles.filter((a) => !featuredIds.has(a.id));
    if (filter === 'All') return list;
    return list.filter((a) => a.category === filter);
  }, [articles, featuredIds, filter]);

  const heroImage =
    featured[0] ? articleImage(featured[0], 0) : articles[0] ? articleImage(articles[0], 0) : JOURNAL_HERO.image;

  return (
    <>
      <PageHero
        title={JOURNAL_HERO.title}
        breadcrumb={JOURNAL_HERO.breadcrumb}
        subtitle={JOURNAL_HERO.subtitle}
        image={heroImage}
      />

      {isLoading && <JournalLoadingSkeleton />}

      {isError && (
        <section className="py-24 px-6 md:px-12 lg:px-20 bg-background">
          <div className="max-w-xl mx-auto">
            <ErrorState message={error?.message || 'Unable to load journal stories.'} />
          </div>
        </section>
      )}

      {!isLoading && !isError && articles.length === 0 && <JournalEmptyState />}

      {!isLoading && !isError && featured.length > 0 && (
        <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-background">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-14 md:mb-16">
                <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-4">Featured Story</p>
                <h2 className="font-heading text-4xl md:text-5xl text-emerald-dark">From the Editors</h2>
                <SectionDivider className="mt-5" />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.08}>
              <JournalCard article={featured[0]} index={0} variant="featured" />
            </ScrollReveal>
          </div>
        </section>
      )}

      {!isLoading && !isError && articles.length > 0 && (
        <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-background via-luxe/30 to-background">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-12 md:mb-14">
                <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-4">The Archive</p>
                <h2 className="font-heading text-4xl md:text-5xl text-emerald-dark">All Stories</h2>
                <SectionDivider className="mt-6" />
                {articles.length > 0 && (
                  <p className="mt-6 text-sm text-muted-foreground max-w-md mx-auto">
                    {articles.length} {articles.length === 1 ? 'story' : 'stories'} from our curators around the world.
                  </p>
                )}
              </div>
            </ScrollReveal>

            {categories.length > 1 && (
              <ScrollReveal delay={0.05}>
                <div className="flex flex-wrap justify-center gap-3 mb-14 md:mb-16">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFilter(cat)}
                      className={`px-5 py-2.5 rounded-full text-xs tracking-luxe uppercase transition-all duration-500 ${
                        filter === cat
                          ? 'bg-emerald-dark text-luxe shadow-md'
                          : 'border border-border bg-white/60 text-emerald-dark hover:border-champagne hover:bg-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </ScrollReveal>
            )}

            {rest.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No other stories in this collection yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 md:gap-y-14">
                {rest.map((article, i) => (
                  <ScrollReveal key={article.id} delay={i * 0.07}>
                    <JournalCard article={article} index={i + 1} />
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <ConciergeCTA cta={cta} />
    </>
  );
}
