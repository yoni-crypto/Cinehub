'use client';

import { useEffect, useRef, useState } from 'react';
import { adsConfig, adsEnabled, type AdSlotConfig } from '@/lib/config/ads';

interface AdSlotProps {
  configKey: keyof typeof adsConfig;
  className?: string;
  minHeight?: number;
}

export function AdSlot({ configKey, className = '', minHeight = 100 }: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  if (!adsEnabled) return null;

  const config = adsConfig[configKey] as AdSlotConfig;
  if (!config?.enabled) return null;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setMounted(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!mounted) {
    return <div ref={containerRef} className={className} style={{ minHeight }} aria-hidden="true" />;
  }

  return (
    <div ref={containerRef} className={className}>
      {config.label && (
        <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-muted-foreground/50">
          {config.label}
        </p>
      )}
      {config.html && (
        <div
          dangerouslySetInnerHTML={{ __html: config.html }}
          data-ad-slot={configKey}
        />
      )}
      {!config.html && config.iframeSrc && (
        <iframe
          src={config.iframeSrc}
          title={config.label ?? `Ad slot ${configKey}`}
          className="mx-auto block"
          loading="lazy"
          scrolling="no"
          frameBorder="0"
        />
      )}
    </div>
  );
}