// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Menu, X, ChevronLeft } from 'lucide-react';
// import { TextLogo } from '@/components/Logo';

// const NAV_ITEMS = [
//   { label: 'Home', to: '/' },
//   { label: 'Destinations', to: '/destinations' },
//   { label: 'Experiences', to: '/experiences' },
//   { label: 'Luxury Packages', to: '/packages' },
//   { label: 'Gallery', to: '/gallery' },
//   { label: 'Journal', to: '/journal' },
//   { label: 'About', to: '/about' },
//   { label: 'Contact', to: '/contact' },
// ];

// const SCROLL_THRESHOLD = 100;

// /**
//  * State machine — three states only:
//  *
//  *   'top'    scrollY < threshold
//  *            Full nav visible, centred, transparent luxury pill.
//  *
//  *   'hidden' scrollY >= threshold
//  *            Nav completely off-screen to the right.
//  *            Only the '<' arrow handle is visible.
//  *
//  *   'open'   User clicked the '<' arrow while in 'hidden'.
//  *            Nav slides back in — anchored to the RIGHT edge,
//  *            NOT centred. Right edge stays fixed, box "grows" left.
//  *
//  * Transitions:
//  *   top    → hidden   scroll past threshold   (slides out from centre)
//  *   hidden → open     arrow click             (slides in from right edge)
//  *   open   → hidden   any scroll event        (slides back out, right-anchored)
//  *   hidden → top      scroll back above threshold
//  *   open   → top      scroll back above threshold
//  *
//  * ── Positioning strategy ─────────────────────────────────────
//  * There is ONE wrapper, always fixed/full-width (so nothing remounts
//  * and no animation continuity is lost). What changes is the wrapper's
//  * `justify-content`, driven by a separate `anchor` state:
//  *
//  *   anchor === 'center'  → justify-center   (the original hero layout)
//  *   anchor === 'right'   → justify-end      (right edge fixed, pill
//  *                                             sits flush to the right)
//  *
//  * The pill's own width classes never change, so nothing about its
//  * visual design changes — only where it's aligned inside the wrapper.
//  *
//  * `anchor` only ever flips while the pill is fully off-screen
//  * (x: '150vw'), so the flex-alignment swap is always invisible to
//  * the user — the pill never visibly "teleports."
//  * ──────────────────────────────────────────────────────────── */
// export default function FloatingNav() {
//   const [navState, setNavState] = useState(() =>
//     window.scrollY < SCROLL_THRESHOLD ? 'top' : 'hidden'
//   );
//   // 'center' = original hero position, 'right' = right-anchored open position
//   const [anchor, setAnchor] = useState('center');
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const hasEnteredRef = useRef(false);
//   const location = useLocation();

//   /* ── Scroll-driven state machine (unchanged) ───────────── */
//   useEffect(() => {
//     const onScroll = () => {
//       if (window.scrollY < SCROLL_THRESHOLD) {
//         setNavState('top');
//       } else {
//         setNavState((prev) => {
//           if (prev === 'top' || prev === 'open') return 'hidden';
//           return prev;
//         });
//       }
//     };

//     window.addEventListener('scroll', onScroll, { passive: true });
//     return () => window.removeEventListener('scroll', onScroll);
//   }, []);

//   /* ── Anchor follows navState, but only flips at safe moments ─
//      - Entering 'open' → anchor becomes 'right' (pill is currently
//        off-screen/invisible, so this is a silent swap).
//      - Returning to 'top' → anchor becomes 'center' (pill is either
//        already off-screen, or — rare fast-scroll edge case — mid-flight;
//        acceptable trade-off for that edge case).
//      - 'hidden' does NOT touch anchor — it keeps whatever the pill's
//        last resting side was, so the slide-out direction stays correct
//        whether we came from 'top' or from 'open'.                    */
//   useEffect(() => {
//     if (navState === 'open') {
//       setAnchor('right');
//     } else if (navState === 'top') {
//       setAnchor('center');
//     }
//   }, [navState]);

//   /* ── Close mobile overlay on route change ──────────────── */
//   useEffect(() => {
//     setMobileOpen(false);
//   }, [location.pathname]);

