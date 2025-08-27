'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Movie, TMDBResponse } from '@/lib/types/movie';
import { MovieCard } from './movie-card';
import { tmdbApi } from '@/lib/api/tmdb';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface MovieGridProps {
  movies: Movie[];
  title?: string;
  showYear?: boolean;
  showRating?: boolean;
  category?: 'popular' | 'top-rated' | 'upcoming' | 'now-playing';
}

export function MovieGrid({ 
  movies: initialMovies, 
  title, 
  showYear = false, 
  showRating = false,
  category 
}: MovieGridProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver>();

  const loadMoreMovies = useCallback(async (page: number) => {
    if (isLoading || !hasMore || !category) return;

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
          return;
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
    if (isLoading || !category) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadNextPage();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, loadNextPage, category]);

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
        <p className="text-muted-foreground text-lg">No movies found</p>
      </div>
    );
  }

  return (
    <section className="py-8">
      {title && (
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {movies.map((movie, index) => {
          if (category && movies.length === index + 1) {
            return (
              <div key={movie.id} ref={lastMovieElementRef}>
                <MovieCard 
                  movie={movie} 
                  showYear={showYear}
                  showRating={showRating}
                />
              </div>
            );
          } else {
            return (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                showYear={showYear}
                showRating={showRating}
              />
            );
          }
        })}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading more movies...</span>
          </div>
        </div>
      )}

      {category && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} • {movies.length} movies loaded
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadPreviousPage}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={loadNextPage}
              disabled={!hasMore || isLoading}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {!hasMore && movies.length > 0 && category && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">You've reached the end of the results</p>
        </div>
      )}
    </section>
  );
}