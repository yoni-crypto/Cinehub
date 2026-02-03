"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Star, Play, Heart } from 'lucide-react';
import { Movie } from '@/lib/types/movie';
import { tmdbApi } from '@/lib/api/tmdb';
import { useAuth } from '@/lib/auth/auth-provider';
import { watchlistService } from '@/lib/services/watchlist';
import { toast } from 'sonner';
import { AuthModal } from '@/components/auth/auth-modal';
import { StreamingModal } from './streaming-modal';

interface MovieCardProps {
  movie: Movie;
  showYear?: boolean;
  showRating?: boolean;
  priority?: boolean;
}

export function MovieCard({ 
  movie, 
  showYear = true, 
  showRating = true, 
  priority = false
}: MovieCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showStreamingModal, setShowStreamingModal] = useState(false);
  const { user } = useAuth();

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  const rating = Math.round(movie.vote_average * 10) / 10;

  useEffect(() => {
    if (user) {
      checkWatchlistStatus();
    }
  }, [user, movie.id]);

  const checkWatchlistStatus = async () => {
    try {
      const status = await watchlistService.isInWatchlist(movie.id);
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
        await watchlistService.removeFromWatchlist(movie.id);
        setIsInWatchlist(false);
        toast.success('Removed from watchlist');
      } else {
        await watchlistService.addToWatchlist(movie.id, movie.title, movie.poster_path || '');
        setIsInWatchlist(true);
        toast.success('Added to watchlist');
      }
    } catch (error: any) {
      console.error('Watchlist error:', error);
      if (error.message.includes('already in your watchlist')) {
        toast.error('Movie is already in your watchlist');
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

  const handleWatchMovie = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setShowStreamingModal(true);
      toast.success(`Opening ${movie.title} for streaming`);
    } catch (error) {
      console.error('Error opening streaming:', error);
      toast.error('Failed to open streaming. Please try again.');
    }
  };

  return (
    <>
      <div
        className="group relative bg-gray-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-red-600/50 transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/movies/${movie.id}`}>
          <div className="relative aspect-[2/3] overflow-hidden">
            <Image
              src={tmdbApi.getImageUrl(movie.poster_path, 'w500')}
              alt={movie.title}
              fill
              className={`object-cover transition-transform duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } group-hover:scale-105`}
              onLoad={() => setImageLoaded(true)}
              priority={priority}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            
            <div 
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />

            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              </div>
            </div>

            {showRating && rating > 0 && (
              <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center">
                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                {rating}
              </div>
            )}

            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                className="w-8 h-8 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center transition-colors"
                onClick={handleToggleWatchlist}
                disabled={isLoading}
                title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                ) : isInWatchlist ? (
                  <Heart className="w-4 h-4 text-red-400" fill="currentColor" />
                ) : (
                  <Heart className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </div>
        </Link>

        <div className="p-3">
          <h3 className="font-medium text-white text-sm line-clamp-2 mb-2">
            {movie.title}
          </h3>
          
          <div className="flex items-center justify-between text-xs text-gray-400">
            {showYear && releaseYear && (
              <span>{releaseYear}</span>
            )}
            
            {showRating && rating > 0 && (
              <div className="flex items-center">
                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                {rating}
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      
      <StreamingModal
        isOpen={showStreamingModal}
        onClose={() => setShowStreamingModal(false)}
        movieId={movie.id}
        title={movie.title}
        posterPath={movie.poster_path || undefined}
        backdropPath={movie.backdrop_path || undefined}
      />
    </>
  );
}