import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CategoriesClientPage } from './client-page';

export const metadata: Metadata = {
  title: 'Movie Categories - CineHub',
  description: 'Browse movies by category - Popular, Top Rated, Upcoming, and more',
};

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-8 py-6 sm:py-8">
          <CategoriesClientPage />
        </div>
      </main>

      <Footer />
    </div>
  );
}
