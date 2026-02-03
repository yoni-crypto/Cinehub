import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { tmdbApi } from '@/lib/api/tmdb';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SearchResults } from '@/components/search/search-results';
import { LoadingScreen } from '@/components/loading-screen';

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

export const metadata: Metadata = {
  title: 'Search - CineHub',
  description: 'Search for movies and TV shows',
};

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
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Suspense fallback={<LoadingScreen message="Searching…" fullScreen={false} />}>
            <SearchContent query={query} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
