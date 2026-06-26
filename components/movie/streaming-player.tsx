"use client";

import { useState, useEffect, useRef } from 'react';
import { Play, X, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tmdbApi } from '@/lib/api/tmdb';

const STREAMCORE_URL = process.env.NEXT_PUBLIC_STREAMCORE_URL ?? 'http://localhost:3001';

interface EmbedServer {
  type: 'embed';
  name: string;
  movieUrl: (id: number) => string;
  tvUrl: (id: number, season: number, episode: number) => string;
}

interface NativeServer {
  type: 'native';
  name: string;
}

type Server = EmbedServer | NativeServer;

const SERVERS: Server[] = [
  { type: 'native', name: 'StreamCore' },
  {
    type: 'embed',
    name: 'VidLink',
    movieUrl: (id) => `https://vidlink.pro/movie/${id}?autoplay=true&title=false`,
    tvUrl: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}?autoplay=true&title=false`,
  },
  {
    type: 'embed',
    name: '2Embed',
    movieUrl: (id) => `https://www.2embed.cc/embed/${id}`,
    tvUrl: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
  {
    type: 'embed',
    name: 'AutoEmbed',
    movieUrl: (id) => `https://autoembed.co/movie/tmdb/${id}`,
    tvUrl: (id, s, e) => `https://autoembed.co/tv/tmdb/${id}-${s}-${e}`,
  },
  {
    type: 'embed',
    name: 'SuperEmbed',
    movieUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tvUrl: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
  {
    type: 'embed',
    name: 'VidSrc',
    movieUrl: (id) => `https://vidsrc.fyi/embed/movie/${id}`,
    tvUrl: (id, s, e) => `https://vidsrc.fyi/embed/tv/${id}/${s}/${e}`,
  },
  {
    type: 'embed',
    name: 'Smashy',
    movieUrl: (id) => `https://embed.smashystream.com/playere.php?tmdb=${id}`,
    tvUrl: (id, s, e) => `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${s}&episode=${e}`,
  },
];

interface StreamingPlayerProps {
  movieId: number;
  title: string;
  posterPath?: string;
  backdropPath?: string;
  autoplay?: boolean;
  onClose?: () => void;
  isTVShow?: boolean;
  seasonNumber?: number;
  episodeNumber?: number;
}

// Native HLS player for StreamCore sources
function HlsPlayer({ src, title }: { src: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = src;
      video.play().catch(() => {});
      return;
    }

    let hls: import('hls.js').default | null = null;

    import('hls.js').then(({ default: Hls }) => {
      if (!Hls.isSupported()) return;
      hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
    });

    return () => hls?.destroy();
  }, [src]);

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

// StreamCore fetcher — calls the local API and returns the first m3u8 URL
function useStreamCore(
  movieId: number,
  isTVShow: boolean,
  seasonNumber: number,
  episodeNumber: number,
  enabled: boolean,
  onError?: () => void,
) {
  const [m3u8, setM3u8] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (!enabled) {
      setM3u8(null);
      setError(null);
      return;
    }
    setLoading(true);

    const endpoint = isTVShow
      ? `${STREAMCORE_URL}/tv/${movieId}/${seasonNumber}/${episodeNumber}`
      : `${STREAMCORE_URL}/movie/${movieId}`;

    fetch(endpoint)
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
      })
      .finally(() => setLoading(false));
  }, [movieId, isTVShow, seasonNumber, episodeNumber, enabled]);

  return { m3u8, error, loading };
}

