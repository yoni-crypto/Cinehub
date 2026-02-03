'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Play, ChevronRight, Home, X, Lightbulb, MessageCircle } from 'lucide-react';
import { tmdbApi } from '@/lib/api/tmdb';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MovieGrid } from '@/components/movie/movie-grid';
import { WatchlistButton } from '@/components/movie/watchlist-button';
import { FavoritesButton } from '@/components/movie/favorites-button';
import { AdBlockDetector } from '@/components/ad-block-detector';
import { LoadingScreen } from '@/components/loading-screen';
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
  const [autoChecking, setAutoChecking] = useState(false);
  const [lightsOff, setLightsOff] = useState(false);
  const [movie, setMovie] = useState<any>(null);
  const [credits, setCredits] = useState<any>({ cast: [] });
  const [similarMovies, setSimilarMovies] = useState<any>({ results: [] });
  const [loading, setLoading] = useState(true);
  const [checkingSource, setCheckingSource] = useState(false);

  // Auto-check other servers if first one fails or times out
  const handleIframeError = () => {
    if (userSelectedServer || selectedServer !== 0) return;
    
    setAutoChecking(true);
    fetch(`/api/streaming/check?movieId=${movieId}`)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.workingIndex === 'number' && data.workingIndex !== 0) {
          setSelectedServer(data.workingIndex);
        }
      })
      .catch(() => setSelectedServer(1))
      .finally(() => setAutoChecking(false));
  };

  // Auto-check after 10 seconds if user hasn't manually selected a server
  useEffect(() => {
    if (!isPlayerOpen || userSelectedServer) return;
    
    const timer = setTimeout(() => {
      if (selectedServer === 0 && !userSelectedServer) {
        handleIframeError();
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [isPlayerOpen, selectedServer, userSelectedServer]);

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
      } catch (error) {
        console.error('Error loading movie:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [movieId]);

  if (loading || !movie) {
    return <LoadingScreen message="Loading movie…" />;
  }

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  const rating = Math.round(movie.vote_average * 10) / 10;
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '';

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="pt-16">
        {/* Big Banner Section */}
        <div className="relative">
          {!isPlayerOpen ? (
            <div className="relative h-[600px] overflow-hidden">
              <Image
                src={tmdbApi.getBackdropUrl(movie.backdrop_path, 'w1280')}
                alt={movie.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
              
              {/* Breadcrumb on Banner */}
              <div className="absolute top-4 left-0 right-0 z-10">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center text-sm text-gray-300">
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
              
              {/* Play Button on Banner */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button 
                  onClick={() => setIsPlayerOpen(true)}
                  className="bg-red-600/90 hover:bg-red-600 text-white rounded-full p-8 shadow-2xl transition-all duration-300 hover:scale-110 border-0"
                >
                  <Play className="w-20 h-20" fill="white" />
                </button>
              </div>
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

              {/* Player — full brightness when lights off */}
              <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="rounded-md overflow-hidden border border-[#2a2a2a] bg-[#0d0d0d]">
                  <div className="flex items-center justify-end gap-1 px-2 py-1.5 border-b border-[#1a1a1a]">
                    {lightsOff && (
                      <button
                        type="button"
                        onClick={() => setLightsOff(false)}
                        className="text-amber-500/90 hover:text-amber-400 text-xs flex items-center gap-1"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        Lights on
                      </button>
                    )}
                    <button
                      onClick={() => setIsPlayerOpen(false)}
                      className="p-1.5 text-gray-500 hover:text-white rounded transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-1.5">
                    <div className="relative w-full aspect-video bg-black">
                      <iframe
                        key={`embed-${selectedServer}`}
                        src={buildEmbedUrl(movieId, selectedServer)}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        frameBorder="0"
                        title={movie.title}
                        onError={handleIframeError}
                      />
                      {autoChecking && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          Checking other servers...
                        </div>
                      )}
                    </div>
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
        <div className="relative -mt-32 z-10">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end gap-8 mb-8">
              {/* Movie Poster */}
              <div className="w-64 aspect-[2/3] relative rounded-lg overflow-hidden shadow-xl flex-shrink-0">
                <Image
                  src={tmdbApi.getImageUrl(movie.poster_path, 'w500')}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Movie Info */}
              <div className="flex-1 text-white pb-8">
                <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
                
                <div className="flex items-center gap-4 mb-4">
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

                <p className="text-gray-300 text-base mb-6 max-w-2xl">
                  {movie.overview}
                </p>

                {/* Watch Buttons */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsPlayerOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded font-semibold flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" fill="white" />
                    Watch Now
                  </button>
                  
                  <WatchlistButton 
                    movieId={movieId}
                    movieTitle={movie.title}
                    moviePoster={movie.poster_path || ''}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded font-semibold flex items-center gap-2"
                  />
                  <span className="ml-2">Watchlist</span>
                </div>
              </div>
            </div>
          </div>
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
                    <h2 className="text-xl font-bold text-white mb-3">Choose Server</h2>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => {
                          setSelectedServer(1);
                          setIsPlayerOpen(true);
                        }}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm font-medium"
                      >
                        Server 1
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedServer(2);
                          setIsPlayerOpen(true);
                        }}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm font-medium"
                      >
                        Server 2
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedServer(3);
                          setIsPlayerOpen(true);
                        }}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm font-medium"
                      >
                        Server 3
                      </button>
                    </div>
                  </div>
                )}

                {/* Cast */}
                {credits.cast.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Cast</h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {credits.cast.slice(0, 15).map((actor: any) => (
                        <div key={actor.id} className="flex-shrink-0 w-32">
                          <div className="w-32 h-32 relative rounded-full overflow-hidden mb-3 bg-gray-800">
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
                          <p className="text-white text-sm font-medium text-center truncate">{actor.name}</p>
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
              <div className="mt-12">
                <h2 className="text-3xl font-bold text-white mb-8">You May Also Like</h2>
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