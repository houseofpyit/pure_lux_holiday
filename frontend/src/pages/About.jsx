import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Heart,
  Gem,
  Sparkles,
  ArrowRight,
  Star,
  Shield,
  Users,
  Globe,
} from 'lucide-react';
import PageHero from '@/components/PageHero';
import ScrollReveal from '@/components/ScrollReveal';
import SectionDivider from '@/components/SectionDivider';
import ConciergeCTA from '@/components/home/ConciergeCTA';
import { LoadingState, ErrorState } from '@/components/state/ContentState';
import { useAbout, useAboutPageCta } from '@/hooks/use-about';
import { IMAGES } from '@/lib/images';

const ICON_MAP = {
  Compass, Heart, Gem, Sparkles, Star, Shield, Users, Globe,
  compass: Compass, heart: Heart, gem: Gem, sparkles: Sparkles,
  star: Star, shield: Shield, users: Users, globe: Globe,
};

const FALLBACK_VALUES = [
  { icon: Compass, title: 'Personalization', desc: 'No two journeys are alike. Every itinerary is crafted from a blank canvas.' },
  { icon: Gem, title: 'Excellence', desc: 'We accept nothing less than perfection in every detail, every time.' },
  { icon: Heart, title: 'Genuine Care', desc: 'Our travelers are family. Your journey is our shared passion.' },
  { icon: Sparkles, title: 'Timeless Elegance', desc: 'We curate experiences that transcend trends and endure in memory.' },
];

const FALLBACK_TIMELINE = [
  { year: '2009', title: 'The Beginning', desc: 'Founded with a vision to redefine luxury travel through personalization.' },
  { year: '2014', title: 'Global Expansion', desc: 'Expanded to over 50 destinations across six continents.' },
  { year: '2019', title: 'Award Recognition', desc: 'Named among the top luxury travel curators worldwide.' },
  { year: '2024', title: 'Beyond Luxury', desc: 'Pioneering a new era of experiential travel with 120+ destinations.' },
];

const HERO_FALLBACK = {
  title: 'Our Story',
  breadcrumb: 'About Pure Luxe Holidays',
  subtitle: 'Fifteen years of crafting journeys that transcend the ordinary.',
  image: IMAGES.about,
};

const STORY_FALLBACK = {
  label: 'Our Story',
  heading: 'A Legacy of Extraordinary Journeys',
  paragraph1: 'Pure Luxe Holidays was born from a simple belief: that travel, at its finest, is not about where you go — but about how the journey transforms you. Founded in 2009, we set out to redefine what luxury travel could be.',
  paragraph2: "Today, we are a team of dedicated travel curators, each with deep regional expertise and an unwavering commitment to craftsmanship. We don't sell packages — we design experiences, one journey at a time.",
  image: IMAGES.bali,
  badgeValue: '15+',
  badgeLabel: 'Years',
};

const MISSION_VISION_FALLBACK = {
  visionLabel: 'Our Vision',
  visionHeading: 'Beyond Luxury',
  vision: 'To be the world\'s most trusted luxury travel curator, where every journey is a masterpiece of personalization, and every traveler returns not just with memories, but with a transformed perspective.',
  missionLabel: 'Our Mission',
  missionHeading: 'Crafting Wonder',
  mission: 'To craft unforgettable luxury journeys through personalized service, premium destinations, and timeless hospitality — making the extraordinary accessible to those who seek it.',
};

function getIcon(iconName) {
  if (!iconName) return Compass;
  return ICON_MAP[iconName] || ICON_MAP[iconName.toLowerCase()] || Compass;
}

