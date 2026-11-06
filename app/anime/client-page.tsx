'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { AnimeCard } from '@/components/anime/anime-card';
import { LoadingScreen } from '@/components/loading-screen';
import { anilistApi, ANIME_GENRES, type Anime, type AnimeSort } from '@/lib/api/anilist';

type Tab = { key: string; label: string; sort: AnimeSort; thisSeason?: boolean };

const TABS: Tab[] = [
  { key: 'trending', label: 'Trending', sort: 'TRENDING_DESC' },
  { key: 'season', label: 'This Season', sort: 'POPULARITY_DESC', thisSeason: true },
  { key: 'popular', label: 'All-Time Popular', sort: 'POPULARITY_DESC' },
  { key: 'top', label: 'Top Rated', sort: 'SCORE_DESC' },
];

export default function AnimeBrowseClient() {
  const [tab, setTab] = useState<Tab>(TABS[0]);
  const [genre, setGenre] = useState('');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [items, setItems] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Debounce search typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  // Reset to page 1 whenever the filter changes
  useEffect(() => setPage(1), [tab, genre, debouncedQuery]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    anilistApi
      .browse({
        sort: tab.sort,
        thisSeason: !debouncedQuery && tab.thisSeason,
        genre,
        search: debouncedQuery,
        page,
        perPage: 30,
      })
      .then((res) => {
        if (cancelled) return;
        setItems(res.media);
        // AniList caps deep pagination; keep the pager sane.
        setLastPage(Math.min(res.pageInfo.lastPage || 1, 100));
      })
      .catch((e) => !cancelled && setError(e.message || 'Could not load anime'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tab, genre, debouncedQuery, page]);

  const goToPage = (p: number) => {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const heading = debouncedQuery ? `Results for “${debouncedQuery}”` : 'Watch Anime Online Free - Sub & Dub';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div ref={topRef} className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-16">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">{heading}</h1>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setTab(t);
                    setQuery('');
                  }}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    tab.key === t.key && !debouncedQuery
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 lg:ml-auto">
              <div className="relative flex-1 lg:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search anime…"
                  aria-label="Search anime"
                  className="w-full bg-muted border border-border rounded-md pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                aria-label="Genre"
                className="bg-muted border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Genres</option>
                {ANIME_GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingScreen message="Loading anime…" fullScreen={false} />
          ) : error ? (
            <div className="py-24 text-center">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => setTab({ ...tab })} className="bg-red-600 hover:bg-red-700 text-white">
                Try again
              </Button>
            </div>
          ) : items.length === 0 ? (
            <p className="py-24 text-center text-muted-foreground">No anime found. Try another search or genre.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-1 sm:gap-1.5 md:gap-2 lg:gap-2 my-6">
              {items.map((a, i) => (
                <AnimeCard key={a.id} anime={a} priority={i < 6} />
              ))}
            </div>
          )}

          {!loading && !error && lastPage > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-10 h-10"
                onClick={() => goToPage(Math.max(1, page - 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-3">
                Page <span className="text-foreground font-medium">{page}</span> of {lastPage}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-10 h-10"
                onClick={() => goToPage(Math.min(lastPage, page + 1))}
                disabled={page >= lastPage}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
