import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ClientPage from './client-page';

interface YearPageProps {
  params: {
    year: string;
  };
}

export async function generateMetadata({ params }: YearPageProps): Promise<Metadata> {
  const year = params.year;
  
  return {
    title: `Best Movies & TV Shows from ${year} | CineHub`,
    description: `Watch the best movies and TV shows released in ${year}. Stream popular titles from ${year} in HD quality.`,
  };
}

export function generateStaticParams() {
  return [
    { year: '2024' },
    { year: '2023' },
    { year: '2022' }
  ];
}

export default function YearPage({ params }: YearPageProps) {
  const year = parseInt(params.year);
  
  if (isNaN(year) || year < 1900 || year > 2030) {
    notFound();
  }

  return <ClientPage year={params.year} />;
}
