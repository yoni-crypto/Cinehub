"use client";

export function StructuredData() {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CineHub",
    "alternateName": "CineHub - Free Movie Streaming",
    "description": "Watch free movies and TV shows online in HD. Stream thousands of popular films, trending series, and new releases.",
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
    ]
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