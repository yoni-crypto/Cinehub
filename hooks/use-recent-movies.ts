"use client";

import { useEffect, useState } from 'react';
import { Movie } from '@/lib/types/movie';

const STORAGE_KEY = 'cinehub-recent-movies';
const MAX_RECENT = 10;

export function useRecentMovies() {
  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setRecentMovies(JSON.parse(stored));
    }
  }, []);

  const addRecentMovie = (movie: Movie) => {
    const updated = [
      movie,
      ...recentMovies.filter(m => m.id !== movie.id)
    ].slice(0, MAX_RECENT);
    
    setRecentMovies(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearRecent = () => {
    setRecentMovies([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { recentMovies, addRecentMovie, clearRecent };
}