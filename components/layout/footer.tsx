import Link from 'next/link';
import { Github, Twitter, Youtube, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-1.5 mb-4">
              <img src="/logo.png" alt="CineHub" className="h-8 w-auto" />
              <span className="text-xl font-bold">
                <span className="text-foreground">Cine</span>
                <span className="text-red-600">Hub</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              Discover and watch the latest movies and TV shows. Your ultimate entertainment destination.
            </p>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Movies
                </Link>
              </li>
              <li>
                <Link href="/tv-shows" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  TV Shows
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-4">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/watchlist" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Watchlist
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Favorites
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 CineHub. All rights reserved. Powered by TMDB API.
          </p>
        </div>
      </div>
    </footer>
  );
}