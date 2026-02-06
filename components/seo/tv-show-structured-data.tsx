"use client";

interface TVShowStructuredDataProps {
  tvShow: {
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    first_air_date: string;
    vote_average: number;
    vote_count: number;
    genres?: Array<{ id: number; name: string }>;
    number_of_seasons?: number;
    number_of_episodes?: number;
  };
  credits?: {
    cast: Array<{ name: string }>;
  };
}

export function TVShowStructuredData({ tvShow, credits }: TVShowStructuredDataProps) {
  const actors = credits?.cast.slice(0, 5).map((c) => c.name) || [];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: tvShow.name,
    description: tvShow.overview,
    image: tvShow.poster_path
      ? `https://image.tmdb.org/t/p/w780${tvShow.poster_path}`
      : undefined,
    datePublished: tvShow.first_air_date,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: tvShow.vote_average.toFixed(1),
      ratingCount: tvShow.vote_count,
      bestRating: "10",
      worstRating: "0",
    },
    actor: actors.map((name) => ({
      "@type": "Person",
      name,
    })),
    genre: tvShow.genres?.map((g) => g.name) || [],
    numberOfSeasons: tvShow.number_of_seasons,
    numberOfEpisodes: tvShow.number_of_episodes,
    url: `https://cinehub1.vercel.app/tv-shows/${tvShow.id}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
