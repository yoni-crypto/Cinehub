// Environment variables configuration
export const env = {
  TMDB_API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY || '',
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  YOUTUBE_API_KEY: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '',
};

// Validation function
export function validateEnv() {
  const missingVars = [];
  
  if (!env.TMDB_API_KEY) missingVars.push('NEXT_PUBLIC_TMDB_API_KEY');
  if (!env.YOUTUBE_API_KEY) missingVars.push('NEXT_PUBLIC_YOUTUBE_API_KEY');
  if (!process.env.MONGODB_URI) missingVars.push('MONGODB_URI');
  if (!process.env.NEXTAUTH_SECRET) missingVars.push('NEXTAUTH_SECRET');
  
  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars.join(', '));
  }
  
  return missingVars.length === 0;
}