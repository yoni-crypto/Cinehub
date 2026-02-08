'use client';

import { useState, useEffect } from 'react';
import { tmdbApi } from '@/lib/api/tmdb';
import { MovieGrid } from '@/components/movie/movie-grid';
import { TVShowGrid } from '@/components/tv-shows/tv-show-grid';
import { MovieGridSkeleton } from '@/components/movie/movie-skeleton';
import { TVShowGridSkeleton } from '@/components/tv-shows/tv-show-skeleton';

function ContentTabs({ activeTab, onTabChange }: { activeTab: 'movies' | 'tv-shows'; onTabChange: (tab: 'movies' | 'tv-shows') => void }) {
  return (
    <div className="bg-muted/50 dark:bg-[#1a1a1a] rounded-lg p-1 inline-flex">
      <button
        onClick={() => onTabChange('movies')}
        className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
          activeTab === 'movies'
            ? 'bg-red-600 text-white shadow-lg'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted dark:text-gray-400 dark:hover:text-white dark:hover:bg-[#2a2a2a]'
        }`}
      >
        Movies
      </button>
      <button
        onClick={() => onTabChange('tv-shows')}
        className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
          activeTab === 'tv-shows'
            ? 'bg-red-600 text-white shadow-lg'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted dark:text-gray-400 dark:hover:text-white dark:hover:bg-[#2a2a2a]'
        }`}
      >
        TV Shows
      </button>
    </div>
  );
}

export default function HomeClient() {
  const [activeTab, setActiveTab] = useState<'movies' | 'tv-shows'>('movies');
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSections = async () => {
      setLoading(true);
      try {
        if (activeTab === 'movies') {
          const [trending, popular1, popular2, recent1, recent2, topRated1, topRated2] = await Promise.all([
            tmdbApi.getTrendingMovies('day'),
            tmdbApi.getPopularMovies(1),
            tmdbApi.getPopularMovies(2),
            tmdbApi.getNowPlayingMovies(1),
            tmdbApi.getNowPlayingMovies(2),
            tmdbApi.getTopRatedMovies(1),
            tmdbApi.getTopRatedMovies(2)
          ]);
          setSections([
            { data: trending.results, title: '', category: 'trending' },
            { data: [...popular1.results, ...popular2.results], title: 'Popular Now', category: 'popular' },
            { data: [...recent1.results, ...recent2.results], title: 'Recently Added', category: 'recent' },
            { data: [...topRated1.results, ...topRated2.results], title: 'Top Rated', category: 'top-rated' }
          ]);
        } else {
          const [trending, popular1, popular2, onAir1, onAir2, topRated1, topRated2] = await Promise.all([
            tmdbApi.getTrendingTVShows('day'),
            tmdbApi.getPopularTVShows(1),
            tmdbApi.getPopularTVShows(2),
            tmdbApi.getOnTheAirTVShows(1),
            tmdbApi.getOnTheAirTVShows(2),
            tmdbApi.getTopRatedTVShows(1),
            tmdbApi.getTopRatedTVShows(2)
          ]);
          setSections([
            { data: trending.results, title: '', category: 'trending' },
            { data: [...popular1.results, ...popular2.results], title: 'Popular Now', category: 'popular' },
            { data: [...onAir1.results, ...onAir2.results], title: 'On The Air', category: 'on-air' },
            { data: [...topRated1.results, ...topRated2.results], title: 'Top Rated', category: 'top-rated' }
          ]);
        }
      } catch (error) {
        console.error('Error loading sections:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSections();
  }, [activeTab]);

  if (loading) {
    return activeTab === 'movies' ? <MovieGridSkeleton count={40} /> : <TVShowGridSkeleton count={40} />;
  }

  return (
    <>
      {sections.map((section, index) => (
        <div key={`${activeTab}-${index}`}>
          {index === 0 && (
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Trending Today</h2>
              <ContentTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          )}
          {activeTab === 'movies' ? (
            <MovieGrid
              movies={section.data}
              title={index === 0 ? '' : section.title}
              showYear
              showRating
            />
          ) : (
            <TVShowGrid
              tvShows={section.data}
              title={index === 0 ? '' : section.title}
            />
          )}
        </div>
      ))}
    </>
  );
}
