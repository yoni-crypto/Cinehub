"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-provider';
import { MovieGrid } from '@/components/movie/movie-grid';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/auth-modal';
import { Heart, LogIn } from 'lucide-react';
import Link from 'next/link';
import { watchlistService, WatchlistItem } from '@/lib/services/watchlist';

export function WatchlistContent() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadWatchlist();
    }
  }, [user]);

  const loadWatchlist = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const items = await watchlistService.getWatchlist();
      setWatchlistItems(items);
    } catch (error) {
      console.error('Error loading watchlist:', error);
      // Don't show error to user, just show empty watchlist
      setWatchlistItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading your watchlist...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Sign in to view your watchlist</h2>
          <p className="text-muted-foreground mb-6">
            Create an account or sign in to save movies to your personal watchlist
          </p>
          <Button onClick={() => setShowAuthModal(true)} className="mb-4">
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-primary hover:underline"
            >
              Sign up for free
            </button>
          </p>
        </div>
        
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading your watchlist...</p>
      </div>
    );
  }

  // Convert watchlist items to movie format for MovieGrid
  const watchlistMovies = watchlistItems.map(item => ({
    id: item.movie_id,
    title: item.movie_title,
    poster_path: item.movie_poster,
    backdrop_path: item.movie_poster, // Use poster as backdrop
    overview: '',
    release_date: '',
    vote_average: 0,
    vote_count: 0,
    adult: false,
    genre_ids: [],
    original_language: 'en',
    original_title: item.movie_title,
    popularity: 0,
    video: false,
  }));

  if (watchlistItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-4">Your watchlist is empty</h2>
        <p className="text-muted-foreground mb-6">
          Start exploring movies and add them to your watchlist
        </p>
        <Button asChild>
          <Link href="/">
            Discover Movies
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <MovieGrid
      movies={watchlistMovies}
      title="Your Watchlist"
      showYear={false}
      showRating={false}
    />
  );
}
