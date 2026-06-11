"use client";

import { useState } from 'react';
import { Play, X, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tmdbApi } from '@/lib/api/tmdb';

interface Server {
  name: string;
  movieUrl: (id: number) => string;
  tvUrl: (id: number, season: number, episode: number) => string;
}

const SERVERS: Server[] = [
  {
    name: 'VidSrc',
    movieUrl: (id) => `https://vidsrc.fyi/embed/movie/${id}`,
    tvUrl: (id, s, e) => `https://vidsrc.fyi/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: 'AutoEmbed',
    movieUrl: (id) => `https://autoembed.co/movie/tmdb/${id}`,
    tvUrl: (id, s, e) => `https://autoembed.co/tv/tmdb/${id}-${s}-${e}`,
  },
  {
    name: 'VidLink',
    movieUrl: (id) => `https://vidlink.pro/movie/${id}`,
    tvUrl: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}`,
  },
  {
    name: 'Smashy',
    movieUrl: (id) => `https://embed.smashystream.com/playere.php?tmdb=${id}`,
    tvUrl: (id, s, e) => `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    name: '2Embed',
    movieUrl: (id) => `https://www.2embed.cc/embed/${id}`,
    tvUrl: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
  {
    name: 'SuperEmbed',
    movieUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tvUrl: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
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
    onClose?.();
  };

  const handleServerChange = (index: number) => {
    setServerIndex(index);
    setIsPlaying(true);
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

      <div className="aspect-video">
        <iframe
          key={`${serverIndex}-${movieId}-${seasonNumber}-${episodeNumber}`}
          src={getUrl(serverIndex)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          className="w-full h-full"
          style={{ border: 'none' }}
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
