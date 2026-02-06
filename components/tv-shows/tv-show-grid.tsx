'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TVShow } from '@/lib/api/tmdb';
import { TMDBResponse } from '@/lib/types/movie';
import { TVShowCard } from './tv-show-card';
import { tmdbApi } from '@/lib/api/tmdb';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const getShowsPerPage = () => {
  if (typeof window === 'undefined') return 40;
  return 40;
};

interface TVShowGridProps {
  tvShows: TVShow[];
  title?: string;
  category?: 'popular' | 'top-rated' | 'on-the-air' | 'airing-today';
}

export function TVShowGrid({ 
  tvShows: initialTVShows, 
  title,
  category 
}: TVShowGridProps) {
  const [tvShows, setTVShows] = useState<TVShow[]>(initialTVShows);
  const [displayedShows, setDisplayedShows] = useState<TVShow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [nextTmdbPage, setNextTmdbPage] = useState(3);
  const [hasMore, setHasMore] = useState(true);
  const [showsPerPage] = useState(40);
  const loadingRef = useRef(false);

  useEffect(() => {
    setTVShows(initialTVShows);
  }, [initialTVShows]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * showsPerPage;
    const endIndex = startIndex + showsPerPage;
    const displayed = tvShows.slice(startIndex, endIndex);
    setDisplayedShows(displayed);
  }, [tvShows, currentPage, showsPerPage, category]);

  const loadMoreShows = useCallback(async () => {
    if (loadingRef.current || !category || !hasMore) return;
    
    loadingRef.current = true;
    setIsLoading(true);
    
    try {
      let response: TMDBResponse<TVShow>;
      
      switch (category) {
        case 'popular':
          response = await tmdbApi.getPopularTVShows(nextTmdbPage);
          break;
        case 'top-rated':
          response = await tmdbApi.getTopRatedTVShows(nextTmdbPage);
          break;
        case 'on-the-air':
          response = await tmdbApi.getOnTheAirTVShows(nextTmdbPage);
          break;
        case 'airing-today':
          response = await tmdbApi.getAiringTodayTVShows(nextTmdbPage);
          break;
        default:
          return;
      }

      setTVShows(prev => [...prev, ...response.results]);
      setNextTmdbPage(prev => prev + 1);
      setHasMore(nextTmdbPage < response.total_pages);
    } catch (error) {
      console.error('Error loading TV shows:', error);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [category, nextTmdbPage, hasMore]);

  const goToPage = useCallback(async (pageNum: number) => {
    const requiredShows = pageNum * showsPerPage;
    
    if (tvShows.length < requiredShows && category && hasMore && !isLoading) {
      setIsLoading(true);
      
      const showsNeeded = requiredShows - tvShows.length;
      const tmdbPagesToLoad = Math.ceil(showsNeeded / 20);
      
      const promises = [];
      for (let i = 0; i < tmdbPagesToLoad; i++) {
        const pageToLoad = nextTmdbPage + i;
        let promise;
        switch (category) {
          case 'popular':
            promise = tmdbApi.getPopularTVShows(pageToLoad);
            break;
          case 'top-rated':
            promise = tmdbApi.getTopRatedTVShows(pageToLoad);
            break;
          case 'on-the-air':
            promise = tmdbApi.getOnTheAirTVShows(pageToLoad);
            break;
          case 'airing-today':
            promise = tmdbApi.getAiringTodayTVShows(pageToLoad);
            break;
        }
        if (promise) promises.push(promise);
      }
      
      try {
        const responses = await Promise.all(promises);
        const newShows = responses.flatMap(r => r.results);
        setTVShows(prev => [...prev, ...newShows]);
        setNextTmdbPage(prev => prev + tmdbPagesToLoad);
      } catch (error) {
        console.error('Error loading TV shows:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    setCurrentPage(pageNum);
  }, [tvShows.length, showsPerPage, category, hasMore, isLoading, nextTmdbPage]);

  const loadNextPage = useCallback(async () => {
    await goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const loadPreviousPage = useCallback(() => {
    if (!isLoading && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage, isLoading]);

  const getPageNumbers = () => {
    const totalLoadedPages = Math.ceil(tvShows.length / showsPerPage);
    const minPages = hasMore ? Math.max(totalLoadedPages, 3) : totalLoadedPages;
    const maxPagesToShow = 7;
    const pages: (number | string)[] = [];
    
    if (minPages <= maxPagesToShow) {
      for (let i = 1; i <= minPages; i++) {
        pages.push(i);
      }
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

  if (!tvShows || tvShows.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No TV shows found</p>
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
        {displayedShows.map((tvShow, index) => (
          <TVShowCard 
            key={tvShow.id} 
            tvShow={tvShow}
            priority={index < 6}
          />
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading more TV shows...</span>
          </div>
        </div>
      )}

      {category && <PaginationControls />}
    </section>
  );
}
