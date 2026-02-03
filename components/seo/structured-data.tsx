"use client";

export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CineHub",
    "description": "Watch free movies and TV shows online. Stream the latest blockbusters and discover trending films.",
    "url": "https://cinehub1.vercel.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://cinehub1.vercel.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://twitter.com/cinehub",
      "https://facebook.com/cinehub"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}