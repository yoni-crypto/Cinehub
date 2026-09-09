export interface FavoriteItem {
  id: string;
  user_id: string;
  movie_id: number;
  media_type: 'movie' | 'tv';
  movie_title: string;
  movie_poster: string;
  added_at: string;
}

export class FavoritesService {
  async addToFavorites(
    movieId: number,
    movieTitle: string,
    moviePoster: string,
    mediaType: 'movie' | 'tv' = 'movie'
  ) {
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mediaId: movieId,
        mediaType,
        title: movieTitle,
        poster: moviePoster,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        throw new Error('User must be authenticated to add movies to favorites');
      }
      throw new Error(data.error || 'Failed to update favorites');
    }

    const data = await res.json();
    if (data.inFavorites === false) {
      throw new Error('Movie is already in your favorites');
    }

    return { success: true };
  }

  async removeFromFavorites(movieId: number, mediaType: 'movie' | 'tv' = 'movie') {
    const res = await fetch(
      `/api/favorites?mediaId=${movieId}&mediaType=${mediaType}`,
      { method: 'DELETE' }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        throw new Error('User must be authenticated to remove movies from favorites');
      }
      throw new Error(data.error || 'Failed to update favorites');
    }

    return { success: true };
  }

  async getFavorites(): Promise<FavoriteItem[]> {
    const res = await fetch('/api/favorites', { cache: 'no-store' });

    if (!res.ok) {
      if (res.status === 401) {
        return [];
      }
      console.warn('Failed to load favorites. Returning empty.');
      return [];
    }

    return res.json();
  }

  async isInFavorites(
    movieId: number,
    mediaType: 'movie' | 'tv' = 'movie'
  ): Promise<boolean> {
    try {
      const res = await fetch(
        `/api/favorites/check?mediaId=${movieId}&mediaType=${mediaType}`,
        { cache: 'no-store' }
      );

      if (!res.ok) {
        return false;
      }

      const data = await res.json();
      return !!data.inFavorites;
    } catch (error) {
      console.warn('Error checking favorites status:', error);
      return false;
    }
  }
}

export const favoritesService = new FavoritesService();
