import { Metadata } from 'next';
import AnimeBrowseClient from './client-page';

export const metadata: Metadata = {
  title: 'Watch Anime Online Free - Sub & Dub in HD | CineHub',
  description:
    'Stream trending, seasonal and all-time popular anime free in HD. Subbed and dubbed episodes, no sign up required. Watch on CineHub.',
  keywords: ['watch anime online free', 'anime sub', 'anime dub', 'stream anime HD', 'seasonal anime', 'free anime streaming'],
  alternates: { canonical: 'https://movie.yonasaddisu.me/anime' },
  openGraph: {
    title: 'Watch Anime Online Free - Sub & Dub | CineHub',
    description: 'Stream trending and seasonal anime free in HD, subbed and dubbed.',
    url: 'https://movie.yonasaddisu.me/anime',
    siteName: 'CineHub',
    type: 'website',
  },
};

export default function AnimePage() {
  return <AnimeBrowseClient />;
}
