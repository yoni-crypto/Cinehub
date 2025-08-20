import { Metadata } from 'next';
import { Suspense } from 'react';
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Movie Categories</h1>
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
    
    switch (category) {
      case 'popular':
        const popularData = await tmdbApi.getPopularMovies(1);
        movies = popularData.results;
        title = 'Popular Movies';
        break;
      case 'top-rated':
        const topRatedData = await tmdbApi.getTopRatedMovies(1);
        movies = topRatedData.results;
        title = 'Top Rated Movies';
        break;
      case 'upcoming':
        const upcomingData = await tmdbApi.getUpcomingMovies(1);
        movies = upcomingData.results;
        title = 'Upcoming Movies';
        break;
      case 'now-playing':
        const nowPlayingData = await tmdbApi.getNowPlayingMovies(1);
        movies = nowPlayingData.results;
        title = 'Now Playing';
        break;
      default:
        const defaultData = await tmdbApi.getPopularMovies(1);
        movies = defaultData.results;
        title = 'Popular Movies';
    }

    return (
      <MovieGrid
        movies={movies}
        title={title}
        showYear={true}
        showRating={true}
      />
    );
  } catch (error) {
    console.error('Error fetching category movies:', error);
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Unable to Load Movies</h2>
        <p className="text-muted-foreground">
          Please check your API configuration and try again.
        </p>
      </div>
    );
  }
}
