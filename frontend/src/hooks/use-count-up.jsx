import { useState, useEffect, useRef } from 'react';

export function useCountUp(target, duration = 2000, suffix = '') {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    // Parse the numeric part from the target (e.g. "15+" -> 15, "98%" -> 98)
    const numericTarget = parseInt(target.replace(/[^0-9]/g, ''), 10);
    if (isNaN(numericTarget)) {
      setCount(target);
      return;
    }

    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * numericTarget);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(numericTarget);
      }
    };

    requestAnimationFrame(animate);
  }, [started, target, duration]);

  return { count, ref, started };
}