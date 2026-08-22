import React from 'react';
import { motion } from 'framer-motion';

export default function SectionDivider({ className = '', width = 'w-24' }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <motion.span
        className={`block h-px bg-champagne/50 ${width}`}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: 'right' }}
      />
      <span className="w-1.5 h-1.5 rounded-full bg-champagne flex-shrink-0" />
      <motion.span
        className={`block h-px bg-champagne/50 ${width}`}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        style={{ transformOrigin: 'left' }}
      />
    </div>
  );
}