import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import SectionDivider from '@/components/SectionDivider';
import { IMAGES } from '@/lib/images';
import { buildMediaUrl } from '@/lib/media';

const FALLBACK_IMAGES = [IMAGES.maldives, IMAGES.swiss, IMAGES.dubai];

function formatArticleDate(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function TravelJournal({ articles }) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-transparent via-luxe/50 to-transparent">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <ScrollReveal>
          <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-4">Travel Journal</p>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-emerald-dark">Stories From The World</h2>
          <SectionDivider className="mt-6" />
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {articles.map((article, i) => {
          const imageUrl = article.featuredImage?.url
            ? buildMediaUrl(article.featuredImage.url)
            : FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
          const dateLabel = formatArticleDate(article.publishedAt);

          return (
            <ScrollReveal key={article.id || article.slug || article.title} delay={i * 0.12}>
              <Link to={article.slug ? `/journal/${article.slug}` : '/journal'} className="group block">
                <div className="relative overflow-hidden rounded-3xl aspect-[4/5] mb-5 lux-shadow">
                  <img src={imageUrl} alt={article.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/60 to-transparent" />
                  {article.category && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-luxe/90 backdrop-blur-sm">
                      <span className="text-[0.6rem] tracking-luxe uppercase text-emerald-dark font-semibold">{article.category}</span>
                    </div>
                  )}
                </div>
                {dateLabel && (
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-3 h-3 text-champagne" />
                    <span className="text-[0.65rem] tracking-luxe uppercase text-muted-foreground">{dateLabel}</span>
                  </div>
                )}
                <h3 className="font-heading text-2xl text-emerald-dark mb-2 group-hover:text-primary transition-colors">{article.title}</h3>
                {article.excerpt && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{article.excerpt}</p>
                )}
                <span className="inline-flex items-center gap-2 text-[0.65rem] tracking-luxe uppercase text-champagne group-hover:gap-3 transition-all duration-500">
                  Read Article <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </ScrollReveal>
          );
        })}
      </div>

      <div className="text-center mt-14">
        <Link
          to="/journal"
          className="inline-flex items-center gap-2 text-[0.7rem] tracking-luxe uppercase text-emerald-dark border-b border-champagne/40 pb-1 hover:border-champagne transition-colors"
        >
          View All Stories <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </section>
  );
}
