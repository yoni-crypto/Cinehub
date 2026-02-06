'use client';

import { useState, useEffect } from 'react';
import { tmdbApi } from '@/lib/api/tmdb';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { TVShowGrid } from '@/components/tv-shows/tv-show-grid';
import { LoadingScreen } from '@/components/loading-screen';
import { TVShow } from '@/lib/api/tmdb';
import { Genre } from '@/lib/types/movie';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

export default function TVShowsPage() {
  const [tvShows, setTVShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<'popular' | 'top-rated' | 'on-the-air' | 'airing-today'>('popular');
  const [filterOpen, setFilterOpen] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  
  // Applied filters
  const [appliedGenre, setAppliedGenre] = useState<string>('all');
  const [appliedYear, setAppliedYear] = useState<string>('all');
  const [appliedSortBy, setAppliedSortBy] = useState<string>('popularity.desc');
  const [appliedCategory, setAppliedCategory] = useState<'popular' | 'top-rated' | 'on-the-air' | 'airing-today'>('popular');
  
  // Temp filters (in the panel)
  const [tempGenre, setTempGenre] = useState<string>('all');
  const [tempYear, setTempYear] = useState<string>('all');
  const [tempSortBy, setTempSortBy] = useState<string>('popularity.desc');
  const [tempCategory, setTempCategory] = useState<'popular' | 'top-rated' | 'on-the-air' | 'airing-today'>('popular');

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const { genres } = await tmdbApi.getTVGenres();
        setGenres(genres);
      } catch (error) {
        console.error('Error loading genres:', error);
      }
    };
    loadGenres();
  }, []);

  useEffect(() => {
    const loadTVShows = async () => {
      setLoading(true);
      try {
        if ((appliedGenre !== 'all') || (appliedYear !== 'all') || appliedSortBy !== 'popularity.desc') {
          const [response, response2] = await Promise.all([
            tmdbApi.discoverTVShows({
              genreId: (appliedGenre !== 'all') ? parseInt(appliedGenre) : undefined,
              year: (appliedYear !== 'all') ? parseInt(appliedYear) : undefined,
              sortBy: appliedSortBy,
              page: 1
            }),
            tmdbApi.discoverTVShows({
              genreId: (appliedGenre !== 'all') ? parseInt(appliedGenre) : undefined,
              year: (appliedYear !== 'all') ? parseInt(appliedYear) : undefined,
              sortBy: appliedSortBy,
              page: 2
            })
          ]);
          setTVShows([...response.results, ...response2.results]);
          setCategory('popular');
        } else {
          let page1, page2;
          switch (appliedCategory) {
            case 'top-rated':
              [page1, page2] = await Promise.all([
                tmdbApi.getTopRatedTVShows(1),
                tmdbApi.getTopRatedTVShows(2)
              ]);
              break;
            case 'on-the-air':
              [page1, page2] = await Promise.all([
                tmdbApi.getOnTheAirTVShows(1),
                tmdbApi.getOnTheAirTVShows(2)
              ]);
              break;
            case 'airing-today':
              [page1, page2] = await Promise.all([
                tmdbApi.getAiringTodayTVShows(1),
                tmdbApi.getAiringTodayTVShows(2)
              ]);
              break;
            default:
              [page1, page2] = await Promise.all([
                tmdbApi.getPopularTVShows(1),
                tmdbApi.getPopularTVShows(2)
              ]);
          }
          setTVShows([...page1.results, ...page2.results]);
        }
      } catch (error) {
        console.error('Error loading TV shows:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTVShows();
  }, [appliedCategory, appliedGenre, appliedYear, appliedSortBy]);

  const applyFilters = () => {
    setAppliedGenre(tempGenre);
    setAppliedYear(tempYear);
    setAppliedSortBy(tempSortBy);
    setAppliedCategory(tempCategory);
    setCategory(tempCategory);
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setTempGenre('all');
    setTempYear('all');
    setTempSortBy('popularity.desc');
    setTempCategory('popular');
    setAppliedGenre('all');
    setAppliedYear('all');
    setAppliedSortBy('popularity.desc');
    setAppliedCategory('popular');
    setCategory('popular');
  };

  const closeFilter = () => {
    setTempGenre(appliedGenre);
    setTempYear(appliedYear);
    setTempSortBy(appliedSortBy);
    setTempCategory(appliedCategory);
    setFilterOpen(false);
  };

  const hasActiveFilters = (appliedGenre !== 'all') || (appliedYear !== 'all') || appliedSortBy !== 'popularity.desc';

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <LoadingScreen message="Loading TV shows…" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Popular TV Shows</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && <span className="ml-1 px-1.5 py-0.5 bg-red-600 text-white text-xs rounded-full">{[appliedGenre !== 'all', appliedYear !== 'all', appliedSortBy !== 'popularity.desc'].filter(Boolean).length}</span>}
            </Button>
          </div>

          {filterOpen && (
            <div className="bg-background border border-border rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filter TV Shows</h3>
                <Button variant="ghost" size="sm" onClick={closeFilter}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <select
                      value={tempCategory}
                      onChange={(e) => setTempCategory(e.target.value as any)}
                      className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="popular">Popular</option>
                      <option value="top-rated">Top Rated</option>
                      <option value="on-the-air">On The Air</option>
                      <option value="airing-today">Airing Today</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Genre</label>
                    <select
                      value={tempGenre}
                      onChange={(e) => setTempGenre(e.target.value)}
                      className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="all">All Genres</option>
                      {genres.map(genre => (
                        <option key={genre.id} value={genre.id.toString()}>
                          {genre.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Year</label>
                    <select
                      value={tempYear}
                      onChange={(e) => setTempYear(e.target.value)}
                      className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="all">All Years</option>
                      {years.map(year => (
                        <option key={year} value={year.toString()}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <select
                      value={tempSortBy}
                      onChange={(e) => setTempSortBy(e.target.value)}
                      className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="popularity.desc">Popularity (High to Low)</option>
                      <option value="popularity.asc">Popularity (Low to High)</option>
                      <option value="vote_average.desc">Rating (High to Low)</option>
                      <option value="vote_average.asc">Rating (Low to High)</option>
                      <option value="first_air_date.desc">Air Date (Newest)</option>
                      <option value="first_air_date.asc">Air Date (Oldest)</option>
                      <option value="name.asc">Title (A-Z)</option>
                      <option value="name.desc">Title (Z-A)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={closeFilter}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={applyFilters}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          )}

          <TVShowGrid
            tvShows={tvShows}
            title=""
            category={category}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
