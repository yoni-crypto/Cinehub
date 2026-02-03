import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://cinehub1.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://cinehub1.vercel.app/categories',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://cinehub1.vercel.app/tv-shows',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://cinehub1.vercel.app/search',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ]
}