"use client";

interface MovieStructuredDataProps {
  movie: {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    release_date: string;
    vote_average: number;
    vote_count: number;
    genres?: Array<{ id: number; name: string }>;
  };
  credits?: {
    cast: Array<{ name: string }>;
    crew: Array<{ job: string; name: string }>;
  };
}

export function MovieStructuredData({ movie, credits }: MovieStructuredDataProps) {
  const director = credits?.crew.find((c) => c.job === "Director");
  const actors = credits?.cast.slice(0, 5).map((c) => c.name) || [];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    description: movie.overview,
    image: movie.poster_path
      ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
      : undefined,
    datePublished: movie.release_date,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: movie.vote_average.toFixed(1),
      ratingCount: movie.vote_count,
      bestRating: "10",
      worstRating: "0",
    },
    director: director
      ? {
          "@type": "Person",
          name: director.name,
        }
      : undefined,
    actor: actors.map((name) => ({
      "@type": "Person",
      name,
    })),
    genre: movie.genres?.map((g) => g.name) || [],
    url: `https://cinehub1.vercel.app/movies/${movie.id}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
