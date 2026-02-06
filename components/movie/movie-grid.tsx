'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Movie, TMDBResponse } from '@/lib/types/movie';
import { MovieCard } from './movie-card';
import { MovieGridSkeleton } from './movie-skeleton';
import { tmdbApi } from '@/lib/api/tmdb';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

// Calculate movies per page based on screen size
const getMoviesPerPage = () => {
  if (typeof window === 'undefined') return 40; // Default for SSR
  return 40; // Fixed 40 movies per page
};

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
  const [displayedMovies, setDisplayedMovies] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [nextTmdbPage, setNextTmdbPage] = useState(3); // Next page to load from TMDB (we already have 1-2)
  const [hasMore, setHasMore] = useState(true);
  const [moviesPerPage] = useState(40);
  const loadingRef = useRef(false);

  // Sync movies when initialMovies changes
  useEffect(() => {
    setMovies(initialMovies);
  }, [initialMovies]);

  // Update displayed movies when movies or pagination changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * moviesPerPage;
    const endIndex = startIndex + moviesPerPage;
    const displayed = movies.slice(startIndex, endIndex);
    setDisplayedMovies(displayed);
  }, [movies, currentPage, moviesPerPage, category]);

  const loadMoreMovies = useCallback(async () => {
    if (loadingRef.current || !category || !hasMore) return;
    
    loadingRef.current = true;
    setIsLoading(true);
    
    try {
      let response: TMDBResponse<Movie>;
      
      switch (category) {
        case 'popular':
          response = await tmdbApi.getPopularMovies(nextTmdbPage);
          break;
        case 'top-rated':
          response = await tmdbApi.getTopRatedMovies(nextTmdbPage);
          break;
        case 'upcoming':
          response = await tmdbApi.getUpcomingMovies(nextTmdbPage);
          break;
        case 'now-playing':
          response = await tmdbApi.getNowPlayingMovies(nextTmdbPage);
          break;
        default:
          return;
      }

      setMovies(prev => [...prev, ...response.results]);
      setNextTmdbPage(prev => prev + 1);
      setHasMore(nextTmdbPage < response.total_pages);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [category, nextTmdbPage, hasMore]);

  const goToPage = useCallback(async (pageNum: number) => {
    const requiredMovies = pageNum * moviesPerPage;
    
    // Load more movies if we don't have enough
    if (movies.length < requiredMovies && category && hasMore && !isLoading) {
      setIsLoading(true);
      
      // Calculate how many TMDB pages we need to load
      const moviesNeeded = requiredMovies - movies.length;
      const tmdbPagesToLoad = Math.ceil(moviesNeeded / 20); // TMDB returns 20 per page
      
      const promises = [];
      for (let i = 0; i < tmdbPagesToLoad; i++) {
        const pageToLoad = nextTmdbPage + i;
        let promise;
        switch (category) {
          case 'popular':
            promise = tmdbApi.getPopularMovies(pageToLoad);
            break;
          case 'top-rated':
            promise = tmdbApi.getTopRatedMovies(pageToLoad);
            break;
          case 'upcoming':
            promise = tmdbApi.getUpcomingMovies(pageToLoad);
            break;
          case 'now-playing':
            promise = tmdbApi.getNowPlayingMovies(pageToLoad);
            break;
        }
        if (promise) promises.push(promise);
      }
      
      try {
        const responses = await Promise.all(promises);
        const newMovies = responses.flatMap(r => r.results);
        setMovies(prev => [...prev, ...newMovies]);
        setNextTmdbPage(prev => prev + tmdbPagesToLoad);
      } catch (error) {
        console.error('Error loading movies:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    setCurrentPage(pageNum);
  }, [movies.length, moviesPerPage, category, hasMore, isLoading, nextTmdbPage]);

  const loadNextPage = useCallback(async () => {
    await goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const loadPreviousPage = useCallback(() => {
    if (!isLoading && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage, isLoading]);

  // Intersection observer disabled - using pagination instead
  const lastMovieElementRef = useCallback((node: HTMLDivElement) => {
    return;
  }, []);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const totalLoadedPages = Math.ceil(movies.length / moviesPerPage);
    // Always show at least 3 pages to indicate more content is available
    const minPages = hasMore ? Math.max(totalLoadedPages, 3) : totalLoadedPages;
    const maxPagesToShow = 7;
    const pages: (number | string)[] = [];
    
    if (minPages <= maxPagesToShow) {
      for (let i = 1; i <= minPages; i++) {
        pages.push(i);
      }
      // Add ellipsis at the end if there's more content
      if (hasMore && minPages === totalLoadedPages) {
        pages.push('...');
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(minPages);
      } else if (currentPage >= minPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = minPages - 4; i <= minPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(minPages);
      }
    }
    
    return pages;
  };

  const PaginationControls = () => {
    const pageNumbers = getPageNumbers();
    
    return (
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 rounded-full p-0"
          onClick={loadPreviousPage}
          disabled={currentPage === 1 || isLoading}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        {pageNumbers.map((page, idx) => (
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-foreground font-bold">...</span>
          ) : (
            <Button
              key={page}
              variant="outline"
              size="sm"
              className={`h-9 w-9 rounded-full p-0 ${
                currentPage === page 
                  ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
                  : 'hover:bg-muted'
              }`}
              onClick={() => goToPage(page as number)}
              disabled={isLoading}
            >
              {page}
            </Button>
          )
        ))}
        
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 rounded-full p-0"
          onClick={loadNextPage}
          disabled={isLoading}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  };

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

      {category && <PaginationControls />}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-1 sm:gap-1.5 md:gap-2 lg:gap-2 my-6">
        {displayedMovies.map((movie, index) => {
          if (category && displayedMovies.length === index + 1) {
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

      {category && <PaginationControls />}
    </section>
  );
}