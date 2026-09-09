"use client";

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const register = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service worker registered:', registration.scope);
        } catch (error) {
          console.error('Service worker registration failed:', error);
        }
      };
      register();
    }
  }, []);

  return null;
}