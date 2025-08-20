"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-provider';
import { MovieGrid } from '@/components/movie/movie-grid';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/auth-modal';
import { Star, LogIn } from 'lucide-react';
import Link from 'next/link';
import { favoritesService, FavoriteItem } from '@/lib/services/favorites';

export function FavoritesContent() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [favoritesItems, setFavoritesItems] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const items = await favoritesService.getFavorites();
      setFavoritesItems(items);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavoritesItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading your favorites...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Sign in to view your favorites</h2>
          <p className="text-muted-foreground mb-6">
            Create an account or sign in to save movies to your favorites
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
        <p className="mt-4 text-muted-foreground">Loading your favorites...</p>
      </div>
    );
  }

  const favoritesMovies = favoritesItems.map(item => ({
    id: item.movie_id,
    title: item.movie_title,
    poster_path: item.movie_poster,
    backdrop_path: item.movie_poster,
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

  if (favoritesItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-4">Your favorites is empty</h2>
        <p className="text-muted-foreground mb-6">
          Start exploring movies and add them to your favorites
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
      movies={favoritesMovies}
      title="Your Favorites"
      showYear={false}
      showRating={false}
    />
  );
}
