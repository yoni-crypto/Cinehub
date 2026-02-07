import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'About CineHub - Free Movie & TV Show Streaming Platform',
  description: 'Learn about CineHub, the best free streaming platform to watch movies and TV shows online in HD. No sign up, no ads, no downloads required. Stream 1000s of titles instantly.',
  alternates: {
    canonical: 'https://cinehub1.vercel.app/about',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-6">About CineHub</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
              CineHub is a premium streaming platform offering free access to thousands of movies and TV shows in high-definition quality. 
              Stream instantly without registration, downloads, or advertisements.
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-12">
              <div className="border border-border p-6 rounded-lg hover:border-red-600/50 transition-colors">
                <h3 className="text-lg font-semibold mb-3">Instant Streaming</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Advanced streaming infrastructure delivers buffer-free playback with automatic quality adjustment for optimal viewing experience.
                </p>
              </div>

              <div className="border border-border p-6 rounded-lg hover:border-red-600/50 transition-colors">
                <h3 className="text-lg font-semibold mb-3">HD Quality</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  All content available in high-definition with support for multiple resolutions. Cinema-quality streaming from any device.
                </p>
              </div>

              <div className="border border-border p-6 rounded-lg hover:border-red-600/50 transition-colors">
                <h3 className="text-lg font-semibold mb-3">No Registration</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Start watching immediately without account creation. Privacy-focused platform with no personal data collection.
                </p>
              </div>

              <div className="border border-border p-6 rounded-lg hover:border-red-600/50 transition-colors">
                <h3 className="text-lg font-semibold mb-3">Free Forever</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Completely free service with no hidden fees, subscriptions, or payment requirements. Unlimited streaming access.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-6">Platform Features</h2>
            
            <div className="grid sm:grid-cols-2 gap-4 my-8">
              <div className="flex gap-3">
                <div className="text-red-600 font-bold">•</div>
                <div>
                  <strong className="block mb-1">Extensive Library</strong>
                  <span className="text-sm text-muted-foreground">Thousands of movies and TV shows across all genres</span>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-red-600 font-bold">•</div>
                <div>
                  <strong className="block mb-1">Daily Updates</strong>
                  <span className="text-sm text-muted-foreground">New releases and trending content added regularly</span>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-red-600 font-bold">•</div>
                <div>
                  <strong className="block mb-1">Multiple Servers</strong>
                  <span className="text-sm text-muted-foreground">Automatic failover ensures uninterrupted streaming</span>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-red-600 font-bold">•</div>
                <div>
                  <strong className="block mb-1">Cross-Platform</strong>
                  <span className="text-sm text-muted-foreground">Optimized for desktop, mobile, and tablet devices</span>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-6">HDToday Alternative</h2>
            
            <p className="text-muted-foreground mb-6">
              CineHub provides a superior streaming experience with enhanced features and improved performance:
            </p>

            <div className="space-y-3 my-6">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2"></div>
                <p className="text-sm"><strong>Modern Interface:</strong> Clean, intuitive design optimized for content discovery</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2"></div>
                <p className="text-sm"><strong>Performance:</strong> Faster page loads and reduced buffering times</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2"></div>
                <p className="text-sm"><strong>Mobile Optimized:</strong> Responsive design for seamless mobile streaming</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2"></div>
                <p className="text-sm"><strong>Security:</strong> Enhanced privacy protection and secure connections</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2"></div>
                <p className="text-sm"><strong>Search:</strong> Advanced filtering and accurate content recommendations</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-6">Getting Started</h2>
            
            <div className="space-y-4 my-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-semibold">1</div>
                <div>
                  <strong className="block mb-1">Browse Content</strong>
                  <p className="text-sm text-muted-foreground">Use the search function or browse by genre, year, and popularity to find content.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-semibold">2</div>
                <div>
                  <strong className="block mb-1">Select Title</strong>
                  <p className="text-sm text-muted-foreground">Click on any movie or TV show to access the streaming page.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-semibold">3</div>
                <div>
                  <strong className="block mb-1">Start Streaming</strong>
                  <p className="text-sm text-muted-foreground">Press play to begin instant HD streaming without registration.</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-6">Our Mission</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              CineHub is dedicated to providing universal access to quality entertainment. We believe premium streaming 
              experiences should be available to everyone without financial barriers or restrictive paywalls. Our platform 
              is designed and maintained by entertainment enthusiasts committed to delivering the best free streaming service.
            </p>

            <div className="border-l-4 border-red-600 bg-muted/30 p-6 mt-12">
              <h3 className="text-lg font-semibold mb-2">Start Streaming</h3>
              <p className="text-sm text-muted-foreground">
                Join our growing community of users streaming movies and TV shows daily. 
                Access thousands of titles instantly without registration or payment.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
