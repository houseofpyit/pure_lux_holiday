import React, { useState, useEffect } from 'react';
import SplashScreen from '@/components/SplashScreen';
import Hero from '@/components/home/Hero';
import Collections from '@/components/home/Collections';
import Destinations from '@/components/home/Destinations';
import Experiences from '@/components/home/Experiences';
import WhyPureLuxe from '@/components/home/WhyPureLuxe';
import AboutTeaser from '@/components/home/AboutTeaser';
import StatsTestimonials from '@/components/home/StatsTestimonials';
import ClientTestimonials from '@/components/home/ClientTestimonials';
import TravelJournal from '@/components/home/TravelJournal';
import ConciergeCTA from '@/components/home/ConciergeCTA';
import { useHomepage, useHomeTestimonials, useHomeJournal } from '@/hooks/use-homepage';

/**
 * Safe section wrapper — if a section throws a render error it is
 * silently suppressed so the rest of the page keeps rendering.
 */
class SectionBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export default function Home() {
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem('plh_splash_seen') === 'true',
  );

  const { data: homepage } = useHomepage();
  const { data: testimonials } = useHomeTestimonials();
  const { data: journalArticles } = useHomeJournal();

  useEffect(() => {
    document.body.style.overflow = splashDone ? '' : 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [splashDone]);

  const handleSplashComplete = () => {
    sessionStorage.setItem('plh_splash_seen', 'true');
    setSplashDone(true);
  };

  return (
    <>
      {/* Hero — gracefully uses fallback when data is absent */}
      <SectionBoundary>
        <Hero hero={homepage?.hero} />
      </SectionBoundary>

      {/* Collections — hidden when backend returns empty list */}
      <SectionBoundary>
        <Collections collections={homepage?.collections} />
      </SectionBoundary>

      {/* Featured Destinations */}
      <SectionBoundary>
        <Destinations destinations={homepage?.destinations} />
      </SectionBoundary>

      {/* Signature Experiences */}
      <SectionBoundary>
        <Experiences experiences={homepage?.experiences} />
      </SectionBoundary>

      {/* Why Pure Luxe */}
      <SectionBoundary>
        <WhyPureLuxe whyChooseUs={homepage?.whyChooseUs} />
      </SectionBoundary>

      {/* About Teaser — already wired; receives raw section object */}
      <SectionBoundary>
        <AboutTeaser section={homepage?.aboutSection} />
      </SectionBoundary>

      {/* Stats + simple testimonial carousel */}
      <SectionBoundary>
        <StatsTestimonials
          statistics={homepage?.statistics}
        />
      </SectionBoundary>

      {/* Rich testimonials — editorial layout */}
      <SectionBoundary>
        <ClientTestimonials testimonials={testimonials} />
      </SectionBoundary>

      <SectionBoundary>
        <TravelJournal articles={journalArticles} />
      </SectionBoundary>

      <SectionBoundary>
        <ConciergeCTA cta={homepage?.cta} />
      </SectionBoundary>

      {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
    </>
  );
}
