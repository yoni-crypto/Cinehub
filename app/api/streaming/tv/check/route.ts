import { NextRequest, NextResponse } from 'next/server';

const TV_STREAMING_SOURCES = [
  { name: 'VidSrc XYZ', buildUrl: (id: number, s: number, e: number) => `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}` },
  { name: 'VidSrc', buildUrl: (id: number, s: number, e: number) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}` },
  { name: 'Embedder', buildUrl: (id: number, s: number, e: number) => `https://embedder.net/e/tv?tmdb=${id}&season=${s}&episode=${e}` },
  { name: 'VidSrc.me', buildUrl: (id: number, s: number, e: number) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}` },
  { name: 'VidSrc.to', buildUrl: (id: number, s: number, e: number) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tvShowId = searchParams.get('tvShowId');
  const season = searchParams.get('season');
  const episode = searchParams.get('episode');

  if (!tvShowId || !season || !episode) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const id = parseInt(tvShowId);
  const s = parseInt(season);
  const e = parseInt(episode);

  if (isNaN(id) || isNaN(s) || isNaN(e)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  // For now, just return the first source (VidSrc XYZ) as working
  // In a real implementation, you'd check each source
  return NextResponse.json({ workingIndex: 0 });
}