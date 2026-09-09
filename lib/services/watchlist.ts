export interface WatchlistItem {
  id: string;
  user_id: string;
  movie_id: number;
  media_type: 'movie' | 'tv';
  movie_title: string;
  movie_poster: string;
  added_at: string;
}

export class WatchlistService {
  async addToWatchlist(
    movieId: number,
    movieTitle: string,
    moviePoster: string,
    mediaType: 'movie' | 'tv' = 'movie'
  ) {
    const res = await fetch('/api/watchlist', {
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
        throw new Error('User must be authenticated to add movies to watchlist');
      }
      throw new Error(data.error || 'Failed to update watchlist');
    }

    const data = await res.json();
    if (data.inWatchlist === false) {
      throw new Error('Movie is already in your watchlist');
    }

    return { success: true };
  }

  async removeFromWatchlist(movieId: number, mediaType: 'movie' | 'tv' = 'movie') {
    const res = await fetch(
      `/api/watchlist?mediaId=${movieId}&mediaType=${mediaType}`,
      { method: 'DELETE' }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        throw new Error('User must be authenticated to remove movies from watchlist');
      }
      throw new Error(data.error || 'Failed to update watchlist');
    }

    return { success: true };
  }

  async getWatchlist(): Promise<WatchlistItem[]> {
    const res = await fetch('/api/watchlist', { cache: 'no-store' });

    if (!res.ok) {
      if (res.status === 401) {
        return [];
      }
      console.warn('Failed to load watchlist. Returning empty.');
      return [];
    }

    return res.json();
  }

  async isInWatchlist(
    movieId: number,
    mediaType: 'movie' | 'tv' = 'movie'
  ): Promise<boolean> {
    try {
      const res = await fetch(
        `/api/watchlist/check?mediaId=${movieId}&mediaType=${mediaType}`,
        { cache: 'no-store' }
      );

      if (!res.ok) {
        return false;
      }

      const data = await res.json();
      return !!data.inWatchlist;
    } catch (error) {
      console.warn('Error checking watchlist status:', error);
      return false;
    }
  }
}

export const watchlistService = new WatchlistService();
