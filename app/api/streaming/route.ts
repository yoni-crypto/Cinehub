import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');
    const tvShowId = searchParams.get('tvShowId');
    const seasonNumber = searchParams.get('seasonNumber');
    const episodeNumber = searchParams.get('episodeNumber');
    
    if (!movieId && !tvShowId) {
      return NextResponse.json(
        { error: 'Movie ID or TV Show ID is required' },
        { status: 400 }
      );
    }

    // Handle TV shows
    if (tvShowId && seasonNumber && episodeNumber) {
      const reliableSources = [
        `https://vidsrc.cc/v2/embed/tv/${tvShowId}/${seasonNumber}/${episodeNumber}`,
        `https://vidsrc.xyz/embed/tv/${tvShowId}/${seasonNumber}/${episodeNumber}`,
        `https://embedder.net/e/tv?tmdb=${tvShowId}&s=${seasonNumber}&e=${episodeNumber}`,
        `https://vidsrc.me/embed/tv?tmdb=${tvShowId}&season=${seasonNumber}&episode=${episodeNumber}`
      ];
      
      const embedUrl = reliableSources[0];
      console.log('Using reliable TV source:', embedUrl);
      
      return NextResponse.json({ embedUrl });
    }

    // Handle movies (existing code)
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