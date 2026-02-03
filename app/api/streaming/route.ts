import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');
    
    if (!movieId) {
      return NextResponse.json(
        { error: 'Movie ID is required' },
        { status: 400 }
      );
    }

    // Use reliable free sources that bypass Cloudflare
    const reliableSources = [
      `https://vidsrc.cc/v2/embed/movie/${movieId}`,
      `https://vidsrc.xyz/embed/movie/${movieId}`,
      `https://embedder.net/e/movie?tmdb=${movieId}`,
      `https://vidsrc.me/embed/movie?tmdb=${movieId}`,
      `https://vidsrc.to/embed/movie/${movieId}`
    ];
    
    const embedUrl = reliableSources[0];
    console.log('Using reliable source:', embedUrl);
    
    return NextResponse.json({ embedUrl });
    
  } catch (error) {
    console.error('Error fetching streaming embed URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}