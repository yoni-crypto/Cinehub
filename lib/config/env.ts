// Environment variables configuration
export const env = {
  TMDB_API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY || '',
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  YOUTUBE_API_KEY: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '',
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};

// Validation function
export function validateEnv() {
  const missingVars = [];
  
  if (!env.TMDB_API_KEY) missingVars.push('NEXT_PUBLIC_TMDB_API_KEY');
  if (!env.YOUTUBE_API_KEY) missingVars.push('NEXT_PUBLIC_YOUTUBE_API_KEY');
  if (!env.SUPABASE_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!env.SUPABASE_ANON_KEY) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars.join(', '));
  }
  
  return missingVars.length === 0;
}