//   /* ── Derived flags ──────────────────────────────────────── */
//   const atTop  = navState === 'top';
//   const hidden = navState === 'hidden';
//   const isNavVisible = atTop || navState === 'open';

//   /* ── Arrow click ────────────────────────────────────────── */
//   const handleArrowClick = useCallback(() => {
//     setNavState('open');
//   }, []);

//   const entrance  = { duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] };
//   const slideEase = { type: 'spring', stiffness: 80, damping: 20, mass: 1 };

//   const onAnimationComplete = useCallback(() => {
//     hasEnteredRef.current = true;
//   }, []);

//   return (
//     <>
//       {/* ─────────────────────────────────────────────────────
//           SINGLE static wrapper — still fixed/full-width so it
//           never remounts. Only `justify-content` toggles between
//           'center' (top) and 'end' (right-anchored open state).
//       ────────────────────────────────────────────────────── */}
//       <div
//         className={`fixed top-3 md:top-5 left-0 right-0 z-50 flex pointer-events-none ${
//           anchor === 'center'
//             ? 'justify-center'
//             : 'justify-end pr-3 md:pr-5'
//         }`}
//       >
//         <motion.nav
//           className="pointer-events-auto w-[calc(100%-1.5rem)] max-w-6xl"
//           initial={{ y: -100, opacity: 0 }}
//           animate={
//             isNavVisible
//               ? { y: 0, opacity: 1, x: 0 }
//               : { y: 0, opacity: 1, x: '150vw' }
//           }
//           transition={!hasEnteredRef.current ? entrance : slideEase}
//           onAnimationComplete={onAnimationComplete}
//         >
//           <div
//             className={`flex items-center justify-between px-5 md:px-8 py-3 md:py-4 rounded-full transition-all duration-700 ${
//               atTop ? 'bg-transparent' : 'glass bg-white/80 lux-shadow'
//             }`}
//           >
//             {/* Logo */}
//             <Link to="/" className="flex-shrink-0">
//               <TextLogo
//                 className={atTop ? 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]' : ''}
//                 onDark={atTop}
//               />
//             </Link>

//             {/* Desktop links */}
//             <div className="hidden lg:flex items-center gap-7">
//               {NAV_ITEMS.map((item) => (
//                 <Link
//                   key={item.to}
//                   to={item.to}
//                   className={`group relative text-[0.7rem] font-medium tracking-luxe uppercase transition-colors duration-300 ${
//                     atTop
//                       ? 'text-white/90 hover:text-white'
//                       : 'text-foreground/70 hover:text-primary'
//                   }`}
//                 >
//                   {item.label}
//                   <span className="absolute -bottom-1 left-0 right-0 h-px bg-champagne scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
//                 </Link>
//               ))}
//             </div>

//             {/* Mobile hamburger */}
//             <div className="flex items-center flex-shrink-0">
//               <button
//                 className="lg:hidden p-2"
//                 onClick={() => setMobileOpen((o) => !o)}
//                 aria-label="Toggle menu"
//               >
//                 {mobileOpen ? (
//                   <X className={`w-5 h-5 ${atTop ? 'text-white' : 'text-foreground'}`} />
//                 ) : (
//                   <Menu className={`w-5 h-5 ${atTop ? 'text-white' : 'text-foreground'}`} />
//                 )}
//               </button>
//             </div>
//           </div>
//         </motion.nav>
//       </div>

//       {/* Arrow handle — unchanged */}
//       <AnimatePresence>
//         {hidden && (
//           <motion.button
//             key="nav-arrow"
//             className="hidden lg:flex fixed top-5 right-0 z-50 w-10 h-14 items-center justify-center rounded-l-xl glass bg-white/80 lux-shadow cursor-pointer"
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 20 }}
//             transition={{ type: 'spring', stiffness: 120, damping: 18 }}
//             onClick={handleArrowClick}
//             aria-label="Open navigation"
//             aria-expanded={false}
//           >
//             <ChevronLeft className="w-4 h-4 text-foreground/70" />
//           </motion.button>
//         )}
//       </AnimatePresence>

