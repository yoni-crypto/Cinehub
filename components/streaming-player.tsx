'use client';

import { useState, useEffect, useRef } from 'react';
import { Maximize, X } from 'lucide-react';

const STREAMCORE_URL = process.env.NEXT_PUBLIC_STREAMCORE_URL ?? 'http://localhost:3001';

// URL prefix that signals a StreamCore API endpoint (returns JSON, not an embed page)
const STREAMCORE_PREFIX = STREAMCORE_URL + '/';

interface StreamingPlayerProps {
  url: string;
  title: string;
  onClose?: () => void;
  onError?: () => void;
}

// Native HLS player — used when url is a StreamCore API endpoint
function HlsPlayer({ apiUrl, title, onError }: { apiUrl: string; title: string; onError?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [m3u8, setM3u8] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    setM3u8(null);
    setError(null);
    fetch(apiUrl)
      .then(r => r.json())
      .then((data: { sources?: { url: string; isM3U8: boolean }[]; error?: string }) => {
        if (data.error) throw new Error(data.error);
        const src = data.sources?.find(s => s.isM3U8)?.url ?? data.sources?.[0]?.url;
        if (!src) throw new Error('No sources returned');
        setM3u8(src);
      })
      .catch(err => {
        setError(err.message);
        onErrorRef.current?.();
      });
  }, [apiUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !m3u8) return;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = m3u8;
      video.play().catch(() => {});
      return;
    }

    let hls: import('hls.js').default | null = null;
    import('hls.js').then(({ default: Hls }) => {
      if (!Hls.isSupported()) return;
      hls = new Hls({ enableWorker: true });
      hls.loadSource(m3u8);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
    });

    return () => hls?.destroy();
  }, [m3u8]);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-center px-6">
        <span className="text-red-400 text-sm font-medium">StreamCore failed</span>
        <span className="text-white/40 text-xs">{error}</span>
      </div>
    );
  }

  if (!m3u8) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        <span className="text-white/60 text-xs">Fetching stream…</span>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      title={title}
      className="w-full h-full"
      controls
      autoPlay
      playsInline
    />
  );
}

export function StreamingPlayer({ url, title, onClose, onError }: StreamingPlayerProps) {
  const [overlayActive, setOverlayActive] = useState(true);
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNative = url.startsWith(STREAMCORE_PREFIX);

  useEffect(() => {
    if (isNative) return;
    setOverlayActive(true);
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
    overlayTimer.current = setTimeout(() => setOverlayActive(false), 1500);
    return () => { if (overlayTimer.current) clearTimeout(overlayTimer.current); };
  }, [url, isNative]);

  // Steal focus back when an iframe opens a pop-under
  useEffect(() => {
    if (isNative) return;
    const refocus = () => setTimeout(() => window.focus(), 50);
    window.addEventListener('blur', refocus);
    return () => window.removeEventListener('blur', refocus);
  }, [isNative]);

  const handleOverlayClick = () => {
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
    setTimeout(() => setOverlayActive(false), 300);
  };

  const requestFullscreen = () => {
    const el = document.querySelector('iframe, video') as HTMLElement & {
      webkitRequestFullscreen?: () => void;
      mozRequestFullScreen?: () => void;
      msRequestFullscreen?: () => void;
    };
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  };

  return (
    <div className="relative w-full aspect-video bg-black">
      {isNative ? (
        <HlsPlayer apiUrl={url} title={title} onError={onError} />
      ) : (
        <>
          <iframe
            src={url}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            frameBorder="0"
            title={title}
            referrerPolicy="no-referrer"
            loading="eager"
            onError={onError}
            onLoad={() => {}}
          />
          {overlayActive && (
            <div
              className="absolute inset-0 z-10 bg-black/70 flex flex-col items-center justify-center gap-3 cursor-pointer"
              onClick={handleOverlayClick}
            >
              <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              <span className="text-white/60 text-xs">Loading player…</span>
            </div>
          )}
        </>
      )}

      <div className="absolute top-2 right-2 flex gap-1">
        <button
          onClick={requestFullscreen}
          className="bg-black/70 hover:bg-black/90 text-white p-1.5 rounded text-xs transition-colors"
          title="Fullscreen"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
