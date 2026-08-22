import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import PageHero from '@/components/PageHero';
import ScrollReveal from '@/components/ScrollReveal';
import SectionDivider from '@/components/SectionDivider';
import ConciergeCTA from '@/components/home/ConciergeCTA';
import { LoadingState, ErrorState } from '@/components/state/ContentState';
import { useAbout, useAboutPageCta } from '@/hooks/use-about';
import { IMAGES } from '@/lib/images';

const FALLBACK_FAQS = [
  {
    id: 'fallback-1',
    question: 'How far in advance should I begin planning?',
    answer: 'For peak-season travel and exclusive-use properties, we recommend 6–12 months. Last-minute journeys are still possible — our concierge will advise on what can be arranged with care.',
  },
  {
    id: 'fallback-2',
    question: 'Are your journeys fully private?',
    answer: 'Yes. Every itinerary is designed for you alone. We do not operate group tours. Transfers, guides, and dining can be arranged privately throughout.',
  },
  {
    id: 'fallback-3',
    question: 'What is included in a Pure Luxe package?',
    answer: 'Each collection lists inclusions and exclusions on its page. Typically you can expect private transfers, a dedicated concierge, carefully chosen stays, and selected experiences. We refine every detail with you before departure.',
  },
  {
    id: 'fallback-4',
    question: 'Can you tailor an existing package?',
    answer: 'Always. Our packages are starting points, not fixed products. Duration, hotels, pacing, and experiences can all be adjusted to match how you travel.',
  },
  {
    id: 'fallback-5',
    question: 'How do I request a journey?',
    answer: 'Use Plan My Journey or Contact. Share dates, destinations, and any wishes. A specialist will reply within 24 hours with next steps.',
  },
  {
    id: 'fallback-6',
    question: 'Do you arrange visas, insurance, and flights?',
    answer: 'We advise on entry requirements and can coordinate flights and recommended insurers. Visa applications remain the traveler’s responsibility unless we agree otherwise in writing.',
  },
];

function sortFaqs(items) {
  return [...items].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

export default function Faq() {
  const { data, isLoading, isError, error } = useAbout();
  const { data: cta } = useAboutPageCta();

  const faqs = useMemo(() => {
    const fromApi = sortFaqs((data?.faqs || []).filter((item) => item.question));
    return fromApi.length > 0 ? fromApi : FALLBACK_FAQS;
  }, [data]);

  return (
    <>
      <PageHero
        title="Frequently Asked Questions"
        breadcrumb="Before You Travel"
        subtitle="Practical answers for guests planning a Pure Luxe journey."
        image={IMAGES.about}
      />

      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-4">Concierge Desk</p>
              <h2 className="font-heading text-4xl md:text-5xl text-emerald-dark">How We Work</h2>
              <SectionDivider className="mt-6" />
            </div>
          </ScrollReveal>

          {isLoading && <LoadingState lines={8} />}
          {isError && <ErrorState message={error?.message || 'Unable to load questions.'} />}

          {!isLoading && !isError && (
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="border-champagne/20">
                  <AccordionTrigger className="font-heading text-lg md:text-xl text-emerald-dark hover:no-underline py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-sm md:text-base pb-6">
                    {faq.answer || 'Please contact our concierge for details.'}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          <p className="text-center text-sm text-muted-foreground mt-14">
            Still have a question?{' '}
            <Link to="/contact" className="text-emerald-dark border-b border-champagne/40 hover:border-champagne">
              Speak with our concierge
            </Link>
            {' '}or{' '}
            <Link to="/plan-my-journey" className="text-emerald-dark border-b border-champagne/40 hover:border-champagne">
              plan your journey
            </Link>
            .
          </p>
        </div>
      </section>

      <ConciergeCTA cta={cta} />
    </>
  );
}
