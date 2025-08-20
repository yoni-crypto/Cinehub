import Link from 'next/link';
import { Github, Twitter, Youtube, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CineHub
              </span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              Discover the latest movies, watch trailers, and build your personalized watchlist. 
              Your premium destination for movie discovery and entertainment.
            </p>
            <div className="flex items-center space-x-4 mt-6">
              <Button variant="ghost" size="sm" asChild>
                <Link href="https://github.com" aria-label="GitHub">
                  <Github className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="https://twitter.com" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="https://youtube.com" aria-label="YouTube">
                  <Youtube className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="mailto:contact@cinehub.com" aria-label="Email">
                  <Mail className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/watchlist" className="text-muted-foreground hover:text-foreground transition-colors">
                  My Watchlist
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="text-muted-foreground hover:text-foreground transition-colors">
                  My Favorites
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © 2024 CineHub. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-6 text-xs text-muted-foreground">
            <span>Powered by</span>
            <Link href="https://www.themoviedb.org/" className="hover:text-foreground transition-colors">
              TMDB
            </Link>
            <Link href="https://developers.google.com/youtube" className="hover:text-foreground transition-colors">
              YouTube API
            </Link>
            <Link href="https://supabase.com" className="hover:text-foreground transition-colors">
              Supabase
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}