function sortByDisplayOrder(items) {
  return [...items].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

function buildValues(coreValues) {
  const sorted = sortByDisplayOrder(coreValues || []);
  if (sorted.length === 0) return FALLBACK_VALUES;

  return sorted.map((value) => ({
    icon: getIcon(value.icon),
    title: value.title,
    desc: value.description,
  }));
}

function buildTimeline(timeline) {
  const sorted = sortByDisplayOrder(timeline || []);
  if (sorted.length === 0) return FALLBACK_TIMELINE;

  return sorted.map((item) => ({
    year: item.year,
    title: item.title,
    desc: item.description,
  }));
}

function buildBadge(statistics) {
  const sorted = sortByDisplayOrder(statistics || []);
  const yearsStat = sorted.find((stat) => /year/i.test(stat.title || '')) || sorted[0];
  if (!yearsStat) return { value: STORY_FALLBACK.badgeValue, label: STORY_FALLBACK.badgeLabel };

  return {
    value: `${yearsStat.value}${yearsStat.suffix || ''}`,
    label: yearsStat.title || STORY_FALLBACK.badgeLabel,
  };
}

export default function About() {
  const { data, isLoading, isError, error } = useAbout();
  const { data: cta } = useAboutPageCta();

  const about = data?.about;
  const values = useMemo(() => buildValues(data?.coreValues), [data?.coreValues]);
  const timeline = useMemo(() => buildTimeline(data?.timeline), [data?.timeline]);
  const badge = useMemo(() => buildBadge(data?.statistics), [data?.statistics]);

  const hero = {
    title: about?.heroTitle || HERO_FALLBACK.title,
    breadcrumb: HERO_FALLBACK.breadcrumb,
    subtitle: about?.heroSubtitle?.trim() || HERO_FALLBACK.subtitle,
    image: about?.heroImage?.url || HERO_FALLBACK.image,
  };

  const story = {
    label: STORY_FALLBACK.label,
    heading: STORY_FALLBACK.heading,
    paragraph1: about?.ourStory || STORY_FALLBACK.paragraph1,
    paragraph2: about?.companyDescription || STORY_FALLBACK.paragraph2,
    image: about?.heroImage?.url || STORY_FALLBACK.image,
  };

  const missionVision = {
    visionLabel: MISSION_VISION_FALLBACK.visionLabel,
    visionHeading: MISSION_VISION_FALLBACK.visionHeading,
    vision: about?.vision || MISSION_VISION_FALLBACK.vision,
    missionLabel: MISSION_VISION_FALLBACK.missionLabel,
    missionHeading: MISSION_VISION_FALLBACK.missionHeading,
    mission: about?.mission || MISSION_VISION_FALLBACK.mission,
  };

  return (
    <>
      <PageHero
        title={hero.title}
        breadcrumb={hero.breadcrumb}
        subtitle={hero.subtitle}
        image={hero.image}
      />

      {isLoading && (
        <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20">
          <LoadingState lines={6} />
        </section>
      )}

      {isError && (
        <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20">
          <ErrorState message={error?.message} />
        </section>
      )}

      {!isLoading && !isError && (
        <>
          <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
              <ScrollReveal>
                <div className="relative">
                  <img src={story.image} alt="Luxury travel destination" className="rounded-3xl lux-shadow w-full" />
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-emerald-deep flex items-center justify-center text-center hidden md:flex">
                    <div>
                      <p className="font-heading text-3xl text-champagne">{badge.value}</p>
                      <p className="text-[0.55rem] tracking-luxe uppercase text-luxe/60">{badge.label}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-4">{story.label}</p>
                <h2 className="font-heading text-4xl md:text-5xl text-emerald-dark mb-6 leading-tight">
                  {story.heading}
                </h2>
                <div className="w-16 h-px bg-champagne mb-6" />
                <p className="text-muted-foreground leading-relaxed mb-4">{story.paragraph1}</p>
                <p className="text-muted-foreground leading-relaxed mb-8">{story.paragraph2}</p>
                <Link
                  to="/plan-my-journey"
                  className="inline-flex items-center gap-2 text-xs tracking-luxe uppercase text-emerald-dark border-b border-champagne/40 pb-1 hover:border-champagne transition-colors group"
                >
                  Begin Your Journey <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </ScrollReveal>
            </div>
          </section>

          <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-emerald-deep text-luxe">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-5xl mx-auto">
              <ScrollReveal>
                <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-4">{missionVision.visionLabel}</p>
                <h3 className="font-heading text-3xl md:text-4xl text-luxe mb-4">{missionVision.visionHeading}</h3>
                <div className="w-12 h-px bg-champagne mb-5" />
                <p className="text-luxe/60 leading-relaxed">{missionVision.vision}</p>
              </ScrollReveal>
              <ScrollReveal delay={0.15}>
                <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-4">{missionVision.missionLabel}</p>
                <h3 className="font-heading text-3xl md:text-4xl text-luxe mb-4">{missionVision.missionHeading}</h3>
                <div className="w-12 h-px bg-champagne mb-5" />
                <p className="text-luxe/60 leading-relaxed">{missionVision.mission}</p>
              </ScrollReveal>
            </div>
          </section>

          <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <ScrollReveal>
                <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-4">Core Values</p>
                <h2 className="font-heading text-4xl md:text-5xl text-emerald-dark">What Guides Us</h2>
                <SectionDivider className="mt-6" />
              </ScrollReveal>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
              {values.map((val, i) => (
                <ScrollReveal key={`${val.title}-${i}`} delay={i * 0.1}>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full border border-champagne/30 flex items-center justify-center mb-5 mx-auto">
                      <val.icon className="w-6 h-6 text-champagne" strokeWidth={1} />
                    </div>
                    <h3 className="font-heading text-xl text-emerald-dark mb-2">{val.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{val.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>

          <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-transparent via-luxe/50 to-transparent">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <ScrollReveal>
                <p className="font-body text-xs tracking-widest-luxe text-champagne uppercase mb-4">Our Journey</p>
                <h2 className="font-heading text-4xl md:text-5xl text-emerald-dark">Milestones</h2>
                <SectionDivider className="mt-6" />
              </ScrollReveal>
            </div>
            <div className="max-w-3xl mx-auto space-y-12">
              {timeline.map((item, i) => (
                <ScrollReveal key={`${item.year}-${item.title}`} delay={i * 0.1}>
                  <div className="flex gap-6 items-start">
                    <div className="flex-shrink-0 w-20 text-right">
                      <p className="font-heading text-3xl text-champagne">{item.year}</p>
                    </div>
                    <div className="flex-shrink-0 w-px bg-champagne/30 self-stretch relative">
                      <span className="absolute top-2 -left-1.5 w-3 h-3 rounded-full bg-champagne" />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="font-heading text-2xl text-emerald-dark mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </>
      )}

      <ConciergeCTA cta={cta} />
    </>
  );
}
