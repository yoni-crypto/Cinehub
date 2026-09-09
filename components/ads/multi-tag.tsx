'use client';

import { useEffect } from 'react';

const TAG_SRC = 'https://quge5.com/88/tag.min.js';
const TAG_ZONE = '278163';
const LOAD_DELAY_MS = 1500;

export function MultiTagLoader() {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const alreadyLoaded = document.querySelector(`script[data-zone="${TAG_ZONE}"]`);
    if (alreadyLoaded) return;

    const timer = setTimeout(() => {
      const s = document.createElement('script');
      s.src = TAG_SRC;
      s.dataset.zone = TAG_ZONE;
      s.async = true;
      s.dataset.cfasync = 'false';
      s.referrerPolicy = 'no-referrer-when-downgrade';
      document.head.appendChild(s);
    }, LOAD_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  return null;
}