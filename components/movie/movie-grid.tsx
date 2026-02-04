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

  const loadMoreMovies = useCallback(async (page: number, replace = false) => {
    if (isLoading || !category) return;
    if (!replace && !hasMore && page > 1) return;

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

      if (page === 1 || replace) {
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
      loadMoreMovies(prevPage, true);
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

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        {movies.map((movie, index) => {
          if (category && movies.length === index + 1) {
            return (
              <div key={movie.id} ref={lastMovieElementRef}>
                <MovieCard 
                  movie={movie} 
                  showYear={showYear}
                  showRating={showRating}
                  priority={index < 6}
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
                priority={index < 6}
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
        <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center sm:justify-between gap-3">
          <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1 w-full sm:w-auto text-center sm:text-left">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center justify-center gap-1 sm:gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 sm:h-8 sm:w-auto sm:px-3"
              onClick={() => { setCurrentPage(1); loadMoreMovies(1, true); }}
              disabled={currentPage === 1 || isLoading}
              aria-label="First page"
            >
              <span className="hidden sm:inline">First</span>
              <span className="sm:hidden">«</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={loadPreviousPage}
              disabled={currentPage === 1 || isLoading}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="min-w-[2rem] h-9 flex items-center justify-center rounded-full bg-red-600 text-white text-sm font-medium">
              {currentPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={loadNextPage}
              disabled={!hasMore || isLoading}
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 sm:h-8 sm:w-auto sm:px-3"
              onClick={() => { setCurrentPage(totalPages); loadMoreMovies(totalPages, true); }}
              disabled={currentPage >= totalPages || isLoading || totalPages <= 1}
              aria-label="Last page"
            >
              <span className="hidden sm:inline">Last</span>
              <span className="sm:hidden">»</span>
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