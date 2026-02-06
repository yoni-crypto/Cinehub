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
    default: 'CineHub - Watch Free Movies & TV Shows Online | Stream HD Films',
    template: '%s | CineHub'
  },
  description: 'Watch free movies and TV shows online in HD. Stream thousands of popular films, trending series, and new releases. No subscription required - start watching now on CineHub.',
  keywords: [
    'free movies online',
    'watch movies free',
    'free tv shows',
    'movie streaming',
    'tv shows online',
    'watch movies online free',
    'stream movies',
    'hd movies',
    'cinema online',
    'film streaming',
    'movie trailers',
    'blockbusters',
    'entertainment',
    'watch online',
    'movie database',
    'film discovery',
    'latest movies',
    'popular movies',
    'top rated movies',
  ],
  authors: [{ name: 'CineHub Team' }],
  creator: 'CineHub',
  publisher: 'CineHub',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cinehub1.vercel.app',
    siteName: 'CineHub',
    title: 'CineHub - Watch Free Movies & TV Shows Online in HD',
    description: 'Stream thousands of movies and TV shows for free in HD. Discover trending films, watch trailers, and build your watchlist on CineHub - no subscription required.',
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
    title: 'CineHub - Watch Free Movies & TV Shows Online',
    description: 'Stream thousands of movies and TV shows for free in HD. Discover trending films and build your watchlist.',
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