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
    sitemap: 'https://cinehub1.vercel.app/sitemap.xml',
    host: 'https://cinehub1.vercel.app',
  }
}