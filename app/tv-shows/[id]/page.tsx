import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { tmdbApi } from '@/lib/api/tmdb';
import { LoadingScreen } from '@/components/loading-screen';
import TVShowClientPage from './client-page';

interface TVShowPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: TVShowPageProps) {
  try {
    const tvShowId = parseInt(params.id);
    const tvShow = await tmdbApi.getTVShowDetails(tvShowId);

    return {
      title: `${tvShow.name} - CineHub`,
      description: tvShow.overview,
    };
  } catch (error) {
    return {
      title: 'TV Show - CineHub',
      description: 'TV Show details',
    };
  }
}

export default function TVShowPage({ params }: TVShowPageProps) {
  const tvShowId = parseInt(params.id);

  if (isNaN(tvShowId)) {
    notFound();
  }

  return <TVShowClientPage tvShowId={tvShowId} />;
}
