import { NextResponse } from 'next/server';

const INDEXNOW_KEY = '1d3051b4934a44b9bd07d8d82458361d';
const BASE_URL = 'https://cinehub1.vercel.app';

export async function POST(request: Request) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'URLs array is required' }, { status: 400 });
    }

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        host: 'cinehub1.vercel.app',
        key: INDEXNOW_KEY,
        keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });

    if (response.ok) {
      return NextResponse.json({ 
        success: true, 
        message: `Successfully submitted ${urls.length} URLs to IndexNow`,
        status: response.status 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to submit to IndexNow',
        status: response.status 
      }, { status: response.status });
    }
  } catch (error) {
    console.error('IndexNow submission error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
