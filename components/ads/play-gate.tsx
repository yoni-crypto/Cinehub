'use client';

import { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';

export const GATE_DURATION_S = 5;
export const PLAY_GATE_INTERVAL_KEY = 'cinehub:play-gate:last';

export function shouldShowPlayGate(): boolean {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return true;
  const last = Number(sessionStorage.getItem(PLAY_GATE_INTERVAL_KEY) ?? 0);
  const minInterval = 3 * 60 * 1000;
  return Date.now() - last > minInterval;
}

export function markPlayGateShown(): void {
  try {
    sessionStorage.setItem(PLAY_GATE_INTERVAL_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

interface PlayGateProps {
  open: boolean;
  onDone: () => void;
  onCancel: () => void;
}

export function PlayGate({ open, onDone, onCancel }: PlayGateProps) {
  const [remaining, setRemaining] = useState(GATE_DURATION_S);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!open) return;
    setRemaining(GATE_DURATION_S);

    const started = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - started) / 1000;
      const left = Math.max(0, GATE_DURATION_S - Math.ceil(elapsed));
      setRemaining(left);
      if (left <= 0) {
        clearInterval(timer);
        doneRef.current();
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center gap-4 text-center px-6">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-red-600 animate-spin" />
        <span className="absolute text-sm font-semibold text-white">{remaining}</span>
      </div>

      <div>
        <p className="text-white text-lg font-semibold">Loading your player…</p>
        <p className="text-white/40 text-sm mt-1 max-w-sm">
          Starting in {remaining}s
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 max-w-sm">
        <p className="text-white/60 text-xs leading-relaxed">
          CineHub is 100% free to stream. The ads you see help us cover server
          costs so you can keep watching without paying a thing.
        </p>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="mt-2 inline-flex items-center gap-1.5 text-white/40 hover:text-white text-xs transition-colors"
      >
        <X className="w-3.5 h-3.5" />
        Skip for now
      </button>
    </div>
  );
}