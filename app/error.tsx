"use client";

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6">
          We encountered an error while loading this page. Please try again.
        </p>
        <div className="space-x-4">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}