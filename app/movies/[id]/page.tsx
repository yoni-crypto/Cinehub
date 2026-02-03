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

    const movie = await tmdbApi.getMovieDetails(movieId);
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';

    return {
      title: `${movie.title}${releaseYear ? ` (${releaseYear})` : ''}`,
      description: movie.overview || `Watch ${movie.title} and discover more movies on CineHub.`,
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