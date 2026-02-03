import { Metadata } from 'next';
import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { WatchlistContent } from '@/components/watchlist/watchlist-content';
import { LoadingScreen } from '@/components/loading-screen';

export const metadata: Metadata = {
  title: 'My Watchlist - CineHub',
  description: 'Your personal movie watchlist on CineHub',
};

export default function WatchlistPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">My Watchlist</h1>
            <p className="text-muted-foreground">
              Movies you've saved to watch later
            </p>
          </div>

          <Suspense fallback={<LoadingScreen message="Loading watchlist…" fullScreen={false} />}>
            <WatchlistContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
