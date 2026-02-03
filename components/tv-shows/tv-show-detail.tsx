'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, ChevronRight, Home, Heart, HeartOff, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TVShowDetails, TVShow, Season, Episode } from '@/lib/api/tmdb';
import { tmdbApi } from '@/lib/api/tmdb';
import { useAuth } from '@/lib/auth/auth-provider';
import { watchlistService } from '@/lib/services/watchlist';
import { favoritesService } from '@/lib/services/favorites';
import { toast } from 'sonner';
import { AuthModal } from '@/components/auth/auth-modal';
import { TVShowGrid } from './tv-show-grid';
import { StreamingModal } from '../movie/streaming-modal';
import { WatchlistButton } from '../movie/watchlist-button';
import { FavoritesButton } from '../movie/favorites-button';

interface TVShowDetailProps {
  tvShow: TVShowDetails;
  credits: any;
  similarTVShows: TVShow[];
}

export function TVShowDetail({ tvShow, credits, similarTVShows }: TVShowDetailProps) {
  const seasonSelectorRef = useRef<HTMLDivElement>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [seasonDetails, setSeasonDetails] = useState<Season | null>(null);
  const [isLoadingSeason, setIsLoadingSeason] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isInFavorites, setIsInFavorites] = useState(false);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(false);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showStreamingModal, setShowStreamingModal] = useState(false);
  const { user } = useAuth();

  const tvShowId = tvShow.id;
  const releaseYear = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : null;
  const rating = tvShow.vote_average ? Math.round(tvShow.vote_average * 10) / 10 : 0;
  const seasonsCount = Math.max(tvShow.number_of_seasons || 1, 1);

  useEffect(() => {
    if (user) {
      checkWatchlistStatus();
      checkFavoritesStatus();
    }
  }, [user, tvShowId]);

  useEffect(() => {
    if (selectedSeason) {
      loadSeasonDetails(selectedSeason);
    }
  }, [selectedSeason, tvShowId]);

  const checkWatchlistStatus = async () => {
    try {
      const status = await watchlistService.isInWatchlist(tvShowId);
      setIsInWatchlist(status);
    } catch (error) {
      console.error('Error checking watchlist status:', error);
    }
  };

  const checkFavoritesStatus = async () => {
    try {
      const status = await favoritesService.isInFavorites(tvShowId);
      setIsInFavorites(status);
    } catch (error) {
      console.error('Error checking favorites status:', error);
    }
  };

  const loadSeasonDetails = async (seasonNumber: number) => {
    setIsLoadingSeason(true);
    try {
      const season = await tmdbApi.getSeasonDetails(tvShowId, seasonNumber);
      setSeasonDetails(season);
      setSelectedEpisode(season.episodes?.[0]?.episode_number ?? 1);
    } catch (error) {
      console.error('Error loading season details:', error);
      toast.error('Failed to load season');
    } finally {
      setIsLoadingSeason(false);
    }
  };

  const handleToggleWatchlist = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setIsLoadingWatchlist(true);
    try {
      if (isInWatchlist) {
        await watchlistService.removeFromWatchlist(tvShowId);
        setIsInWatchlist(false);
        toast.success('Removed from watchlist');
      } else {
        await watchlistService.addToWatchlist(tvShowId, tvShow.name, tvShow.poster_path || '');
        setIsInWatchlist(true);
        toast.success('Added to watchlist');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update watchlist');
    } finally {
      setIsLoadingWatchlist(false);
    }
  };

  const handleToggleFavorites = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setIsLoadingFavorites(true);
    try {
      if (isInFavorites) {
        await favoritesService.removeFromFavorites(tvShowId);
        setIsInFavorites(false);
        toast.success('Removed from favorites');
      } else {
        await favoritesService.addToFavorites(tvShowId, tvShow.name, tvShow.poster_path || '');
        setIsInFavorites(true);
        toast.success('Added to favorites');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update favorites');
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const scrollToSeasonSelector = () => {
    seasonSelectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleWatchEpisode = () => {
    setShowStreamingModal(true);
    toast.success(`Opening ${tvShow.name} S${selectedSeason}E${selectedEpisode}`);
  };

  const currentEpisode = seasonDetails?.episodes?.find(ep => ep.episode_number === selectedEpisode);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero banner - same as movie */}
      <div className="relative h-[600px] overflow-hidden">
        <Image
          src={tmdbApi.getBackdropUrl(tvShow.backdrop_path, 'w1280')}
          alt={tvShow.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />

        <div className="absolute top-4 left-0 right-0 z-10">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center text-sm text-gray-300">
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

        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            onClick={scrollToSeasonSelector}
            className="bg-red-600/90 hover:bg-red-600 text-white rounded-full p-8 shadow-2xl transition-all duration-300 hover:scale-110 border-0"
            aria-label="Choose season and episode"
          >
            <Play className="w-20 h-20" fill="white" />
          </button>
        </div>
      </div>

      {/* Overlapping details - same as movie */}
      <div className="relative -mt-32 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end gap-8 mb-8">
            <div className="w-64 aspect-[2/3] relative rounded-lg overflow-hidden shadow-xl flex-shrink-0">
              <Image
                src={tmdbApi.getImageUrl(tvShow.poster_path, 'w500')}
                alt={tvShow.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 text-white pb-8">
              <h1 className="text-4xl font-bold mb-4">{tvShow.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                {rating > 0 && (
                  <span className="bg-yellow-500 text-black px-2 py-1 rounded text-sm font-bold">
                    ⭐ {rating}
                  </span>
                )}
                {releaseYear && <span className="text-gray-300">{releaseYear}</span>}
                {tvShow.number_of_seasons > 0 && (
                  <span className="text-gray-300">{tvShow.number_of_seasons} Season{tvShow.number_of_seasons !== 1 ? 's' : ''}</span>
                )}
                <span className="bg-green-600 px-2 py-1 rounded text-xs font-bold">HD</span>
              </div>
              {tvShow.genres?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tvShow.genres.map((g) => (
                    <span key={g.id} className="bg-gray-800 px-3 py-1 rounded text-sm">
                      {g.name}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-gray-300 text-base mb-6 max-w-2xl">
                {tvShow.overview}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={scrollToSeasonSelector}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded font-semibold flex items-center gap-2"
                >
                  <Play className="w-5 h-5" fill="white" />
                  Watch Now
                </button>
                <WatchlistButton
                  movieId={tvShowId}
                  movieTitle={tvShow.name}
                  moviePoster={tvShow.poster_path || ''}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded font-semibold flex items-center gap-2"
                />
                <span className="text-gray-400">Watchlist</span>
                <FavoritesButton
                  movieId={tvShowId}
                  movieTitle={tvShow.name}
                  moviePoster={tvShow.poster_path || ''}
                  iconType="star"
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded font-semibold"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HDToday-style: Season selector + episode list */}
      <div ref={seasonSelectorRef} className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-24">
        <h2 className="text-xl font-bold text-white mb-4">Episodes</h2>

        {/* Season tabs - HDToday style: horizontal tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Array.from({ length: seasonsCount }, (_, i) => i + 1).map((seasonNum) => (
            <button
              key={seasonNum}
              type="button"
              onClick={() => setSelectedSeason(seasonNum)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                selectedSeason === seasonNum
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Season {seasonNum}
            </button>
          ))}
        </div>

        {isLoadingSeason ? (
          <div className="text-gray-400 py-8">Loading episodes…</div>
        ) : seasonDetails?.episodes && seasonDetails.episodes.length > 0 ? (
          <>
            {/* Episode list - HDToday style: rows with thumb, number, title, play */}
            <div className="space-y-1 border border-gray-800 rounded-lg overflow-hidden">
              {seasonDetails.episodes.map((episode) => (
                <div
                  key={episode.id}
                  className={`flex items-center gap-4 p-3 border-b border-gray-800 last:border-b-0 hover:bg-gray-900/80 transition-colors ${
                    selectedEpisode === episode.episode_number ? 'bg-gray-900' : ''
                  }`}
                >
                  <div className="w-32 sm:w-40 aspect-video relative rounded overflow-hidden flex-shrink-0 bg-gray-800">
                    {episode.still_path ? (
                      <Image
                        src={tmdbApi.getImageUrl(episode.still_path, 'w300')}
                        alt={episode.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-2xl font-bold">
                        {episode.episode_number}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-white font-medium">
                      <span className="text-gray-400 text-sm">E{episode.episode_number}</span>
                      <span className="truncate">{episode.name}</span>
                    </div>
                    {episode.overview && (
                      <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">{episode.overview}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEpisode(episode.episode_number);
                      setShowStreamingModal(true);
                    }}
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
                    aria-label={`Play episode ${episode.episode_number}`}
                  >
                    <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                  </button>
                </div>
              ))}
            </div>

            {/* Watch selected episode bar */}
            {currentEpisode && (
              <div className="mt-6 flex items-center gap-4 p-4 rounded-lg bg-gray-900/80 border border-gray-800">
                <span className="text-white font-medium">
                  S{selectedSeason}E{selectedEpisode} · {currentEpisode.name}
                </span>
                <Button
                  onClick={handleWatchEpisode}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" fill="currentColor" />
                  Watch Episode
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500">No episodes available for this season.</p>
        )}
      </div>

      {/* Cast */}
      {credits?.cast?.length > 0 && (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-white mb-6">Cast</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {credits.cast.slice(0, 15).map((actor: any) => (
              <div key={actor.id} className="flex-shrink-0 w-32 text-center">
                <div className="w-32 h-32 relative rounded-full overflow-hidden mb-3 bg-gray-800">
                  <Image
                    src={actor.profile_path ? tmdbApi.getImageUrl(actor.profile_path, 'w185') : '/placeholder.png'}
                    alt={actor.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-white text-sm font-medium truncate">{actor.name}</p>
                <p className="text-gray-400 text-xs truncate">{actor.character}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Similar */}
      {similarTVShows.length > 0 && (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-white mb-8">You May Also Like</h2>
          <TVShowGrid tvShows={similarTVShows.slice(0, 12)} />
        </div>
      )}

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />

      <StreamingModal
        isOpen={showStreamingModal}
        onClose={() => setShowStreamingModal(false)}
        movieId={tvShowId}
        title={`${tvShow.name} S${selectedSeason}E${selectedEpisode}`}
        posterPath={tvShow.poster_path || undefined}
        backdropPath={tvShow.backdrop_path || undefined}
        isTVShow={true}
        seasonNumber={selectedSeason}
        episodeNumber={selectedEpisode}
      />
    </div>
  );
}
