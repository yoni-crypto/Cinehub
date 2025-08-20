import { Suspense } from 'react';
import { SearchResults } from '@/components/search/search-results';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchPageProps {
  searchParams: { q?: string };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<SearchResultsSkeleton />}>
            <SearchResults query={query} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Searching...</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
