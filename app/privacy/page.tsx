import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | CineHub',
  description: 'CineHub privacy policy. Learn how we collect, use, and protect your information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2024</p>
          
          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. No Account Required</h2>
              <p>
                CineHub does not require you to create an account to watch movies and TV shows. You can browse and stream content freely without providing any personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Optional Account Features</h2>
              <p className="mb-3">If you choose to create an account for features like Watchlist and Favorites, we collect only:</p>
              <div className="grid gap-2 ml-4">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                  <p>Email address (for account access)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                  <p>Your saved watchlist and favorites</p>
                </div>
              </div>
              <p className="mt-3">
                We do not sell, share, or use your information for any purpose other than providing these features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. What We Don't Collect</h2>
              <p className="mb-3">We do not collect or track:</p>
              <div className="grid gap-2 ml-4">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                  <p>Viewing history (unless you're signed in)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                  <p>Personal browsing data</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                  <p>Payment information (we don't charge for anything)</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Security</h2>
              <p>
                If you create an account, your data is encrypted and stored securely using Supabase infrastructure. 
                We implement industry-standard security measures to protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Cookies</h2>
              <p>
                We use minimal cookies only to maintain your session if you're signed in. No tracking cookies are used.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Third-Party Services</h2>
              <p>
                CineHub uses TMDB for movie data and Supabase for optional account features. 
                We do not share your data with any third parties for marketing or advertising purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Your Rights</h2>
              <p>
                You can delete your account and all associated data at any time. Simply contact us and we'll remove everything immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. Any changes will be posted on this page.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