export function StreamingPlayer({
  movieId,
  title,
  posterPath,
  backdropPath,
  autoplay = false,
  onClose,
  isTVShow = false,
  seasonNumber = 1,
  episodeNumber = 1,
}: StreamingPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [serverIndex, setServerIndex] = useState(0);
  const [overlayActive, setOverlayActive] = useState(true);
  const overlayTimer = useRef<NodeJS.Timeout | null>(null);

  const currentServer = SERVERS[serverIndex];
  const isNative = currentServer.type === 'native';

  const { m3u8, error: streamCoreError, loading: streamCoreLoading } = useStreamCore(
    movieId, isTVShow, seasonNumber, episodeNumber,
    isPlaying && isNative,
    () => setServerIndex(1),
  );

  // Steal focus back if an iframe opens a pop-under
  useEffect(() => {
    if (!isPlaying || isNative) return;
    const refocus = () => setTimeout(() => window.focus(), 50);
    window.addEventListener('blur', refocus);
    return () => window.removeEventListener('blur', refocus);
  }, [isPlaying, isNative]);

  // Overlay for iframe servers only
  useEffect(() => {
    if (isNative) return;
    setOverlayActive(true);
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
    overlayTimer.current = setTimeout(() => setOverlayActive(false), 1500);
    return () => { if (overlayTimer.current) clearTimeout(overlayTimer.current); };
  }, [serverIndex, movieId, seasonNumber, episodeNumber, isNative]);

  const getEmbedUrl = (index: number) => {
    const server = SERVERS[index];
    if (server.type !== 'embed') return '';
    return isTVShow
      ? server.tvUrl(movieId, seasonNumber, episodeNumber)
      : server.movieUrl(movieId);
  };

  const handleClose = () => {
    setIsPlaying(false);
    setServerIndex(0);
    setOverlayActive(true);
    onClose?.();
  };

  const handleServerChange = (index: number) => {
    setServerIndex(index);
    setIsPlaying(true);
  };

  const handleOverlayClick = () => {
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
    setTimeout(() => setOverlayActive(false), 300);
  };

  if (!isPlaying) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <img
          src={
            backdropPath ? tmdbApi.getBackdropUrl(backdropPath, 'w1280') :
            posterPath ? tmdbApi.getPosterUrl(posterPath, 'w500') :
            '/placeholder.png'
          }
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center">
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white h-20 w-20 rounded-full p-0 mb-4"
              onClick={() => setIsPlaying(true)}
            >
              <Play className="w-8 h-8 ml-1" fill="white" />
            </Button>
            <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
            <p className="text-gray-300 text-sm">Click to start streaming</p>
          </div>
        </div>
        {onClose && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-4 right-4 h-8 w-8 p-0 bg-black/60 hover:bg-black/80 border-0"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden">
      {/* Server switcher bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-black/90 border-b border-white/10 flex-wrap">
        <ServerCrash className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="text-xs text-gray-400 mr-1 shrink-0">Server:</span>
        {SERVERS.map((server, i) => (
          <button
            key={server.name}
            onClick={() => handleServerChange(i)}
            className={`text-xs px-2 py-0.5 rounded transition-colors ${
              i === serverIndex
                ? 'bg-red-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {server.name}
            {server.type === 'native' && (
              <span className="ml-1 text-green-400 text-[10px]">★</span>
            )}
          </button>
        ))}
        {onClose && (
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto h-6 w-6 p-0 text-gray-400 hover:text-white"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="aspect-video relative bg-black">
        {isNative ? (
          streamCoreLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              <span className="text-white/60 text-xs">Fetching stream…</span>
            </div>
          ) : streamCoreError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
              <span className="text-red-400 text-sm font-medium">StreamCore failed</span>
              <span className="text-white/40 text-xs">{streamCoreError}</span>
              <button
                onClick={() => handleServerChange(1)}
                className="mt-2 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition-colors"
              >
                Try VidLink instead
              </button>
            </div>
          ) : m3u8 ? (
            <HlsPlayer src={m3u8} title={title} />
          ) : null
        ) : (
          <>
            <iframe
              key={`${serverIndex}-${movieId}-${seasonNumber}-${episodeNumber}`}
              src={getEmbedUrl(serverIndex)}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="w-full h-full"
              style={{ border: 'none' }}
              referrerPolicy="no-referrer"
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
      </div>
    </div>
  );
}
