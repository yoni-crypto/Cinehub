"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Star, Play } from 'lucide-react';
import { Movie } from '@/lib/types/movie';
import { tmdbApi } from '@/lib/api/tmdb';

import { AuthModal } from '@/components/auth/auth-modal';
import { StreamingModal } from './streaming-modal';

interface MovieCardProps {
  movie: Movie;
  showYear?: boolean;
  showRating?: boolean;
  showHDBadge?: boolean;
  priority?: boolean;
}

export function MovieCard({ 
  movie, 
  showYear = true, 
  showRating = true, 
  showHDBadge = true,
  priority = false
}: MovieCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showStreamingModal, setShowStreamingModal] = useState(false);

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  const rating = Math.round(movie.vote_average * 10) / 10;





  const handleWatchMovie = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowStreamingModal(true);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only prevent navigation on mobile if clicking interactive elements
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
        <Link href={`/movies/${movie.id}`} onClick={handleCardClick}>
          <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-gray-900/70 dark:bg-gray-900/70">
            <Image
              src={tmdbApi.getImageUrl(movie.poster_path, 'w500')}
              alt={`Watch ${movie.title}${releaseYear ? ` (${releaseYear})` : ''} Free Online HD | Stream Full Movie`}
              fill
              className={`object-cover transition-transform duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } group-hover:scale-[1.03]`}
              onLoad={() => setImageLoaded(true)}
              priority={priority}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />

            {/* Light dim + play button on hover */}
            <div className="absolute inset-0 z-[1] bg-black/0 group-hover:bg-black/40 transition-colors duration-150" />
            <div className="absolute inset-0 z-[2] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-600 shadow-md flex items-center justify-center">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" />
              </div>
            </div>
            
            {showRating && rating > 0 && (
              <div className="absolute bottom-1.5 left-1.5 z-[3] bg-black/85 text-[11px] text-white px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{rating}</span>
              </div>
            )}

            <div className="absolute top-2 right-2 z-[3] flex items-center gap-1.5 justify-end">
              {showHDBadge && (
                <span className="bg-white text-gray-900 border border-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                  HD
                </span>
              )}
            </div>
          </div>
        </Link>

        <div className="pt-2">
          <h3 className="font-medium text-foreground text-xs sm:text-sm line-clamp-1 mb-1">
            {movie.title}
          </h3>
          
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="truncate">
              {showYear && releaseYear && releaseYear}
              {movie.runtime && (
                <>
                  {' • '}
                  {movie.runtime}m
                </>
              )}
            </span>
            
            {showRating && rating > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white text-gray-900 border border-gray-900 dark:bg-gray-900/80 dark:text-white dark:border-gray-700 text-[10px] uppercase tracking-wide flex-shrink-0">
                Movie
              </span>
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