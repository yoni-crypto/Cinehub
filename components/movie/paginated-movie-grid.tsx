'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Movie, TMDBResponse } from '@/lib/types/movie';
import { MovieCard } from './movie-card';
import { tmdbApi } from '@/lib/api/tmdb';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginatedMovieGridProps {
  title: string;
  category: 'popular' | 'top-rated' | 'upcoming' | 'now-playing';
  initialMovies: Movie[];
}

export function PaginatedMovieGrid({ title, category, initialMovies }: PaginatedMovieGridProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver>();

  const loadMoreMovies = useCallback(async (page: number) => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      let response: TMDBResponse<Movie>;
      switch (category) {
        case 'popular':
          response = await tmdbApi.getPopularMovies(page);
          break;
        case 'top-rated':
          response = await tmdbApi.getTopRatedMovies(page);
          break;
        case 'upcoming':
          response = await tmdbApi.getUpcomingMovies(page);
          break;
        case 'now-playing':
          response = await tmdbApi.getNowPlayingMovies(page);
          break;
        default:
          response = await tmdbApi.getPopularMovies(page);
      }

      if (page === 1) {
        setMovies(response.results);
      } else {
        setMovies(prev => [...prev, ...response.results]);
      }

      setTotalPages(response.total_pages);
      setHasMore(page < response.total_pages);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [category, isLoading, hasMore]);

  const loadNextPage = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadMoreMovies(nextPage);
    }
  }, [currentPage, isLoading, hasMore, loadMoreMovies]);

  const loadPreviousPage = useCallback(() => {
    if (!isLoading && currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      loadMoreMovies(prevPage);
    }
  }, [currentPage, isLoading, loadMoreMovies]);

  const lastMovieElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadNextPage();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, loadNextPage]);

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  if (!movies || movies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No movies found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
          {title}
        </h2>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadPreviousPage}
            disabled={currentPage === 1 || isLoading}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <span className="text-sm text-gray-300 px-3">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={loadNextPage}
            disabled={!hasMore || isLoading}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {movies.map((movie, index) => {
          if (movies.length === index + 1) {
            return (
              <div key={movie.id} ref={lastMovieElementRef}>
                <MovieCard movie={movie} />
              </div>
            );
          } else {
            return <MovieCard key={movie.id} movie={movie} />;
          }
        })}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-white" />
            <span className="text-white">Loading more movies...</span>
          </div>
        </div>
      )}

      {!hasMore && movies.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">You've reached the end of the results</p>
        </div>
      )}
    </div>
  );
}
