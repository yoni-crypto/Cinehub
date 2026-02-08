'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function UmamiTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).umami) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      (window as any).umami.track((props: any) => ({ ...props, url }));
    }
  }, [pathname, searchParams]);

  return null;
}
