'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Play, ChevronRight, Home, X, Lightbulb, MessageCircle, ExternalLink } from 'lucide-react';
import { tmdbApi } from '@/lib/api/tmdb';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { TVShowGrid } from '@/components/tv-shows/tv-show-grid';
import { WatchlistButton } from '@/components/movie/watchlist-button';
import { FavoritesButton } from '@/components/movie/favorites-button';
import { AdBlockDetector } from '@/components/ad-block-detector';
import { LoadingScreen } from '@/components/loading-screen';
import { StreamingPlayer } from '@/components/streaming-player';
import React, { useState, useEffect, useRef } from 'react';

interface TVShowClientPageProps {
  tvShowId: number;
}

// TV show streaming sources
const TV_STREAMING_SOURCES: Array<{ name: string; buildUrl: (tvShowId: number, season: number, episode: number) => string }> = [
  { name: 'VidSrc XYZ', buildUrl: (id, s, e) => `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}?autoplay=1` },
  { name: 'VidSrc', buildUrl: (id, s, e) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}?autoplay=1` },
  { name: 'Embedder', buildUrl: (id, s, e) => `https://embedder.net/e/tv?tmdb=${id}&season=${s}&episode=${e}&autoplay=1` },
  { name: 'VidSrc.me', buildUrl: (id, s, e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}&autoplay=1` },
  { name: 'VidSrc.to', buildUrl: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}?autoplay=1` },
];

function buildTVEmbedUrl(tvShowId: number, season: number, episode: number, serverIndex: number): string {
  const source = TV_STREAMING_SOURCES[Math.min(serverIndex, TV_STREAMING_SOURCES.length - 1)] ?? TV_STREAMING_SOURCES[0];
  return source.buildUrl(tvShowId, season, episode);
}

