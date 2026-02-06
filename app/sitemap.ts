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
  ]

  try {
    // Fetch popular movies and TV shows for sitemap
    const [movies1, movies2, movies3, tvShows1, tvShows2] = await Promise.all([
      tmdbApi.getPopularMovies(1),
      tmdbApi.getPopularMovies(2),
      tmdbApi.getTopRatedMovies(1),
      tmdbApi.getPopularTVShows(1),
      tmdbApi.getPopularTVShows(2),
    ])

    const allMovies = [...movies1.results, ...movies2.results, ...movies3.results]
    const allTVShows = [...tvShows1.results, ...tvShows2.results]

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

    return [...staticPages, ...movieUrls, ...tvShowUrls]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}