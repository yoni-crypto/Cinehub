import './globals.css';
import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/lib/auth/auth-provider';
import { Analytics } from '@vercel/analytics/next';
import { StructuredData } from '@/components/seo/structured-data';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';
import { ErrorBoundary } from '@/components/error-boundary';
import { Suspense } from 'react';


const dmSans = DM_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cinehub1.vercel.app'),
  title: {
    default: 'Watch Free Movies & TV Shows Online HD - No Sign Up Required | CineHub',
    template: '%s | Watch Free on CineHub'
  },
  description: 'Watch free movies and TV shows online in HD quality without sign up. Stream 1000s of latest films, trending series, and new releases instantly. Best free alternative to HDToday, FMovies, and 123Movies. No ads, no registration - start streaming now!',
  keywords: [
    'watch movies online free',
    'free movies online no sign up',
    'watch movies free hd',
    'free movie streaming sites',
    'watch tv shows online free',
    'stream movies online free',
    'free movies no registration',
    'watch full movies online free',
    'hd movies online free',
    'free streaming sites',
    'movies online free',
    'watch series online free',
    'free movie sites',
    'stream tv shows free',
    'online movies free streaming',
    'watch movies without downloading',
    'free hd movies streaming',
    'latest movies online free',
    'new movies online free',
    'popular movies free',
    'top rated movies free',
    'best free movie sites',
    'hdtoday alternative',
    'fmovies alternative',
    '123movies alternative',
    'free cinema online',
    'watch films online free',
  ],
  authors: [{ name: 'CineHub Team' }],
  creator: 'CineHub',
  publisher: 'CineHub',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cinehub1.vercel.app',
    siteName: 'CineHub',
    title: 'Watch Free Movies & TV Shows Online HD - No Sign Up | CineHub',
    description: 'Stream 1000s of movies and TV shows for free in HD quality. No registration, no ads, no downloads. Watch latest films and trending series instantly. Best free streaming site 2024.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CineHub - Free Movie & TV Show Streaming Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watch Free Movies & TV Shows Online HD - CineHub',
    description: 'Stream 1000s of movies and TV shows for free in HD. No sign up, no ads. Watch instantly!',
    images: ['/og-image.jpg'],
    creator: '@cinehub',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://cinehub1.vercel.app',
  },
  verification: {
    google: '32b4b569e6dea431',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <script defer src="https://cloud.umami.is/script.js" data-website-id="75dacefb-9327-4e41-894e-15746ab91235"></script>
      </head>
      <body className={`${dmSans.variable} min-h-screen antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <AuthProvider>
              <KeyboardShortcuts />
              {children}
              <Toaster position="top-right" richColors />
              <Suspense fallback={null}>
                <Analytics />
              </Suspense>
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}