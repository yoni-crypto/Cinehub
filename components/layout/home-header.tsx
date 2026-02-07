"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, User, LogOut, X, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-provider';
import { AuthModal } from '@/components/auth/auth-modal';
import { ThemeToggle } from '@/components/theme-toggle';
import { tmdbApi } from '@/lib/api/tmdb';

export function HomeHeader() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth() || { user: null, signOut: async () => {} };
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSuggestions(false);
      setShowHistory(false);
    }
  };

  const searchMovies = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }
    
    try {
      const response = await tmdbApi.searchMulti(query);
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
    setSearchQuery(value);
    
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
      if (searchQuery.length === 0 && history.length > 0) {
        setShowHistory(true);
      }
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
        release_date: item.release_date || item.first_air_date
      };
      const newHistory = [historyItem, ...history.filter((h: any) => h.id !== item.id)].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
    
    router.push(`/${type}/${item.id}`);
    setSearchQuery('');
    setShowSuggestions(false);
    setShowHistory(false);
  };

  const selectHistoryItem = (item: any) => {
    const type = item.media_type === 'movie' ? 'movies' : 'tv-shows';
    router.push(`/${type}/${item.id}`);
    setSearchQuery('');
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

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <div className="relative">
        <header className="relative border-b border-border">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=1920')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
          <div className="h-56 flex flex-col relative">
            <div className="flex items-start justify-between px-4 sm:px-6 lg:px-8 max-w-[1560px] mx-auto w-full pt-6 relative z-50">
              <Link href="/" className="flex items-center gap-1.5">
                <img src="/logo.png" alt="CineHub" className="h-8 w-auto" />
                <span className="text-xl font-bold">
                  <span className="text-foreground">Cine</span>
                  <span className="text-red-600">Hub</span>
                </span>
              </Link>
              
              <nav className="hidden lg:flex items-start gap-8">
                <Link href="/" className="text-white hover:text-red-400 transition-colors font-medium">
                  Home
                </Link>
                <div className="relative group">
                  <span className="text-white hover:text-red-400 transition-colors font-medium cursor-pointer">
                    Genre
                  </span>
                  <div className="absolute top-full left-0 w-64 bg-background border border-border rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="grid grid-cols-2 gap-0">
                      <Link href="/genre/action" className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted">Action</Link>
                      <Link href="/genre/comedy" className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted">Comedy</Link>
                      <Link href="/genre/drama" className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted">Drama</Link>
                      <Link href="/genre/horror" className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted">Horror</Link>
                      <Link href="/genre/thriller" className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted">Thriller</Link>
                      <Link href="/genre/romance" className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted">Romance</Link>
                      <Link href="/genre/sci-fi" className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted">Sci-Fi</Link>
                      <Link href="/genre/fantasy" className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted">Fantasy</Link>
                      <Link href="/genre/animation" className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted">Animation</Link>
                      <Link href="/genre/crime" className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted">Crime</Link>
                    </div>
                  </div>
                </div>
                <div className="relative group">
                  <span className="text-white hover:text-red-400 transition-colors font-medium cursor-pointer">
                    Country
                  </span>
                  <div className="absolute top-full left-0 w-[420px] bg-background border border-border rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="grid grid-cols-4 gap-2 p-3">
                      <Link href="/categories?country=us" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted text-sm rounded transition-colors text-center">USA</Link>
                      <Link href="/categories?country=uk" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted text-sm rounded transition-colors text-center">UK</Link>
                      <Link href="/categories?country=ca" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted text-sm rounded transition-colors text-center">Canada</Link>
                      <Link href="/categories?country=fr" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted text-sm rounded transition-colors text-center">France</Link>
                      <Link href="/categories?country=jp" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted text-sm rounded transition-colors text-center">Japan</Link>
                      <Link href="/categories?country=kr" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted text-sm rounded transition-colors text-center">Korea</Link>
                      <Link href="/categories?country=de" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted text-sm rounded transition-colors text-center">Germany</Link>
                      <Link href="/categories?country=in" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted text-sm rounded transition-colors text-center">India</Link>
                      <Link href="/categories?country=es" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted text-sm rounded transition-colors text-center">Spain</Link>
                      <Link href="/categories?country=it" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted text-sm rounded transition-colors text-center">Italy</Link>
                      <Link href="/categories?country=au" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted text-sm rounded transition-colors text-center">Australia</Link>
                      <Link href="/categories?country=br" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted text-sm rounded transition-colors text-center">Brazil</Link>
                      <Link href="/categories?country=mx" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted text-sm rounded transition-colors text-center">Mexico</Link>
                      <Link href="/categories?country=ru" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted text-sm rounded transition-colors text-center">Russia</Link>
                      <Link href="/categories?country=cn" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted text-sm rounded transition-colors text-center">China</Link>
                      <Link href="/categories?country=nl" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted text-sm rounded transition-colors text-center">Netherlands</Link>
                      <Link href="/categories?country=se" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted text-sm rounded transition-colors text-center">Sweden</Link>
                      <Link href="/categories?country=no" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted text-sm rounded transition-colors text-center">Norway</Link>
                      <Link href="/categories?country=dk" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted text-sm rounded transition-colors text-center">Denmark</Link>
                      <Link href="/categories?country=be" className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted text-sm rounded transition-colors text-center">Belgium</Link>
                    </div>
                  </div>
                </div>
                <Link href="/movies" className="text-white hover:text-red-400 transition-colors font-medium">
                  Movies
                </Link>
                <Link href="/tv-shows" className="text-white hover:text-red-400 transition-colors font-medium">
                  TV Shows
                </Link>
                <Link href="/categories?category=top-rated" className="text-white hover:text-red-400 transition-colors font-medium flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  Top Rated
                </Link>
              </nav>
              
              <div className="flex items-start gap-2">
                <div className="text-white">
                  <ThemeToggle />
                </div>
                {user ? (
                  <div className="relative group">
                    <button className="text-foreground hover:text-red-500 transition-colors">
                      <User className="w-5 h-5" />
                    </button>
                    <div className="absolute top-full right-0 w-48 bg-background border border-border rounded-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="px-3 py-2 text-sm text-muted-foreground border-b border-border">
                        {user.email}
                      </div>
                      <Link href="/watchlist" className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors flex items-center">
                        Watchlist
                      </Link>
                      <Link href="/favorites" className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors flex items-center">
                        Favorites
                      </Link>
                      <button onClick={handleSignOut} className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors flex items-center">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-medium transition-colors text-sm"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="absolute left-1/2 -translate-x-1/2 w-full px-4 sm:px-6 lg:px-8 z-40" style={{top: '196px'}}>
          <div ref={searchRef} className="relative max-w-5xl mx-auto">
            <form onSubmit={handleSearch}>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search movies, TV shows..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={handleSearchFocus}
                  className="flex-1 bg-background border border-border rounded-full px-6 sm:px-8 md:px-10 py-3.5 sm:py-4 md:py-5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500 shadow-lg text-base sm:text-lg"
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full text-white font-medium transition-colors shadow-lg flex items-center justify-center flex-shrink-0"
                >
                  <Search className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>
              </div>
            </form>

            {(showSuggestions && searchResults.length > 0) || (showHistory && searchHistory.length > 0) ? (
              <div className="absolute top-full left-0 right-20 mt-2 bg-background border border-border rounded-lg shadow-xl z-50">
                {showSuggestions && searchQuery.length > 0 && (
                  <div className="border-b border-border">
                    <button
                      onClick={() => {
                        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                        setSearchQuery('');
                        setShowSuggestions(false);
                        setShowHistory(false);
                      }}
                      className="w-full p-3 text-center text-red-500 hover:bg-muted transition-colors text-sm font-medium"
                    >
                      View All Results
                    </button>
                  </div>
                )}
                
                <div className="max-h-80 overflow-y-auto">
                  {showHistory && searchHistory.length > 0 && (
                    <>
                      <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border">Recent Searches</div>
                      {searchHistory.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => selectHistoryItem(item)}
                          className="flex items-center p-2 hover:bg-muted cursor-pointer border-b border-border last:border-b-0 group"
                        >
                          <img
                            src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : '/placeholder.png'}
                            alt={item.title}
                            className="w-8 h-12 object-cover rounded mr-2"
                          />
                          <div className="flex-1">
                            <h4 className="text-foreground font-medium text-xs">{item.title}</h4>
                            <p className="text-muted-foreground text-xs">
                              {item.media_type === 'movie' ? 'Movie' : 'TV Show'} • {item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'}
                            </p>
                          </div>
                          <button
                            onClick={(e) => removeHistoryItem(item.id, e)}
                            className="p-1 hover:bg-muted rounded transition-all"
                          >
                            <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                  
                  {showSuggestions && searchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => selectSuggestion(item)}
                      className="flex items-center p-3 hover:bg-muted cursor-pointer border-b border-border"
                    >
                      <img
                        src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : '/placeholder.png'}
                        alt={item.title || item.name}
                        className="w-12 h-16 object-cover rounded mr-3"
                      />
                      <div className="flex-1">
                        <h4 className="text-foreground font-medium text-sm">
                          {item.title || item.name}
                        </h4>
                        <p className="text-muted-foreground text-xs">
                          {item.media_type === 'movie' ? 'Movie' : 'TV Show'} • {item.release_date || item.first_air_date ? new Date(item.release_date || item.first_air_date).getFullYear() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
}
