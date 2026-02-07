import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ClientPage from './client-page';

interface GenrePageProps {
  params: {
    slug: string;
  };
}

const genreMap: Record<string, { id: number; name: string; description: string }> = {
  'action': { 
    id: 28, 
    name: 'Action',
    description: 'Watch the best action movies online free in HD. Explosive fights, car chases, and adrenaline-pumping adventures. Stream action-packed films without sign up.'
  },
  'comedy': { 
    id: 35, 
    name: 'Comedy',
    description: 'Watch free comedy movies online in HD. Laugh out loud with the funniest films and hilarious comedies. Stream comedy movies without registration.'
  },
  'drama': { 
    id: 18, 
    name: 'Drama',
    description: 'Watch free drama movies online in HD. Powerful stories, emotional journeys, and award-winning performances. Stream drama films without sign up.'
  },
  'horror': { 
    id: 27, 
    name: 'Horror',
    description: 'Watch free horror movies online in HD. Scary films, terrifying thrillers, and spine-chilling stories. Stream horror movies without registration.'
  },
  'thriller': { 
    id: 53, 
    name: 'Thriller',
    description: 'Watch free thriller movies online in HD. Suspenseful plots, edge-of-your-seat action, and mind-bending mysteries. Stream thriller films without sign up.'
  },
  'romance': { 
    id: 10749, 
    name: 'Romance',
    description: 'Watch free romance movies online in HD. Love stories, romantic comedies, and heartwarming tales. Stream romance films without registration.'
  },
  'sci-fi': { 
    id: 878, 
    name: 'Science Fiction',
    description: 'Watch free sci-fi movies online in HD. Futuristic adventures, space exploration, and mind-blowing technology. Stream science fiction films without sign up.'
  },
  'fantasy': { 
    id: 14, 
    name: 'Fantasy',
    description: 'Watch free fantasy movies online in HD. Magical worlds, epic quests, and mythical creatures. Stream fantasy films without registration.'
  },
  'animation': { 
    id: 16, 
    name: 'Animation',
    description: 'Watch free animated movies online in HD. Family-friendly cartoons, anime, and animated adventures. Stream animation films without sign up.'
  },
  'crime': { 
    id: 80, 
    name: 'Crime',
    description: 'Watch free crime movies online in HD. Heists, detective stories, and criminal masterminds. Stream crime films without registration.'
  },
};

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const genre = genreMap[params.slug];
  
  if (!genre) {
    return {
      title: 'Genre Not Found',
      description: 'The requested genre could not be found.',
    };
  }

  const title = `Watch Free ${genre.name} Movies Online HD - No Sign Up | CineHub`;
  const description = `${genre.description} Discover the best ${genre.name.toLowerCase()} movies of all time. Watch now on CineHub - no subscription required.`;

  return {
    title,
    description,
    keywords: [
      `${genre.name.toLowerCase()} movies`,
      `watch ${genre.name.toLowerCase()} movies online free`,
      `free ${genre.name.toLowerCase()} movies`,
      `${genre.name.toLowerCase()} movies online`,
      `best ${genre.name.toLowerCase()} movies`,
      `${genre.name.toLowerCase()} films`,
      `stream ${genre.name.toLowerCase()} movies`,
      `${genre.name.toLowerCase()} movies hd`,
      'free movies online',
      'watch movies free',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://cinehub1.vercel.app/genre/${params.slug}`,
      siteName: 'CineHub',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://cinehub1.vercel.app/genre/${params.slug}`,
    },
  };
}

export function generateStaticParams() {
  return Object.keys(genreMap).map((slug) => ({
    slug,
  }));
}

export default function GenrePage({ params }: GenrePageProps) {
  const genre = genreMap[params.slug];
  
  if (!genre) {
    notFound();
  }

  return <ClientPage genre={genre} slug={params.slug} />;
}
