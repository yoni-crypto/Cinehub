import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/proxy/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/auth/', '/proxy/'],
      },
    ],
    sitemap: 'https://movie.yonasaddisu.me/sitemap.xml',
    host: 'https://movie.yonasaddisu.me',
  }
}