"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        router.push('/search');
      }
      
      // Ctrl/Cmd + H for home
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        router.push('/');
      }

      // Ctrl/Cmd + F for favorites
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        router.push('/favorites');
      }

      // Ctrl/Cmd + W for watchlist
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        router.push('/watchlist');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return null;
}