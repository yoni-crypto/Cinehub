import { Metadata } from 'next';
import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FavoritesContent } from '@/components/favorites/favorites-content';
import { LoadingScreen } from '@/components/loading-screen';

export const metadata: Metadata = {
  title: 'My Favorites - CineHub',
  description: 'Your favorite movies on CineHub',
};

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-8 py-8 sm:py-12">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">My Favorites</h1>
            <p className="text-muted-foreground">
              Movies you've marked as favorites
            </p>
          </div>

          <Suspense fallback={<LoadingScreen message="Loading favorites…" fullScreen={false} />}>
            <FavoritesContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
