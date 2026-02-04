import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  
  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  const proxyHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Stream Player</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; overflow: hidden; }
    iframe { width: 100vw; height: 100vh; border: none; }
  </style>
</head>
<body>
  <iframe 
    src="${url}" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; camera; microphone"
    allowfullscreen
    referrerpolicy="no-referrer"
  ></iframe>
  <script>
    Object.defineProperty(window, 'parent', { get: () => window });
    Object.defineProperty(window, 'top', { get: () => window });
    Object.defineProperty(window, 'frameElement', { get: () => null });
    Object.defineProperty(navigator, 'userAgent', {
      get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    history.pushState(null, '', location.href);
    window.addEventListener('popstate', () => {
      history.pushState(null, '', location.href);
    });
  </script>
</body>
</html>`;

  return new NextResponse(proxyHTML, {
    headers: {
      'Content-Type': 'text/html',
      'X-Frame-Options': 'SAMEORIGIN',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}