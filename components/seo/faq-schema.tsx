"use client";

export function FAQSchema() {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is CineHub free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, CineHub is completely free to use. You can watch unlimited movies and TV shows without any subscription or registration required."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to sign up to watch movies?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No sign up is required. You can start watching movies and TV shows instantly without creating an account. However, creating a free account allows you to save favorites and create watchlists."
        }
      },
      {
        "@type": "Question",
        "name": "What quality are the movies available in?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CineHub offers movies and TV shows in multiple quality options including HD (720p), Full HD (1080p), and select titles in 4K quality. The quality automatically adjusts based on your internet connection."
        }
      },
      {
        "@type": "Question",
        "name": "How often is new content added?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "New movies and TV shows are added daily to CineHub. We update our library regularly with the latest releases, trending content, and classic films."
        }
      },
      {
        "@type": "Question",
        "name": "Can I watch on mobile devices?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, CineHub is fully responsive and works on all devices including smartphones, tablets, laptops, and desktop computers. You can watch anywhere, anytime."
        }
      },
      {
        "@type": "Question",
        "name": "Is CineHub legal and safe?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CineHub aggregates content from various sources and provides links to streaming services. We recommend using a VPN for privacy and checking content availability in your region."
        }
      },
      {
        "@type": "Question",
        "name": "What makes CineHub better than HDToday or FMovies?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CineHub offers a cleaner interface, faster loading times, multiple server options, no intrusive ads, and a more reliable streaming experience compared to alternatives like HDToday, FMovies, or 123Movies."
        }
      },
      {
        "@type": "Question",
        "name": "Can I download movies from CineHub?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CineHub is a streaming platform designed for online viewing. We recommend streaming content directly for the best experience and to ensure you're accessing the latest versions."
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
    />
  );
}
