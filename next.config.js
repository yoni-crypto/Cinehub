/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: false,
    domains: ['image.tmdb.org', 'img.youtube.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/webp', 'image/avif']
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /node_modules\/(@supabase\/realtime-js)/ }
    ];
    return config;
  },
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
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cloud.umami.is https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http:; font-src 'self' data:; connect-src 'self' https:; media-src 'self' https: http:; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;"
        }
      ]
    }
  ]
};

module.exports = nextConfig;
