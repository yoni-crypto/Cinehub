"use client";

import { useState, useEffect } from 'react';
import { Play, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { streamingApi } from '@/lib/api/streaming';
import { tmdbApi } from '@/lib/api/tmdb';

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
      let url;
      if (isTVShow && seasonNumber && episodeNumber) {
        url = await streamingApi.getTVShowEmbedUrl(movieId, seasonNumber, episodeNumber);
      } else {
        url = await streamingApi.getEmbedUrl(movieId);
      }

      if (url) {
        setEmbedUrl(url);
      } else {
        setError(isTVShow ? 'Streaming not available for this TV show episode' : 'Streaming not available for this movie');
      }
    } catch (err) {
      setError('Failed to load streaming');
      console.error('Error fetching embed URL:', err);
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
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-sm">Loading streaming...</p>
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

  if (error) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <Button
            size="sm"
            variant="secondary"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handlePlay}
          >
            Try Again
          </Button>
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
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          onLoad={() => {
            // Prevent any navigation when iframe loads
            console.log('Streaming iframe loaded successfully');
          }}
          onError={() => {
            console.error('Streaming iframe failed to load');
            setError('Failed to load streaming player');
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
