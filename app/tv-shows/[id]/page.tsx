import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { tmdbApi } from '@/lib/api/tmdb';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { TVShowDetail } from '@/components/tv-shows/tv-show-detail';

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

async function TVShowContent({ tvShowId }: { tvShowId: number }) {
  try {
    const [tvShow, credits, similarTVShows] = await Promise.all([
      tmdbApi.getTVShowDetails(tvShowId),
      tmdbApi.getTVShowCredits(tvShowId),
      tmdbApi.getSimilarTVShows(tvShowId),
    ]);

    return (
      <TVShowDetail
        tvShow={tvShow}
        credits={credits}
        similarTVShows={similarTVShows.results}
      />
    );
  } catch (error) {
    console.error('Error fetching TV show details:', error);
    notFound();
  }
}

export default function TVShowPage({ params }: TVShowPageProps) {
  const tvShowId = parseInt(params.id);

  if (isNaN(tvShowId)) {
    notFound();
  }

  return (
    <>
      <Header />
      <main>
        <Suspense fallback={
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-white text-xl">Loading TV show...</div>
          </div>
        }>
          <TVShowContent tvShowId={tvShowId} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
