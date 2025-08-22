'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MovieGrid } from './movie-grid';
import { PaginatedMovieGrid } from './paginated-movie-grid';
import { Movie } from '@/lib/types/movie';

interface MovieCategoryTabsProps {
  trendingMovies: Movie[];
  popularMovies: Movie[];
  topRatedMovies: Movie[];
  upcomingMovies: Movie[];
  nowPlayingMovies: Movie[];
}

export function MovieCategoryTabs({
  trendingMovies,
  popularMovies,
  topRatedMovies,
  upcomingMovies,
  nowPlayingMovies
}: MovieCategoryTabsProps) {
  const [activeTab, setActiveTab] = useState('trending');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-5 bg-gray-800">
        <TabsTrigger value="trending" className="text-white data-[state=active]:bg-primary">
          Trending
        </TabsTrigger>
        <TabsTrigger value="popular" className="text-white data-[state=active]:bg-primary">
          Popular
        </TabsTrigger>
        <TabsTrigger value="top-rated" className="text-white data-[state=active]:bg-primary">
          Top Rated
        </TabsTrigger>
        <TabsTrigger value="upcoming" className="text-white data-[state=active]:bg-primary">
          Upcoming
        </TabsTrigger>
        <TabsTrigger value="now-playing" className="text-white data-[state=active]:bg-primary">
          Now Playing
        </TabsTrigger>
      </TabsList>

      <TabsContent value="trending" className="mt-6">
        <MovieGrid movies={trendingMovies} title="Trending Now" />
      </TabsContent>

      <TabsContent value="popular" className="mt-6">
        <PaginatedMovieGrid 
          title="Popular Movies" 
          category="popular"
          initialMovies={popularMovies}
        />
      </TabsContent>

      <TabsContent value="top-rated" className="mt-6">
        <PaginatedMovieGrid 
          title="Top Rated Movies" 
          category="top-rated"
          initialMovies={topRatedMovies}
        />
      </TabsContent>

      <TabsContent value="upcoming" className="mt-6">
        <PaginatedMovieGrid 
          title="Upcoming Movies" 
          category="upcoming"
          initialMovies={upcomingMovies}
        />
      </TabsContent>

      <TabsContent value="now-playing" className="mt-6">
        <PaginatedMovieGrid 
          title="Now Playing" 
          category="now-playing"
          initialMovies={nowPlayingMovies}
        />
      </TabsContent>
    </Tabs>
  );
}
