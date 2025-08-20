import { env } from '@/lib/config/env';
import { Movie, MovieDetails, Genre, TMDBResponse, Credits } from '@/lib/types/movie';

class TMDBApi {
  private baseUrl = env.TMDB_BASE_URL;
  private apiKey = env.TMDB_API_KEY;

  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.set('api_key', this.apiKey);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBResponse<Movie>> {
    return this.request(`/trending/movie/${timeWindow}`);
  }

  async getPopularMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.request('/movie/popular', { page: page.toString() });
  }

  async getTopRatedMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.request('/movie/top_rated', { page: page.toString() });
  }

  async getUpcomingMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.request('/movie/upcoming', { page: page.toString() });
  }

  async getNowPlayingMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.request('/movie/now_playing', { page: page.toString() });
  }

  async getMovieDetails(movieId: number): Promise<MovieDetails> {
    return this.request(`/movie/${movieId}`);
  }

  async getMovieCredits(movieId: number): Promise<Credits> {
    return this.request(`/movie/${movieId}/credits`);
  }

  async getSimilarMovies(movieId: number, page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.request(`/movie/${movieId}/similar`, { page: page.toString() });
  }

  async searchMovies(query: string, page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.request('/search/movie', { 
      query: encodeURIComponent(query),
      page: page.toString()
    });
  }

  async getGenres(): Promise<{ genres: Genre[] }> {
    return this.request('/genre/movie/list');
  }

  async discoverMovies(params: {
    genreId?: number;
    year?: number;
    sortBy?: string;
    page?: number;
  }): Promise<TMDBResponse<Movie>> {
    const queryParams: Record<string, string> = {
      page: (params.page || 1).toString(),
      sort_by: params.sortBy || 'popularity.desc'
    };

    if (params.genreId) {
      queryParams.with_genres = params.genreId.toString();
    }

    if (params.year) {
      queryParams.year = params.year.toString();
    }

    return this.request('/discover/movie', queryParams);
  }

  async getMovieVideos(movieId: number): Promise<{ results: any[] }> {
    return this.request(`/movie/${movieId}/videos`);
  }

  getImageUrl(path: string | null, size: string = 'w500'): string {
    if (!path) return '/placeholder-movie.jpg';
    return `${env.TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  getBackdropUrl(path: string | null, size: string = 'w1280'): string {
    if (!path) return '/placeholder-backdrop.jpg';
    return `${env.TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }
}

export const tmdbApi = new TMDBApi();