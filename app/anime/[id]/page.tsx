import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { anilistApi, animeTitle, plainDescription } from '@/lib/api/anilist';
import AnimeClientPage from './client-page';

interface AnimePageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: AnimePageProps): Promise<Metadata> {
  try {
    const anime = await anilistApi.getAnime(parseInt(params.id));
    const title = animeTitle(anime);
    const year = anime.seasonYear ? ` (${anime.seasonYear})` : '';
    const desc = plainDescription(anime.description).slice(0, 150);
    const pageTitle = `Watch ${title}${year} Sub & Dub Free Online | CineHub`;
    const description = desc
      ? `${desc}... Watch ${title} episodes free in HD, subbed and dubbed, on CineHub.`
      : `Watch ${title}${year} free online in HD, subbed and dubbed, on CineHub.`;
    const image = anime.coverImage.extraLarge || anime.coverImage.large || '/placeholder.png';
    const url = `https://movie.yonasaddisu.me/anime/${anime.id}`;

    return {
      title: pageTitle,
      description,
      keywords: [
        `watch ${title} online free`,
        `${title} sub`,
        `${title} dub`,
        `${title} episodes`,
        ...anime.genres.map((g) => `${g} anime`),
        'free anime streaming',
      ],
      openGraph: { title: pageTitle, description, url, type: 'video.tv_show', siteName: 'CineHub', images: [{ url: image, alt: `${title} cover` }] },
      twitter: { card: 'summary_large_image', title: pageTitle, description, images: [image] },
      alternates: { canonical: url },
    };
  } catch {
    return { title: 'Anime Not Found | CineHub', description: 'The requested anime could not be found.' };
  }
}

export default function AnimePage({ params }: AnimePageProps) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();
  return <AnimeClientPage animeId={id} />;
}
