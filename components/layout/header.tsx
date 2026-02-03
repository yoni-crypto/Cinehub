"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-provider';
import { AuthModal } from '@/components/auth/auth-modal';
import { tmdbApi } from '@/lib/api/tmdb';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      setIsMobileMenuOpen(false);
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
    setIsMobileMenuOpen(false);
  };

  const selectHistoryItem = (item: any) => {
    const type = item.media_type === 'movie' ? 'movies' : 'tv-shows';
    router.push(`/${type}/${item.id}`);
    setSearchQuery('');
    setShowSuggestions(false);
    setShowHistory(false);
    setIsMobileMenuOpen(false);
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

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-900">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <img src="/logo_wn.png" alt="CineHub" className="h-20 sm:h-24 lg:h-28 w-auto" />
          </Link>

          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link href="/" className="text-white hover:text-red-500 transition-colors font-medium">
              Home
            </Link>
            
            <div className="relative">
              <Link href="/categories" className="text-white hover:text-red-500 transition-colors font-medium">
                Movies
              </Link>
            </div>
            
            <div className="relative">
              <Link href="/tv-shows" className="text-white hover:text-red-500 transition-colors font-medium">
                TV Shows
              </Link>
            </div>
            
            <div className="relative group">
              <span className="text-white hover:text-red-500 transition-colors font-medium cursor-pointer">
                Genre
              </span>
              <div className="absolute top-full left-0 w-64 bg-black border border-gray-800 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="grid grid-cols-2 gap-0">
                  <Link href="/categories?genre=action" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">Action</Link>
                  <Link href="/categories?genre=comedy" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">Comedy</Link>
                  <Link href="/categories?genre=drama" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">Drama</Link>
                  <Link href="/categories?genre=horror" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">Horror</Link>
                  <Link href="/categories?genre=thriller" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">Thriller</Link>
                  <Link href="/categories?genre=romance" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">Romance</Link>
                  <Link href="/categories?genre=sci-fi" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">Sci-Fi</Link>
                  <Link href="/categories?genre=fantasy" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">Fantasy</Link>
                  <Link href="/categories?genre=animation" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">Animation</Link>
                  <Link href="/categories?genre=crime" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">Crime</Link>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <span className="text-white hover:text-red-500 transition-colors font-medium cursor-pointer">
                Country
              </span>
              <div className="absolute top-full left-0 w-64 bg-black border border-gray-800 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="grid grid-cols-2 gap-0">
                  <Link href="/categories?country=us" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">USA</Link>
                  <Link href="/categories?country=uk" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">UK</Link>
                  <Link href="/categories?country=ca" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">Canada</Link>
                  <Link href="/categories?country=fr" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">France</Link>
                  <Link href="/categories?country=jp" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">Japan</Link>
                  <Link href="/categories?country=kr" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">Korea</Link>
                  <Link href="/categories?country=de" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">Germany</Link>
                  <Link href="/categories?country=in" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">India</Link>
                  <Link href="/categories?country=es" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">Spain</Link>
                  <Link href="/categories?country=it" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">Italy</Link>
                </div>
              </div>
            </div>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  placeholder="Search movies, shows..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={handleSearchFocus}
                  className="bg-gray-900 border border-gray-700 rounded-l px-4 py-2.5 text-white placeholder-gray-400 w-80 focus:outline-none focus:border-red-500 h-10"
                />
                <button type="submit" className="bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-r transition-colors h-10">
                  <Search className="w-5 h-5 text-white" />
                </button>
              </form>
              
              {(showSuggestions && searchResults.length > 0) || (showHistory && searchHistory.length > 0) ? (
                <div className="absolute top-full left-0 right-0 bg-black border border-gray-800 rounded-b-lg shadow-xl z-50">
                  {showSuggestions && searchQuery.length > 0 && (
                    <div className="border-b border-gray-800">
                      <button
                        onClick={() => {
                          router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                          setSearchQuery('');
                          setShowSuggestions(false);
                          setShowHistory(false);
                        }}
                        className="w-full p-3 text-center text-red-500 hover:bg-gray-800 transition-colors text-sm font-medium"
                      >
                        View All Results
                      </button>
                    </div>
                  )}
                  
                  <div className="max-h-80 overflow-y-auto">
                    {showHistory && searchHistory.length > 0 && (
                      <>
                        <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-800">Recent Searches</div>
                        {searchHistory.map((item, index) => (
                          <div
                            key={index}
                            onClick={() => selectHistoryItem(item)}
                            className="flex items-center p-2 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-b-0 group"
                          >
                            <img
                              src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : '/placeholder.png'}
                              alt={item.title}
                              className="w-8 h-12 object-cover rounded mr-2"
                            />
                            <div className="flex-1">
                              <h4 className="text-white font-medium text-xs">{item.title}</h4>
                              <p className="text-gray-400 text-xs">
                                {item.media_type === 'movie' ? 'Movie' : 'TV Show'} • {item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'}
                              </p>
                            </div>
                            <button
                              onClick={(e) => removeHistoryItem(item.id, e)}
                              className="p-1 hover:bg-gray-700 rounded transition-all"
                            >
                              <X className="w-3 h-3 text-gray-400 hover:text-white" />
                            </button>
                          </div>
                        ))}
                      </>
                    )}
                    
                    {showSuggestions && searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => selectSuggestion(item)}
                        className="flex items-center p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800"
                      >
                        <img
                          src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : '/placeholder.png'}
                          alt={item.title || item.name}
                          className="w-12 h-16 object-cover rounded mr-3"
                        />
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-sm">
                            {item.title || item.name}
                          </h4>
                          <p className="text-gray-400 text-xs">
                            {item.media_type === 'movie' ? 'Movie' : `TV Show${item.number_of_seasons ? ` • ${item.number_of_seasons} Season${item.number_of_seasons > 1 ? 's' : ''}` : ''}`} • {item.release_date || item.first_air_date ? new Date(item.release_date || item.first_air_date).getFullYear() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="hidden sm:block">
              {user ? (
                <div className="relative group">
                  <button className="text-white hover:text-red-500 transition-colors">
                    <User className="w-5 h-5" />
                  </button>
                  <div className="absolute top-full right-0 w-48 bg-black border border-gray-800 rounded-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-3 py-2 text-sm text-gray-300 border-b border-gray-800">
                      {user.email}
                    </div>
                    <Link href="/watchlist" className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors flex items-center">
                      Watchlist
                    </Link>
                    <Link href="/favorites" className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors flex items-center">
                      Favorites
                    </Link>
                    <button onClick={handleSignOut} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors flex items-center">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-medium transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-800">
              <form onSubmit={handleSearch} className="flex items-center space-x-2 mb-4 relative">
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={handleSearchFocus}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                />
                <button type="submit" className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded transition-colors">
                  <Search className="w-4 h-4 text-white" />
                </button>
                
                {(showSuggestions && searchResults.length > 0) || (showHistory && searchHistory.length > 0) ? (
                  <div className="absolute top-full left-0 right-0 bg-black border border-gray-800 rounded shadow-xl z-50 max-h-64 overflow-y-auto">
                    {showHistory && searchHistory.length > 0 && (
                      <>
                        <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-800">Recent Searches</div>
                        {searchHistory.map((item, index) => (
                          <div
                            key={index}
                            onClick={() => selectHistoryItem(item)}
                            className="flex items-center p-2 hover:bg-gray-800 cursor-pointer border-b border-gray-800 group"
                          >
                            <img
                              src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : '/placeholder.png'}
                              alt={item.title}
                              className="w-6 h-9 object-cover rounded mr-2"
                            />
                            <div className="flex-1">
                              <h4 className="text-white font-medium text-xs">{item.title}</h4>
                              <p className="text-gray-400 text-xs">
                                {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
                              </p>
                            </div>
                            <button
                              onClick={(e) => removeHistoryItem(item.id, e)}
                              className="p-1 hover:bg-gray-700 rounded transition-all"
                            >
                              <X className="w-3 h-3 text-gray-400 hover:text-white" />
                            </button>
                          </div>
                        ))}
                      </>
                    )}
                    
                    {showSuggestions && searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => selectSuggestion(item)}
                        className="flex items-center p-2 hover:bg-gray-800 cursor-pointer border-b border-gray-800"
                      >
                        <img
                          src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : '/placeholder.png'}
                          alt={item.title || item.name}
                          className="w-8 h-12 object-cover rounded mr-2"
                        />
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-xs">
                            {item.title || item.name}
                          </h4>
                          <p className="text-gray-400 text-xs">
                            {item.media_type === 'movie' ? 'Movie' : `TV Show${item.number_of_seasons ? ` • ${item.number_of_seasons}S` : ''}`}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {showSuggestions && searchQuery.length > 0 && (
                      <div className="border-t border-gray-800">
                        <button
                          onClick={() => {
                            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                            setSearchQuery('');
                            setShowSuggestions(false);
                            setShowHistory(false);
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full p-2 text-center text-red-500 hover:bg-gray-800 transition-colors text-xs font-medium"
                        >
                          View All Results
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </form>

              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link
                href="/categories"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                onClick={closeMobileMenu}
              >
                Movies
              </Link>
              <Link
                href="/tv-shows"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                onClick={closeMobileMenu}
              >
                TV Shows
              </Link>
              {user && (
                <>
                  <Link
                    href="/watchlist"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Watchlist
                  </Link>
                  <Link
                    href="/favorites"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Favorites
                  </Link>
                  <div className="border-t border-gray-800 pt-2">
                    <div className="px-3 py-2 text-sm text-gray-400">
                      {user.email}
                    </div>
                    <button
                      onClick={() => {
                        handleSignOut();
                        closeMobileMenu();
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Log out
                    </button>
                  </div>
                </>
              )}
              {!user && (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    closeMobileMenu();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </header>
  );
}