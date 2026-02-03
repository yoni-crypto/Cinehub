"use client";

import { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState<'movies' | 'tv-shows'>('movies');
  const [sortBy, setSortBy] = useState('popularity');
  const [sortedMovies, setSortedMovies] = useState(movies);
  const [sortedTVShows, setSortedTVShows] = useState(tvShows);

  // Save search to history
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const newHistory = [query, ...history.filter((h: string) => h !== query)].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  }, [query]);

  // Sort results
  useEffect(() => {
    const sortMovies = (movies: Movie[]) => {
      switch (sortBy) {
        case 'title':
          return [...movies].sort((a, b) => a.title.localeCompare(b.title));
        case 'rating':
          return [...movies].sort((a, b) => b.vote_average - a.vote_average);
        case 'release_date':
          return [...movies].sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
        default:
          return [...movies].sort((a, b) => b.popularity - a.popularity);
      }
    };

    const sortTVShows = (shows: TVShow[]) => {
      switch (sortBy) {
        case 'title':
          return [...shows].sort((a, b) => a.name.localeCompare(b.name));
        case 'rating':
          return [...shows].sort((a, b) => b.vote_average - a.vote_average);
        case 'release_date':
          return [...shows].sort((a, b) => new Date(b.first_air_date).getTime() - new Date(a.first_air_date).getTime());
        default:
          return [...shows].sort((a, b) => b.popularity - a.popularity);
      }
    };

    setSortedMovies(sortMovies(movies));
    setSortedTVShows(sortTVShows(tvShows));
  }, [movies, tvShows, sortBy]);

  const totalResults = sortedMovies.length + sortedTVShows.length;
  const currentResults = activeTab === 'movies' ? sortedMovies : sortedTVShows;

  if (totalResults === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">
          No results found for "{query}"
        </h1>
        <p className="text-gray-400 text-lg">
          Try searching with different keywords or browse our categories.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            Search Results for "{query}"
          </h1>
          <p className="text-gray-400 text-lg">
            Found {totalResults} result{totalResults !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="bg-[#1a1a1a] rounded-lg p-1 inline-flex">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-gray-400 px-4 py-2 text-sm focus:outline-none cursor-pointer"
          >
            <option value="popularity">Popular</option>
            <option value="rating">Rating</option>
            <option value="release_date">Latest</option>
            <option value="title">A-Z</option>
          </select>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg p-1 inline-flex mb-6">
        <button
          onClick={() => setActiveTab('movies')}
          className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === 'movies'
              ? 'bg-red-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
          }`}
        >
          Movies ({sortedMovies.length})
        </button>
        <button
          onClick={() => setActiveTab('tv-shows')}
          className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === 'tv-shows'
              ? 'bg-red-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
          }`}
        >
          TV Shows ({sortedTVShows.length})
        </button>
      </div>

      <div>
        {activeTab === 'movies' ? (
          sortedMovies.length > 0 ? (
            <MovieGrid movies={sortedMovies} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No movies found for "{query}"</p>
            </div>
          )
        ) : (
          sortedTVShows.length > 0 ? (
            <TVShowGrid tvShows={sortedTVShows} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No TV shows found for "{query}"</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
