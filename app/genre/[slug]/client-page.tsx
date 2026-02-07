'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MovieGrid } from '@/components/movie/movie-grid';
import { MovieGridSkeleton } from '@/components/movie/movie-skeleton';
import { Button } from '@/components/ui/button';
import { tmdbApi } from '@/lib/api/tmdb';
import { Genre } from '@/lib/types/movie';

interface ClientPageProps {
  genre: {
    id: number;
    name: string;
    description: string;
  };
  slug: string;
}

export default function ClientPage({ genre }: ClientPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [appliedYear, setAppliedYear] = useState<string>('all');
  const [appliedSortBy, setAppliedSortBy] = useState<string>('popularity.desc');
  
  const [tempYear, setTempYear] = useState<string>('all');
  const [tempSortBy, setTempSortBy] = useState<string>('popularity.desc');

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      try {
        const [response1, response2] = await Promise.all([
          tmdbApi.discoverMovies({
            genreId: genre.id,
            year: appliedYear !== 'all' ? parseInt(appliedYear) : undefined,
            sortBy: appliedSortBy,
            page: page * 2 - 1
          }),
          tmdbApi.discoverMovies({
            genreId: genre.id,
            year: appliedYear !== 'all' ? parseInt(appliedYear) : undefined,
            sortBy: appliedSortBy,
            page: page * 2
          })
        ]);
        setMovies([...response1.results, ...response2.results]);
        setTotalPages(Math.min(Math.ceil(response1.total_pages / 2), 250));
      } catch (error) {
        console.error('Error loading genre movies:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMovies();
  }, [genre.id, appliedYear, appliedSortBy, page]);

  const applyFilters = () => {
    setAppliedYear(tempYear);
    setAppliedSortBy(tempSortBy);
    setPage(1);
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setTempYear('all');
    setTempSortBy('popularity.desc');
    setAppliedYear('all');
    setAppliedSortBy('popularity.desc');
    setPage(1);
  };

  const closeFilter = () => {
    setTempYear(appliedYear);
    setTempSortBy(appliedSortBy);
    setFilterOpen(false);
  };

  const hasActiveFilters = appliedYear !== 'all' || appliedSortBy !== 'popularity.desc';
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const PaginationControls = () => (
    totalPages > 1 ? (
      <div className="flex items-center justify-center gap-2 my-6">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-10 h-10"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center gap-1">
          {page > 2 && (
            <Button variant="ghost" size="icon" className="rounded-full w-10 h-10" onClick={() => setPage(1)}>1</Button>
          )}
          {page > 3 && <span className="px-2">...</span>}
          {page > 1 && (
            <Button variant="ghost" size="icon" className="rounded-full w-10 h-10" onClick={() => setPage(page - 1)}>{page - 1}</Button>
          )}
          <Button size="icon" className="rounded-full w-10 h-10 bg-red-600 hover:bg-red-700">{page}</Button>
          {page < totalPages && (
            <Button variant="ghost" size="icon" className="rounded-full w-10 h-10" onClick={() => setPage(page + 1)}>{page + 1}</Button>
          )}
          {page < totalPages - 2 && <span className="px-2">...</span>}
          {page < totalPages - 1 && (
            <Button variant="ghost" size="icon" className="rounded-full w-10 h-10" onClick={() => setPage(totalPages)}>{totalPages}</Button>
          )}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-10 h-10"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    ) : null
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {genre.name} Movies
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            {genre.description}
          </p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && <span className="ml-1 px-1.5 py-0.5 bg-red-600 text-white text-xs rounded-full">{[appliedYear !== 'all', appliedSortBy !== 'popularity.desc'].filter(Boolean).length}</span>}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {loading ? (
          <MovieGridSkeleton count={40} />
        ) : (
          <>
            <PaginationControls />
            
            <MovieGrid
              movies={movies}
              title=""
              showYear={true}
              showRating={true}
            />
            
            <PaginationControls />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
