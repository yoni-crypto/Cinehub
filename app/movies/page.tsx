'use client';

import { useState, useEffect } from 'react';
import { tmdbApi } from '@/lib/api/tmdb';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MovieGrid } from '@/components/movie/movie-grid';
import { LoadingScreen } from '@/components/loading-screen';
import { Movie, Genre } from '@/lib/types/movie';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<'popular' | 'top-rated' | 'upcoming' | 'now-playing'>('popular');
  const [filterOpen, setFilterOpen] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  
  // Applied filters
  const [appliedGenre, setAppliedGenre] = useState<string>('all');
  const [appliedYear, setAppliedYear] = useState<string>('all');
  const [appliedSortBy, setAppliedSortBy] = useState<string>('popularity.desc');
  const [appliedCountry, setAppliedCountry] = useState<string>('all');
  const [appliedCategory, setAppliedCategory] = useState<'popular' | 'top-rated' | 'upcoming' | 'now-playing'>('popular');
  
  // Temp filters (in the panel)
  const [tempGenre, setTempGenre] = useState<string>('all');
  const [tempYear, setTempYear] = useState<string>('all');
  const [tempSortBy, setTempSortBy] = useState<string>('popularity.desc');
  const [tempCountry, setTempCountry] = useState<string>('all');
  const [tempCategory, setTempCategory] = useState<'popular' | 'top-rated' | 'upcoming' | 'now-playing'>('popular');

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const { genres } = await tmdbApi.getGenres();
        setGenres(genres);
      } catch (error) {
        console.error('Error loading genres:', error);
      }
    };
    loadGenres();
  }, []);

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      try {
        if ((appliedGenre !== 'all') || (appliedYear !== 'all') || (appliedCountry !== 'all') || appliedSortBy !== 'popularity.desc') {
          const [response, response2] = await Promise.all([
            tmdbApi.discoverMovies({
              genreId: (appliedGenre !== 'all') ? parseInt(appliedGenre) : undefined,
              year: (appliedYear !== 'all') ? parseInt(appliedYear) : undefined,
              sortBy: appliedSortBy,
              originCountry: (appliedCountry !== 'all') ? appliedCountry : undefined,
              page: 1
            }),
            tmdbApi.discoverMovies({
              genreId: (appliedGenre !== 'all') ? parseInt(appliedGenre) : undefined,
              year: (appliedYear !== 'all') ? parseInt(appliedYear) : undefined,
              sortBy: appliedSortBy,
              originCountry: (appliedCountry !== 'all') ? appliedCountry : undefined,
              page: 2
            })
          ]);
          setMovies([...response.results, ...response2.results]);
          setCategory('popular');
        } else {
          let page1, page2;
          switch (appliedCategory) {
            case 'top-rated':
              [page1, page2] = await Promise.all([
                tmdbApi.getTopRatedMovies(1),
                tmdbApi.getTopRatedMovies(2)
              ]);
              break;
            case 'upcoming':
              [page1, page2] = await Promise.all([
                tmdbApi.getUpcomingMovies(1),
                tmdbApi.getUpcomingMovies(2)
              ]);
              break;
            case 'now-playing':
              [page1, page2] = await Promise.all([
                tmdbApi.getNowPlayingMovies(1),
                tmdbApi.getNowPlayingMovies(2)
              ]);
              break;
            default:
              [page1, page2] = await Promise.all([
                tmdbApi.getPopularMovies(1),
                tmdbApi.getPopularMovies(2)
              ]);
          }
          setMovies([...page1.results, ...page2.results]);
        }
      } catch (error) {
        console.error('Error loading movies:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMovies();
  }, [appliedCategory, appliedGenre, appliedYear, appliedSortBy, appliedCountry]);

  const applyFilters = () => {
    setAppliedGenre(tempGenre);
    setAppliedYear(tempYear);
    setAppliedSortBy(tempSortBy);
    setAppliedCountry(tempCountry);
    setAppliedCategory(tempCategory);
    setCategory(tempCategory);
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setTempGenre('all');
    setTempYear('all');
    setTempSortBy('popularity.desc');
    setTempCountry('all');
    setTempCategory('popular');
    setAppliedGenre('all');
    setAppliedYear('all');
    setAppliedSortBy('popularity.desc');
    setAppliedCountry('all');
    setAppliedCategory('popular');
    setCategory('popular');
  };

  const closeFilter = () => {
    setTempGenre(appliedGenre);
    setTempYear(appliedYear);
    setTempSortBy(appliedSortBy);
    setTempCountry(appliedCountry);
    setTempCategory(appliedCategory);
    setFilterOpen(false);
  };

  const hasActiveFilters = (appliedGenre !== 'all') || (appliedYear !== 'all') || appliedSortBy !== 'popularity.desc' || (appliedCountry !== 'all');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'IN', name: 'India' },
    { code: 'CN', name: 'China' },
    { code: 'AU', name: 'Australia' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <LoadingScreen message="Loading movies…" />
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
            <h1 className="text-2xl md:text-3xl font-bold">Popular Movies</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && <span className="ml-1 px-1.5 py-0.5 bg-red-600 text-white text-xs rounded-full">{[appliedGenre !== 'all', appliedYear !== 'all', appliedCountry !== 'all', appliedSortBy !== 'popularity.desc'].filter(Boolean).length}</span>}
            </Button>
          </div>

          {filterOpen && (
            <div className="bg-background border border-border rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filter Movies</h3>
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
                      <option value="now-playing">Now Playing</option>
                      <option value="upcoming">Upcoming</option>
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
                    <label className="text-sm font-medium mb-2 block">Country</label>
                    <select
                      value={tempCountry}
                      onChange={(e) => setTempCountry(e.target.value)}
                      className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="all">All Countries</option>
                      {countries.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name}
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
                      <option value="release_date.desc">Release Date (Newest)</option>
                      <option value="release_date.asc">Release Date (Oldest)</option>
                      <option value="title.asc">Title (A-Z)</option>
                      <option value="title.desc">Title (Z-A)</option>
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

          <MovieGrid
            movies={movies}
            title=""
            category={category}
            showYear={true}
            showRating={true}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
