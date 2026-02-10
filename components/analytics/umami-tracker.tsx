'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: any) => void;
    };
  }
}

export function UmamiTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.umami) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      window.umami.track('pageview', { url, referrer: document.referrer });
    }
  }, [pathname, searchParams]);

  return null;
}

// Optimized event tracker with debouncing
let eventQueue: Array<{ event: string; data?: any }> = [];
let flushTimeout: NodeJS.Timeout | null = null;

const flushEvents = () => {
  if (eventQueue.length === 0 || !window.umami) return;
  
  eventQueue.forEach(({ event, data }) => {
    window.umami!.track(event, data);
  });
  eventQueue = [];
};

export const trackEvent = (event: string, data?: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.umami) return;
  
  // Queue event and flush after 100ms to batch multiple events
  eventQueue.push({ event, data });
  
  if (flushTimeout) clearTimeout(flushTimeout);
  flushTimeout = setTimeout(flushEvents, 100);
};

// Useful analytics helpers
export const analytics = {
  // Search tracking
  search: (query: string, results: number) => 
    trackEvent('search', { query, results }),
  
  // Watchlist actions
  addWatchlist: (title: string, type: 'movie' | 'tv') => 
    trackEvent('add_watchlist', { title, type }),
  
  removeWatchlist: (title: string, type: 'movie' | 'tv') => 
    trackEvent('remove_watchlist', { title, type }),
  
  // Filter/Sort usage
  filter: (type: string, value: string) => 
    trackEvent('filter', { type, value }),
  
  sort: (by: string) => 
    trackEvent('sort', { by }),
  
  // Video quality selection
  qualityCheck: (title: string, quality: string) => 
    trackEvent('quality_check', { title, quality }),
};
