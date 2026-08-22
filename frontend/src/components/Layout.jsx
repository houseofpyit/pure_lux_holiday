import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingNav from '@/components/FloatingNav';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import SeoRouteMeta from '@/components/SeoRouteMeta';
import Footer from '@/components/Footer';
import SCROLL_TO_UP_LOGO from '@/assets/footer_logo.png';

export default function Layout() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 800);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="min-h-screen flex flex-col">
      <SeoRouteMeta />
      <FloatingNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      <FloatingWhatsApp />

      {/* Back to Top — PL logo (bottom right) */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            onClick={scrollTop}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-emerald-deep/60 backdrop-blur-md border border-white/15 flex items-center justify-center lux-shadow hover:scale-110 hover:bg-emerald-deep/70 transition-all duration-500"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.4 }}
            aria-label="Back to top"
          >
            <img src={SCROLL_TO_UP_LOGO} alt="Scroll to top" className="w-8 h-8 object-contain" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}