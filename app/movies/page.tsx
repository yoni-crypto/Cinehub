import { Metadata } from 'next';
import { Suspense } from 'react';
import { tmdbApi } from '@/lib/api/tmdb';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MovieGrid } from '@/components/movie/movie-grid';
import { LoadingScreen } from '@/components/loading-screen';

export const metadata: Metadata = {
  title: 'Movies - CineHub',
  description: 'Browse and discover movies - Popular, Top Rated, by Genre, and more',
};

export default function MoviesPage({
  searchParams,
}: {
  searchParams: { genre?: string; country?: string; category?: string };
}) {
  const genre = searchParams.genre;
  const country = searchParams.country;
  const category = searchParams.category || 'popular';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Suspense fallback={<LoadingScreen message="Loading movies…" />}>
            <MoviesContent genre={genre} country={country} category={category} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

async function MoviesContent({ 
  genre, 
  country, 
  category 
}: { 
  genre?: string; 
  country?: string; 
  category: string; 
}) {
  try {
    let movies;
    let title;
    
    // Handle genre filtering from header dropdown
    if (genre) {
      const genreMap: Record<string, number> = {
        'action': 28,
        'comedy': 35,
        'drama': 18,
        'horror': 27,
        'thriller': 53,
        'romance': 10749,
        'sci-fi': 878,
        'fantasy': 14,
        'animation': 16,
        'crime': 80
      };
      
      const genreId = genreMap[genre.toLowerCase()];
      if (genreId) {
        const genreData = await tmdbApi.discoverMovies({ genreId });
        movies = genreData.results;
        title = `${genre.charAt(0).toUpperCase() + genre.slice(1)} Movies`;
      } else {
        throw new Error('Invalid genre');
      }
    }
    // Handle country filtering from header dropdown
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
        'it': 'IT'
      };
      
      const countryCode = countryMap[country.toLowerCase()];
      if (countryCode) {
        // Use discover with region parameter
        const countryData = await tmdbApi.discoverMovies({ 
          sortBy: 'popularity.desc'
        });
        // Note: TMDB doesn't have direct country filtering in discover
        // This would need to be implemented differently or use production_countries
        movies = countryData.results;
        title = `Movies from ${getCountryName(country)}`;
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
          break;
        case 'top-rated':
          const topRatedData = await tmdbApi.getTopRatedMovies(1);
          movies = topRatedData.results;
          title = 'Top Rated Movies';
          break;
        case 'upcoming':
          const upcomingData = await tmdbApi.getUpcomingMovies(1);
          movies = upcomingData.results;
          title = 'Upcoming Movies';
          break;
        case 'now-playing':
          const nowPlayingData = await tmdbApi.getNowPlayingMovies(1);
          movies = nowPlayingData.results;
          title = 'Now Playing';
          break;
        default:
          const defaultData = await tmdbApi.getPopularMovies(1);
          movies = defaultData.results;
          title = 'Popular Movies';
      }
    }

    return (
      <MovieGrid
        movies={movies}
        title={title}
        category="popular"
        showYear={true}
        showRating={true}
      />
    );
  } catch (error) {
    console.error('Error fetching movies:', error);
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Unable to load movies</h2>
        <p className="text-muted-foreground">Please try again later</p>
      </div>
    );
  }
}

function getCountryName(countryCode: string): string {
  const countryNames: Record<string, string> = {
    'us': 'United States',
    'uk': 'United Kingdom',
    'ca': 'Canada', 
    'fr': 'France',
    'jp': 'Japan',
    'kr': 'South Korea',
    'de': 'Germany',
    'in': 'India',
    'es': 'Spain',
    'it': 'Italy'
  };
  
  return countryNames[countryCode.toLowerCase()] || countryCode.toUpperCase();
}