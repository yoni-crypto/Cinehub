'use client';

import { Suspense, useState } from 'react';
import { tmdbApi } from '@/lib/api/tmdb';
import { validateEnv } from '@/lib/config/env';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroCarousel } from '@/components/movie/hero-carousel';
import { MovieGrid } from '@/components/movie/movie-grid';
import { TVShowGrid } from '@/components/tv-shows/tv-show-grid';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/loading-screen';
import { CategoriesSearchBar } from '@/components/categories/categories-search-bar';
import Link from 'next/link';
import { useEffect } from 'react';
import { Filter } from 'lucide-react';

function HomePopularMovies() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    tmdbApi.getPopularMovies(1).then((res) => {
      if (!cancelled) {
        setMovies(res.results);
      }
    }).catch(() => {}).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingScreen message="Loading…" fullScreen={false} />;
  return (
    <MovieGrid
      movies={movies}
      title=""
      category="popular"
      showYear={true}
      showRating={true}
    />
  );
}

function ContentTabs({ activeTab, onTabChange }: { activeTab: 'movies' | 'tv-shows'; onTabChange: (tab: 'movies' | 'tv-shows') => void }) {
  return (
    <div className="bg-[#1a1a1a] rounded-lg p-1 inline-flex mb-8">
      <button
        onClick={() => onTabChange('movies')}
        className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
          activeTab === 'movies'
            ? 'bg-red-600 text-white shadow-lg'
            : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
        }`}
      >
        Movies
      </button>
      <button
        onClick={() => onTabChange('tv-shows')}
        className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
          activeTab === 'tv-shows'
            ? 'bg-red-600 text-white shadow-lg'
            : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
        }`}
      >
        TV Shows
      </button>
    </div>
  );
}

function TrendingSection({ contentType }: { contentType: 'movies' | 'tv-shows' }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(false);
      try {
        const trendingData = contentType === 'movies' 
          ? await tmdbApi.getTrendingMovies('week')
          : await tmdbApi.getTrendingTVShows('week');
        setData(trendingData);
      } catch (error) {
        console.error('Error fetching trending data:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [contentType]);

  if (loading) return <LoadingScreen message="Loading…" fullScreen={false} />;
  if (error) {
    return (
      <div className="h-[70vh] min-h-[500px] flex items-center justify-center bg-gradient-to-br from-primary/20 to-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Content temporarily unavailable</h2>
          <p className="text-muted-foreground mb-6">Please try refreshing the page</p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <HeroCarousel movies={data.results.slice(0, 10)} />;
}

function ContentSections({ contentType }: { contentType: 'movies' | 'tv-shows' }) {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSections = async () => {
      setLoading(true);
      try {
        if (contentType === 'movies') {
          const [trending, popular, recent, topRated, upcoming] = await Promise.all([
            tmdbApi.getTrendingMovies('day'),
            tmdbApi.getPopularMovies(1),
            tmdbApi.getNowPlayingMovies(1),
            tmdbApi.getTopRatedMovies(1),
            tmdbApi.getUpcomingMovies(1)
          ]);
          setSections([
            { data: trending.results.slice(0, 12), title: 'Trending Today', category: 'popular' },
            { data: popular.results.slice(0, 12), title: 'Popular Now', category: 'popular' },
            { data: recent.results.slice(0, 12), title: 'Recently Added', category: 'now-playing' },
            { data: topRated.results.slice(0, 12), title: 'Top Rated', category: 'top-rated' },
            { data: upcoming.results.slice(0, 12), title: 'Coming Soon', category: 'upcoming' }
          ]);
        } else {
          const [trending, popular, onAir, topRated] = await Promise.all([
            tmdbApi.getTrendingTVShows('day'),
            tmdbApi.getPopularTVShows(1),
            tmdbApi.getOnTheAirTVShows(1),
            tmdbApi.getTopRatedTVShows(1)
          ]);
          setSections([
            { data: trending.results.slice(0, 12), title: 'Trending Today', category: 'popular' },
            { data: popular.results.slice(0, 12), title: 'Popular Now', category: 'popular' },
            { data: onAir.results.slice(0, 12), title: 'On The Air', category: 'on-the-air' },
            { data: topRated.results.slice(0, 12), title: 'Top Rated', category: 'top-rated' }
          ]);
        }
      } catch (error) {
        console.error('Error loading sections:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSections();
  }, [contentType]);

  if (loading) return <LoadingScreen message="Loading…" fullScreen={false} />;

  return (
    <>
      {sections.map((section, index) => (
        <div key={`${contentType}-${index}`}>
          {contentType === 'movies' ? (
            <MovieGrid
              movies={section.data}
              title={section.title}
              category={section.category}
              showYear={true}
              showRating={true}
            />
          ) : (
            <TVShowGrid
              tvShows={section.data}
              title={section.title}
              category={section.category}
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
      <Header />

      <main className="pt-16">
        {/* Mobile only: HDToday-style layout with your theme */}
        <div className="md:hidden bg-background">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
            <div className="mb-4">
              <CategoriesSearchBar
                className="max-w-full"
                wrapperClassName="bg-gray-900 border-gray-700"
                inputClassName="text-white placeholder-gray-400"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Popular Movies
              </h1>
              <Link
                href="/categories"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition-colors"
                title="Filter by category"
              >
                <Filter className="w-4 h-4" />
              </Link>
            </div>
            <Suspense fallback={<LoadingScreen message="Loading…" fullScreen={false} />}>
              <HomePopularMovies />
            </Suspense>
          </div>
        </div>

        {/* Hero carousel + main content: visible on all, hero only on desktop */}
        <div className="hidden md:block bg-background">
          <Suspense fallback={<LoadingScreen message="Loading…" fullScreen={false} />}>
            <TrendingSection contentType={activeTab} />
          </Suspense>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-background">
          <ContentTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="space-y-20">
            <Suspense key={activeTab} fallback={<LoadingScreen message="Loading…" fullScreen={false} />}>
              <ContentSections contentType={activeTab} />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}