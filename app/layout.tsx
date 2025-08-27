import './globals.css';
import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/lib/auth/auth-provider';
import { Analytics } from '@vercel/analytics/next';


const dmSans = DM_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans'
});

export const metadata: Metadata = {
  title: {
    default: 'CineHub - Discover Movies & Watch Trailers',
    template: '%s | CineHub'
  },
  description: 'Discover the latest movies, watch trailers, and build your watchlist on CineHub - your premium movie discovery platform.',
  keywords: ['movies', 'trailers', 'cinema', 'entertainment', 'film', 'discovery'],
  authors: [{ name: 'CineHub Team' }],
  creator: 'CineHub',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cinehub1.vercel.app',
    siteName: 'CineHub',
    title: 'CineHub - Discover Movies & Watch Trailers',
    description: 'Discover the latest movies, watch trailers, and build your watchlist on CineHub.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CineHub - Movie Discovery Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CineHub - Discover Movies & Watch Trailers',
    description: 'Discover the latest movies, watch trailers, and build your watchlist on CineHub.',
    images: ['/og-image.jpg'],
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
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>

      <body className={`${dmSans.variable} min-h-screen antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}