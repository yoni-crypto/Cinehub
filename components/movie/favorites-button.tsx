"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Star, StarOff } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-provider';
import { favoritesService } from '@/lib/services/favorites';
import { toast } from 'sonner';
import { AuthModal } from '@/components/auth/auth-modal';


interface FavoritesButtonProps {
  movieId: number;
  movieTitle: string;
  moviePoster: string;
  className?: string;
  size?: 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export function FavoritesButton({ 
  movieId, 
  movieTitle, 
  moviePoster, 
  className = '',
  size = 'lg',
  variant = 'outline'
}: FavoritesButtonProps) {
  const { user } = useAuth();
  const [isInFavorites, setIsInFavorites] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (user) {
      checkFavoritesStatus();
    }
  }, [user, movieId]);

  const checkFavoritesStatus = async () => {
    try {
      const status = await favoritesService.isInFavorites(movieId);
      setIsInFavorites(status);
    } catch (error) {
      console.error('Error checking favorites status:', error);
      setIsInFavorites(false);
    }
  };

  const handleToggleFavorites = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);
    try {
      if (isInFavorites) {
        await favoritesService.removeFromFavorites(movieId);
        setIsInFavorites(false);
        toast.success('Removed from favorites');
      } else {
        await favoritesService.addToFavorites(movieId, movieTitle, moviePoster);
        setIsInFavorites(true);

        toast.success('Added to favorites');
      }
    } catch (error: any) {
      console.error('Favorites error:', error);
      if (error.message.includes('already in your favorites')) {
        toast.error('Movie is already in your favorites');
        setIsInFavorites(true);
      } else if (error.message.includes('not configured')) {
        toast.error('Favorites feature is not available. Please check your configuration.');
      } else {
        toast.error(error.message || 'Failed to update favorites');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        size={size}
        className={className}
        onClick={handleToggleFavorites}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        ) : isInFavorites ? (
          <Star className="w-4 h-4 fill-yellow-400" />
        ) : (
          <Star className="w-4 h-4" />
        )}
      </Button>
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
}
