import { getSupabaseClient } from '@/lib/supabase/client';

const supabase = getSupabaseClient();

export interface FavoriteItem {
  id: number;
  user_id: string;
  movie_id: number;
  movie_title: string;
  movie_poster: string;
  added_at: string;
}

export class FavoritesService {
  private supabase: any;

  constructor() {
    this.supabase = supabase;
  }

  async addToFavorites(movieId: number, movieTitle: string, moviePoster: string) {
    if (!this.supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }

    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to add movies to favorites');
    }

    const { error } = await this.supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        movie_id: movieId,
        movie_title: movieTitle,
        movie_poster: moviePoster,
      });

    if (error) {
      if (error.code === '23505') {
        throw new Error('Movie is already in your favorites');
      }
      throw error;
    }

    return { success: true };
  }

  async removeFromFavorites(movieId: number) {
    if (!this.supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }

    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to remove movies from favorites');
    }

    const { error } = await this.supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('movie_id', movieId);

    if (error) {
      throw error;
    }

    return { success: true };
  }

  async getFavorites(): Promise<FavoriteItem[]> {
    if (!this.supabase) {
      console.warn('Supabase is not configured. Returning empty favorites.');
      return [];
    }

    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await this.supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  async isInFavorites(movieId: number): Promise<boolean> {
    if (!this.supabase) {
      return false;
    }

    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { data, error } = await this.supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('movie_id', movieId)
        .maybeSingle();

      if (error) {
        console.warn('Error checking favorites status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.warn('Error checking favorites status:', error);
      return false;
    }
  }
}

export const favoritesService = new FavoritesService();
