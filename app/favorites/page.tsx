import { Metadata } from 'next';
import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MovieGrid } from '@/components/movie/movie-grid';
import { FavoritesContent } from '@/components/favorites/favorites-content';

import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'My Favorites - CineHub',
  description: 'Your favorite movies on CineHub',
};

function FavoritesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Skeleton className="h-8 w-64 mx-auto mb-4" />
        <Skeleton className="h-4 w-96 mx-auto" />
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

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">My Favorites</h1>
            <p className="text-muted-foreground">
              Movies you've marked as favorites
            </p>
          </div>

          <Suspense fallback={<FavoritesSkeleton />}>
            <FavoritesContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
