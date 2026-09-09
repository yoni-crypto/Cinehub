'use client';

import { useEffect, useRef } from 'react';
import { adsConfig, type AdFormatConfig, type AdFormatKey } from '@/lib/config/ads';

interface AdScriptLoaderProps {
  configKey: AdFormatKey;
}

const SESSION_KEY_PREFIX = 'cinehub:ad:session-shows:';
const LAST_SHOW_KEY_PREFIX = 'cinehub:ad:last-shown:';

function canShow(key: string, config: AdFormatConfig): boolean {
  if (typeof window === 'undefined') return false;

  const lastShown = Number(localStorage.getItem(`${LAST_SHOW_KEY_PREFIX}${key}`) ?? 0);
  const now = Date.now();

  if (config.minSecondsBetweenShows && now - lastShown < config.minSecondsBetweenShows * 1000) {
    return false;
  }

  const sessionShows = Number(sessionStorage.getItem(`${SESSION_KEY_PREFIX}${key}`) ?? 0);
  if (config.maxShowsPerSession && sessionShows >= config.maxShowsPerSession) {
    return false;
  }

  return true;
}

function markShown(key: string, config: AdFormatConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${LAST_SHOW_KEY_PREFIX}${key}`, String(Date.now()));
  const sessionShows = Number(sessionStorage.getItem(`${SESSION_KEY_PREFIX}${key}`) ?? 0) + 1;
  sessionStorage.setItem(`${SESSION_KEY_PREFIX}${key}`, String(sessionShows));

  if (config.maxShowsPerSession && sessionShows >= config.maxShowsPerSession) {
    try {
      localStorage.setItem(`${SESSION_KEY_PREFIX}${key}:done`, '1');
    } catch {
      /* ignore */
    }
  }
}

export function AdScriptLoader({ configKey }: AdScriptLoaderProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    const config = adsConfig[configKey] as AdFormatConfig;
    if (!config?.enabled) return;
    if (firedRef.current) return;

    const scriptSrc = config.scriptSrc?.trim();
    const scriptInline = config.scriptInline?.trim();
    if (!scriptSrc && !scriptInline) return;

    if (configKey !== 'pushNotifications' && !canShow(configKey, config)) return;

    const timer = setTimeout(
      () => {
        if (firedRef.current) return;
        firedRef.current = true;

        if (configKey !== 'pushNotifications') {
          markShown(configKey, config);
        }

        try {
          if (scriptInline) {
            const s = document.createElement('script');
            s.type = 'text/javascript';
            s.text = scriptInline;
            document.head.appendChild(s);
          }
          if (scriptSrc) {
            const s = document.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = scriptSrc;
            document.head.appendChild(s);
          }
        } catch (e) {
          console.error(`Failed to load ad script [${configKey}]:`, e);
        }
      },
      config.loadDelayMs ?? 0
    );

    return () => clearTimeout(timer);
  }, [configKey]);

  return null;
}