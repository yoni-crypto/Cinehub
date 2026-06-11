"use client";

import { useState, useEffect, useRef } from 'react';
import { Play, X, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tmdbApi } from '@/lib/api/tmdb';

interface Server {
  name: string;
  movieUrl: (id: number) => string;
  tvUrl: (id: number, season: number, episode: number) => string;
}

// VidLink first — cleanest, least aggressive ads
const SERVERS: Server[] = [
  {
    name: 'VidLink',
    movieUrl: (id) => `https://vidlink.pro/movie/${id}?autoplay=true&title=false`,
    tvUrl: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}?autoplay=true&title=false`,
  },
  {
    name: '2Embed',
    movieUrl: (id) => `https://www.2embed.cc/embed/${id}`,
    tvUrl: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
  {
    name: 'AutoEmbed',
    movieUrl: (id) => `https://autoembed.co/movie/tmdb/${id}`,
    tvUrl: (id, s, e) => `https://autoembed.co/tv/tmdb/${id}-${s}-${e}`,
  },
  {
    name: 'SuperEmbed',
    movieUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tvUrl: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
  {
    name: 'VidSrc',
    movieUrl: (id) => `https://vidsrc.fyi/embed/movie/${id}`,
    tvUrl: (id, s, e) => `https://vidsrc.fyi/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: 'Smashy',
    movieUrl: (id) => `https://embed.smashystream.com/playere.php?tmdb=${id}`,
    tvUrl: (id, s, e) => `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    name: 'EmbedAPI',
    movieUrl: (id) => `https://player.embed-api.stream/?id=${id}`,
    tvUrl: (id, s, e) => `https://player.embed-api.stream/?id=${id}&s=${s}&e=${e}`,
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
  // Overlay sits on top of the iframe to absorb the first click that ad scripts wait for
  const [overlayActive, setOverlayActive] = useState(true);
  const overlayTimer = useRef<NodeJS.Timeout | null>(null);

  // Steal focus back if the iframe somehow opens a pop-under
  useEffect(() => {
    if (!isPlaying) return;
    const refocus = () => setTimeout(() => window.focus(), 50);
    window.addEventListener('blur', refocus);
    return () => window.removeEventListener('blur', refocus);
  }, [isPlaying]);

  // Reset overlay whenever the server or content changes
  useEffect(() => {
    setOverlayActive(true);
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
    // Auto-drop the overlay after 4s — by then autoplay has started
    // and the iframe's fake-click layer is no longer the threat
    overlayTimer.current = setTimeout(() => setOverlayActive(false), 1500);
    return () => { if (overlayTimer.current) clearTimeout(overlayTimer.current); };
  }, [serverIndex, movieId, seasonNumber, episodeNumber]);

  const getUrl = (index: number) => {
    const server = SERVERS[index];
    return isTVShow
      ? server.tvUrl(movieId, seasonNumber, episodeNumber)
      : server.movieUrl(movieId);
  };

  const handlePlay = () => setIsPlaying(true);

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

  // User clicked our overlay — absorb it (kills the ad trigger),
  // then drop the overlay after a short delay so the NEXT click hits the real player
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
              onClick={handlePlay}
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

      <div className="aspect-video relative">
        <iframe
          key={`${serverIndex}-${movieId}-${seasonNumber}-${episodeNumber}`}
          src={getUrl(serverIndex)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="w-full h-full"
          style={{ border: 'none' }}
          referrerPolicy="no-referrer"
        />
        {/* Loading overlay — visible so users know the player is buffering,
            blocks ad-click triggers during the first 1.5s, then auto-drops. */}
        {overlayActive && (
          <div
            className="absolute inset-0 z-10 bg-black/70 flex flex-col items-center justify-center gap-3 cursor-pointer"
            onClick={handleOverlayClick}
          >
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-white/60 text-xs">Loading player…</span>
          </div>
        )}
      </div>
    </div>
  );
}
