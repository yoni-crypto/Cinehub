import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Terms of Service | CineHub',
  description: 'CineHub terms of service and user agreement.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2024</p>
          
          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using CineHub, you accept and agree to be bound by these Terms of Service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Use of Service</h2>
              <p>You agree to use CineHub only for lawful purposes and in accordance with these terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Content</h2>
              <p>All content is provided for entertainment purposes. We do not host any content on our servers.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Prohibited Activities</h2>
              <div className="grid gap-2 ml-4">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                  <p>Attempting to hack or disrupt the service</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                  <p>Sharing account credentials</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                  <p>Using automated tools to access content</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                  <p>Violating any applicable laws</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Disclaimer</h2>
              <p>The service is provided "as is" without warranties of any kind.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Limitation of Liability</h2>
              <p>CineHub shall not be liable for any indirect, incidental, or consequential damages.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. Continued use constitutes acceptance.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
