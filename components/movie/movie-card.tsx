"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, Star, Play, Heart, HeartOff, ExternalLink } from 'lucide-react';
import { Movie } from '@/lib/types/movie';
import { tmdbApi } from '@/lib/api/tmdb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/auth-provider';
import { watchlistService } from '@/lib/services/watchlist';
import { toast } from 'sonner';
import { AuthModal } from '@/components/auth/auth-modal';
import { StreamingModal } from './streaming-modal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
      <TooltipProvider>
        <motion.div
          className="group relative bg-card rounded-lg overflow-hidden border border-border/50 card-hover"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <Link href={`/movies/${movie.id}`}>
            <div className="relative aspect-[2/3] overflow-hidden">
              <Image
                src={tmdbApi.getImageUrl(movie.poster_path, 'w500')}
                alt={movie.title}
                fill
                className={`object-cover transition-all duration-500 ${
                  imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                } group-hover:scale-110`}
                onLoad={() => setImageLoaded(true)}
                priority={priority}
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              
              <motion.div 
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
              />

              <motion.div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: isHovered ? 1 : 0, 
                  opacity: isHovered ? 1 : 0 
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </div>
              </motion.div>

              {showRating && rating > 0 && (
                <Badge className="absolute top-2 left-2 bg-black/80 text-white border-0">
                  <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {rating}
                </Badge>
              )}

              <div className="absolute top-2 right-2 flex gap-1 opacity-0 sm:group-hover:opacity-100 transition-opacity sm:opacity-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700 border-0"
                      onClick={handleWatchMovie}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Watch Full Movie
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 bg-black/60 hover:bg-black/80 border-0"
                      onClick={handleToggleWatchlist}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      ) : isInWatchlist ? (
                        <HeartOff className="w-4 h-4 text-red-400" />
                      ) : (
                        <Heart className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </Link>

          <div className="p-4">
            <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {movie.title}
            </h3>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {showYear && releaseYear && (
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {releaseYear}
                </div>
              )}
              
              {showRating && rating > 0 && (
                <div className="flex items-center">
                  <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {rating}
                </div>
              )}
            </div>

            <motion.p
              className="text-xs text-muted-foreground mt-2 line-clamp-3"
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: isHovered ? 'auto' : 0, 
                opacity: isHovered ? 1 : 0 
              }}
              transition={{ duration: 0.3 }}
            >
              {movie.overview}
            </motion.p>
          </div>
        </motion.div>
      </TooltipProvider>

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