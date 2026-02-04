import { Metadata } from 'next';
import { Suspense } from 'react';
import { Filter } from 'lucide-react';
import { tmdbApi } from '@/lib/api/tmdb';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MovieGrid } from '@/components/movie/movie-grid';
import { CategoryTabs } from '@/components/categories/category-tabs';
import { LoadingScreen } from '@/components/loading-screen';
import { CategoriesSearchBar } from '@/components/categories/categories-search-bar';

export const metadata: Metadata = {
  title: 'Movie Categories - CineHub',
  description: 'Browse movies by category - Popular, Top Rated, Upcoming, and more',
};

export default function CategoriesPage({
  searchParams,
}: {
  searchParams: { category?: string; genre?: string; country?: string };
}) {
  const category = searchParams.category || 'popular';
  const genre = searchParams.genre;
  const country = searchParams.country;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-4 sm:mb-6">
            <CategoriesSearchBar />
          </div>
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Movie Categories</h1>
            {!genre && !country && (
              <a
                href="#category-tabs"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors self-start sm:self-auto"
                title="Filter by category"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filter</span>
              </a>
            )}
          </div>
          {!genre && !country && (
            <div id="category-tabs" className="mb-6 scroll-mt-4">
              <CategoryTabs activeCategory={category} />
            </div>
          )}

          <Suspense key={`${category}-${genre}-${country}`} fallback={<LoadingScreen message="Loading categories…" fullScreen={false} />}>
            <CategoryContent category={category} genre={genre} country={country} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

async function CategoryContent({ category, genre, country }: { category: string; genre?: string; country?: string }) {
  try {
    let movies;
    let title;
    let categoryProp: 'popular' | 'top-rated' | 'upcoming' | 'now-playing';
    
    // Handle genre filtering
    if (genre) {
      const genreMap: Record<string, number> = {
        'action': 28,
        'adventure': 12,
        'animation': 16,
        'comedy': 35,
        'crime': 80,
        'documentary': 99,
        'drama': 18,
        'family': 10751,
        'fantasy': 14,
        'history': 36,
        'horror': 27,
        'music': 10402,
        'mystery': 9648,
        'romance': 10749,
        'sci-fi': 878,
        'thriller': 53,
        'war': 10752,
        'western': 37,
      };
      
      const genreId = genreMap[genre];
      if (genreId) {
        const genreData = await tmdbApi.discoverMovies({ genreId });
        movies = genreData.results;
        title = `${genre.charAt(0).toUpperCase() + genre.slice(1)} Movies`;
        categoryProp = 'popular';
      } else {
        throw new Error('Invalid genre');
      }
    }
    // Handle country filtering
    else if (country) {
      const countryMap: Record<string, string> = {
        'us': 'US',
        'uk': 'GB',
        'ca': 'CA',
        'fr': 'FR',
        'jp': 'JP',
        'kr': 'KR',
        'de': 'DE',
        'in': 'IN',
        'es': 'ES',
        'it': 'IT',
        'au': 'AU',
        'br': 'BR',
        'mx': 'MX',
        'ru': 'RU',
        'cn': 'CN',
        'nl': 'NL',
        'se': 'SE',
        'no': 'NO',
        'dk': 'DK',
        'be': 'BE'
      };
      
      const countryCode = countryMap[country];
      if (countryCode) {
        const countryData = await tmdbApi.discoverMovies({ 
          sortBy: 'popularity.desc',
          originCountry: countryCode
        });
        movies = countryData.results;
        title = `Movies from ${country === 'br' ? 'Brazil' : country === 'mx' ? 'Mexico' : country === 'au' ? 'Australia' : country === 'ru' ? 'Russia' : country === 'cn' ? 'China' : country === 'nl' ? 'Netherlands' : country === 'se' ? 'Sweden' : country === 'no' ? 'Norway' : country === 'dk' ? 'Denmark' : country === 'be' ? 'Belgium' : country.toUpperCase()}`;
        categoryProp = 'popular';
      } else {
        throw new Error('Invalid country');
      }
    }
    // Handle regular categories
    else {
      switch (category) {
        case 'popular':
          const popularData = await tmdbApi.getPopularMovies(1);
          movies = popularData.results;
          title = 'Popular Movies';
          categoryProp = 'popular';
          break;
        case 'top-rated':
          const topRatedData = await tmdbApi.getTopRatedMovies(1);
          movies = topRatedData.results;
          title = 'Top Rated Movies';
          categoryProp = 'top-rated';
          break;
        case 'upcoming':
          const upcomingData = await tmdbApi.getUpcomingMovies(1);
          movies = upcomingData.results;
          title = 'Upcoming Movies';
          categoryProp = 'upcoming';
          break;
        case 'now-playing':
          const nowPlayingData = await tmdbApi.getNowPlayingMovies(1);
          movies = nowPlayingData.results;
          title = 'Now Playing';
          categoryProp = 'now-playing';
          break;
        default:
          const defaultData = await tmdbApi.getPopularMovies(1);
          movies = defaultData.results;
          title = 'Popular Movies';
          categoryProp = 'popular';
      }
    }

    return (
      <MovieGrid
        movies={movies}
        title={title}
        category={categoryProp}
        showYear={true}
        showRating={true}
      />
    );
  } catch (error) {
    console.error('Error fetching category movies:', error);
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Unable to load movies</h2>
        <p className="text-muted-foreground">Please try again later</p>
      </div>
    );
  }
}
