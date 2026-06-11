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
import ShareButton from '@/components/share-button';
import { LoadingScreen } from '@/components/loading-screen';
import { StreamingPlayer } from '@/components/streaming-player';
import { continueWatching } from '@/lib/continue-watching';
import { TVShowStructuredData } from '@/components/seo/tv-show-structured-data';
import React, { useState, useEffect, useRef } from 'react';

interface TVShowClientPageProps {
  tvShowId: number;
}

const TV_STREAMING_SOURCES: Array<{ name: string; buildUrl: (tvShowId: number, season: number, episode: number) => string }> = [
  { name: 'VidLink',    buildUrl: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}?autoplay=true&title=false` },
  { name: '2Embed',     buildUrl: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` },
  { name: 'AutoEmbed',  buildUrl: (id, s, e) => `https://autoembed.co/tv/tmdb/${id}-${s}-${e}` },
  { name: 'SuperEmbed', buildUrl: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}` },
  { name: 'VidSrc',     buildUrl: (id, s, e) => `https://vidsrc.fyi/embed/tv/${id}/${s}/${e}` },
  { name: 'Smashy',     buildUrl: (id, s, e) => `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${s}&episode=${e}` },
  { name: 'EmbedAPI',   buildUrl: (id, s, e) => `https://player.embed-api.stream/?id=${id}&s=${s}&e=${e}` },
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
  const [hasAutoResumed, setHasAutoResumed] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [tvShow, setTvShow] = useState<any>(null);
  const [credits, setCredits] = useState<any>({ cast: [] });
  const [similarTVShows, setSimilarTVShows] = useState<any>({ results: [] });
  const [seasonDetails, setSeasonDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingSeason, setIsLoadingSeason] = useState(false);
  const pageLoadTime = useRef<number>(Date.now());
  const watchingInterval = useRef<NodeJS.Timeout | null>(null);
  const clickCount = useRef<{ [key: string]: { count: number; lastClick: number } }>({});

  useEffect(() => {
    // Check URL params for auto-play
    const urlParams = new URLSearchParams(window.location.search);
    const autoplay = urlParams.get('autoplay') === 'true';
    const urlSeason = urlParams.get('season');
    const urlEpisode = urlParams.get('episode');
    
    if (autoplay) {
      setShouldAutoPlay(true);
      setIsAutoPlaying(true);
      if (urlSeason && urlEpisode) {
        setSelectedSeason(parseInt(urlSeason));
        setSelectedEpisode(parseInt(urlEpisode));
      }
    }
    
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
        
        // Auto-resume from continue watching
        if (!hasAutoResumed) {
          const continueItem = continueWatching.get(tvShowId.toString(), 'tv');
          if (continueItem && continueItem.season && continueItem.episode) {
            setSelectedSeason(continueItem.season);
            setSelectedEpisode(continueItem.episode);
          }
          setHasAutoResumed(true);
        }
        
        // Track page load
        if (typeof window !== 'undefined' && (window as any).umami) {
          (window as any).umami.track('page_load', {
            type: 'tv',
            tvShowId: tvShowId,
            title: tvShowData.name
          });
        }
      } catch (error) {
        console.error('Error loading TV show:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [tvShowId]);

  // Auto-play when data is loaded
  useEffect(() => {
    if (shouldAutoPlay && tvShow && seasonDetails && !isPlayerOpen) {
      setTimeout(() => {
        openPlayer(selectedServer, selectedSeason, selectedEpisode);
        setShouldAutoPlay(false);
        setIsAutoPlaying(false);
      }, 1000);
    }
  }, [shouldAutoPlay, tvShow, seasonDetails, isPlayerOpen]);

  // Watch time tracking
  useEffect(() => {
    if (isPlayerOpen) {
      watchingInterval.current = setInterval(() => {
        if (typeof window !== 'undefined' && (window as any).umami) {
          (window as any).umami.track('watching', {
            type: 'tv',
            tvShowId: tvShowId,
            season: selectedSeason,
            episode: selectedEpisode,
            server: TV_STREAMING_SOURCES[selectedServer]?.name || 'Unknown'
          });
        }
      }, 60000);
    } else {
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
  }, [isPlayerOpen, selectedServer, selectedSeason, selectedEpisode, tvShowId]);

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
      // Don't reset episode if we have a specific one selected (from URL or continue watching)
      if (selectedEpisode === 1 && season.episodes?.[0]?.episode_number) {
        setSelectedEpisode(season.episodes[0].episode_number);
      }
    } catch (error) {
      console.error('Error loading season details:', error);
    } finally {
      setIsLoadingSeason(false);
    }
  };

  const scrollToSeasonSelector = () => {
    seasonSelectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Track rage clicks
  const trackClick = (target: string) => {
    const now = Date.now();
    const key = `${target}_${tvShowId}`;
    
    if (!clickCount.current[key]) {
      clickCount.current[key] = { count: 1, lastClick: now };
    } else {
      const timeDiff = now - clickCount.current[key].lastClick;
      if (timeDiff < 5000) {
        clickCount.current[key].count++;
        if (clickCount.current[key].count >= 3) {
          if (typeof window !== 'undefined' && (window as any).umami) {
            (window as any).umami.track('rage_click', {
              target: target,
              tvShowId: tvShowId,
              clicks: clickCount.current[key].count
            });
          }
          clickCount.current[key].count = 0;
        }
      } else {
        clickCount.current[key] = { count: 1, lastClick: now };
      }
    }
    clickCount.current[key].lastClick = now;
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
    
    // Track TV show play event with time-to-play
    const timeToPlay = Date.now() - pageLoadTime.current;
    if (typeof window !== 'undefined' && (window as any).umami) {
      (window as any).umami.track('tv_play', {
        show: tvShow.name,
        season: s,
        episode: e,
        server: TV_STREAMING_SOURCES[idx]?.name || 'Unknown',
        tvShowId: tvShowId,
        timeToPlay: timeToPlay
      });
    }
    
    trackClick('play');
    
    // Add to continue watching
    if (tvShow) {
      const episodeName = seasonDetails?.episodes?.find((ep: any) => ep.episode_number === e)?.name;
      continueWatching.add({
        id: tvShowId.toString(),
        type: 'tv',
        title: tvShow.name,
        poster: tvShow.poster_path || '',
        season: s,
        episode: e,
        episodeName: episodeName
      });
    }
  };

  if (loading || !tvShow || isAutoPlaying) {
    return <LoadingScreen message={isAutoPlaying ? "Starting playback..." : "Loading TV show…"} />;
  }

  const releaseYear = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : '';
  const rating = Math.round(tvShow.vote_average * 10) / 10;
  const seasonsCount = Math.max(tvShow.number_of_seasons || 1, 1);
  const currentEpisode = seasonDetails?.episodes?.find((ep: any) => ep.episode_number === selectedEpisode);

  return (
    <div className="min-h-screen bg-background">
      <TVShowStructuredData tvShow={tvShow} credits={credits} />
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
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/30 dark:block hidden" />
              
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
                <div className="rounded-md overflow-hidden border border-border bg-card">
                  <div className="flex items-center justify-between gap-2 px-2 py-1.5 border-b border-border">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">
                        {tvShow.name} S{selectedSeason}E{selectedEpisode}
                        {currentEpisode && ` - ${currentEpisode.name}`}
                      </span>
                      <a
                        href={buildTVEmbedUrl(tvShowId, selectedSeason, selectedEpisode, selectedServer)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0 px-2 py-1 rounded transition-colors"
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
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors"
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
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-muted-foreground text-sm">
                    <FavoritesButton
                      movieId={tvShowId}
                      movieTitle={tvShow.name}
                      moviePoster={tvShow.poster_path || ''}
                      iconType="plus"
                      label="Add to favorite"
                      size="sm"
                      variant="ghost"
                      className="hover:text-foreground text-muted-foreground hover:bg-transparent p-0 h-auto font-normal"
                    />
                    <button
                      type="button"
                      onClick={() => setLightsOff(!lightsOff)}
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      <Lightbulb className={`w-3.5 h-3.5 ${lightsOff ? 'text-amber-500/90' : ''}`} />
                      {lightsOff ? 'Lights on' : 'Lights off'}
                    </button>
                    <a href="#comments" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                      <MessageCircle className="w-3.5 h-3.5" />
                      Comments
                    </a>
                  </div>
                  <p className="text-center text-muted-foreground text-sm mt-6 mb-2">
                    If current server doesn&apos;t work, try another below.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {TV_STREAMING_SOURCES.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedServer(idx);
                          setUserSelectedServer(true);
                          // Track server change for TV shows
                          if (typeof window !== 'undefined' && (window as any).umami) {
                            (window as any).umami.track('tv_server_change', {
                              show: tvShow.name,
                              season: selectedSeason,
                              episode: selectedEpisode,
                              server: TV_STREAMING_SOURCES[idx]?.name || 'Unknown',
                              tvShowId: tvShowId
                            });
                          }
                        }}
                        className={`flex flex-col items-center min-w-[100px] px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                          selectedServer === idx
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground hover:bg-muted'
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
              <div className="bg-white dark:bg-transparent rounded-2xl shadow-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6 lg:gap-8 mb-8">
                {/* TV Show Poster - Hidden on mobile */}
                <div className="hidden sm:block w-40 lg:w-48 aspect-[2/3] relative rounded-lg overflow-hidden shadow-xl flex-shrink-0">
                  <Image
                    src={tmdbApi.getImageUrl(tvShow.poster_path, 'w500')}
                    alt={tvShow.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* TV Show Info */}
                <div className="flex-1 text-foreground pb-4 sm:pb-8">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">{tvShow.name}</h1>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-yellow-500 text-black px-2 py-1 rounded text-sm font-bold">
                      ⭐ {rating}
                    </span>
                    <span className="text-muted-foreground">{releaseYear}</span>
                    <span className="text-muted-foreground">{tvShow.number_of_seasons} Season{tvShow.number_of_seasons !== 1 ? 's' : ''}</span>
                    <span className="bg-green-600 px-2 py-1 rounded text-xs font-bold">HD</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {tvShow.genres?.map((genre: any) => (
                      <span key={genre.id} className="bg-muted px-3 py-1 rounded text-sm">
                        {genre.name}
                      </span>
                    ))}
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {tvShow.overview}
                  </p>

                  {/* Watch Buttons — scroll to pick episode; play opens in new tab */}
                  <div className="flex gap-3 mb-4">
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
                    
                    <ShareButton title={tvShow.name} />
                  </div>
                  
                  <p className="text-muted-foreground text-xs">
                    Free streaming? Tell your friends about it
                  </p>
                </div>
              </div>
              </div>
            </div>
          </div>
        )}

        {/* Season & Episode Selection */}
        <div ref={seasonSelectorRef} className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 scroll-mt-24">
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">Episodes</h2>

          {/* Season tabs */}
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
            {Array.from({ length: seasonsCount }, (_, i) => i + 1).map((seasonNum) => (
              <button
                key={seasonNum}
                type="button"
                  onClick={() => {
                    setSelectedSeason(seasonNum);
                    // Track season change
                    if (typeof window !== 'undefined' && (window as any).umami) {
                      (window as any).umami.track('season_change', {
                        show: tvShow.name,
                        season: seasonNum,
                        tvShowId: tvShowId
                      });
                    }
                  }}
                className={`px-3 sm:px-4 py-2 rounded text-sm font-medium transition-colors ${
                  selectedSeason === seasonNum
                    ? 'bg-red-600 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                Season {seasonNum}
              </button>
            ))}
          </div>

          {/* Server Selection for TV Shows */}
          {!isPlayerOpen && (
            <div className="mb-6">
              <h3 className="text-base font-semibold text-foreground mb-3">Choose Server</h3>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                {TV_STREAMING_SOURCES.map((source, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const ep = seasonDetails?.episodes?.[0]?.episode_number ?? selectedEpisode;
                      openPlayer(idx, selectedSeason, ep);
                    }}
                    className="flex flex-col items-center min-w-[100px] px-4 py-2.5 rounded-lg border border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground hover:bg-muted text-sm transition-colors"
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
            <div className="text-muted-foreground py-8">Loading episodes…</div>
          ) : seasonDetails?.episodes && seasonDetails.episodes.length > 0 ? (
            <div className="space-y-1 border border-border rounded-lg overflow-hidden">
              {seasonDetails.episodes.map((episode: any) => (
                <div
                  key={episode.id}
                  onClick={() => {
                    openPlayer(selectedServer, selectedSeason, episode.episode_number);
                    // Track episode selection
                    if (typeof window !== 'undefined' && (window as any).umami) {
                      (window as any).umami.track('episode_select', {
                        show: tvShow.name,
                        season: selectedSeason,
                        episode: episode.episode_number,
                        episodeName: episode.name,
                        tvShowId: tvShowId
                      });
                    }
                  }}
                  className={`flex items-center gap-3 sm:gap-4 p-3 border-b border-border last:border-b-0 hover:bg-muted transition-colors cursor-pointer ${
                    selectedEpisode === episode.episode_number ? 'bg-muted' : ''
                  }`}
                >
                  <div className="w-24 sm:w-32 lg:w-40 aspect-video relative rounded overflow-hidden flex-shrink-0 bg-muted">
                    {episode.still_path ? (
                      <Image
                        src={tmdbApi.getImageUrl(episode.still_path, 'w300')}
                        alt={episode.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-lg sm:text-2xl font-bold">
                        {episode.episode_number}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <span className="text-muted-foreground text-xs sm:text-sm">E{episode.episode_number}</span>
                      <span className="truncate text-sm sm:text-base">{episode.name}</span>
                    </div>
                    {episode.overview && (
                      <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 line-clamp-2">{episode.overview}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white ml-0.5" fill="white" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No episodes available for this season.</p>
          )}
        </div>

        {/* Cast */}
        {credits.cast.length > 0 && (
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Cast</h2>
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {credits.cast.slice(0, 15).map((actor: any) => (
                <div key={actor.id} className="flex-shrink-0 w-24 sm:w-28 lg:w-32">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 relative rounded-full overflow-hidden mb-2 sm:mb-3 bg-muted">
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
                  <p className="text-foreground text-xs sm:text-sm font-medium text-center truncate">{actor.name}</p>
                  <p className="text-muted-foreground text-xs text-center truncate">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <section id="comments" className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 scroll-mt-24">
          <h2 className="text-lg font-semibold text-foreground mb-3">Comments</h2>
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center text-muted-foreground text-sm">
            Sign in to join the conversation.
          </div>
        </section>

        {/* Related TV Shows */}
        {similarTVShows.results.length > 0 && (
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8">You May Also Like</h2>
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