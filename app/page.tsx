import { Suspense } from 'react';
import { Metadata } from 'next';
import { tmdbApi } from '@/lib/api/tmdb';
import { validateEnv } from '@/lib/config/env';
import { HomeHeader } from '@/components/layout/home-header';
import { Footer } from '@/components/layout/footer';
import { MovieGrid } from '@/components/movie/movie-grid';
import { TVShowGrid } from '@/components/tv-shows/tv-show-grid';
import { MovieGridSkeleton } from '@/components/movie/movie-skeleton';
import { TVShowGridSkeleton } from '@/components/tv-shows/tv-show-skeleton';
import { ContinueWatching } from '@/components/continue-watching';
import HomeClient from './home-client';

export const metadata: Metadata = {
  title: 'Watch Free Movies & TV Shows Online HD - No Sign Up Required | CineHub',
  description: 'Watch free movies and TV shows online in HD quality without sign up. Stream 1000s of latest films, trending series, and new releases instantly. Best free alternative to HDToday, FMovies, and 123Movies.',
  keywords: [
    'watch movies online free',
    'free movies online no sign up',
    'watch movies free hd',
    'free movie streaming sites',
    'watch tv shows online free',
    'stream movies online free',
    'hdtoday alternative',
    'fmovies alternative',
    '123movies alternative',
    'free streaming sites 2024',
    'watch full movies online free',
    'hd movies online free',
  ],
  openGraph: {
    title: 'Watch Free Movies & TV Shows Online HD - No Sign Up | CineHub',
    description: 'Stream 1000s of movies and TV shows for free in HD quality. No registration, no ads, no downloads. Watch latest films and trending series instantly.',
    type: 'website',
    url: 'https://cinehub1.vercel.app',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  alternates: {
    canonical: 'https://cinehub1.vercel.app',
  },
};

async function TrendingMovies() {
  try {
    const [page1, page2] = await Promise.all([
      tmdbApi.getPopularMovies(1),
      tmdbApi.getPopularMovies(2)
    ]);
    return <MovieGrid movies={[...page1.results, ...page2.results]} title="" showYear showRating />;
  } catch {
    return <MovieGridSkeleton count={40} />;
  }
}

async function PopularMovies() {
  try {
    const [page1, page2] = await Promise.all([
      tmdbApi.getPopularMovies(1),
      tmdbApi.getPopularMovies(2)
    ]);
    return <MovieGrid movies={[...page1.results, ...page2.results]} title="Popular Movies" showYear showRating />;
  } catch {
    return null;
  }
}

async function RecentMovies() {
  try {
    const [page1, page2] = await Promise.all([
      tmdbApi.getNowPlayingMovies(1),
      tmdbApi.getNowPlayingMovies(2)
    ]);
    return <MovieGrid movies={[...page1.results, ...page2.results]} title="Recently Added Movies" showYear showRating />;
  } catch {
    return null;
  }
}

async function TopRatedMovies() {
  try {
    const [page1, page2] = await Promise.all([
      tmdbApi.getTopRatedMovies(1),
      tmdbApi.getTopRatedMovies(2)
    ]);
    return <MovieGrid movies={[...page1.results, ...page2.results]} title="Top Rated Movies" showYear showRating />;
  } catch {
    return null;
  }
}

async function PopularTVShows() {
  try {
    const [page1, page2] = await Promise.all([
      tmdbApi.getPopularTVShows(1),
      tmdbApi.getPopularTVShows(2)
    ]);
    return <TVShowGrid tvShows={[...page1.results, ...page2.results]} title="Popular TV Shows" />;
  } catch {
    return null;
  }
}

export default function HomePage() {
  const isEnvValid = validateEnv();

  if (!isEnvValid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Setup Required</h1>
          <p className="text-muted-foreground mb-6">
            Please configure your environment variables to use CineHub.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader />

      <main className="mt-8">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6 bg-background">
          {/* SEO H1 - Hidden but present for search engines */}
          <h1 className="sr-only">Watch Free Movies and TV Shows Online in HD - CineHub</h1>
          
          <ContinueWatching />
          
          <div className="mt-12">
            <HomeClient />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
