import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Monogram } from '@/components/Logo';
import SectionDivider from '@/components/SectionDivider';

export default function ComingSoon({ title }) {
  return (
    <section className="min-h-[90vh] flex items-center justify-center px-6 py-20">
      <motion.div
        className="max-w-lg text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <Monogram className="w-20 h-20 mx-auto mb-8" />
        <p className="font-accent text-3xl text-champagne mb-4">Luxury &amp; Beyond</p>
        <h1 className="font-heading text-4xl md:text-6xl text-emerald-dark mb-6">{title}</h1>
        <SectionDivider className="mb-8" />
        <p className="text-muted-foreground leading-relaxed mb-10 max-w-md mx-auto">
          This experience is being meticulously crafted by our team. Like all things of beauty, it deserves a little more time. Please check back soon.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-champagne to-gold text-emerald-dark text-xs font-semibold tracking-luxe uppercase hover:shadow-lg hover:shadow-champagne/30 transition-all duration-500"
        >
          <ArrowLeft className="w-3 h-3" /> Return Home
        </Link>
      </motion.div>
    </section>
  );
}