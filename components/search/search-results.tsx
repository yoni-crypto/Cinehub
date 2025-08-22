"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MovieGrid } from '@/components/movie/movie-grid';
import { TVShowGrid } from '@/components/tv-shows/tv-show-grid';
import { Movie } from '@/lib/types/movie';
import { TVShow } from '@/lib/api/tmdb';

interface SearchResultsProps {
  query: string;
  movies: Movie[];
  tvShows: TVShow[];
}

export function SearchResults({ query, movies, tvShows }: SearchResultsProps) {
  const [activeTab, setActiveTab] = useState('movies');

  const totalResults = movies.length + tvShows.length;

  if (totalResults === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
          No results found for "{query}"
        </h1>
        <p className="text-muted-foreground text-lg">
          Try searching with different keywords or browse our categories.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
          Search Results for "{query}"
        </h1>
        <p className="text-muted-foreground text-lg">
          Found {totalResults} result{totalResults !== 1 ? 's' : ''}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted">
          <TabsTrigger value="movies" className="data-[state=active]:bg-background">
            Movies ({movies.length})
          </TabsTrigger>
          <TabsTrigger value="tv-shows" className="data-[state=active]:bg-background">
            TV Shows ({tvShows.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="movies" className="mt-6">
          {movies.length > 0 ? (
            <MovieGrid movies={movies} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No movies found for "{query}"</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tv-shows" className="mt-6">
          {tvShows.length > 0 ? (
            <TVShowGrid tvShows={tvShows} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No TV shows found for "{query}"</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
