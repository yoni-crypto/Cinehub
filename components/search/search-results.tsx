"use client";

import { useEffect, useState } from 'react';
import { Movie } from '@/lib/types/movie';
import { tmdbApi } from '@/lib/api/tmdb';
import { MovieGrid } from '@/components/movie/movie-grid';
import { Button } from '@/components/ui/button';
import { Search, AlertCircle } from 'lucide-react';

interface SearchResultsProps {
  query: string;
}

export function SearchResults({ query }: SearchResultsProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setMovies([]);
      setError(null);
      setHasSearched(false);
      return;
    }

    const searchMovies = async () => {
      setIsLoading(true);
      setError(null);
      setHasSearched(true);
      
      try {
        const response = await tmdbApi.searchMovies(query);
        setMovies(response.results || []);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search movies. Please try again.');
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchMovies, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  if (!query.trim() && !hasSearched) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Search Movies</h1>
          <p className="text-muted-foreground">Search for movies, actors, or genres</p>
        </div>
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Search for Movies</h2>
          <p className="text-muted-foreground mb-6">
            Use the search bar in the header to find movies, actors, or genres
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Try searching for:</p>
            <ul className="space-y-1">
              <li>• Movie titles (e.g., "The Dark Knight")</li>
              <li>• Actor names (e.g., "Tom Hanks")</li>
              <li>• Genres (e.g., "action", "comedy")</li>
              <li>• Keywords (e.g., "superhero", "space")</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Search Results for "{query}"</h1>
          <p className="text-muted-foreground">Searching...</p>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Searching for "{query}"...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Search Error</h1>
          <p className="text-muted-foreground">Something went wrong</p>
        </div>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Search Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (hasSearched && movies.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Search Results for "{query}"</h1>
          <p className="text-muted-foreground">No results found</p>
        </div>
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4">No Results Found</h2>
          <p className="text-muted-foreground mb-6">
            No movies found for "{query}". Try different keywords or check your spelling.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Try searching for:</p>
            <ul className="space-y-1">
              <li>• Movie titles (e.g., "The Dark Knight")</li>
              <li>• Actor names (e.g., "Tom Hanks")</li>
              <li>• Genres (e.g., "action", "comedy")</li>
              <li>• Keywords (e.g., "superhero", "space")</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Search Results for "{query}"</h1>
        <p className="text-muted-foreground">Found {movies.length} results</p>
      </div>
      <MovieGrid
        movies={movies}
        showYear={true}
        showRating={true}
      />
    </div>
  );
}
