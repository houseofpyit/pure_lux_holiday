import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const variants = {
  gold: 'bg-gradient-to-r from-champagne to-gold text-emerald-dark',
  outline: 'border border-champagne/60 text-foreground hover:border-champagne',
  ghost: 'text-foreground',
  light: 'bg-luxe text-emerald-dark hover:bg-white',
};

export default function LuxuryButton({ children, to, href, variant = 'gold', className = '', onClick, type = 'button', state }) {
  const base = 'inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs font-semibold tracking-luxe uppercase transition-all duration-700 relative overflow-hidden group';
  const classes = `${base} ${variants[variant]} ${className}`;

  const content = (
    <span className="relative z-10 flex items-center gap-2">{children}</span>
  );

  if (to) {
    return (
      <Link to={to} state={state} className={classes}>
        <span className="absolute inset-0 bg-gradient-to-r from-gold to-champagne opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        <span className="absolute inset-0 bg-gradient-to-r from-gold to-champagne opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        {content}
      </a>
    );
  }

  return (
    <motion.button type={type} onClick={onClick} className={classes} whileTap={{ scale: 0.98 }}>
      <span className="absolute inset-0 bg-gradient-to-r from-gold to-champagne opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      {content}
    </motion.button>
  );
}