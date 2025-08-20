import { env } from '@/lib/config/env';

class YouTubeApi {
  private baseUrl = 'https://www.googleapis.com/youtube/v3';
  private apiKey = env.YOUTUBE_API_KEY;

  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('part', 'snippet');
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async searchTrailer(movieTitle: string, year?: string): Promise<string | null> {
    try {
      const searchQuery = `${movieTitle} ${year || ''} official trailer`.trim();
      
      const response = await this.request('/search', {
        q: searchQuery,
        type: 'video',
        maxResults: '1',
        videoEmbeddable: 'true',
        videoSyndicated: 'true'
      });

      const items = (response as any).items;
      if (items && items.length > 0) {
        return items[0].id.videoId;
      }

      return null;
    } catch (error) {
      console.error('Error searching for trailer:', error);
      return null;
    }
  }

  async getVideoDetails(videoId: string): Promise<any> {
    try {
      const response = await this.request('/videos', {
        id: videoId,
        part: 'snippet,statistics'
      });

      return response;
    } catch (error) {
      console.error('Error getting video details:', error);
      throw error;
    }
  }

  getThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'medium'): string {
    const qualityMap = {
      default: 'default',
      medium: 'mqdefault',
      high: 'hqdefault',
      maxres: 'maxresdefault'
    };
    return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
  }

  getEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`;
  }
}

export const youtubeApi = new YouTubeApi();