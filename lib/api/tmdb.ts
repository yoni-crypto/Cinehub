import { env } from '@/lib/config/env';
import { Movie, MovieDetails, Genre, TMDBResponse, Credits } from '@/lib/types/movie';

// TV Show types
export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
  original_name: string;
}

export interface TVShowDetails extends TVShow {
  created_by: Array<{
    id: number;
    credit_id: string;
    name: string;
    gender: number;
    profile_path: string | null;
  }>;
  episode_run_time: number[];
  genres: Genre[];
  homepage: string;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: {
    air_date: string;
    episode_number: number;
    id: number;
    name: string;
    overview: string;
    production_code: string;
    season_number: number;
    still_path: string | null;
    vote_average: number;
    vote_count: number;
  };
  next_episode_to_air: {
    air_date: string;
    episode_number: number;
    id: number;
    name: string;
    overview: string;
    production_code: string;
    season_number: number;
    still_path: string | null;
    vote_average: number;
    vote_count: number;
  } | null;
  networks: Array<{
    name: string;
    id: number;
    logo_path: string | null;
    origin_country: string;
  }>;
  number_of_episodes: number;
  number_of_seasons: number;
  production_companies: Array<{
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }>;
  production_countries: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  seasons: Array<{
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
  }>;
  spoken_languages: Array<{
    english_name: string;
    iso_639_1: string;
    name: string;
  }>;
  status: string;
  tagline: string;
  type: string;
}

export interface Season {
  _id: string;
  air_date: string;
  episodes: Episode[];
  name: string;
  overview: string;
  id: number;
  poster_path: string | null;
  season_number: number;
}

export interface Episode {
  air_date: string;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  crew: Array<{
    department: string;
    job: string;
    credit_id: string;
    adult: boolean;
    gender: number;
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path: string | null;
  }>;
  guest_stars: Array<{
    character: string;
    credit_id: string;
    order: number;
    adult: boolean;
    gender: number;
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path: string | null;
  }>;
}

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

  // TV Show methods
  async getTrendingTVShows(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBResponse<TVShow>> {
    return this.request(`/trending/tv/${timeWindow}`);
  }

  async getPopularTVShows(page: number = 1): Promise<TMDBResponse<TVShow>> {
    return this.request('/tv/popular', { page: page.toString() });
  }

  async getTopRatedTVShows(page: number = 1): Promise<TMDBResponse<TVShow>> {
    return this.request('/tv/top_rated', { page: page.toString() });
  }

  async getOnTheAirTVShows(page: number = 1): Promise<TMDBResponse<TVShow>> {
    return this.request('/tv/on_the_air', { page: page.toString() });
  }

  async getAiringTodayTVShows(page: number = 1): Promise<TMDBResponse<TVShow>> {
    return this.request('/tv/airing_today', { page: page.toString() });
  }

  async getTVShowDetails(tvShowId: number): Promise<TVShowDetails> {
    return this.request(`/tv/${tvShowId}`);
  }

  async getTVShowCredits(tvShowId: number): Promise<Credits> {
    return this.request(`/tv/${tvShowId}/credits`);
  }

  async getSimilarTVShows(tvShowId: number, page: number = 1): Promise<TMDBResponse<TVShow>> {
    return this.request(`/tv/${tvShowId}/similar`, { page: page.toString() });
  }

  async searchTVShows(query: string, page: number = 1): Promise<TMDBResponse<TVShow>> {
    return this.request('/search/tv', { 
      query: encodeURIComponent(query),
      page: page.toString()
    });
  }

  async getTVGenres(): Promise<{ genres: Genre[] }> {
    return this.request('/genre/tv/list');
  }

  async discoverTVShows(params: {
    genreId?: number;
    year?: number;
    sortBy?: string;
    page?: number;
  }): Promise<TMDBResponse<TVShow>> {
    const queryParams: Record<string, string> = {
      page: (params.page || 1).toString(),
      sort_by: params.sortBy || 'popularity.desc'
    };

    if (params.genreId) {
      queryParams.with_genres = params.genreId.toString();
    }

    if (params.year) {
      queryParams.first_air_date_year = params.year.toString();
    }

    return this.request('/discover/tv', queryParams);
  }

  async getSeasonDetails(tvShowId: number, seasonNumber: number): Promise<Season> {
    return this.request(`/tv/${tvShowId}/season/${seasonNumber}`);
  }

  async getTVShowVideos(tvShowId: number): Promise<{ results: any[] }> {
    return this.request(`/tv/${tvShowId}/videos`);
  }

  getImageUrl(path: string | null, size: string = 'w500'): string {
    if (!path) return '/placeholder-movie.jpg';
    return `${env.TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  getBackdropUrl(path: string | null, size: string = 'w1280'): string {
    if (!path) return '/placeholder-backdrop.jpg';
    return `${env.TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  getPosterUrl(path: string | null, size: string = 'w500'): string {
    if (!path) return '/placeholder-movie.jpg';
    return `${env.TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }
}

export const tmdbApi = new TMDBApi();