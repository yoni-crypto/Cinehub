import { Suspense } from 'react';
import { Metadata } from 'next';
import { tmdbApi } from '@/lib/api/tmdb';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { TVShowGrid } from '@/components/tv-shows/tv-show-grid';
import { TVShowCategoryTabs } from '@/components/tv-shows/tv-show-category-tabs';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'TV Shows - CineHub',
  description: 'Discover and watch the latest TV shows',
};

function TVShowGridSkeleton() {
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

export default function TVShowsPage({
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">TV Shows</h1>
            <TVShowCategoryTabs activeCategory={category} />
          </div>

          <Suspense key={category} fallback={<TVShowGridSkeleton />}>
            <TVShowCategoryContent category={category} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

async function TVShowCategoryContent({ category }: { category: string }) {
  try {
    const { tmdbApi } = await import('@/lib/api/tmdb');
    
    let tvShows;
    let title;
    let categoryProp: 'popular' | 'top-rated' | 'on-the-air' | 'airing-today';
    
    switch (category) {
      case 'popular':
        const popularData = await tmdbApi.getPopularTVShows(1);
        tvShows = popularData.results;
        title = 'Popular TV Shows';
        categoryProp = 'popular';
        break;
      case 'top-rated':
        const topRatedData = await tmdbApi.getTopRatedTVShows(1);
        tvShows = topRatedData.results;
        title = 'Top Rated TV Shows';
        categoryProp = 'top-rated';
        break;
      case 'on-the-air':
        const onTheAirData = await tmdbApi.getOnTheAirTVShows(1);
        tvShows = onTheAirData.results;
        title = 'On The Air';
        categoryProp = 'on-the-air';
        break;
      case 'airing-today':
        const airingTodayData = await tmdbApi.getAiringTodayTVShows(1);
        tvShows = airingTodayData.results;
        title = 'Airing Today';
        categoryProp = 'airing-today';
        break;
      default:
        const defaultData = await tmdbApi.getPopularTVShows(1);
        tvShows = defaultData.results;
        title = 'Popular TV Shows';
        categoryProp = 'popular';
    }

    return (
      <TVShowGrid
        tvShows={tvShows}
        title={title}
        category={categoryProp}
      />
    );
  } catch (error) {
    console.error('Error fetching category TV shows:', error);
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Unable to load TV shows</h2>
        <p className="text-muted-foreground">Please try again later</p>
      </div>
    );
  }
}
