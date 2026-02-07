interface FAQSchemaProps {
  movieTitle: string;
  movieYear?: number;
}

export function FAQSchema({ movieTitle, movieYear }: FAQSchemaProps) {
  const year = movieYear ? ` (${movieYear})` : '';
  
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `How can I watch ${movieTitle}${year} online for free?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `You can watch ${movieTitle}${year} online for free on CineHub without any registration or sign-up. Simply click the play button and start streaming instantly in HD quality.`
        }
      },
      {
        "@type": "Question",
        "name": `Is it free to watch ${movieTitle} on CineHub?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, ${movieTitle} is completely free to watch on CineHub. No subscription, no payment, no credit card required. Stream unlimited movies and TV shows for free.`
        }
      },
      {
        "@type": "Question",
        "name": `Do I need to sign up to watch ${movieTitle}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `No sign-up required! Watch ${movieTitle} instantly without creating an account. CineHub offers free streaming with no registration needed.`
        }
      },
      {
        "@type": "Question",
        "name": `What quality is ${movieTitle} available in?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${movieTitle} is available in HD quality on CineHub. We provide high-definition streaming for the best viewing experience.`
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  );
}
