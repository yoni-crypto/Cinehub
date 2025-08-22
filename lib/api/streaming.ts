export interface StreamingSource {
  quality: string;
  url: string;
  type: string;
}

export interface StreamingData {
  sources: StreamingSource[];
  title: string;
  poster: string;
  backdrop: string;
}

class StreamingAPI {
  private baseUrl = 'https://moviesapi.club';

  async getStreamingSources(movieId: number): Promise<StreamingData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/movie/${movieId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching streaming sources:', error);
      return null;
    }
  }

  async getTVShowStreamingSources(tvShowId: number, seasonNumber: number, episodeNumber: number): Promise<StreamingData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/tv/${tvShowId}-${seasonNumber}-${episodeNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching TV show streaming sources:', error);
      return null;
    }
  }

  async getEmbedUrl(movieId: number): Promise<string | null> {
    try {
      const response = await fetch(`/api/streaming?movieId=${movieId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('Streaming API error:', data.error);
        return null;
      }
      
      return data.embedUrl || null;
    } catch (error) {
      console.error('Error fetching embed URL:', error);
      return null;
    }
  }

  async getTVShowEmbedUrl(tvShowId: number, seasonNumber: number, episodeNumber: number): Promise<string | null> {
    try {
      const response = await fetch(`/api/streaming/tv?tvShowId=${tvShowId}&seasonNumber=${seasonNumber}&episodeNumber=${episodeNumber}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('TV Show Streaming API error:', data.error);
        return null;
      }
      
      return data.embedUrl || null;
    } catch (error) {
      console.error('Error fetching TV show embed URL:', error);
      return null;
    }
  }

  getStreamingUrl(movieId: number): string {
    return `${this.baseUrl}/movie/${movieId}`;
  }

  getTVShowStreamingUrl(tvShowId: number, seasonNumber: number, episodeNumber: number): string {
    return `${this.baseUrl}/tv/${tvShowId}-${seasonNumber}-${episodeNumber}`;
  }
}

export const streamingApi = new StreamingAPI();
