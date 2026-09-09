# CineHub - Professional Streaming Platform

A modern, responsive streaming platform built with Next.js, featuring movies and TV shows with professional HDToday-style design.

## Features

- **Professional Design**: Clean, modern interface inspired by top streaming sites
- **Real-time Search**: Live search with suggestions and history
- **Movies & TV Shows**: Comprehensive content with filtering and sorting
- **Responsive Design**: Optimized for all devices
- **Multiple Streaming Sources**: Automatic server fallback system
- **User Authentication**: Secure login with NextAuth.js (email/password, Google & GitHub)
- **Watchlist & Favorites**: Personal content management
- **Genre & Country Filters**: Advanced content discovery

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Database**: MongoDB (via Mongoose)
- **Authentication**: NextAuth.js (Auth.js) with Google, GitHub & credentials
- **API**: TMDB (The Movie Database)
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up a local MongoDB instance (or use MongoDB Atlas) and set `MONGODB_URI`
4. Set up environment variables (see `.env.example`)
5. Run development server: `npm run dev`

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
MONGODB_URI=mongodb://localhost:27017/cinehub
NEXTAUTH_SECRET=your_secure_random_secret
NEXTAUTH_URL=http://localhost:3000

# Optional OAuth providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

Run `openssl rand -base64 32` to generate a secure `NEXTAUTH_SECRET`.

For email/password login to work, MongoDB must be running. For Google/GitHub login, create OAuth apps at the respective developer consoles and add the callback URL `${NEXTAUTH_URL}/api/auth/callback/google` (or `/github`).

## License

MIT License