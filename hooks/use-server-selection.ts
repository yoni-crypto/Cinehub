'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getPreferredServer, setPreferredServer, type MediaKind } from '@/lib/streaming/servers';

// Shared across every page in the session so we only hit the health route once.
let healthPromise: Promise<Set<string>> | null = null;

function loadHealth(): Promise<Set<string>> {
  if (!healthPromise) {
    healthPromise = fetch('/api/streaming/health')
      .then((r) => (r.ok ? r.json() : { down: [] }))
      .then((d: { down?: string[] }) => new Set(d.down ?? []))
      .catch(() => new Set<string>());
  }
  return healthPromise;
}

/**
 * Picks which server to start on and handles fallback:
 *  1. the server the user last watched successfully on (if it's healthy)
 *  2. otherwise the first healthy server in list order
 * `next()` jumps to the next healthy server; `choose()` is a manual pick and
 * becomes the remembered preference.
 */
export function useServerSelection<T extends { id: string }>(kind: MediaKind, servers: T[]) {
  const [index, setIndex] = useState(0);
  const [down, setDown] = useState<Set<string>>(new Set());
  // Once the user picks a server, the async health result must not override it.
  const touched = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadHealth().then((d) => {
      if (cancelled) return;
      setDown(d);
      if (touched.current) return;
      const pref = getPreferredServer(kind);
      const prefIdx = pref ? servers.findIndex((s) => s.id === pref && !d.has(s.id)) : -1;
      const firstHealthy = servers.findIndex((s) => !d.has(s.id));
      setIndex(prefIdx >= 0 ? prefIdx : Math.max(firstHealthy, 0));
    });
    return () => {
      cancelled = true;
    };
    // servers is a module-level constant per page; kind is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const choose = useCallback(
    (i: number) => {
      touched.current = true;
      setIndex(i);
      if (servers[i]) setPreferredServer(kind, servers[i].id);
    },
    [kind, servers],
  );

  /** Skip to the next healthy server (wraps around). Returns the new index. */
  const next = useCallback(() => {
    let newIdx = index;
    for (let step = 1; step <= servers.length; step++) {
      const i = (index + step) % servers.length;
      if (!down.has(servers[i].id)) {
        newIdx = i;
        break;
      }
    }
    choose(newIdx);
    return newIdx;
  }, [index, servers, down, choose]);

  /** Call once playback has clearly been working (e.g. after a minute on the server). */
  const confirmWorking = useCallback(() => {
    if (servers[index]) setPreferredServer(kind, servers[index].id);
  }, [kind, servers, index]);

  const isDown = useCallback((i: number) => down.has(servers[i]?.id), [down, servers]);

  return { index, choose, next, confirmWorking, isDown };
}
