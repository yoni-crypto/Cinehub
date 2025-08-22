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

    const url = `https://moviesapi.club/movie/${movieId}`;
    console.log('Fetching movie streaming URL:', url);

    // Try multiple times with different approaches
    let response;
    
    // First attempt: Standard browser headers
    response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://moviesapi.club/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Cache-Control': 'max-age=0',
      },
    });

    if (!response.ok) {
      console.log('First attempt failed, trying alternative headers...');
      // Second attempt: Minimal headers
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://moviesapi.club/',
        },
      });
    }

    if (!response.ok) {
      console.error('Failed to fetch movie streaming data:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch streaming data' },
        { status: response.status }
      );
    }

    const html = await response.text();
    console.log('HTML content length:', html.length);
    
    // More robust regex patterns to find the embed URL
    let embedUrl = null;
    
    // Pattern 1: cdn.moviesapi.club embed URL (new format) - MOST RELIABLE
    let match = html.match(/src=["'](https?:\/\/cdn\.moviesapi\.club\/embed\/[^"']+)["']/i);
    if (match) {
      embedUrl = match[1];
      console.log('Found with Pattern 1 (cdn.moviesapi.club embed):', embedUrl);
    }
    
    // Pattern 2: Any cdn.moviesapi.club URL - RELIABLE
    if (!embedUrl) {
      match = html.match(/src=["']([^"']*cdn\.moviesapi\.club[^"']*)["']/i);
      if (match) {
        embedUrl = match[1];
        console.log('Found with Pattern 2 (any cdn.moviesapi.club):', embedUrl);
      }
    }
    
    // Pattern 3: Look for cdn.moviesapi.club in any context - RELIABLE
    if (!embedUrl) {
      match = html.match(/(https?:\/\/cdn\.moviesapi\.club\/[^"'\s>]+)/i);
      if (match) {
        embedUrl = match[1];
        console.log('Found with Pattern 3 (cdn.moviesapi.club context):', embedUrl);
      }
    }
    
    // Pattern 4: Standard vidora.stream embed URL - RELIABLE
    if (!embedUrl) {
      match = html.match(/src=["'](https?:\/\/vidora\.stream\/embed\/[^"']+)["']/i);
      if (match) {
        embedUrl = match[1];
        console.log('Found with Pattern 4 (vidora.stream embed):', embedUrl);
      }
    }
    
    // Pattern 5: Any vidora.stream URL - RELIABLE
    if (!embedUrl) {
      match = html.match(/src=["']([^"']*vidora\.stream[^"']*)["']/i);
      if (match) {
        embedUrl = match[1];
        console.log('Found with Pattern 5 (any vidora.stream):', embedUrl);
      }
    }
    
    // Pattern 6: Look for iframe with reliable streaming URLs only
    if (!embedUrl) {
      match = html.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/i);
      if (match && (match[1].includes('vidora.stream') || match[1].includes('cdn.moviesapi.club'))) {
        embedUrl = match[1];
        console.log('Found with Pattern 6 (iframe reliable streaming):', embedUrl);
      }
    }
    
    // Pattern 7: Look for any embed URL from reliable sources
    if (!embedUrl) {
      match = html.match(/src=["']([^"']*embed[^"']*)["']/i);
      if (match && (match[1].includes('vidora.stream') || match[1].includes('cdn.moviesapi.club'))) {
        embedUrl = match[1];
        console.log('Found with Pattern 7 (reliable embed):', embedUrl);
      }
    }
    
    // Pattern 8: Look for any iframe src from reliable sources only
    if (!embedUrl) {
      match = html.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/i);
      if (match && (match[1].includes('vidora.stream') || match[1].includes('cdn.moviesapi.club'))) {
        embedUrl = match[1];
        console.log('Found with Pattern 8 (reliable iframe src):', embedUrl);
      }
    }
    
    // Pattern 9: Look for any URL containing 'embed' from reliable sources
    if (!embedUrl) {
      match = html.match(/(https?:\/\/[^"'\s>]*embed[^"'\s>]*)/i);
      if (match && (match[1].includes('vidora.stream') || match[1].includes('cdn.moviesapi.club'))) {
        embedUrl = match[1];
        console.log('Found with Pattern 9 (reliable embed URL):', embedUrl);
      }
    }
    
    // Pattern 10: Look for any URL containing 'stream' from reliable sources
    if (!embedUrl) {
      match = html.match(/(https?:\/\/[^"'\s>]*stream[^"'\s>]*)/i);
      if (match && (match[1].includes('vidora.stream') || match[1].includes('cdn.moviesapi.club'))) {
        embedUrl = match[1];
        console.log('Found with Pattern 10 (reliable stream URL):', embedUrl);
      }
    }
    
    // Pattern 11: Last resort - try unreliable sources but with validation
    if (!embedUrl) {
      match = html.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/i);
      if (match) {
        const potentialUrl = match[1];
        console.log('Found potential unreliable source:', potentialUrl);
        
        // Only use if it's not obviously broken
        if (!potentialUrl.includes('cloudnestra.com') || potentialUrl.length < 1000) {
          embedUrl = potentialUrl;
          console.log('Using unreliable source as last resort:', embedUrl);
          console.log('WARNING: This source may not work reliably');
        } else {
          console.log('Skipping extremely unreliable source (too long or problematic)');
        }
      }
    }

    if (embedUrl) {
      // Ensure the URL is properly formatted
      if (embedUrl.startsWith('//')) {
        embedUrl = `https:${embedUrl}`;
      } else if (!embedUrl.startsWith('http')) {
        embedUrl = `https://${embedUrl}`;
      }
      
      console.log('Final embed URL:', embedUrl);
      return NextResponse.json({ embedUrl });
    } else {
      console.log('No reliable streaming source found. HTML snippet:', html.substring(0, 1000));
      console.log('Looking for iframe tags in HTML...');
      const iframeMatches = html.match(/<iframe[^>]*>/gi);
      if (iframeMatches) {
        console.log('Found iframe tags:', iframeMatches);
        // Check if unreliable sources were found but skipped
        const unreliableMatch = html.match(/<iframe[^>]*src=["']([^"']*cloudnestra\.com[^"']*)["'][^>]*>/i);
        if (unreliableMatch) {
          console.log('Skipped unreliable source:', unreliableMatch[1]);
        }
      }
      return NextResponse.json(
        { error: 'High-quality streaming not available for this movie. Please try another movie.' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error fetching streaming embed URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
