import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface WatchlistItem {
  id: number;
  user_id: string;
  movie_id: number;
  movie_title: string;
  movie_poster: string;
  added_at: string;
}

export class WatchlistService {
  private supabase: any;

  constructor() {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase environment variables are not configured. Watchlist features will be disabled.');
      return;
    }
    this.supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  async addToWatchlist(movieId: number, movieTitle: string, moviePoster: string) {
    if (!this.supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }

    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to add movies to watchlist');
    }

    const { error } = await this.supabase
      .from('watchlist')
      .insert({
        user_id: user.id,
        movie_id: movieId,
        movie_title: movieTitle,
        movie_poster: moviePoster,
      });

    if (error) {
      if (error.code === '23505') {
        throw new Error('Movie is already in your watchlist');
      }
      throw error;
    }

    return { success: true };
  }

  async removeFromWatchlist(movieId: number) {
    if (!this.supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }

    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to remove movies from watchlist');
    }

    const { error } = await this.supabase
      .from('watchlist')
      .delete()
      .eq('user_id', user.id)
      .eq('movie_id', movieId);

    if (error) {
      throw error;
    }

    return { success: true };
  }

  async getWatchlist(): Promise<WatchlistItem[]> {
    if (!this.supabase) {
      console.warn('Supabase is not configured. Returning empty watchlist.');
      return [];
    }

    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await this.supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  async isInWatchlist(movieId: number): Promise<boolean> {
    if (!this.supabase) {
      return false;
    }

    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data, error } = await this.supabase
      .from('watchlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('movie_id', movieId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return !!data;
  }
}

export const watchlistService = new WatchlistService();
