import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Film, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="mb-8">
            <Film className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-6xl md:text-8xl font-bold text-muted-foreground mb-4">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Page Not Found
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/search">
                <Search className="w-4 h-4 mr-2" />
                Search Movies
              </Link>
            </Button>
          </div>

          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-4">Popular Pages</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button asChild variant="ghost" size="sm">
                <Link href="/categories">Categories</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/watchlist">Watchlist</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
