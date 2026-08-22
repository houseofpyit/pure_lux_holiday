import React from 'react';
import { Link } from 'react-router-dom';
import PageHero from '@/components/PageHero';
import ScrollReveal from '@/components/ScrollReveal';
import SectionDivider from '@/components/SectionDivider';
import { IMAGES } from '@/lib/images';

export default function LegalPage({
  title,
  breadcrumb,
  subtitle,
  image,
  updated,
  children,
}) {
  return (
    <>
      <PageHero title={title} breadcrumb={breadcrumb} subtitle={subtitle} image={image || IMAGES.cta} />
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            {updated && (
              <p className="text-[0.65rem] tracking-luxe uppercase text-champagne mb-6">Last updated {updated}</p>
            )}
            <div className="article-body space-y-6">{children}</div>
            <SectionDivider className="my-12" />
            <p className="text-sm text-muted-foreground">
              Questions about this page?{' '}
              <Link to="/contact" className="text-emerald-dark border-b border-champagne/40 hover:border-champagne">
                Contact our concierge
              </Link>
              .
            </p>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
