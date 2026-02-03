"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AdBlockDetector() {
  const [hasAdBlock, setHasAdBlock] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Simple ad-block detection
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    testAd.style.position = 'absolute';
    testAd.style.left = '-10000px';
    document.body.appendChild(testAd);

    setTimeout(() => {
      if (testAd.offsetHeight === 0) {
        setHasAdBlock(true);
      }
      document.body.removeChild(testAd);
    }, 100);
  }, []);

  if (!isClient || !hasAdBlock) return null;

  return (
    <Alert className="mb-4 border-yellow-500/50 bg-yellow-500/10">
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
      <AlertDescription className="text-yellow-200">
        Ad blocker detected. If streaming doesn't work, try disabling your ad blocker for this site or use the alternative "Watch Trailer" option.
      </AlertDescription>
    </Alert>
  );
}