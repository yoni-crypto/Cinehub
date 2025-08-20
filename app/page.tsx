import { Suspense } from 'react';
import { tmdbApi } from '@/lib/api/tmdb';
import { validateEnv } from '@/lib/config/env';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroCarousel } from '@/components/movie/hero-carousel';
import { MovieGrid } from '@/components/movie/movie-grid';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

function MovieGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

async function TrendingSection() {
  try {
    const trendingData = await tmdbApi.getTrendingMovies('week');
    return <HeroCarousel movies={trendingData.results.slice(0, 10)} />;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return (
      <div className="h-[70vh] min-h-[500px] flex items-center justify-center bg-gradient-to-br from-primary/20 to-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Unable to load trending movies</h2>
          <p className="text-muted-foreground mb-6">Please check your API configuration</p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }
}

async function PopularMoviesSection() {
  try {
    const popularData = await tmdbApi.getPopularMovies(1);
    return (
      <MovieGrid
        movies={popularData.results.slice(0, 18)}
        title="Popular Now"
        showYear={true}
        showRating={true}
      />
    );
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return (
      <section className="py-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">Popular Now</h2>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Unable to load popular movies</p>
        </div>
      </section>
    );
  }
}

async function TopRatedMoviesSection() {
  try {
    const topRatedData = await tmdbApi.getTopRatedMovies(1);
    return (
      <MovieGrid
        movies={topRatedData.results.slice(0, 12)}
        title="Top Rated"
        showYear={true}
        showRating={true}
      />
    );
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    return null;
  }
}

async function UpcomingMoviesSection() {
  try {
    const upcomingData = await tmdbApi.getUpcomingMovies(1);
    return (
      <MovieGrid
        movies={upcomingData.results.slice(0, 12)}
        title="Coming Soon"
        showYear={true}
        showRating={false}
      />
    );
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    return null;
  }
}

export default async function HomePage() {
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
        <Suspense 
          fallback={
            <div className="h-[70vh] min-h-[500px] bg-gradient-to-br from-primary/20 to-background animate-pulse" />
          }
        >
          <TrendingSection />
        </Suspense>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
          <Suspense fallback={
            <section className="py-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-8">Popular Now</h2>
              <MovieGridSkeleton />
            </section>
          }>
            <PopularMoviesSection />
          </Suspense>

          <Suspense fallback={
            <section className="py-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-8">Top Rated</h2>
              <MovieGridSkeleton />
            </section>
          }>
            <TopRatedMoviesSection />
          </Suspense>

          <Suspense fallback={
            <section className="py-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-8">Coming Soon</h2>
              <MovieGridSkeleton />
            </section>
          }>
            <UpcomingMoviesSection />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}