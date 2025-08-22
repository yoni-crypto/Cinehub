'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, Star, Play, Heart, HeartOff, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showStreamingModal, setShowStreamingModal] = useState(false);
  const { user } = useAuth();

  const releaseYear = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : null;
  const rating = tvShow.vote_average ? Math.round(tvShow.vote_average * 10) / 10 : 0;

  const handleWatchTVShow = () => {
    try {
      setShowStreamingModal(true);
      toast.success(`Opening ${tvShow.name} for streaming`);
    } catch (error) {
      console.error('Error opening streaming:', error);
      toast.error('Failed to open streaming. Please try again.');
    }
  };

  const handleToggleWatchlist = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const isInWatchlist = await watchlistService.isInWatchlist(tvShow.id);
      if (isInWatchlist) {
        await watchlistService.removeFromWatchlist(tvShow.id);
        toast.success('Removed from watchlist');
      } else {
        await watchlistService.addToWatchlist(tvShow.id, tvShow.name, tvShow.poster_path || '');
        toast.success('Added to watchlist');
      }
    } catch (error: any) {
      console.error('Watchlist error:', error);
      toast.error(error.message || 'Failed to update watchlist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <motion.div
        className="group relative bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ y: -5 }}
      >
        <Link href={`/tv-shows/${tvShow.id}`} className="block">
          <div className="relative aspect-[2/3] overflow-hidden">
            <Image
              src={tmdbApi.getPosterUrl(tvShow.poster_path, 'w500')}
              alt={tvShow.name}
              fill
              className={`object-cover transition-transform duration-300 ${
                imageLoaded ? 'scale-100' : 'scale-110'
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

            {rating > 0 && (
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
                    onClick={(e) => {
                      e.preventDefault();
                      handleWatchTVShow();
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Watch TV Show
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0 bg-black/60 hover:bg-black/80 border-0"
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleWatchlist();
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    ) : (
                      <Heart className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Add to Watchlist
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </Link>

        <div className="p-4">
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {tvShow.name}
          </h3>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {releaseYear && (
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {releaseYear}
              </div>
            )}

            {rating > 0 && (
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
            {tvShow.overview}
          </motion.p>
        </div>
      </motion.div>

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
    </TooltipProvider>
  );
}