//       {/* Mobile overlay — unchanged */}
//       <AnimatePresence>
//         {mobileOpen && (
//           <motion.div
//             className="fixed inset-0 z-40 lg:hidden bg-emerald-dark/98 glass-dark flex flex-col items-center justify-center gap-6"
//             initial={{ opacity: 0, clipPath: 'circle(0% at 100% 0%)' }}
//             animate={{ opacity: 1, clipPath: 'circle(150% at 100% 0%)' }}
//             exit={{ opacity: 0, clipPath: 'circle(0% at 100% 0%)' }}
//             transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
//           >
//             {NAV_ITEMS.map((item, i) => (
//               <motion.div
//                 key={item.to}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.1 + i * 0.05 }}
//               >
//                 <Link
//                   to={item.to}
//                   className="font-heading text-3xl text-luxe hover:text-champagne transition-colors duration-300"
//                 >
//                   {item.label}
//                 </Link>
//               </motion.div>
//             ))}
//             <Link
//               to="/plan-my-journey"
//               className="mt-4 px-8 py-3 rounded-full bg-gradient-to-r from-champagne to-gold text-emerald-dark text-xs font-semibold tracking-luxe uppercase"
//             >
//               Plan My Journey
//             </Link>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, Menu } from 'lucide-react';
import { ImageLogo } from '@/components/Logo';

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Destinations', to: '/destinations' },
  { label: 'Experiences', to: '/experiences' },
  { label: 'Luxury Packages', to: '/packages' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Journal', to: '/journal' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const SCROLL_THRESHOLD = 60;

// A link is "active" if its path matches the current route.
// '/' only matches the exact home page; every other path also
// matches its own sub-routes (e.g. '/destinations/goa').
function isLinkActive(pathname, to) {
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function FloatingNav() {
  // atTop: are we within the hero region? Controls transparent vs glass background ONLY.
  const [atTop, setAtTop] = useState(true);
  // collapsed: should the links be hidden (logo only)? Controls link visibility ONLY.
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const onScroll = () => {
      const currentY = window.scrollY;
      const goingDown = currentY > lastScrollY.current;
      const withinTop = currentY <= SCROLL_THRESHOLD;

      // Background: transparent only inside the hero region at the very top.
      // Everywhere else on the page it stays solid glass, regardless of
      // scroll direction or whether links are shown/collapsed.
      setAtTop(withinTop);

      // Links: collapse while scrolling down past the top region,
      // expand immediately the moment the user scrolls up (at any
      // position on the page) or returns to the top.
      if (withinTop) {
        setCollapsed(false);
      } else if (goingDown) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Lock background scroll while the mobile full-screen menu is open.
  useEffect(() => {
    if (mobileOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [mobileOpen]);

  const linksTransition = { type: 'spring', stiffness: 200, damping: 26, mass: 0.6 };

  return (
    <>
      {/*
        Wrapper spans the full viewport width so the flex `justify-end`
        keeps the pill flush against the RIGHT edge at any screen size.
        Desktop-only (hidden lg:flex) — mobile uses the hamburger
        trigger + full-screen menu further down instead of this pill.

        NOTE ON SIZE ACROSS DESKTOP WIDTHS:
        The pill's width is driven entirely by its content (logo + links),
        which previously used the SAME gap/padding/font-size at every
        desktop width. That made the pill occupy a much bigger fraction
        of the screen on a 1024px window than on a 1920px window, which
        is why the logo appeared to "shift left" on smaller screens even
        though the pill was always right-anchored.
        Fix: scale gap / padding / font-size / logo height across the
        lg → xl → 2xl breakpoints so the pill keeps a more consistent
        proportion of the screen at every desktop size, without changing
        the design itself.
      */}
      <div className="hidden lg:flex fixed top-3 md:top-5 left-0 right-0 z-50 justify-end pointer-events-none">
        <motion.nav
          className="pointer-events-auto"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            layout
            transition={linksTransition}
            onClick={() => { if (collapsed) setCollapsed(false); }}
            className={`flex items-center overflow-hidden pl-5 lg:pl-6 xl:pl-8 2xl:pl-10 pr-3 lg:pr-4 xl:pr-5 2xl:pr-6 py-2.5 lg:py-3 xl:py-3.5 2xl:py-4 rounded-l-full rounded-r-none transition-colors duration-700 ${atTop ? 'bg-transparent' : 'glass bg-white/80 lux-shadow'} ${collapsed ? 'cursor-pointer' : ''}`}
          >
            <AnimatePresence>
              {collapsed && (
                <motion.span
                  key="collapse-hint"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center ml-2"
                >
                  <ChevronLeft className={`w-4 h-4 ${atTop ? 'text-white/70' : 'text-foreground/50'}`} />
                </motion.span>
              )}
            </AnimatePresence>

            <Link
              to="/"
              className="flex-shrink-0 relative z-10"
              onClick={(e) => {
                e.stopPropagation();
                if (location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  navigate('/');
                }
              }}
            >
              <ImageLogo className="h-11 lg:h-12 xl:h-14 2xl:h-16 w-auto" />
            </Link>

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  key="nav-body"
                  layout
                  initial={{ opacity: 0, x: 60, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 'auto' }}
                  exit={{ opacity: 0, x: 60, width: 0 }}
                  transition={linksTransition}
                  className="flex items-center overflow-hidden"
                >
                  <div className="flex items-center gap-5 lg:gap-6 xl:gap-8 2xl:gap-10 ml-7 lg:ml-10 xl:ml-14 2xl:ml-16 whitespace-nowrap">
                    {NAV_ITEMS.map((item) => {
                      const active = isLinkActive(location.pathname, item.to);
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={`group relative text-[0.7rem] xl:text-[0.75rem] 2xl:text-[0.8rem] font-medium tracking-luxe uppercase transition-colors duration-300 ${
                            active
                              ? 'text-champagne'
                              : atTop
                                ? 'text-white/90 hover:text-white'
                                : 'text-foreground/70 hover:text-primary'
                          }`}
                        >
                          {item.label}
                          <span
                            className={`absolute -bottom-1 left-0 right-0 h-px bg-champagne origin-center transition-transform duration-500 ${
                              active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                            }`}
                          />
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.nav>
      </div>

      {/*
        MOBILE — Centered logo at the top of every page.
        Visible only on mobile/tablet (below lg breakpoint).
        Uses the same ImageLogo component as desktop for consistency.
      */}
      {/* <div className="lg:hidden fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <Link
          to="/"
          onClick={(e) => {
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              navigate('/');
            }
          }}
        >
          <ImageLogo height={64} />
        </Link>
      </div> */}

      {/*
        MOBILE — hamburger/X trigger sits on a black glass pill so it
        stays visible over ANY background (white sections included).
        Icon color is always white since the pill behind it is always
        dark now — no more atTop-dependent color logic needed here.
      */}
      <button
        className="lg:hidden fixed top-4 right-4 z-50 flex items-center justify-center w-11 h-11 rounded-full glass bg-black/50 lux-shadow"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <Menu className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Mobile Menu — logo up top, links centered below. Closing is
          handled entirely by the fixed hamburger/X button above, which
          sits at z-50 (above this overlay's z-40) so it stays visible
          and clickable the whole time the menu is open. */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden bg-[#0a2e28]/95 glass-dark flex flex-col"
            initial={{ opacity: 0, clipPath: 'circle(0% at 100% 0%)' }}
            animate={{ opacity: 1, clipPath: 'circle(150% at 100% 0%)' }}
            exit={{ opacity: 0, clipPath: 'circle(0% at 100% 0%)' }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="flex items-center px-5 pt-5">
              <Link to="/" onClick={() => setMobileOpen(false)} className="flex-shrink-0">
                <ImageLogo height={44} />
              </Link>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              {NAV_ITEMS.map((item, i) => {
                const active = isLinkActive(location.pathname, item.to);
                return (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <Link
                      to={item.to}
                      className={`font-heading text-3xl transition-colors duration-300 ${
                        active ? 'text-champagne' : 'text-luxe hover:text-champagne'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}