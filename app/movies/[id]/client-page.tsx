'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Play, ChevronRight, Home, X, Lightbulb, MessageCircle, ExternalLink } from 'lucide-react';
import { tmdbApi } from '@/lib/api/tmdb';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MovieGrid } from '@/components/movie/movie-grid';
import { WatchlistButton } from '@/components/movie/watchlist-button';
import { FavoritesButton } from '@/components/movie/favorites-button';
import { AdBlockDetector } from '@/components/ad-block-detector';
import ShareButton from '@/components/share-button';
import { LoadingScreen } from '@/components/loading-screen';
import { StreamingPlayer } from '@/components/streaming-player';
import { continueWatching } from '@/lib/continue-watching';
import React, { useState, useEffect } from 'react';

interface ClientPageProps {
  movieId: number;
}

// Order must match app/api/streaming/check/route.ts — XYZ first (auto sound), then fallbacks
const STREAMING_SOURCES: Array<{ name: string; buildUrl: (movieId: number) => string }> = [
  { name: 'VidSrc XYZ', buildUrl: (id) => `https://vidsrc.xyz/embed/movie/${id}?autoplay=1` },
  { name: 'VidSrc', buildUrl: (id) => `https://vidsrc.cc/v2/embed/movie/${id}?autoplay=1` },
  { name: 'Embedder', buildUrl: (id) => `https://embedder.net/e/movie?tmdb=${id}&autoplay=1` },
  { name: 'VidSrc.me', buildUrl: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}&autoplay=1` },
  { name: 'VidSrc.to', buildUrl: (id) => `https://vidsrc.to/embed/movie/${id}?autoplay=1` },
];

function buildEmbedUrl(movieId: number, serverIndex: number): string {
  const source = STREAMING_SOURCES[Math.min(serverIndex, STREAMING_SOURCES.length - 1)] ?? STREAMING_SOURCES[0];
  return source.buildUrl(movieId);
}

