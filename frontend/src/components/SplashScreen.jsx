import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SPLASH_LOGO from '@/assets/splash_logo.png';

const EASE_LUX = [0.22, 1, 0.36, 1];
const EASE_EXPO = [0.16, 1, 0.3, 1];
const EASE_SILK = [0.25, 0.46, 0.45, 0.94];

const FLIGHT_DURATION_MS = 1300; // single source of truth, shared by line draw + plane motion
const FLIGHT_PATH_D = 'M 50 55 Q 70 40 92 15'; // climbing departure arc, in 0-100 viewBox space

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),   // Logo appears
      setTimeout(() => setPhase(2), 1500),  // Shimmer sweep
      setTimeout(() => setPhase(3), 1900),  // Tagline
      setTimeout(() => setPhase(4), 2600),  // Divider
      setTimeout(() => setPhase(5), 3400),  // Glow pulse
      setTimeout(() => setPhase(6), 4000),  // Plane departs
      setTimeout(() => setPhase(7), 4000 + FLIGHT_DURATION_MS + 200), // Plane fully exited
      setTimeout(() => setExiting(true), 4000 + FLIGHT_DURATION_MS + 500),
      setTimeout(() => onComplete(), 4000 + FLIGHT_DURATION_MS + 1500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
          style={{
            backgroundColor: '#F8F5F0',
            // Use the real visible viewport height on mobile (dvh) instead of
            // the layout viewport (100vh), which can be taller than what's
            // actually shown when the browser's address bar is visible —
            // that mismatch was pushing the centered content upward.
            height: '100dvh',
            width: '100dvw',
          }}
          exit={{ clipPath: 'circle(0% at 50% 50%)' }}
          transition={{ duration: 1, ease: EASE_SILK }}
        >
          {/* Ambient glow */}
          <motion.div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: '45vw',
              height: '45vw',
              maxWidth: '560px',
              maxHeight: '560px',
              background: 'radial-gradient(circle at center, rgba(212,175,106,0.08) 0%, transparent 70%)',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: phase >= 1 ? [0, 1] : 0,
              scale: phase >= 1 ? [0.9, 1.05, 1] : 0.9,
            }}
            transition={{ duration: 2.2, ease: EASE_LUX }}
          />

          {/* Main content stack — centered as one block so it never drifts
              toward the top on mobile viewports */}
          <div className="relative z-10 flex flex-col items-center justify-center px-8 text-center w-full">
            <div className="relative overflow-hidden">
              <motion.img
                src={SPLASH_LOGO}
                alt="Pure Luxe Holidays"
                className="w-64 md:w-72 lg:w-80 h-auto"
                initial={{ opacity: 0, scale: 0.97, filter: 'blur(4px)' }}
                animate={{
                  opacity: phase >= 1 ? 1 : 0,
                  scale: phase >= 1 ? 1 : 0.97,
                  filter: phase >= 1 ? 'blur(0px)' : 'blur(4px)',
                }}
                transition={{ duration: 1.3, ease: EASE_EXPO }}
              />
              {phase >= 2 && (
                <motion.div
                  className="absolute top-0 left-0 h-full pointer-events-none"
                  style={{
                    width: '40%',
                    background:
                      'linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.55) 45%, rgba(212,175,106,0.35) 55%, transparent 100%)',
                    mixBlendMode: 'overlay',
                  }}
                  initial={{ x: '-120%' }}
                  animate={{ x: '260%' }}
                  transition={{ duration: 1.3, ease: EASE_SILK }}
                />
              )}
            </div>

            <motion.p
              className="font-body mt-7 text-center"
              style={{
                fontSize: '15px',
                fontWeight: 500,
                color: '#7A756F',
                textTransform: 'uppercase',
                maxWidth: '280px',
              }}
              initial={{ opacity: 0, letterSpacing: '0.4em', y: 8 }}
              animate={{
                opacity: phase >= 3 ? 1 : 0,
                letterSpacing: phase >= 3 ? '0.18em' : '0.4em',
                y: phase >= 3 ? 0 : 8,
              }}
              transition={{ duration: 1.4, ease: EASE_LUX }}
            >
              Curating Extraordinary Journeys
            </motion.p>

            <motion.div
              className="mt-6 h-px"
              style={{
                backgroundColor: '#D4AF6A',
                boxShadow: phase >= 5 ? '0 0 8px rgba(212,175,106,0.5)' : 'none',
              }}
              initial={{ width: 0, opacity: 0 }}
              animate={{
                width: phase >= 4 ? '120px' : 0,
                opacity: phase >= 4 ? 1 : 0,
              }}
              transition={{ duration: 1, ease: EASE_LUX }}
            />
          </div>

          {phase >= 6 && <FlightPath active={phase >= 6} exited={phase >= 7} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// A single rAF loop drives the line's stroke-dashoffset AND the plane's
// position/rotation together, so the plane always sits exactly on the
// line's tip — no drift, no two animation systems racing each other.
//
// FIX: previously the line's opacity was only ever set to 1 (at the start)
// and never faded back down, so after the plane flew off-screen and its
// own opacity dropped to 0, the fully-drawn golden line was left sitting
// on screen for a few hundred ms until the whole splash unmounted. Now
// the line fades out on the same tail curve (t > 0.85) as the plane and
// trail, so everything disappears together.
function FlightPath({ active, exited }) {
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const planeRef = useRef(null);
  const trailRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active || !pathRef.current) return;

    const svgPath = pathRef.current;
    const totalLen = svgPath.getTotalLength();
    svgPath.style.strokeDasharray = `${totalLen}`;
    svgPath.style.strokeDashoffset = `${totalLen}`;
    svgPath.style.opacity = 1;

    const start = performance.now();

    function frame(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / FLIGHT_DURATION_MS);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic

      // Line draw — same eased progress the plane uses
      svgPath.style.strokeDashoffset = `${totalLen * (1 - eased)}`;

      // Plane position — sampled from the exact same path, same length
      const point = svgPath.getPointAtLength(eased * totalLen);
      const lookahead = svgPath.getPointAtLength(Math.min(totalLen, (eased + 0.01) * totalLen));
      const angle = Math.atan2(lookahead.y - point.y, lookahead.x - point.x) * (180 / Math.PI);

      let opacity = 1;
      if (t < 0.06) opacity = t / 0.06;
      else if (t > 0.85) opacity = Math.max(0, (1 - t) / 0.15);
      if (exited) opacity = 0;

      // Line fade-out — mirrors the plane's tail-end fade so the line
      // disappears together with the plane instead of lingering behind.
      const lineOpacity = t > 0.85 ? Math.max(0, (1 - t) / 0.15) : 1;
      svgPath.style.opacity = exited ? 0 : lineOpacity;

      if (planeRef.current) {
        planeRef.current.setAttribute(
          'transform',
          `translate(${point.x} ${point.y}) rotate(${angle}) scale(${0.75 + eased * 0.35})`
        );
        planeRef.current.style.opacity = opacity;
      }
      if (trailRef.current) {
        trailRef.current.setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${angle})`);
        trailRef.current.style.opacity = opacity * 0.55;
      }

      if (t < 1) rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, exited]);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <defs>
        <linearGradient id="pathGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D4AF6A" stopOpacity="0" />
          <stop offset="40%" stopColor="#D4AF6A" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#C89B3C" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <path
        ref={pathRef}
        d={FLIGHT_PATH_D}
        fill="none"
        stroke="url(#pathGrad)"
        strokeWidth="0.15"
        strokeLinecap="round"
        style={{ opacity: 0, transition: 'opacity 0.25s ease-out' }}
      />

      {/* Soft trailing streak just behind the plane */}
      <g ref={trailRef} style={{ opacity: 0 }}>
        <path d="M0,0 L-3,0.5" stroke="#D4AF6A" strokeWidth="0.3" strokeLinecap="round" />
      </g>

      {/* User-supplied icon (airplane-svgrepo-com (2).svg), path data untouched.
          Nose vertex sits at -45deg from the icon's own bbox center, so the inner
          <g> applies a fixed rotate(45) + recenter + scale to point the nose at
          local +x — matching the convention the per-frame rotation expects.
          Only the outer <g ref={planeRef}> transform is touched at runtime. */}
      <g ref={planeRef} style={{ opacity: 0 }}>
        <g transform="rotate(45) scale(0.387) translate(-7.004,-9.339)">
          <path
            d="M12.382 5.304 10.096 7.59l.006.02L11.838 14a.908.908 0 0 1-.211.794l-.573.573a.339.339 0 0 1-.566-.08l-2.348-4.25-.745-.746-1.97 1.97a3.311 3.311 0 0 1-.75.504l.44 1.447a.875.875 0 0 1-.199.79l-.175.176a.477.477 0 0 1-.672 0l-1.04-1.039-.018-.02-.788-.786-.02-.02-1.038-1.039a.477.477 0 0 1 0-.672l.176-.176a.875.875 0 0 1 .79-.197l1.447.438a3.322 3.322 0 0 1 .504-.75l1.97-1.97-.746-.744-4.25-2.348a.339.339 0 0 1-.08-.566l.573-.573a.909.909 0 0 1 .794-.211l6.39 1.736.02.006 2.286-2.286c.37-.372 1.621-1.02 1.993-.65.37.372-.279 1.622-.65 1.993z"
            fill="#C89B3C"
          />
        </g>
      </g>
    </svg>
  );
}