export default function TVShowClientPage({ tvShowId }: TVShowClientPageProps) {
  const seasonSelectorRef = useRef<HTMLDivElement>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState(0);
  const [userSelectedServer, setUserSelectedServer] = useState(false);
  const [lightsOff, setLightsOff] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [tvShow, setTvShow] = useState<any>(null);
  const [credits, setCredits] = useState<any>({ cast: [] });
  const [similarTVShows, setSimilarTVShows] = useState<any>({ results: [] });
  const [seasonDetails, setSeasonDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingSeason, setIsLoadingSeason] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tvShowData, creditsData, similarData] = await Promise.all([
          tmdbApi.getTVShowDetails(tvShowId),
          tmdbApi.getTVShowCredits(tvShowId),
          tmdbApi.getSimilarTVShows(tvShowId, 1).catch(() => ({ results: [] }))
        ]);
        setTvShow(tvShowData);
        setCredits(creditsData);
        setSimilarTVShows(similarData);
      } catch (error) {
        console.error('Error loading TV show:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [tvShowId]);

  useEffect(() => {
    if (selectedSeason && tvShow) {
      loadSeasonDetails(selectedSeason);
    }
  }, [selectedSeason, tvShow]);

  const loadSeasonDetails = async (seasonNumber: number) => {
    setIsLoadingSeason(true);
    try {
      const season = await tmdbApi.getSeasonDetails(tvShowId, seasonNumber);
      setSeasonDetails(season);
      setSelectedEpisode(season.episodes?.[0]?.episode_number ?? 1);
    } catch (error) {
      console.error('Error loading season details:', error);
    } finally {
      setIsLoadingSeason(false);
    }
  };

  const scrollToSeasonSelector = () => {
    seasonSelectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Handle TV show play - just open the player, no new tabs
  const openPlayer = (serverIndex?: number, season?: number, episode?: number) => {
    const s = season ?? selectedSeason;
    const e = episode ?? selectedEpisode;
    const idx = serverIndex ?? selectedServer;
    if (typeof serverIndex === 'number') setSelectedServer(serverIndex);
    if (typeof season === 'number') setSelectedSeason(season);
    if (typeof episode === 'number') setSelectedEpisode(episode);
    setIsPlayerOpen(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  if (loading || !tvShow) {
    return <LoadingScreen message="Loading TV show…" />;
  }

  const releaseYear = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : '';
  const rating = Math.round(tvShow.vote_average * 10) / 10;
  const seasonsCount = Math.max(tvShow.number_of_seasons || 1, 1);
  const currentEpisode = seasonDetails?.episodes?.find((ep: any) => ep.episode_number === selectedEpisode);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="pt-16">
        {/* Big Banner Section */}
        <div className="relative">
          {!isPlayerOpen ? (
            <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden">
              <Image
                src={tmdbApi.getBackdropUrl(tvShow.backdrop_path, 'w1280')}
                alt={tvShow.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
              
              {/* Breadcrumb on Banner */}
              <div className="absolute top-4 left-0 right-0 z-10">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center text-xs sm:text-sm text-gray-300">
                    <Link href="/" className="hover:text-white flex items-center transition-colors">
                      <Home className="w-4 h-4 mr-1" />
                      Home
                    </Link>
                    <ChevronRight className="w-4 h-4 mx-2" />
                    <Link href="/tv-shows" className="hover:text-white transition-colors">TV Shows</Link>
                    <ChevronRight className="w-4 h-4 mx-2" />
                    <span className="text-white">{tvShow.name}</span>
                  </div>
                </div>
              </div>
              
              {/* Play Button on Banner — scroll to pick episode; play opens in new tab */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={scrollToSeasonSelector}
                  className="bg-red-600/90 hover:bg-red-600 text-white rounded-full p-4 sm:p-6 lg:p-8 shadow-2xl transition-all duration-300 hover:scale-110 border-0"
                >
                  <Play className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20" fill="white" />
                </button>
              </div>
            </div>
          ) : (
            /* HDToday-style streaming layout */
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
                    <Link href="/tv-shows" className="hover:text-white transition-colors">TV Shows</Link>
                    <ChevronRight className="w-4 h-4 mx-2 text-gray-600" />
                    <span className="text-white">{tvShow.name}</span>
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
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-white truncate">
                        {tvShow.name} S{selectedSeason}E{selectedEpisode}
                        {currentEpisode && ` - ${currentEpisode.name}`}
                      </span>
                      <a
                        href={buildTVEmbedUrl(tvShowId, selectedSeason, selectedEpisode, selectedServer)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-white flex items-center gap-1 shrink-0 px-2 py-1 rounded transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open in new tab
                      </a>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
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
                        onClick={() => setIsPlayerOpen(false)}
                        className="p-1.5 text-gray-500 hover:text-white rounded transition-colors"
                        aria-label="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-1.5">
                    <StreamingPlayer 
                      url={buildTVEmbedUrl(tvShowId, selectedSeason, selectedEpisode, selectedServer)}
                      title={`${tvShow.name} S${selectedSeason}E${selectedEpisode}`}
                    />
                  </div>
                </div>
              </div>

              {/* Below player: dim when lights off */}
              <div className={lightsOff ? 'brightness-[0.2] pointer-events-none transition-all duration-300' : 'transition-all duration-300'}>
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-gray-500 text-sm">
                    <FavoritesButton
                      movieId={tvShowId}
                      movieTitle={tvShow.name}
                      moviePoster={tvShow.poster_path || ''}
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
                    {TV_STREAMING_SOURCES.map((_, idx) => (
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
                          {TV_STREAMING_SOURCES[idx].name}
                        </span>
                      </button>
                    ))}
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

        {/* Movie Details Overlapping Section (hidden when streaming) */}
        {!isPlayerOpen && (
          <div className="relative -mt-16 sm:-mt-24 lg:-mt-32 z-10">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6 lg:gap-8 mb-8">
                {/* TV Show Poster - Hidden on mobile */}
                <div className="hidden sm:block w-56 lg:w-64 aspect-[2/3] relative rounded-lg overflow-hidden shadow-xl flex-shrink-0">
                  <Image
                    src={tmdbApi.getImageUrl(tvShow.poster_path, 'w500')}
                    alt={tvShow.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* TV Show Info */}
                <div className="flex-1 text-white pb-4 sm:pb-8">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">{tvShow.name}</h1>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-yellow-500 text-black px-2 py-1 rounded text-sm font-bold">
                      ⭐ {rating}
                    </span>
                    <span className="text-gray-300">{releaseYear}</span>
                    <span className="text-gray-300">{tvShow.number_of_seasons} Season{tvShow.number_of_seasons !== 1 ? 's' : ''}</span>
                    <span className="bg-green-600 px-2 py-1 rounded text-xs font-bold">HD</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {tvShow.genres?.map((genre: any) => (
                      <span key={genre.id} className="bg-gray-800 px-3 py-1 rounded text-sm">
                        {genre.name}
                      </span>
                    ))}
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    {tvShow.overview}
                  </p>

                  {/* Watch Buttons — scroll to pick episode; play opens in new tab */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={scrollToSeasonSelector}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-semibold flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" fill="white" />
                      Watch Now
                    </button>
                    
                    <WatchlistButton 
                      movieId={tvShowId}
                      movieTitle={tvShow.name}
                      moviePoster={tvShow.poster_path || ''}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded font-semibold flex items-center gap-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Season & Episode Selection */}
        <div ref={seasonSelectorRef} className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 scroll-mt-24">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Episodes</h2>

          {/* Season tabs */}
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
            {Array.from({ length: seasonsCount }, (_, i) => i + 1).map((seasonNum) => (
              <button
                key={seasonNum}
                type="button"
                onClick={() => setSelectedSeason(seasonNum)}
                className={`px-3 sm:px-4 py-2 rounded text-sm font-medium transition-colors ${
                  selectedSeason === seasonNum
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Season {seasonNum}
              </button>
            ))}
          </div>

          {/* Server Selection for TV Shows */}
          {!isPlayerOpen && (
            <div className="mb-6">
              <h3 className="text-base font-semibold text-white mb-3">Choose Server</h3>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                {TV_STREAMING_SOURCES.map((source, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const ep = seasonDetails?.episodes?.[0]?.episode_number ?? selectedEpisode;
                      openPlayer(idx, selectedSeason, ep);
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

          {isLoadingSeason ? (
            <div className="text-gray-400 py-8">Loading episodes…</div>
          ) : seasonDetails?.episodes && seasonDetails.episodes.length > 0 ? (
            <div className="space-y-1 border border-gray-800 rounded-lg overflow-hidden">
              {seasonDetails.episodes.map((episode: any) => (
                <div
                  key={episode.id}
                  onClick={() => openPlayer(selectedServer, selectedSeason, episode.episode_number)}
                  className={`flex items-center gap-3 sm:gap-4 p-3 border-b border-gray-800 last:border-b-0 hover:bg-gray-900/80 transition-colors cursor-pointer ${
                    selectedEpisode === episode.episode_number ? 'bg-gray-900' : ''
                  }`}
                >
                  <div className="w-24 sm:w-32 lg:w-40 aspect-video relative rounded overflow-hidden flex-shrink-0 bg-gray-800">
                    {episode.still_path ? (
                      <Image
                        src={tmdbApi.getImageUrl(episode.still_path, 'w300')}
                        alt={episode.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-lg sm:text-2xl font-bold">
                        {episode.episode_number}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-white font-medium">
                      <span className="text-gray-400 text-xs sm:text-sm">E{episode.episode_number}</span>
                      <span className="truncate text-sm sm:text-base">{episode.name}</span>
                    </div>
                    {episode.overview && (
                      <p className="text-gray-500 text-xs sm:text-sm mt-0.5 line-clamp-2">{episode.overview}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white ml-0.5" fill="white" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No episodes available for this season.</p>
          )}
        </div>

        {/* Cast */}
        {credits.cast.length > 0 && (
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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

        <section id="comments" className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 scroll-mt-24">
          <h2 className="text-lg font-semibold text-white mb-3">Comments</h2>
          <div className="rounded-lg border border-gray-800 bg-gray-900/30 px-4 py-6 text-center text-gray-500 text-sm">
            Sign in to join the conversation.
          </div>
        </section>

        {/* Related TV Shows */}
        {similarTVShows.results.length > 0 && (
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">You May Also Like</h2>
            <TVShowGrid 
              tvShows={similarTVShows.results.slice(0, 12)} 
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}