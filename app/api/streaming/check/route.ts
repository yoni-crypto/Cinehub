import { NextRequest, NextResponse } from 'next/server';

// XYZ first — has auto sound play; then fallbacks in order
const MOVIE_SOURCES = [
  (id: string) => `https://vidsrc.xyz/embed/movie/${id}?autoplay=1`,
  (id: string) => `https://vidsrc.cc/v2/embed/movie/${id}?autoplay=1`,
  (id: string) => `https://embedder.net/e/movie?tmdb=${id}&autoplay=1`,
  (id: string) => `https://vidsrc.me/embed/movie?tmdb=${id}&autoplay=1`,
  (id: string) => `https://vidsrc.to/embed/movie/${id}?autoplay=1`,
];

const CHECK_TIMEOUT_MS = 2000;

async function checkUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:109.0) Gecko/20100101 Firefox/119.0' },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const movieId = request.nextUrl.searchParams.get('movieId');
  if (!movieId) {
    return NextResponse.json({ error: 'movieId required' }, { status: 400 });
  }

  try {
    const urls = MOVIE_SOURCES.map((fn) => fn(movieId));
    const results = await Promise.all(urls.map((url) => checkUrl(url)));
    const firstWorking = results.findIndex(Boolean);
    const idx = firstWorking >= 0 ? firstWorking : 0;
    return NextResponse.json({ workingIndex: idx, url: urls[idx] });
  } catch (error) {
    console.error('Streaming check error:', error);
    return NextResponse.json({ workingIndex: 0, url: MOVIE_SOURCES[0](movieId) }, { status: 200 });
  }
}
