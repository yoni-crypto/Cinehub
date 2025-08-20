export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  adult: boolean;
  genre_ids: number[];
  original_language: string;
  popularity: number;
  vote_count: number;
  video: boolean;
  vote_average: number;
}

export interface MovieDetails extends Movie {
  budget: number;
  genres: Genre[];
  homepage: string | null;
  imdb_id: string | null;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  revenue: number;
  runtime: number | null;
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string | null;
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface Cast {
  adult: boolean;
  gender: number | null;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}

export interface Crew {
  adult: boolean;
  gender: number | null;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  credit_id: string;
  department: string;
  job: string;
}

export interface Credits {
  id: number;
  cast: Cast[];
  crew: Crew[];
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface UserReview {
  id: string;
  user_id: string;
  movie_id: number;
  rating: number;
  review_text: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_avatar?: string;
}

export interface Watchlist {
  id: string;
  user_id: string;
  movie_id: number;
  added_at: string;
  watched: boolean;
}