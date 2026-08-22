import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import SectionDivider from '@/components/SectionDivider';
import { useCountUp } from '@/hooks/use-count-up';

// ── Stat item ─────────────────────────────────────────────────

function StatItem({ stat, delay }) {
  // value from API is a string like "15+", "5000+", "98%"
  const { count, ref } = useCountUp(stat.value, 2200);
  const suffix = stat.suffix || stat.value.replace(/[0-9]/g, '');

  return (
    <ScrollReveal delay={delay}>
      <div ref={ref} className="text-center">
        <p className="font-heading text-5xl md:text-6xl text-emerald-dark mb-2">
          {count}{suffix}
        </p>
        <p className="text-xs tracking-luxe uppercase text-muted-foreground">{stat.title}</p>
      </div>
    </ScrollReveal>
  );
}

// ── Main component ────────────────────────────────────────────

export default function StatsTestimonials({ statistics }) {
  const hasStats = statistics && statistics.length > 0;

  if (!hasStats) return null;

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
        {statistics.map((stat, i) => (
          <StatItem key={stat.id} stat={stat} delay={i * 0.1} />
        ))}
      </div>
    </section>
  );
}
