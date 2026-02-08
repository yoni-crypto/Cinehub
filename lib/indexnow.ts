const BASE_URL = 'https://cinehub1.vercel.app';

export async function submitToIndexNow(urls: string[]) {
  if (!urls || urls.length === 0) return;

  try {
    const response = await fetch(`${BASE_URL}/api/indexnow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls })
    });
    
    const result = await response.json();
    console.log('IndexNow submission:', result);
    return result;
  } catch (error) {
    console.error('IndexNow submission failed:', error);
    return null;
  }
}

export async function submitPageToIndexNow(path: string) {
  const url = `${BASE_URL}${path}`;
  return submitToIndexNow([url]);
}

export async function submitMultiplePagesToIndexNow(paths: string[]) {
  const urls = paths.map(path => `${BASE_URL}${path}`);
  return submitToIndexNow(urls);
}
