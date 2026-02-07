import { MetadataRoute } from 'next'
import { tmdbApi } from '@/lib/api/tmdb'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cinehub1.vercel.app'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/movies`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tv-shows`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // Blog posts
  const blogPosts = ['top-movies-2024', 'streaming-guide-beginners', 'best-action-movies', 'hidden-gems-2023', 'tv-shows-binge-watch']
  const blogPages: MetadataRoute.Sitemap = blogPosts.map(slug => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // Year pages
  const yearPages: MetadataRoute.Sitemap = ['2024', '2023', '2022'].map(year => ({
    url: `${baseUrl}/year/${year}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Genre pages
  const genres = ['action', 'comedy', 'drama', 'horror', 'thriller', 'romance', 'sci-fi', 'fantasy', 'animation', 'crime']
  const genrePages: MetadataRoute.Sitemap = genres.map(genre => ({
    url: `${baseUrl}/genre/${genre}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }))

  try {
    // Fetch top 500 movies and 200 TV shows for comprehensive sitemap
    const moviePages = Array.from({ length: 25 }, (_, i) => i + 1); // 25 pages = 500 movies
    const tvPages = Array.from({ length: 10 }, (_, i) => i + 1); // 10 pages = 200 TV shows
    
    const [movieResults, tvResults] = await Promise.all([
      Promise.all(moviePages.map(page => tmdbApi.getPopularMovies(page))),
      Promise.all(tvPages.map(page => tmdbApi.getPopularTVShows(page)))
    ]);

    const allMovies = movieResults.flatMap(result => result.results);
    const allTVShows = tvResults.flatMap(result => result.results);

    // Generate movie URLs
    const movieUrls: MetadataRoute.Sitemap = allMovies.map((movie) => ({
      url: `${baseUrl}/movies/${movie.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    // Generate TV show URLs
    const tvShowUrls: MetadataRoute.Sitemap = allTVShows.map((show) => ({
      url: `${baseUrl}/tv-shows/${show.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    return [...staticPages, ...blogPages, ...yearPages, ...genrePages, ...movieUrls, ...tvShowUrls]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return [...staticPages, ...blogPages, ...yearPages, ...genrePages]
  }
}