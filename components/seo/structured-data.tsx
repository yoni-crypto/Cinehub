"use client";

export function StructuredData() {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CineHub",
    "alternateName": ["CineHub - Free Movie Streaming", "CineHub Movies", "Watch Free Movies CineHub"],
    "description": "Watch free movies and TV shows online in HD quality without sign up. Stream thousands of popular films, trending series, and new releases instantly. Best free streaming site.",
    "url": "https://cinehub1.vercel.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://cinehub1.vercel.app/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://twitter.com/elyonox",
      "https://facebook.com/elyonox"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "15420",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CineHub",
    "url": "https://cinehub1.vercel.app",
    "logo": "https://cinehub1.vercel.app/logo.png",
    "description": "Free online movie and TV show streaming platform",
    "sameAs": [
      "https://twitter.com/elyonox",
      "https://facebook.com/elyonox"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
    </>
  );
}