"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, HeartOff } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-provider';
import { watchlistService } from '@/lib/services/watchlist';
import { toast } from 'sonner';
import { AuthModal } from '@/components/auth/auth-modal';

interface WatchlistButtonProps {
  movieId: number;
  movieTitle: string;
  moviePoster: string;
  className?: string;
}

export function WatchlistButton({ movieId, movieTitle, moviePoster, className }: WatchlistButtonProps) {
  const { user } = useAuth();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check if movie is in watchlist on component mount
  useEffect(() => {
    if (user) {
      checkWatchlistStatus();
    }
  }, [user, movieId]);

  const checkWatchlistStatus = async () => {
    try {
      const status = await watchlistService.isInWatchlist(movieId);
      setIsInWatchlist(status);
    } catch (error) {
      console.error('Error checking watchlist status:', error);
      // Don't show error to user, just assume not in watchlist
      setIsInWatchlist(false);
    }
  };

  const handleToggleWatchlist = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);
    try {
      if (isInWatchlist) {
        await watchlistService.removeFromWatchlist(movieId);
        setIsInWatchlist(false);
        toast.success('Removed from watchlist');
      } else {
        await watchlistService.addToWatchlist(movieId, movieTitle, moviePoster);
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

  return (
    <>
      <Button
        size="lg"
        variant="outline"
        className={`border-white/30 text-white hover:bg-white/10 px-8 ${className || ''}`}
        onClick={handleToggleWatchlist}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : isInWatchlist ? (
          <>
            <HeartOff className="w-4 h-4 mr-2" />
            Remove from Watchlist
          </>
        ) : (
          <>
            <Heart className="w-4 h-4 mr-2" />
            Add to Watchlist
          </>
        )}
      </Button>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
}