export default function ClientPage({ movieId }: ClientPageProps) {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState(0);
  const [userSelectedServer, setUserSelectedServer] = useState(false);
  const [lightsOff, setLightsOff] = useState(false);
  const [movie, setMovie] = useState<any>(null);
  const [credits, setCredits] = useState<any>({ cast: [] });
  const [similarMovies, setSimilarMovies] = useState<any>({ results: [] });
  const [loading, setLoading] = useState(true);
  const playerOpenedAt = React.useRef<number>(0);
  const pageLoadTime = React.useRef<number>(Date.now());
  const watchingInterval = React.useRef<NodeJS.Timeout | null>(null);
  const clickCount = React.useRef<{ [key: string]: { count: number; lastClick: number } }>({});
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Record when player opens so we can ignore ghost taps on close button (mobile)
  useEffect(() => {
    if (isPlayerOpen) {
      playerOpenedAt.current = Date.now();
      // Start watch time tracking
      watchingInterval.current = setInterval(() => {
        if (typeof window !== 'undefined' && (window as any).umami) {
          (window as any).umami.track('watching', {
            type: 'movie',
            movieId: movieId,
            server: STREAMING_SOURCES[selectedServer]?.name || 'Unknown'
          });
        }
      }, 60000); // Every 60 seconds
    } else {
      // Clear watch time tracking
      if (watchingInterval.current) {
        clearInterval(watchingInterval.current);
        watchingInterval.current = null;
      }
    }
    
    return () => {
      if (watchingInterval.current) {
        clearInterval(watchingInterval.current);
      }
    };
  }, [isPlayerOpen, selectedServer, movieId]);

  useEffect(() => {
    // Check URL params for auto-play
    const urlParams = new URLSearchParams(window.location.search);
    const autoplay = urlParams.get('autoplay') === 'true';
    
    if (autoplay) {
      setShouldAutoPlay(true);
      setIsAutoPlaying(true);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [movieData, creditsData, similarData] = await Promise.all([
          tmdbApi.getMovieDetails(movieId),
          tmdbApi.getMovieCredits(movieId),
          tmdbApi.getSimilarMovies(movieId, 1).catch(() => ({ results: [] }))
        ]);
        setMovie(movieData);
        setCredits(creditsData);
        setSimilarMovies(similarData);
        
        // Track page load
        if (typeof window !== 'undefined' && (window as any).umami) {
          (window as any).umami.track('page_load', {
            type: 'movie',
            movieId: movieId,
            title: movieData.title
          });
        }
      } catch (error) {
        console.error('Error loading movie:', error);
        // Don't call notFound() immediately, give it a moment
        setTimeout(() => {
          notFound();
        }, 100);
      } finally {
        setLoading(false);
      }
    };
    
    if (movieId) {
      loadData();
    }
  }, [movieId]);

  // Auto-play when data is loaded
  useEffect(() => {
    if (shouldAutoPlay && movie && !isPlayerOpen) {
      setTimeout(() => {
        setIsPlayerOpen(true);
        
        // Add to continue watching
        continueWatching.add({
          id: movieId.toString(),
          type: 'movie',
          title: movie.title,
          poster: movie.poster_path || ''
        });
        
        setShouldAutoPlay(false);
        setIsAutoPlaying(false);
      }, 1000);
    }
  }, [shouldAutoPlay, movie, isPlayerOpen]);

  if (loading || !movie || isAutoPlaying) {
    return <LoadingScreen message={isAutoPlaying ? "Starting playback..." : "Loading movie…"} />;
  }

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  const rating = Math.round(movie.vote_average * 10) / 10;
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '';

  // Track rage clicks
  const trackClick = (target: string) => {
    const now = Date.now();
    const key = `${target}_${movieId}`;
    
    if (!clickCount.current[key]) {
      clickCount.current[key] = { count: 1, lastClick: now };
    } else {
      const timeDiff = now - clickCount.current[key].lastClick;
      if (timeDiff < 5000) { // Within 5 seconds
        clickCount.current[key].count++;
        if (clickCount.current[key].count >= 3) {
          // Rage click detected
          if (typeof window !== 'undefined' && (window as any).umami) {
            (window as any).umami.track('rage_click', {
              target: target,
              movieId: movieId,
              clicks: clickCount.current[key].count
            });
          }
          clickCount.current[key].count = 0; // Reset
        }
      } else {
        clickCount.current[key] = { count: 1, lastClick: now };
      }
    }
    clickCount.current[key].lastClick = now;
  };



  // Handle play button clicks - just open the player, no new tabs
  const handlePlayClick = (serverIndex?: number) => {
    const idx = serverIndex ?? selectedServer;
    if (typeof serverIndex === 'number') {
      setSelectedServer(serverIndex);
      setUserSelectedServer(true);
    }
    setIsPlayerOpen(true);
    
    // Track play event with time-to-play
    const timeToPlay = Date.now() - pageLoadTime.current;
    if (typeof window !== 'undefined' && (window as any).umami) {
      (window as any).umami.track('play', {
        movie: movie.title,
        server: STREAMING_SOURCES[idx]?.name || 'Unknown',
        movieId: movieId,
        timeToPlay: timeToPlay
      });
    }
    
    trackClick('play');
    
    // Add to continue watching
    if (movie) {
      continueWatching.add({
        id: movieId.toString(),
        type: 'movie',
        title: movie.title,
        poster: movie.poster_path || ''
      });
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="pt-16 relative">
        {/* Big Banner Section */}
        <div className="relative">
          {!isPlayerOpen ? (
            <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden z-0">
              <Image
                src={tmdbApi.getBackdropUrl(movie.backdrop_path, 'w1280')}
                alt={movie.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
              
              {/* Breadcrumb on Banner — z-30 so it stays clickable above play area */}
              <div className="absolute top-4 left-0 right-0 z-30">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center text-xs sm:text-sm text-gray-300">
                    <Link href="/" className="hover:text-white flex items-center transition-colors">
                      <Home className="w-4 h-4 mr-1" />
                      Home
                    </Link>
                    <ChevronRight className="w-4 h-4 mx-2" />
                    <Link href="/categories" className="hover:text-white transition-colors">Movies</Link>
                    <ChevronRight className="w-4 h-4 mx-2" />
                    <span className="text-white">{movie.title}</span>
                  </div>
                </div>
              </div>
              
              {/* Play button is in overlay below (z-20) so it sits above overlapping section on mobile */}
            </div>
          ) : (
            /* HDToday-style streaming layout — lights off = only player bright, rest dimmed */
            <div className="relative w-full">
              {/* Everything above player: dim when lights off */}
              <div className={lightsOff ? 'brightness-[0.2] pointer-events-none transition-all duration-300' : 'transition-all duration-300'}>
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                  <div className="flex items-center text-sm text-gray-400">
                    <Link href="/" className="hover:text-white flex items-center transition-colors">
                      <Home className="w-4 h-4 mr-1" />
                      Home
                    </Link>
                    <ChevronRight className="w-4 h-4 mx-2 text-gray-600" />
                    <Link href="/categories" className="hover:text-white transition-colors">Movies</Link>
                    <ChevronRight className="w-4 h-4 mx-2 text-gray-600" />
                    <span className="text-white">{movie.title}</span>
                  </div>
                </div>
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-2">
                  <AdBlockDetector />
                  <p className="text-gray-500 text-xs">
                    Stuck? Turn off adblock or pick another source.
                  </p>
                </div>
              </div>

              {/* Player — stream opens in new tab so providers see a real tab (not iframe) */}
              <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="rounded-md overflow-hidden border border-[#2a2a2a] bg-[#0d0d0d]">
                  <div className="flex items-center justify-between gap-2 px-2 py-1.5 border-b border-[#1a1a1a]">
                    <a
                      href={buildEmbedUrl(movieId, selectedServer)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 px-2 py-1.5 rounded transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open in new tab
                    </a>
                    <div className="flex items-center gap-1">
                      {lightsOff && (
                        <button
                          type="button"
                          onClick={() => setLightsOff(false)}
                          className="text-amber-500/90 hover:text-amber-400 text-xs flex items-center gap-1 px-2 py-1.5"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          Lights on
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (Date.now() - playerOpenedAt.current < 400) return;
                          setIsPlayerOpen(false);
                        }}
                        className="p-1.5 text-gray-500 hover:text-white rounded transition-colors"
                        aria-label="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-1.5">
                    <StreamingPlayer 
                      url={buildEmbedUrl(movieId, selectedServer)}
                      title={movie.title}
                    />
                  </div>
                </div>
              </div>

              {/* Below player: dim when lights off */}
              <div className={lightsOff ? 'brightness-[0.2] pointer-events-none transition-all duration-300' : 'transition-all duration-300'}>
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-gray-500 text-sm">
                    <FavoritesButton
                      movieId={movieId}
                      movieTitle={movie.title}
                      moviePoster={movie.poster_path || ''}
                      iconType="plus"
                      label="Add to favorite"
                      size="sm"
                      variant="ghost"
                      className="hover:text-white text-gray-500 hover:bg-transparent p-0 h-auto font-normal"
                    />
                    <button
                      type="button"
                      onClick={() => setLightsOff(!lightsOff)}
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <Lightbulb className={`w-3.5 h-3.5 ${lightsOff ? 'text-amber-500/90' : ''}`} />
                      {lightsOff ? 'Lights on' : 'Lights off'}
                    </button>
                    <a href="#comments" className="flex items-center gap-1.5 hover:text-white transition-colors">
                      <MessageCircle className="w-3.5 h-3.5" />
                      Comments
                    </a>
                  </div>
                  <p className="text-center text-gray-500 text-sm mt-6 mb-2">
                    If current server doesn&apos;t work, try another below.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {STREAMING_SOURCES.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedServer(idx);
                          setUserSelectedServer(true);
                          // Track server change
                          if (typeof window !== 'undefined' && (window as any).umami) {
                            (window as any).umami.track('server_change', {
                              movie: movie.title,
                              server: STREAMING_SOURCES[idx]?.name || 'Unknown',
                              movieId: movieId
                            });
                          }
                        }}
                        className={`flex flex-col items-center min-w-[100px] px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                          selectedServer === idx
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white hover:bg-gray-800/50'
                        }`}
                      >
                        <span className="text-[10px] uppercase tracking-wide opacity-80">Server</span>
                        <span className="flex items-center gap-1.5 font-medium mt-0.5">
                          <Play className="w-3.5 h-3.5" fill="currentColor" />
                          {STREAMING_SOURCES[idx].name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                  <div className="border-l-2 border-gray-800 pl-5 sm:pl-6">
                    <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
                      <div className="w-40 sm:w-48 aspect-[2/3] relative rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={tmdbApi.getImageUrl(movie.poster_path, 'w500')}
                          alt={movie.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">{movie.title}</h1>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' trailer')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-gray-600 text-gray-300 hover:border-red-500/60 hover:text-red-400 text-sm transition-colors"
                          >
                            Trailer
                          </a>
                          <span className="px-2.5 py-1 rounded border border-gray-600 text-xs font-medium text-green-400/90">HD</span>
                          <span className="px-2.5 py-1 rounded border border-gray-600 text-sm text-gray-300">
                            IMDB <span className="text-amber-400/90 font-medium">{rating}</span>
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-xl">
                          {movie.overview}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                          <div><span className="text-gray-500">Released</span> <span className="text-gray-300">{movie.release_date || '—'}</span></div>
                          <div><span className="text-gray-500">Duration</span> <span className="text-gray-300">{runtime || '—'}</span></div>
                          <div><span className="text-gray-500">Genre</span> <span className="text-gray-300">{movie.genres?.map((g: { name: string }) => g.name).join(', ') || '—'}</span></div>
                          <div><span className="text-gray-500">Country</span> <span className="text-gray-300">{movie.production_countries?.[0]?.name || '—'}</span></div>
                          <div className="sm:col-span-2"><span className="text-gray-500">Casts</span> <span className="text-gray-300">{credits.cast?.slice(0, 5).map((c: { name: string }) => c.name).join(', ') || '—'}</span></div>
                          {movie.production_companies?.length > 0 && (
                            <div className="sm:col-span-2"><span className="text-gray-500">Production</span> <span className="text-gray-300">{movie.production_companies.slice(0, 3).map((p: { name: string }) => p.name).join(', ')}</span></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {lightsOff && (
                <button
                  type="button"
                  onClick={() => setLightsOff(false)}
                  className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
                >
                  Turn on light
                </button>
              )}
            </div>
          )}
        </div>

        {/* Movie Details Overlapping Section (hidden when streaming—details shown in streaming layout) */}
        {!isPlayerOpen && (
        <div className="relative -mt-16 sm:-mt-24 lg:-mt-32 z-10">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6 lg:gap-8 mb-8">
              {/* Movie Poster - Hidden on mobile */}
              <div className="hidden sm:block w-56 lg:w-64 aspect-[2/3] relative rounded-lg overflow-hidden shadow-xl flex-shrink-0">
                <Image
                  src={tmdbApi.getImageUrl(movie.poster_path, 'w500')}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Movie Info */}
              <div className="flex-1 text-white pb-4 sm:pb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">{movie.title}</h1>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-yellow-500 text-black px-2 py-1 rounded text-sm font-bold">
                    ⭐ {rating}
                  </span>
                  <span className="text-gray-300">{releaseYear}</span>
                  <span className="text-gray-300">{runtime}</span>
                  <span className="bg-green-600 px-2 py-1 rounded text-xs font-bold">HD</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.genres.map((genre: any) => (
                    <span key={genre.id} className="bg-gray-800 px-3 py-1 rounded text-sm">
                      {genre.name}
                    </span>
                  ))}
                </div>

                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  {movie.overview}
                </p>

                {/* Watch Buttons */}
                <div className="flex gap-3 mb-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePlayClick();
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-semibold flex items-center gap-2 touch-manipulation"
                  >
                    <Play className="w-4 h-4" fill="white" />
                    Watch Now
                  </button>
                  
                  <WatchlistButton 
                    movieId={movieId}
                    movieTitle={movie.title}
                    moviePoster={movie.poster_path || ''}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded font-semibold flex items-center gap-2"
                  />
                  
                  <ShareButton title={movie.title} />
                </div>
                
                <p className="text-gray-400 text-xs">
                  Free streaming? Tell your friends about it
                </p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Play overlay — above overlapping section (z-10) so tap opens player on mobile */}
        {!isPlayerOpen && (
          <div
            className="absolute top-0 left-0 right-0 h-[400px] sm:h-[500px] lg:h-[600px] z-20 pointer-events-none flex items-center justify-center"
            aria-hidden
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePlayClick();
              }}
              className="pointer-events-auto bg-red-600/90 hover:bg-red-600 active:scale-95 text-white rounded-full p-4 sm:p-6 lg:p-8 shadow-2xl transition-all duration-300 hover:scale-110 border-0 touch-manipulation min-w-[44px] min-h-[44px]"
              aria-label="Play movie"
            >
              <Play className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20" fill="white" />
            </button>
          </div>
        )}

        {/* Content Section */}
        <div className="bg-black relative z-0">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="">
              {/* Main Content */}
              <div className="">
                {/* Server Selection */}
                {!isPlayerOpen && (
                  <div className="mb-8">
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Choose Server</h2>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      {STREAMING_SOURCES.map((source, idx) => (
                        <button
                          key={idx}
                        onClick={() => {
                          handlePlayClick(idx);
                          // Track server selection from main buttons
                          if (typeof window !== 'undefined' && (window as any).umami) {
                            (window as any).umami.track('server_select', {
                              movie: movie.title,
                              server: source.name,
                              movieId: movieId
                            });
                          }
                        }}
                        className="flex flex-col items-center min-w-[100px] px-4 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white hover:bg-gray-800/50 text-sm transition-colors"
                        >
                          <span className="text-[10px] uppercase tracking-wide opacity-80">Server</span>
                          <span className="flex items-center gap-1.5 font-medium mt-0.5">
                            <Play className="w-3.5 h-3.5" fill="currentColor" />
                            {source.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cast */}
                {credits.cast.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Cast</h2>
                    <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {credits.cast.slice(0, 15).map((actor: any) => (
                        <div key={actor.id} className="flex-shrink-0 w-24 sm:w-28 lg:w-32">
                          <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 relative rounded-full overflow-hidden mb-2 sm:mb-3 bg-gray-800">
                            <Image
                              src={actor.profile_path 
                                ? tmdbApi.getImageUrl(actor.profile_path, 'w185')
                                : '/placeholder.png'
                              }
                              alt={actor.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <p className="text-white text-xs sm:text-sm font-medium text-center truncate">{actor.name}</p>
                          <p className="text-gray-400 text-xs text-center truncate">{actor.character}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <section id="comments" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-semibold text-white mb-3">Comments</h2>
                  <div className="rounded-lg border border-gray-800 bg-gray-900/30 px-4 py-6 text-center text-gray-500 text-sm">
                    Sign in to join the conversation.
                  </div>
                </section>
              </div>
            </div>

            {/* Related Movies */}
            {similarMovies.results.length > 0 && (
              <div className="mt-8 sm:mt-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">You May Also Like</h2>
                <MovieGrid 
                  movies={similarMovies.results.slice(0, 12)} 
                  showYear={true}
                  showRating={true}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}