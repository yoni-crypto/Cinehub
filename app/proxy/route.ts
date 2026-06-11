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
    iframe { width: 100vw; height: 100vh; border: none; display: block; }
  </style>
</head>
<body>
  <iframe
    id="player"
    src="${url}"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
    allowfullscreen
    referrerpolicy="no-referrer"
  ></iframe>
  <script>
    // Spoof frame context so the player thinks it's top-level
    Object.defineProperty(window, 'parent', { get: () => window });
    Object.defineProperty(window, 'top', { get: () => window });
    Object.defineProperty(window, 'frameElement', { get: () => null });

    // Kill all popup/popunder attempts at this level
    window.open = () => null;

    // Block any attempt to navigate this page away
    window.addEventListener('beforeunload', e => e.preventDefault());
    history.pushState(null, '', location.href);
    window.addEventListener('popstate', () => history.pushState(null, '', location.href));

    // Strip overlay ad elements injected into this page (not inside iframe - can't touch those)
    const AD_SELECTORS = [
      '[id*="ad"]','[class*="ad-"]','[class*="-ad"]','[class*="ads"]',
      '[id*="banner"]','[class*="banner"]',
      '[id*="popup"]','[class*="popup"]',
      '[id*="overlay"]','[class*="overlay"]',
      '[data-ad]','ins.adsbygoogle',
      'iframe:not(#player)',
    ];

    function stripAds(root) {
      AD_SELECTORS.forEach(sel => {
        root.querySelectorAll(sel).forEach(el => {
          // Only remove elements that are not the main player iframe
          if (el.id !== 'player') el.remove();
        });
      });
    }

    // Run once on load
    document.addEventListener('DOMContentLoaded', () => stripAds(document));

    // Watch for dynamically injected ad elements
    new MutationObserver(mutations => {
      for (const m of mutations) {
        m.addedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          const el = node;
          const tag = el.tagName;
          if (tag === 'SCRIPT' || tag === 'LINK') return;
          // Remove secondary iframes (ad iframes) but not our player
          if (tag === 'IFRAME' && el.id !== 'player') { el.remove(); return; }
          // Remove elements that look like ad overlays (fixed/absolute with high z-index)
          const style = window.getComputedStyle(el);
          const z = parseInt(style.zIndex, 10);
          const pos = style.position;
          if ((pos === 'fixed' || pos === 'absolute') && z > 100 && el.id !== 'player') {
            el.remove();
          }
        });
      }
    }).observe(document.body, { childList: true, subtree: true });
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