import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { tmdbApi } from '@/lib/api/tmdb';
import { LoadingScreen } from '@/components/loading-screen';
import TVShowClientPage from './client-page';

interface TVShowPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: TVShowPageProps): Promise<Metadata> {
  try {
    const tvShowId = parseInt(params.id);
    const [tvShow, credits] = await Promise.all([
      tmdbApi.getTVShowDetails(tvShowId),
      tmdbApi.getTVShowCredits(tvShowId),
    ]);

    const firstAirYear = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : '';
    const creator = tvShow.created_by?.[0]?.name || '';
    const cast = credits.cast.slice(0, 5).map((c: any) => c.name).join(', ');
    const genres = tvShow.genres?.map((g: any) => g.name).join(', ') || '';
    const rating = tvShow.vote_average ? tvShow.vote_average.toFixed(1) : '';

    const title = `Watch ${tvShow.name}${firstAirYear ? ` (${firstAirYear})` : ''} Free Online | CineHub`;
    const description = tvShow.overview
      ? `${tvShow.overview.slice(0, 150)}... Watch ${tvShow.name} online free. ${creator ? `Created by ${creator}. ` : ''}${cast ? `Starring ${cast}. ` : ''}Stream all episodes on CineHub.`
      : `Watch ${tvShow.name}${firstAirYear ? ` (${firstAirYear})` : ''} online free. Stream all episodes in HD on CineHub.`;

    const keywords = [
      `watch ${tvShow.name} online free`,
      `${tvShow.name} full episodes`,
      `${tvShow.name} streaming`,
      tvShow.name,
      ...(tvShow.genres?.map((g: any) => `${g.name} tv shows`) || []),
      firstAirYear ? `${firstAirYear} tv shows` : '',
      'free tv shows online',
      'stream tv series',
    ].filter(Boolean);

    const posterUrl = tvShow.poster_path
      ? `https://image.tmdb.org/t/p/w780${tvShow.poster_path}`
      : '/placeholder.png';

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        type: 'video.tv_show',
        url: `https://cinehub1.vercel.app/tv-shows/${tvShowId}`,
        images: [{
          url: posterUrl,
          width: 780,
          height: 1170,
          alt: `${tvShow.name} poster`,
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
        canonical: `https://cinehub1.vercel.app/tv-shows/${tvShowId}`,
      },
    };
  } catch (error) {
    return {
      title: 'TV Show Not Found',
      description: 'The requested TV show could not be found.',
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