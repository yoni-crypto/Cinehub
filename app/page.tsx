'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useEffect } from 'react';
import { Filter } from 'lucide-react';
import { tmdbApi } from '@/lib/api/tmdb';
import { validateEnv } from '@/lib/config/env';
import { HomeHeader } from '@/components/layout/home-header';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MovieGrid } from '@/components/movie/movie-grid';
import { TVShowGrid } from '@/components/tv-shows/tv-show-grid';
import { MovieGridSkeleton } from '@/components/movie/movie-skeleton';
import { TVShowGridSkeleton } from '@/components/tv-shows/tv-show-skeleton';
import { Button } from '@/components/ui/button';
import { ContinueWatching } from '@/components/continue-watching';
import { LoadingScreen } from '@/components/loading-screen';

function HomePopularMovies() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      tmdbApi.getPopularMovies(1),
      tmdbApi.getPopularMovies(2)
    ]).then(([page1, page2]) => {
      if (!cancelled) {
        setMovies([...page1.results, ...page2.results]);
      }
    }).catch(() => {}).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <MovieGridSkeleton count={40} />;
  return (
    <MovieGrid
      movies={movies}
      title="Popular Movies"
      showYear={true}
      showRating={true}
    />
  );
}

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

function ContentSections({ contentType }: { contentType: 'movies' | 'tv-shows' }) {
  const [activeTab, setActiveTab] = useState<'movies' | 'tv-shows'>(contentType);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSections = async () => {
      setLoading(true);
      try {
        if (activeTab === 'movies') {
          const [trending, popular1, popular2, recent1, recent2, topRated1, topRated2, upcoming1, upcoming2] = await Promise.all([
            tmdbApi.getTrendingMovies('day'),
            tmdbApi.getPopularMovies(1),
            tmdbApi.getPopularMovies(2),
            tmdbApi.getNowPlayingMovies(1),
            tmdbApi.getNowPlayingMovies(2),
            tmdbApi.getTopRatedMovies(1),
            tmdbApi.getTopRatedMovies(2),
            tmdbApi.getUpcomingMovies(1),
            tmdbApi.getUpcomingMovies(2)
          ]);
          setSections([
            { data: trending.results, title: '', category: 'popular' },
            { data: [...popular1.results, ...popular2.results], title: 'Popular Now', category: 'popular' },
            { data: [...recent1.results, ...recent2.results], title: 'Recently Added', category: 'now-playing' },
            { data: [...topRated1.results, ...topRated2.results], title: 'Top Rated', category: 'top-rated' },
            { data: [...upcoming1.results, ...upcoming2.results], title: 'Coming Soon', category: 'upcoming' }
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
            { data: trending.results, title: '', category: 'popular' },
            { data: [...popular1.results, ...popular2.results], title: 'Popular Now', category: 'popular' },
            { data: [...onAir1.results, ...onAir2.results], title: 'On The Air', category: 'on-the-air' },
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

  return (
    <>
      {sections.map((section, index) => (
        <div key={`${contentType}-${index}`}>
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
              showYear={true}
              showRating={true}
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

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'movies' | 'tv-shows'>('movies');
  const isEnvValid = validateEnv();

  if (!isEnvValid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Setup Required</h1>
          <p className="text-muted-foreground mb-6">
            Please configure your environment variables to use CineHub.
          </p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader />

      <main className="mt-8">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6 bg-background">
          <ContinueWatching />
          
          <div className="mt-12">
            <Suspense key={activeTab} fallback={activeTab === 'movies' ? <MovieGridSkeleton count={40} /> : <TVShowGridSkeleton count={40} />}>
              <ContentSections contentType={activeTab} />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}