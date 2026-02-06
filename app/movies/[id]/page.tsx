import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { tmdbApi } from '@/lib/api/tmdb';
import ClientPage from './client-page';

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

    const [movie, credits] = await Promise.all([
      tmdbApi.getMovieDetails(movieId),
      tmdbApi.getMovieCredits(movieId),
    ]);

    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
    const director = credits.crew.find((c: any) => c.job === 'Director')?.name || '';
    const cast = credits.cast.slice(0, 5).map((c: any) => c.name).join(', ');
    const genres = movie.genres?.map((g: any) => g.name).join(', ') || '';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '';

    const title = `Watch ${movie.title}${releaseYear ? ` (${releaseYear})` : ''} Free Online | CineHub`;
    const description = movie.overview 
      ? `${movie.overview.slice(0, 150)}... Watch ${movie.title} online free. ${director ? `Directed by ${director}. ` : ''}${cast ? `Starring ${cast}. ` : ''}Stream now on CineHub.`
      : `Watch ${movie.title}${releaseYear ? ` (${releaseYear})` : ''} online free. Stream full movie in HD on CineHub.`;

    const keywords = [
      `watch ${movie.title} online free`,
      `${movie.title} full movie`,
      `${movie.title} streaming`,
      movie.title,
      ...(movie.genres?.map((g: any) => `${g.name} movies`) || []),
      releaseYear ? `${releaseYear} movies` : '',
      director ? director : '',
      'free movies online',
      'stream movies',
    ].filter(Boolean);

    const posterUrl = movie.poster_path 
      ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
      : '/placeholder.png';

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        type: 'video.movie',
        url: `https://cinehub1.vercel.app/movies/${movieId}`,
        images: [{
          url: posterUrl,
          width: 780,
          height: 1170,
          alt: `${movie.title} poster`,
        }],
        siteName: 'CineHub',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [posterUrl],
      },
      alternates: {
        canonical: `https://cinehub1.vercel.app/movies/${movieId}`,
      },
    };
  } catch {
    return {
      title: 'Movie Not Found',
      description: 'The requested movie could not be found.',
    };
  }
}

export default function MoviePage({ params }: MoviePageProps) {
  const movieId = parseInt(params.id);
  
  if (isNaN(movieId)) {
    notFound();
  }

  return <ClientPage movieId={movieId} />;
}