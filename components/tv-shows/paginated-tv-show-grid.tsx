'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TVShow } from '@/lib/api/tmdb';
import { TMDBResponse } from '@/lib/types/movie';
import { TVShowCard } from './tv-show-card';
import { tmdbApi } from '@/lib/api/tmdb';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginatedTVShowGridProps {
  title: string;
  category: 'popular' | 'top-rated' | 'on-the-air' | 'airing-today';
  initialTVShows: TVShow[];
}

export function PaginatedTVShowGrid({ title, category, initialTVShows }: PaginatedTVShowGridProps) {
  const [tvShows, setTVShows] = useState<TVShow[]>(initialTVShows);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver>();

  const loadMoreTVShows = useCallback(async (page: number) => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      let response: TMDBResponse<TVShow>;
      switch (category) {
        case 'popular':
          response = await tmdbApi.getPopularTVShows(page);
          break;
        case 'top-rated':
          response = await tmdbApi.getTopRatedTVShows(page);
          break;
        case 'on-the-air':
          response = await tmdbApi.getOnTheAirTVShows(page);
          break;
        case 'airing-today':
          response = await tmdbApi.getAiringTodayTVShows(page);
          break;
        default:
          response = await tmdbApi.getPopularTVShows(page);
      }

      if (page === 1) {
        setTVShows(response.results);
      } else {
        setTVShows(prev => [...prev, ...response.results]);
      }

      setTotalPages(response.total_pages);
      setHasMore(page < response.total_pages);
    } catch (error) {
      console.error('Error loading TV shows:', error);
    } finally {
      setIsLoading(false);
    }
  }, [category, isLoading, hasMore]);

  const loadNextPage = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadMoreTVShows(nextPage);
    }
  }, [currentPage, isLoading, hasMore, loadMoreTVShows]);

  const loadPreviousPage = useCallback(() => {
    if (!isLoading && currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      loadMoreTVShows(prevPage);
    }
  }, [currentPage, isLoading, loadMoreTVShows]);

  const lastTVShowElementRef = useCallback((node: HTMLDivElement) => {
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

  if (!tvShows || tvShows.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No TV shows found</p>
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
        {tvShows.map((tvShow, index) => {
          if (tvShows.length === index + 1) {
            return (
              <div key={tvShow.id} ref={lastTVShowElementRef}>
                <TVShowCard tvShow={tvShow} />
              </div>
            );
          } else {
            return <TVShowCard key={tvShow.id} tvShow={tvShow} />;
          }
        })}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-white" />
            <span className="text-white">Loading more TV shows...</span>
          </div>
        </div>
      )}

      {!hasMore && tvShows.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">You've reached the end of the results</p>
        </div>
      )}
    </div>
  );
}
