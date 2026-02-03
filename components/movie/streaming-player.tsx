"use client";

import { useState, useEffect } from 'react';
import { Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { streamingApi } from '@/lib/api/streaming';
import { tmdbApi } from '@/lib/api/tmdb';
import { AdBlockDetector } from '@/components/ad-block-detector';
import { LoadingScreen } from '@/components/loading-screen';

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
  seasonNumber,
  episodeNumber
}: StreamingPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(autoplay);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPlaying && !embedUrl) {
      fetchEmbedUrl();
    }
  }, [isPlaying, embedUrl]);

  const fetchEmbedUrl = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the reliable source directly
      const directUrl = `https://vidsrc.cc/v2/embed/movie/${movieId}`;
      console.log('Using direct streaming URL:', directUrl);
      setEmbedUrl(directUrl);
    } catch (err) {
      setError('Failed to load streaming');
      console.error('Error setting embed URL:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setHasStartedPlaying(true);
  };

  const handleClose = () => {
    setIsPlaying(false);
    setHasStartedPlaying(false);
    setEmbedUrl(null);
    setError(null);
    onClose?.();
  };

  if (!isPlaying && !hasStartedPlaying) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <img
          src={backdropPath ? tmdbApi.getBackdropUrl(backdropPath, 'w1280') :
               posterPath ? tmdbApi.getPosterUrl(posterPath, 'w500') :
               '/placeholder-movie.jpg'}
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

  if (isLoading) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <LoadingScreen message="Loading stream…" compact />
        {onClose && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-4 right-4 h-8 w-8 p-0 bg-black/60 hover:bg-black/80 border-0 z-10"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <AdBlockDetector />
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <div className="space-y-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-red-600 hover:bg-red-700 text-white mr-2"
                onClick={handlePlay}
              >
                Try Again
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-white border-white/30"
                onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' trailer')}`, '_blank')}
              >
                Watch Trailer Instead
              </Button>
            </div>
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
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      {embedUrl && (
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
          frameBorder="0"
          loading="lazy"
          referrerPolicy="no-referrer"
          style={{ border: 'none' }}
          onLoad={() => {
            console.log('Streaming iframe loaded successfully');
            // Try to unmute after load
            setTimeout(() => {
              const iframe = document.querySelector('iframe');
              if (iframe && iframe.contentWindow) {
                try {
                  iframe.contentWindow.postMessage({ action: 'unmute' }, '*');
                } catch (e) {
                  console.log('Could not unmute automatically');
                }
              }
            }, 1000);
          }}
          onError={() => {
            console.error('Streaming iframe failed to load, trying alternative...');
            const altSources = [
              `https://vidsrc.xyz/embed/movie/${movieId}`,
              `https://embedder.net/e/movie?tmdb=${movieId}`,
              `https://vidsrc.me/embed/movie?tmdb=${movieId}`
            ];
            
            const currentIndex = altSources.findIndex(src => embedUrl.includes(src.split('/')[2]));
            const nextSource = altSources[currentIndex + 1] || altSources[0];
            
            console.log('Trying next source:', nextSource);
            setEmbedUrl(nextSource);
          }}
        />
      )}

      {onClose && (
        <Button
          size="sm"
          variant="secondary"
          className="absolute top-2 right-2 sm:top-4 sm:right-4 h-8 w-8 sm:h-10 sm:w-10 p-0 bg-black/60 hover:bg-black/80 border-0 z-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      )}
    </div>
  );
}
