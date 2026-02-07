import Link from 'next/link';
import { Github, Twitter, Youtube, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-16">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-8">
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
            <h3 className="text-foreground font-semibold mb-3 text-sm">By Year</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/year/2024" className="text-muted-foreground hover:text-red-600 transition-colors text-sm">
                  2024
                </Link>
              </li>
              <li>
                <Link href="/year/2023" className="text-muted-foreground hover:text-red-600 transition-colors text-sm">
                  2023
                </Link>
              </li>
              <li>
                <Link href="/year/2022" className="text-muted-foreground hover:text-red-600 transition-colors text-sm">
                  2022
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
          <p className="text-muted-foreground text-xs text-center">
            © 2024 CineHub. All rights reserved. Powered by TMDB API.
          </p>
        </div>
      </div>
    </footer>
  );
}