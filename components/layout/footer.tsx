import Link from 'next/link';
import { Github, Twitter, Youtube, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-16">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 xl:gap-6 mb-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-1.5 mb-4">
              <img src="/logo.png" alt="CineHub" className="h-8 w-auto" />
              <span className="text-xl font-bold">
                <span className="text-foreground">Cine</span>
                <span className="text-red-600">Hub</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm mb-4">
              Watch free movies and TV shows online in HD quality. Stream 1000s of latest films without registration. Best free streaming site 2024.
            </p>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-3 text-sm">Browse</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/movies" className="text-muted-foreground hover:text-red-600 transition-colors text-sm">
                  Movies
                </Link>
              </li>
              <li>
                <Link href="/tv-shows" className="text-muted-foreground hover:text-red-600 transition-colors text-sm">
                  TV Shows
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-red-600 transition-colors text-sm">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-3 text-sm">Popular Genres</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/genre/action" className="text-muted-foreground hover:text-red-600 transition-colors text-sm">
                  Action Movies
                </Link>
              </li>
              <li>
                <Link href="/genre/comedy" className="text-muted-foreground hover:text-red-600 transition-colors text-sm">
                  Comedy Movies
                </Link>
              </li>
              <li>
                <Link href="/genre/horror" className="text-muted-foreground hover:text-red-600 transition-colors text-sm">
                  Horror Movies
                </Link>
              </li>
              <li>
                <Link href="/genre/thriller" className="text-muted-foreground hover:text-red-600 transition-colors text-sm">
                  Thriller Movies
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-3 text-sm">More Genres</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/genre/drama" className="text-muted-foreground hover:text-red-600 transition-colors text-sm">
                  Drama Movies
                </Link>
              </li>
              <li>
                <Link href="/genre/romance" className="text-muted-foreground hover:text-red-600 transition-colors text-sm">
                  Romance Movies
                </Link>
              </li>
              <li>
                <Link href="/genre/sci-fi" className="text-muted-foreground hover:text-red-600 transition-colors text-sm">
                  Sci-Fi Movies
                </Link>
              </li>
              <li>
                <Link href="/genre/animation" className="text-muted-foreground hover:text-red-600 transition-colors text-sm">
                  Animation Movies
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-3 text-sm">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-red-600 transition-colors text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-red-600 transition-colors text-sm">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-3 text-sm">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-red-600 transition-colors text-sm">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-red-600 transition-colors text-sm">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="mb-6">
            <p className="text-muted-foreground text-xs leading-relaxed">
              <strong className="text-foreground">CineHub</strong> - Your ultimate destination to watch free movies and TV shows online in HD quality. Stream thousands of popular films, trending series, and new releases without registration. Best free alternative to HDToday, FMovies, 123Movies, and other streaming sites. Watch action movies, comedy films, horror movies, thriller series, drama shows, romance movies, sci-fi films, and more. Updated daily with the latest content.
            </p>
          </div>
          <p className="text-muted-foreground text-xs text-center">
            © 2024 CineHub. All rights reserved. Powered by TMDB API.
          </p>
        </div>
      </div>
    </footer>
  );
}