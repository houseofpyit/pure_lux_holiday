import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, sendAnalyticsHeartbeat } from '@/api/analytics.api';
import { getPageReferrer, getVisitorId } from '@/lib/analytics';

const HEARTBEAT_MS = 60_000;

export default function PageViewTracker() {
  const { pathname, search } = useLocation();
  const lastPathRef = useRef('');

  useEffect(() => {
    const path = `${pathname}${search || ''}`;
    if (!path || path === lastPathRef.current) return;
    lastPathRef.current = path;

    const payload = {
      visitor_id: getVisitorId(),
      path,
      page_title: typeof document !== 'undefined' ? document.title : null,
      referrer: getPageReferrer(),
    };

    trackPageView(payload).catch(() => {});
  }, [pathname, search]);

  useEffect(() => {
    const tick = () => {
      sendAnalyticsHeartbeat({ visitor_id: getVisitorId() }).catch(() => {});
    };

    tick();
    const timer = window.setInterval(tick, HEARTBEAT_MS);
    return () => window.clearInterval(timer);
  }, []);

  return null;
}
