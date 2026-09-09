/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['image.tmdb.org', 'img.youtube.com'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cloud.umami.is https://va.vercel-scripts.com https://3nbf4.com https://quge5.com; worker-src 'self' https://3nbf4.com blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http:; font-src 'self' data:; connect-src 'self' https: http://localhost:3001 https://3nbf4.com https://quge5.com; media-src 'self' https: http:; frame-src *;"
        }
      ]
    }
  ]
};

module.exports = nextConfig;
