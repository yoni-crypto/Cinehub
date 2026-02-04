# CineHub - Professional Streaming Platform

A modern, responsive streaming platform built with Next.js, featuring movies and TV shows with professional HDToday-style design.

## Features

- **Professional Design**: Clean, modern interface inspired by top streaming sites
- **Real-time Search**: Live search with suggestions and history
- **Movies & TV Shows**: Comprehensive content with filtering and sorting
- **Responsive Design**: Optimized for all devices
- **Multiple Streaming Sources**: Automatic server fallback system
- **User Authentication**: Secure login with Supabase
- **Watchlist & Favorites**: Personal content management
- **Genre & Country Filters**: Advanced content discovery

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **API**: TMDB (The Movie Database)
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run development server: `npm run dev`

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
```

## License

MIT License