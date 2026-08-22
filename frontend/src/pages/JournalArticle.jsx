import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import PageHero from '@/components/PageHero';
import ScrollReveal from '@/components/ScrollReveal';
import ConciergeCTA from '@/components/home/ConciergeCTA';
import { LoadingState, ErrorState } from '@/components/state/ContentState';
import { useBlogArticle } from '@/hooks/use-blog';
import { useAboutPageCta } from '@/hooks/use-about';
import { IMAGES } from '@/lib/images';
import { buildMediaUrl } from '@/lib/media';

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

export default function JournalArticle() {
  const { slug } = useParams();
  const { data: article, isLoading, isError, error } = useBlogArticle(slug);
  const { data: cta } = useAboutPageCta();

  const heroImage = article?.bannerImage?.url
    ? buildMediaUrl(article.bannerImage.url)
    : article?.featuredImage?.url
      ? buildMediaUrl(article.featuredImage.url)
      : IMAGES.maldives;

  const dateLabel = formatArticleDate(article?.publishedAt);
  const related = (article?.relatedArticles || []).filter((item) => item.slug !== slug).slice(0, 3);

  if (isLoading) {
    return (
      <>
        <PageHero title="Travel Journal" breadcrumb="Story" image={IMAGES.maldives} />
        <section className="py-24 px-6 md:px-12 lg:px-20">
          <LoadingState lines={10} />
        </section>
      </>
    );
  }

  if (isError || !article) {
    return (
      <>
        <PageHero title="Story Not Found" breadcrumb="Travel Journal" image={IMAGES.maldives} />
        <section className="py-24 px-6 md:px-12 lg:px-20">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <ErrorState message={error?.message || 'This story is no longer available.'} />
            <Link
              to="/journal"
              className="inline-flex items-center gap-2 text-xs tracking-luxe uppercase text-emerald-dark border-b border-champagne/40 pb-1 hover:border-champagne"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Journal
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        title={article.title}
        breadcrumb={article.category || 'Travel Journal'}
        subtitle={article.excerpt}
        image={heroImage}
      />

      <article className="py-20 md:py-28 px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <Link
              to="/journal"
              className="inline-flex items-center gap-2 text-[0.65rem] tracking-luxe uppercase text-muted-foreground hover:text-emerald-dark mb-10"
            >
              <ArrowLeft className="w-3 h-3" /> All Stories
            </Link>

            <div className="flex flex-wrap items-center gap-4 mb-12 text-[0.65rem] tracking-luxe uppercase text-muted-foreground">
              {dateLabel && (
                <span className="inline-flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-champagne" />
                  {dateLabel}
                </span>
              )}
              {article.readingTime > 0 && (
                <span className="inline-flex items-center gap-2">
                  <Clock className="w-3 h-3 text-champagne" />
                  {article.readingTime} min read
                </span>
              )}
              {article.authorName && <span>By {article.authorName}</span>}
            </div>
          </ScrollReveal>

          {article.content ? (
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <p className="text-muted-foreground leading-relaxed">
              {article.excerpt || 'This story is being prepared.'}
            </p>
          )}

          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-14 pt-10 border-t border-border">
              {article.tags.map((tag) => (
                <span
                  key={tag.id || tag.slug}
                  className="px-3 py-1.5 rounded-full border border-champagne/30 text-[0.6rem] tracking-luxe uppercase text-emerald-dark"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="pb-24 px-6 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl text-emerald-dark mb-10 text-center">Continue Reading</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((item) => {
                const imageUrl = item.featuredImage?.url
                  ? buildMediaUrl(item.featuredImage.url)
                  : IMAGES.swiss;
                return (
                  <Link key={item.id} to={`/journal/${item.slug}`} className="group block">
                    <div className="relative overflow-hidden rounded-3xl aspect-[4/5] mb-4 lux-shadow">
                      <img
                        src={imageUrl}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                      />
                    </div>
                    <h3 className="font-heading text-xl text-emerald-dark group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <ConciergeCTA cta={cta} />
    </>
  );
}
