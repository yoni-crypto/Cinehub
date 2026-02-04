'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { tmdbApi } from '@/lib/api/tmdb';

interface CategoriesSearchBarProps {
  className?: string;
  inputClassName?: string;
  wrapperClassName?: string;
}

export function CategoriesSearchBar({ className, inputClassName, wrapperClassName }: CategoriesSearchBarProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const searchMovies = async (q: string) => {
    if (q.length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const response = await tmdbApi.searchMulti(q);
      setSearchResults(response.results.slice(0, 8));
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length === 0) {
      if (typeof window !== 'undefined') {
        const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        setSearchHistory(history);
        setShowHistory(history.length > 0);
      }
      setShowSuggestions(false);
    } else {
      setShowHistory(false);
      searchMovies(value);
    }
  };

  const handleSearchFocus = () => {
    if (typeof window !== 'undefined') {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      setSearchHistory(history);
      if (query.length === 0 && history.length > 0) {
        setShowHistory(true);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setShowSuggestions(false);
      setShowHistory(false);
    }
  };

  const selectSuggestion = (item: any) => {
    const type = item.media_type === 'movie' ? 'movies' : 'tv-shows';
    if (typeof window !== 'undefined') {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const historyItem = {
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
        media_type: item.media_type,
        release_date: item.release_date || item.first_air_date,
      };
      const newHistory = [historyItem, ...history.filter((h: any) => h.id !== item.id)].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
    router.push(`/${type}/${item.id}`);
    setQuery('');
    setShowSuggestions(false);
    setShowHistory(false);
  };

  const selectHistoryItem = (item: any) => {
    const type = item.media_type === 'movie' ? 'movies' : 'tv-shows';
    router.push(`/${type}/${item.id}`);
    setQuery('');
    setShowSuggestions(false);
    setShowHistory(false);
  };

  const removeHistoryItem = (itemId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const newHistory = history.filter((h: any) => h.id !== itemId);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      setSearchHistory(newHistory);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasDropdown = (showSuggestions && searchResults.length > 0) || (showHistory && searchHistory.length > 0);

  return (
    <div ref={searchRef} className={`relative w-full ${className ?? ''}`}>
      <form onSubmit={handleSubmit} className="w-full">
        <div
          className={`relative flex items-center bg-background border border-input rounded-lg overflow-visible focus-within:outline-none ${wrapperClassName ?? ''}`}
        >
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none flex-shrink-0" />
          <input
            type="search"
            placeholder="Enter keywords..."
            value={query}
            onChange={handleSearchInputChange}
            onFocus={handleSearchFocus}
            className={`w-full pl-10 pr-4 py-2.5 text-foreground bg-transparent placeholder:text-muted-foreground focus:outline-none text-sm ${inputClassName ?? ''}`}
            aria-label="Search movies and shows"
          />
        </div>
      </form>

      {hasDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-black border border-gray-800 rounded-lg shadow-xl z-50 max-h-80 overflow-hidden flex flex-col">
          {showSuggestions && query.length > 0 && (
            <button
              type="button"
              onClick={() => {
                router.push(`/search?q=${encodeURIComponent(query)}`);
                setQuery('');
                setShowSuggestions(false);
                setShowHistory(false);
              }}
              className="w-full p-3 text-center text-red-500 hover:bg-gray-800 transition-colors text-sm font-medium border-b border-gray-800"
            >
              View All Results
            </button>
          )}
          <div className="overflow-y-auto">
            {showHistory && searchHistory.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-800 bg-gray-900/50">
                  Recent Searches
                </div>
                {searchHistory.map((item: any, index: number) => (
                  <div
                    key={`${item.id}-${index}`}
                    onClick={() => selectHistoryItem(item)}
                    className="flex items-center p-2 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-b-0"
                  >
                    <img
                      src={
                        item.poster_path
                          ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                          : '/placeholder.png'
                      }
                      alt={item.title}
                      className="w-8 h-12 object-cover rounded mr-2 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-xs truncate">{item.title}</h4>
                      <p className="text-gray-400 text-xs">
                        {item.media_type === 'movie' ? 'Movie' : 'TV Show'} •{' '}
                        {item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => removeHistoryItem(item.id, e)}
                      className="p-1.5 hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                      aria-label="Remove from history"
                    >
                      <X className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
                    </button>
                  </div>
                ))}
              </>
            )}
            {showSuggestions &&
              searchResults.map((item: any) => (
                <div
                  key={item.id}
                  onClick={() => selectSuggestion(item)}
                  className="flex items-center p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-b-0"
                >
                  <img
                    src={
                      item.poster_path
                        ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                        : '/placeholder.png'
                    }
                    alt={item.title || item.name}
                    className="w-12 h-16 object-cover rounded mr-3 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm truncate">{item.title || item.name}</h4>
                    <p className="text-gray-400 text-xs">
                      {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
                      {item.number_of_seasons
                        ? ` • ${item.number_of_seasons} Season${item.number_of_seasons > 1 ? 's' : ''}`
                        : ''}{' '}
                      •{' '}
                      {item.release_date || item.first_air_date
                        ? new Date(item.release_date || item.first_air_date).getFullYear()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
