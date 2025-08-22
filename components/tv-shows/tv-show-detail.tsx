'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Star, Play, Clock, Users, Heart, HeartOff, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TVShowDetails, TVShow, Season, Episode } from '@/lib/api/tmdb';
import { tmdbApi } from '@/lib/api/tmdb';
import { useAuth } from '@/lib/auth/auth-provider';
import { watchlistService } from '@/lib/services/watchlist';
import { favoritesService } from '@/lib/services/favorites';
import { toast } from 'sonner';
import { AuthModal } from '@/components/auth/auth-modal';
import { TVShowGrid } from './tv-show-grid';
import { StreamingModal } from '../movie/streaming-modal';

interface TVShowDetailProps {
  tvShow: TVShowDetails;
  credits: any; // Using any for now since Credits type is not exported
  similarTVShows: TVShow[];
}

export function TVShowDetail({ tvShow, credits, similarTVShows }: TVShowDetailProps) {
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
      setSelectedEpisode(1);
    } catch (error) {
      console.error('Error loading season details:', error);
      toast.error('Failed to load season details');
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
      console.error('Watchlist error:', error);
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
      console.error('Favorites error:', error);
      toast.error(error.message || 'Failed to update favorites');
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const handleWatchEpisode = () => {
    try {
      setShowStreamingModal(true);
      toast.success(`Opening ${tvShow.name} S${selectedSeason}E${selectedEpisode} for streaming`);
    } catch (error) {
      console.error('Error opening streaming:', error);
      toast.error('Failed to open streaming. Please try again.');
    }
  };

  const currentEpisode = seasonDetails?.episodes.find(ep => ep.episode_number === selectedEpisode);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Hero - Shorter height */}
        <div className="relative w-full h-[40vh] overflow-hidden">
          <Image
            src={tmdbApi.getBackdropUrl(tvShow.backdrop_path, 'w1280')}
            alt={tvShow.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          
                     {/* Back button positioned at top */}
           <div className="absolute top-4 left-4 z-10">
             <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10 bg-black/20 backdrop-blur-sm">
               <Link href="/tv-shows">
                 <ArrowLeft className="w-4 h-4 mr-2" />
                 Back to TV Shows
               </Link>
             </Button>
           </div>
        </div>

        {/* Mobile Content Section */}
        <div className="px-4 py-6 space-y-6">
          {/* Mobile Poster and Title Row */}
          <div className="flex items-start space-x-4">
            <div className="w-24 aspect-[2/3] relative rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                             <Image
                 src={tmdbApi.getPosterUrl(tvShow.poster_path || '', 'w500')}
                 alt={tvShow.name}
                 fill
                 className="object-cover"
                 priority
               />
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold mb-2 leading-tight">
                {tvShow.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary" className="bg-primary text-primary-foreground text-xs">
                  {tvShow.status}
                </Badge>
                
                {rating > 0 && (
                  <div className="flex items-center text-muted-foreground text-xs">
                    <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {rating}
                  </div>
                )}
                
                {releaseYear && (
                  <div className="flex items-center text-muted-foreground text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    {releaseYear}
                  </div>
                )}

                {tvShow.number_of_seasons > 0 && (
                  <div className="flex items-center text-muted-foreground text-xs">
                    {tvShow.number_of_seasons} Season{tvShow.number_of_seasons !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {tvShow.genres?.slice(0, 3).map((genre) => (
                  <Badge
                    key={genre.id}
                    variant="outline"
                    className="text-xs"
                  >
                    {genre.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleWatchEpisode}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-base rounded-lg shadow-lg"
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Episode
              </Button>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={handleToggleWatchlist}
                disabled={isLoadingWatchlist}
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground border rounded-full p-3 transition-all duration-200 hover:scale-110"
                size="lg"
              >
                {isLoadingWatchlist ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : isInWatchlist ? (
                  <HeartOff className="w-4 h-4" />
                ) : (
                  <Heart className="w-4 h-4" />
                )}
              </Button>

              <Button
                onClick={handleToggleFavorites}
                disabled={isLoadingFavorites}
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground border rounded-full p-3 transition-all duration-200 hover:scale-110"
                size="lg"
              >
                {isLoadingFavorites ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : isInFavorites ? (
                  <Star className="w-4 h-4 fill-yellow-400" />
                ) : (
                  <Star className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Overview */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Overview</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {tvShow.overview}
            </p>
          </div>

          {/* Episode Selection */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Watch Episodes</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Season</label>
                <Select value={selectedSeason.toString()} onValueChange={(value) => setSelectedSeason(parseInt(value))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: tvShow.number_of_seasons }, (_, i) => i + 1).map((season) => (
                      <SelectItem key={season} value={season.toString()}>
                        Season {season}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Episode</label>
                <Select value={selectedEpisode.toString()} onValueChange={(value) => setSelectedEpisode(parseInt(value))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {seasonDetails?.episodes.map((episode) => (
                      <SelectItem key={episode.episode_number} value={episode.episode_number.toString()}>
                        Episode {episode.episode_number}: {episode.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleWatchEpisode}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-base rounded-lg shadow-lg"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Watch Episode
            </Button>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {tvShow.vote_count > 0 && (
              <div className="flex items-center text-muted-foreground">
                <Users className="w-4 h-4 mr-2" />
                {tvShow.vote_count.toLocaleString()} votes
              </div>
            )}
            <div className="flex items-center text-muted-foreground">
              <span className="font-medium">Status:</span>
              <span className="ml-2">{tvShow.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        {/* Hero Section */}
        <div className="relative w-full h-[80vh] overflow-hidden">
          <Image
            src={tmdbApi.getBackdropUrl(tvShow.backdrop_path, 'w1280')}
            alt={tvShow.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/40" />

          <div className="absolute inset-0 flex items-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8 sm:pb-12 lg:pb-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-end">
                <div className="hidden lg:block">
                  <div className="w-80 aspect-[2/3] relative rounded-xl overflow-hidden shadow-2xl ring-4 ring-white/10">
                    <Image
                      src={tmdbApi.getPosterUrl(tvShow.poster_path || '', 'w500')}
                      alt={tvShow.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>

                <div className="text-white">
                  <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                    <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10">
                      <Link href="/tv-shows">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Link>
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                    <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                      {tvShow.status}
                    </Badge>
                    {releaseYear && (
                      <>
                        <span className="text-white/60">•</span>
                        <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10">
                          <span className="text-sm sm:text-base">{releaseYear}</span>
                        </Button>
                      </>
                    )}
                    {tvShow.number_of_seasons > 0 && (
                      <>
                        <span className="text-white/60">•</span>
                        <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10">
                          <span className="text-sm sm:text-base">{tvShow.number_of_seasons} Season{tvShow.number_of_seasons !== 1 ? 's' : ''}</span>
                        </Button>
                      </>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 text-shadow">
                    {tvShow.name}
                  </h1>

                  <div className="flex items-center space-x-4 mb-3 sm:mb-4">
                    {rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm sm:text-base font-semibold">{rating}</span>
                      </div>
                    )}
                    {tvShow.vote_count > 0 && (
                      <span className="text-sm sm:text-base text-gray-300">
                        ({tvShow.vote_count.toLocaleString()} votes)
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-200 mb-4 sm:mb-6 lg:mb-8 max-w-2xl text-shadow leading-relaxed">
                    {tvShow.overview}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-10">
                    {/* Primary Action - Watch Episode */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Button
                        onClick={handleWatchEpisode}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        size="lg"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Watch Episode
                      </Button>
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Button
                        onClick={handleToggleWatchlist}
                        disabled={isLoadingWatchlist}
                        className="bg-black/40 hover:bg-black/60 text-white border border-white/30 rounded-full p-3 sm:p-4 transition-all duration-200 hover:scale-110"
                        size="lg"
                      >
                        {isLoadingWatchlist ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : isInWatchlist ? (
                          <HeartOff className="w-4 h-4" />
                        ) : (
                          <Heart className="w-4 h-4" />
                        )}
                      </Button>

                      <Button
                        onClick={handleToggleFavorites}
                        disabled={isLoadingFavorites}
                        className="bg-black/40 hover:bg-black/60 text-white border border-white/30 rounded-full p-3 sm:p-4 transition-all duration-200 hover:scale-110"
                        size="lg"
                      >
                        {isLoadingFavorites ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : isInFavorites ? (
                          <Star className="w-4 h-4 fill-yellow-400" />
                        ) : (
                          <Star className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Season and Episode Selection */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">
            Watch Episodes
          </h2>
          
          <div className="bg-muted rounded-lg p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Season Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Season</label>
                <Select value={selectedSeason.toString()} onValueChange={(value) => setSelectedSeason(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: tvShow.number_of_seasons }, (_, i) => i + 1).map((season) => (
                      <SelectItem key={season} value={season.toString()}>
                        Season {season}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Episode Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Episode</label>
                <Select 
                  value={selectedEpisode.toString()} 
                  onValueChange={(value) => setSelectedEpisode(parseInt(value))}
                  disabled={isLoadingSeason || !seasonDetails}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingSeason ? "Loading..." : "Select Episode"} />
                  </SelectTrigger>
                  <SelectContent>
                    {seasonDetails?.episodes.map((episode) => (
                      <SelectItem key={episode.episode_number} value={episode.episode_number.toString()}>
                        Episode {episode.episode_number}: {episode.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Watch Button */}
              <div className="flex items-end">
                <Button
                  onClick={handleWatchEpisode}
                  disabled={!currentEpisode}
                  className="w-full bg-primary hover:bg-primary/90 font-semibold py-2 sm:py-3 text-sm sm:text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Episode
                </Button>
              </div>
            </div>

            {/* Episode Details */}
            {currentEpisode && (
              <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-background rounded-lg">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Episode Still */}
                  <div className="lg:col-span-1">
                    {currentEpisode.still_path && (
                      <div className="relative aspect-video rounded-lg overflow-hidden">
                        <Image
                          src={tmdbApi.getImageUrl(currentEpisode.still_path, 'w500')}
                          alt={currentEpisode.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Episode Info */}
                  <div className="lg:col-span-2">
                    <h3 className="text-lg sm:text-xl font-bold mb-2">
                      Episode {currentEpisode.episode_number}: {currentEpisode.name}
                    </h3>
                    
                    <div className="flex items-center space-x-4 mb-3 text-sm text-muted-foreground">
                      {currentEpisode.air_date && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(currentEpisode.air_date).toLocaleDateString()}
                        </div>
                      )}
                      {currentEpisode.runtime > 0 && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {currentEpisode.runtime} min
                        </div>
                      )}
                      {currentEpisode.vote_average > 0 && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                          {Math.round(currentEpisode.vote_average * 10) / 10}
                        </div>
                      )}
                    </div>

                    <p className="text-sm sm:text-base leading-relaxed">
                      {currentEpisode.overview || 'No description available for this episode.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Show Details */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">
            Show Details
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Overview</h3>
              <p className="leading-relaxed">{tvShow.overview}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Details</h3>
              <div className="space-y-2 text-sm">
                {tvShow.status && (
                  <div><span className="font-medium">Status:</span> {tvShow.status}</div>
                )}
                {tvShow.type && (
                  <div><span className="font-medium">Type:</span> {tvShow.type}</div>
                )}
                {tvShow.number_of_seasons > 0 && (
                  <div><span className="font-medium">Seasons:</span> {tvShow.number_of_seasons}</div>
                )}
                {tvShow.number_of_episodes > 0 && (
                  <div><span className="font-medium">Episodes:</span> {tvShow.number_of_episodes}</div>
                )}
                {tvShow.episode_run_time.length > 0 && (
                  <div><span className="font-medium">Episode Runtime:</span> {tvShow.episode_run_time[0]} min</div>
                )}
                {tvShow.genres.length > 0 && (
                  <div>
                    <span className="font-medium">Genres:</span> {tvShow.genres.map(g => g.name).join(', ')}
                  </div>
                )}
                {tvShow.networks.length > 0 && (
                  <div>
                    <span className="font-medium">Networks:</span> {tvShow.networks.map(n => n.name).join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Similar TV Shows */}
        {similarTVShows.length > 0 && (
          <section>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8">More Like This</h2>
            <TVShowGrid tvShows={similarTVShows.slice(0, 12)} />
          </section>
        )}
      </div>

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
