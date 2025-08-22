import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { tmdbApi } from '@/lib/api/tmdb';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SearchResults } from '@/components/search/search-results';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

export const metadata: Metadata = {
  title: 'Search - CineHub',
  description: 'Search for movies and TV shows',
};

function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function SearchContent({ query }: { query: string }) {
  try {
    const [movies, tvShows] = await Promise.all([
      tmdbApi.searchMovies(query),
      tmdbApi.searchTVShows(query),
    ]);

    return (
      <SearchResults 
        query={query}
        movies={movies.results}
        tvShows={tvShows.results}
      />
    );
  } catch (error) {
    console.error('Error searching:', error);
    notFound();
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q;

  if (!query) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Suspense fallback={<SearchResultsSkeleton />}>
            <SearchContent query={query} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
