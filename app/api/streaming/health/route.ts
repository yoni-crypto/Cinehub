import { NextResponse } from 'next/server';
import { HEALTH_PROBES } from '@/lib/streaming/servers';

// Cached at the edge for 10 minutes, so providers get probed at most ~6x/hour total,
// not once per visitor.
export const revalidate = 600;

const TIMEOUT_MS = 6000;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

/**
 * A provider is "down" only on hard failures: DNS/connection error, timeout or 5xx.
 * 4xx (e.g. Cloudflare blocking datacenter IPs) is treated as up, because the
 * provider may still work fine from a real user's browser.
 */
async function isDown(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'User-Agent': UA, Accept: 'text/html' },
      cache: 'no-store',
    });
    // Don't download the body; we only care that the server answered.
    res.body?.cancel().catch(() => {});
    return res.status >= 500;
  } catch {
    return true;
  }
}

export async function GET() {
  const entries = Object.entries(HEALTH_PROBES);
  const results = await Promise.all(entries.map(async ([id, url]) => [id, await isDown(url)] as const));
  const down = results.filter(([, d]) => d).map(([id]) => id);
  return NextResponse.json({ down, checkedAt: new Date().toISOString() });
}
