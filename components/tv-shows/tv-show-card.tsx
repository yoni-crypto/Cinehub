"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Star, Play, Heart } from 'lucide-react';
import { TVShow } from '@/lib/api/tmdb';
import { tmdbApi } from '@/lib/api/tmdb';
import { useAuth } from '@/lib/auth/auth-provider';
import { watchlistService } from '@/lib/services/watchlist';
import { toast } from 'sonner';
import { AuthModal } from '@/components/auth/auth-modal';
import { StreamingModal } from '../movie/streaming-modal';

interface TVShowCardProps {
  tvShow: TVShow;
  priority?: boolean;
}

export function TVShowCard({ tvShow, priority = false }: TVShowCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showStreamingModal, setShowStreamingModal] = useState(false);
  const [showDetails, setShowDetails] = useState<any>(null);
  const { user } = useAuth();

  const releaseYear = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : '';
  const rating = Math.round(tvShow.vote_average * 10) / 10;

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const details = await tmdbApi.getTVShowDetails(tvShow.id);
        setShowDetails(details);
      } catch (error) {
        console.error('Error loading TV show details:', error);
      }
    };
    loadDetails();
  }, [tvShow.id]);

  useEffect(() => {
    if (user) {
      checkWatchlistStatus();
    }
  }, [user, tvShow.id]);

  const checkWatchlistStatus = async () => {
    try {
      const status = await watchlistService.isInWatchlist(tvShow.id);
      setIsInWatchlist(status);
    } catch (error) {
      console.error('Error checking watchlist status:', error);
      setIsInWatchlist(false);
    }
  };

  const handleToggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);
    try {
      if (isInWatchlist) {
        await watchlistService.removeFromWatchlist(tvShow.id);
        setIsInWatchlist(false);
        toast.success('Removed from watchlist');
      } else {
        await watchlistService.addToWatchlist(tvShow.id, tvShow.name, tvShow.poster_path || '');
        setIsInWatchlist(true);
        toast.success('Added to watchlist');
      }
    } catch (error: any) {
      console.error('Watchlist error:', error);
      if (error.message.includes('already in your watchlist')) {
        toast.error('TV show is already in your watchlist');
        setIsInWatchlist(true);
      } else if (error.message.includes('not configured')) {
        toast.error('Watchlist feature is not available. Please check your configuration.');
      } else {
        toast.error(error.message || 'Failed to update watchlist');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatchTVShow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowStreamingModal(true);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isMobile = window.innerWidth < 768;
    
    if (isMobile && (target.closest('button') || target.closest('[role="button"]'))) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  };

  return (
    <>
      <div
        className="group relative rounded-lg overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/tv-shows/${tvShow.id}`} onClick={handleCardClick}>
          <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-gray-900/70 dark:bg-gray-900/70">
            <Image
              src={tmdbApi.getPosterUrl(tvShow.poster_path, 'w500')}
              alt={tvShow.name}
              fill
              className={`object-cover transition-transform duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } group-hover:scale-[1.03]`}
              onLoad={() => setImageLoaded(true)}
              priority={priority}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />

            <div className="absolute inset-0 z-[1] bg-black/0 group-hover:bg-black/40 transition-colors duration-150" />
            <div className="absolute inset-0 z-[2] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-600 shadow-md flex items-center justify-center">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" />
              </div>
            </div>
            
            {rating > 0 && (
              <div className="absolute bottom-1.5 left-1.5 z-[3] bg-black/85 text-[11px] text-white px-1.5 py-0.5 rounded flex items-center gap-1">
                <span className="text-[10px] opacity-80">IMDb</span>
                <span className="font-semibold">{rating}</span>
              </div>
            )}

            <div className="absolute top-2 right-2 z-[3] flex items-center gap-1.5 justify-end">
              <span className="bg-white text-gray-900 border border-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                HD
              </span>
            </div>
          </div>
        </Link>

        <div className="pt-2">
          <h3 className="font-medium text-foreground text-xs sm:text-sm line-clamp-1 mb-1">
            {tvShow.name}
          </h3>
          
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="truncate">
              {showDetails?.last_episode_to_air ? (
                `SS ${showDetails.last_episode_to_air.season_number} . E ${showDetails.last_episode_to_air.episode_number}`
              ) : (
                releaseYear && releaseYear
              )}
            </span>
            
            {rating > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white text-gray-900 border border-gray-900 dark:bg-gray-900/80 dark:text-white dark:border-gray-700 text-[10px] uppercase tracking-wide flex-shrink-0">
                TV
              </span>
            )}
          </div>
        </div>
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      
      <StreamingModal
        isOpen={showStreamingModal}
        onClose={() => setShowStreamingModal(false)}
        movieId={tvShow.id}
        title={tvShow.name}
        posterPath={tvShow.poster_path || undefined}
        backdropPath={tvShow.backdrop_path || undefined}
        isTVShow={true}
      />
    </>
  );
}
