import { Metadata } from 'next';
import { Suspense } from 'react';
import { tmdbApi } from '@/lib/api/tmdb';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MovieGrid } from '@/components/movie/movie-grid';
import { CategoryTabs } from '@/components/categories/category-tabs';

import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Movie Categories - CineHub',
  description: 'Browse movies by category - Popular, Top Rated, Upcoming, and more',
};

function MovieGridSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CategoriesPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const category = searchParams.category || 'popular';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Movie Categories</h1>
            <CategoryTabs activeCategory={category} />
          </div>

          <Suspense fallback={<MovieGridSkeleton />}>
            <CategoryContent category={category} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

async function CategoryContent({ category }: { category: string }) {
  try {
    const { tmdbApi } = await import('@/lib/api/tmdb');
    
    let movies;
    let title;
    let categoryProp: 'popular' | 'top-rated' | 'upcoming' | 'now-playing';
    
    switch (category) {
      case 'popular':
        const popularData = await tmdbApi.getPopularMovies(1);
        movies = popularData.results;
        title = 'Popular Movies';
        categoryProp = 'popular';
        break;
      case 'top-rated':
        const topRatedData = await tmdbApi.getTopRatedMovies(1);
        movies = topRatedData.results;
        title = 'Top Rated Movies';
        categoryProp = 'top-rated';
        break;
      case 'upcoming':
        const upcomingData = await tmdbApi.getUpcomingMovies(1);
        movies = upcomingData.results;
        title = 'Upcoming Movies';
        categoryProp = 'upcoming';
        break;
      case 'now-playing':
        const nowPlayingData = await tmdbApi.getNowPlayingMovies(1);
        movies = nowPlayingData.results;
        title = 'Now Playing';
        categoryProp = 'now-playing';
        break;
      default:
        const defaultData = await tmdbApi.getPopularMovies(1);
        movies = defaultData.results;
        title = 'Popular Movies';
        categoryProp = 'popular';
    }

    return (
      <MovieGrid
        movies={movies}
        title={title}
        category={categoryProp}
        showYear={true}
        showRating={true}
      />
    );
  } catch (error) {
    console.error('Error fetching category movies:', error);
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Unable to load movies</h2>
        <p className="text-muted-foreground">Please try again later</p>
      </div>
    );
  }
}
