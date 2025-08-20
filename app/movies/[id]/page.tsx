import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { Calendar, Clock, Star, Users, ArrowLeft } from 'lucide-react';
import { tmdbApi } from '@/lib/api/tmdb';
import { youtubeApi } from '@/lib/api/youtube';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MovieGrid } from '@/components/movie/movie-grid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { YouTubePlayer } from '@/components/movie/youtube-player';
import { CastGrid } from '@/components/movie/cast-grid';
import { TrailerButton } from '@/components/movie/trailer-button';
import { WatchlistButton } from '@/components/movie/watchlist-button';
import { FavoritesButton } from '@/components/movie/favorites-button';

interface MoviePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  try {
    const movieId = parseInt(params.id);
    if (isNaN(movieId)) {
      return {
        title: 'Movie Not Found',
        description: 'The requested movie could not be found.',
      };
    }

    const movie = await tmdbApi.getMovieDetails(movieId);
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';

    return {
      title: `${movie.title}${releaseYear ? ` (${releaseYear})` : ''}`,
      description: movie.overview || `Watch ${movie.title} and discover more movies on CineHub.`,
      keywords: [
        movie.title,
        ...movie.genres.map(g => g.name),
        'movie',
        'trailer',
        'cinema'
      ],
      openGraph: {
        title: movie.title,
        description: movie.overview,
        images: [
          {
            url: tmdbApi.getBackdropUrl(movie.backdrop_path, 'w1280'),
            width: 1280,
            height: 720,
            alt: movie.title,
          },
        ],
      },
    };
  } catch {
    return {
      title: 'Movie Not Found',
      description: 'The requested movie could not be found.',
    };
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const movieId = parseInt(params.id);
  
  if (isNaN(movieId)) {
    notFound();
  }

  try {
    const [movie, credits, similarMovies] = await Promise.all([
      tmdbApi.getMovieDetails(movieId),
      tmdbApi.getMovieCredits(movieId),
      tmdbApi.getSimilarMovies(movieId, 1).catch(() => ({ results: [] }))
    ]);

    const trailerVideoId = await youtubeApi.searchTrailer(
      movie.title, 
      movie.release_date ? new Date(movie.release_date).getFullYear().toString() : undefined
    );

    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
    const rating = Math.round(movie.vote_average * 10) / 10;
    const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '';

    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16">
          <div className="relative w-full h-[80vh] overflow-hidden">
            <Image
              src={tmdbApi.getBackdropUrl(movie.backdrop_path, 'w1280')}
              alt={movie.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />

            <div className="absolute inset-0 flex items-end">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
                  <div className="hidden lg:block">
                    <div className="w-80 aspect-[2/3] relative rounded-lg overflow-hidden shadow-2xl">
                      <Image
                        src={tmdbApi.getImageUrl(movie.poster_path, 'w500')}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        sizes="320px"
                      />
                    </div>
                  </div>

                  <div className="text-white">
                    <div className="flex items-center space-x-2 mb-4">
                      <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10">
                        <Link href="/">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Link>
                      </Button>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold mb-4 text-shadow">
                      {movie.title}
                    </h1>

                    {movie.tagline && (
                      <p className="text-xl text-gray-300 mb-6 italic text-shadow">
                        {movie.tagline}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      {rating > 0 && (
                        <Badge variant="secondary" className="bg-black/60 text-white border-0">
                          <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                          {rating} / 10
                        </Badge>
                      )}
                      
                      {releaseYear && (
                        <div className="flex items-center text-gray-300">
                          <Calendar className="w-4 h-4 mr-1" />
                          {releaseYear}
                        </div>
                      )}

                      {runtime && (
                        <div className="flex items-center text-gray-300">
                          <Clock className="w-4 h-4 mr-1" />
                          {runtime}
                        </div>
                      )}

                      {movie.vote_count > 0 && (
                        <div className="flex items-center text-gray-300">
                          <Users className="w-4 h-4 mr-1" />
                          {movie.vote_count.toLocaleString()} votes
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {movie.genres.map((genre) => (
                        <Badge
                          key={genre.id}
                          variant="outline"
                          className="border-white/30 text-white hover:bg-white/10"
                        >
                          {genre.name}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-lg text-gray-200 mb-8 max-w-2xl text-shadow leading-relaxed">
                      {movie.overview}
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                      {trailerVideoId && (
                        <TrailerButton />
                      )}

                      <WatchlistButton 
                        movieId={movieId} 
                        movieTitle={movie.title}
                        moviePoster={movie.poster_path || ''}
                      />

                      <FavoritesButton 
                        movieId={movieId} 
                        movieTitle={movie.title}
                        moviePoster={movie.poster_path || ''}
                        className="text-white hover:bg-white/10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
            {trailerVideoId && (
              <section id="trailer">
                <h2 className="text-3xl font-bold mb-8">Official Trailer</h2>
                <YouTubePlayer videoId={trailerVideoId} title={`${movie.title} - Official Trailer`} />
              </section>
            )}

            {credits.cast.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold mb-8">Cast</h2>
                <CastGrid cast={credits.cast.slice(0, 12)} />
              </section>
            )}

            <section>
              <h2 className="text-3xl font-bold mb-8">Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {movie.budget > 0 && (
                    <div>
                      <h3 className="font-semibold text-muted-foreground">Budget</h3>
                      <p>${movie.budget.toLocaleString()}</p>
                    </div>
                  )}

                  {movie.revenue > 0 && (
                    <div>
                      <h3 className="font-semibold text-muted-foreground">Revenue</h3>
                      <p>${movie.revenue.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-muted-foreground">Status</h3>
                    <p>{movie.status}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-muted-foreground">Original Language</h3>
                    <p>{movie.original_language.toUpperCase()}</p>
                  </div>

                  {movie.production_companies.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-muted-foreground">Production Companies</h3>
                      <p>{movie.production_companies.map(c => c.name).join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {similarMovies.results.length > 0 && (
              <section>
                <MovieGrid
                  movies={similarMovies.results.slice(0, 12)}
                  title="Similar Movies"
                  showYear={true}
                  showRating={true}
                />
              </section>
            )}
          </div>
        </main>

        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Error loading movie:', error);
    notFound();
  }
}